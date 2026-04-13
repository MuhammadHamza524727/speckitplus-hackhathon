"""
Ingest Script — Physical AI Book
Cohere v5 (ClientV2) + Qdrant + Neon
"""

import os
import glob
import time
import hashlib
import logging
from typing import List
from dataclasses import dataclass

import cohere
from qdrant_client import QdrantClient
from qdrant_client.http import models
import psycopg2
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@dataclass
class TextChunk:
    chunk_id: str
    content: str
    source_file: str
    chunk_index: int


class BookIngestor:
    def __init__(self):
        self.cohere_key = os.getenv("COHERE_API_KEY")
        self.qdrant_url = os.getenv("QDRANT_URL")
        self.qdrant_key = os.getenv("QDRANT_API_KEY")
        self.neon_url   = os.getenv("NEON_DB_URL")

        if not all([self.cohere_key, self.qdrant_url, self.qdrant_key]):
            raise ValueError("Missing env vars: COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY")

        # Cohere v5 — ClientV2
        self.co     = cohere.ClientV2(self.cohere_key)
        self.qdrant = QdrantClient(url=self.qdrant_url.strip(), api_key=self.qdrant_key.strip())

        self.collection_name = "physical_ai_book"
        self.embed_model     = "embed-english-v3.0"
        self.vector_size     = 1024
        self.batch_size      = 64
        self.delay           = 1.0   # seconds between batches (rate limit safety)

    def discover_docs(self, source_dir: str = "../docs/") -> List[str]:
        patterns = ["**/*.mdx", "**/*.md"]
        files = []
        for pat in patterns:
            files.extend(glob.glob(os.path.join(source_dir, pat), recursive=True))
        files = sorted(set(files))
        logger.info(f"Found {len(files)} doc files")
        return files

    def load_content(self, file_path: str) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def chunk_text(self, text: str, source_file: str,
                   chunk_size: int = 800, overlap: int = 100) -> List[TextChunk]:
        chunks = []
        start, index = 0, 0
        text_len = len(text)

        while start < text_len:
            end        = min(start + chunk_size, text_len)
            chunk_text = text[start:end].strip()
            if not chunk_text:
                break

            chunk_id = hashlib.md5(f"{source_file}_{index}".encode()).hexdigest()
            chunks.append(TextChunk(
                chunk_id=chunk_id, content=chunk_text,
                source_file=source_file, chunk_index=index
            ))
            index += 1
            start = end - overlap if end < text_len else text_len

        return chunks

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Cohere v5 ClientV2 embed with float embeddings"""
        all_embeddings = []

        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            retries = 0

            while True:
                try:
                    resp = self.co.embed(
                        texts=batch,
                        model=self.embed_model,
                        input_type="search_document",
                        embedding_types=["float"]
                    )
                    # Cohere v5: resp.embeddings.float_
                    all_embeddings.extend(resp.embeddings.float_)
                    logger.info(f"  Batch {i//self.batch_size + 1}: {len(batch)} chunks embedded")
                    break

                except Exception as e:
                    retries += 1
                    if retries > 5:
                        raise Exception(f"Embed failed after 5 retries: {e}")
                    wait = 2 ** retries
                    logger.warning(f"  Rate limit / error. Retrying in {wait}s... ({e})")
                    time.sleep(wait)

            if i + self.batch_size < len(texts):
                time.sleep(self.delay)

        return all_embeddings

    def ensure_collection(self):
        try:
            info = self.qdrant.get_collection(self.collection_name)
            size = info.config.params.vectors.size
            if size != self.vector_size:
                logger.info(f"Dimension mismatch ({size}!={self.vector_size}). Recreating...")
                self.qdrant.delete_collection(self.collection_name)
                raise Exception("recreate")
            logger.info(f"Collection '{self.collection_name}' exists (dim={size})")
        except Exception:
            logger.info(f"Creating collection '{self.collection_name}'...")
            self.qdrant.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=self.vector_size,
                    distance=models.Distance.COSINE
                )
            )

    def store_in_qdrant(self, chunks: List[TextChunk]):
        if not chunks:
            return
        texts      = [c.content for c in chunks]
        embeddings = self.embed_batch(texts)

        points = [
            models.PointStruct(
                id=chunk.chunk_id,
                vector=emb,
                payload={
                    "text": chunk.content,
                    "source_file": chunk.source_file,
                    "chunk_index": chunk.chunk_index
                }
            )
            for chunk, emb in zip(chunks, embeddings)
        ]
        self.qdrant.upsert(collection_name=self.collection_name, points=points)
        logger.info(f"  Upserted {len(points)} points to Qdrant")

    def store_in_neon(self, chunks: List[TextChunk]):
        if not self.neon_url or not chunks:
            return
        conn = psycopg2.connect(self.neon_url)
        cur  = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS book_chunks (
                chunk_id   TEXT PRIMARY KEY,
                source_file TEXT,
                chunk_index INTEGER,
                content    TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        for c in chunks:
            cur.execute("""
                INSERT INTO book_chunks (chunk_id, source_file, chunk_index, content)
                VALUES (%s,%s,%s,%s)
                ON CONFLICT (chunk_id) DO UPDATE SET
                    content=EXCLUDED.content,
                    source_file=EXCLUDED.source_file,
                    chunk_index=EXCLUDED.chunk_index
            """, (c.chunk_id, c.source_file, c.chunk_index, c.content))
        conn.commit()
        cur.close()
        conn.close()
        logger.info(f"  {len(chunks)} chunks stored in Neon")

    def run(self, source_dir: str = "../docs/"):
        logger.info("=== Starting ingestion ===")
        t0 = time.time()

        self.ensure_collection()
        files = self.discover_docs(source_dir)
        total = 0

        for idx, fpath in enumerate(files, 1):
            logger.info(f"[{idx}/{len(files)}] {fpath}")
            try:
                content = self.load_content(fpath)
                chunks  = self.chunk_text(content, fpath)
                if not chunks:
                    logger.warning("  No chunks — skipping")
                    continue

                total += len(chunks)
                self.store_in_qdrant(chunks)
                self.store_in_neon(chunks)

            except Exception as e:
                logger.error(f"  FAILED: {e}")
                continue

        logger.info(f"=== Done! {len(files)} files, {total} chunks in {time.time()-t0:.1f}s ===")


if __name__ == "__main__":
    ingestor = BookIngestor()
    ingestor.run()
