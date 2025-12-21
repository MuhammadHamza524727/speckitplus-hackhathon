
# """
# Final Ingest Script for Physical AI Book
# Uses Cohere (FREE tier) for embeddings
# Stores in Qdrant + Neon
# """

# import os
# import glob
# import time
# import hashlib
# from pathlib import Path
# from typing import List
# from dataclasses import dataclass
# import logging
# import cohere
# from qdrant_client import QdrantClient
# from qdrant_client.http import models
# import psycopg2
# from dotenv import load_dotenv

# load_dotenv()

# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# @dataclass
# class TextChunk:
#     chunk_id: str
#     content: str
#     source_file: str
#     chunk_index: int

# class BookIngestor:
#     def __init__(self):
#         self.cohere_key = os.getenv("COHERE_API_KEY")
#         self.qdrant_url = os.getenv("QDRANT_URL")
#         self.qdrant_key = os.getenv("QDRANT_API_KEY")
#         self.neon_url = os.getenv("NEON_DB_URL")

#         if not all([self.cohere_key, self.qdrant_url, self.qdrant_key, self.neon_url]):
#             raise ValueError("Missing required env vars. Check .env file.")

#         self.co = cohere.Client(self.cohere_key)
#         self.qdrant = QdrantClient(url=self.qdrant_url, api_key=self.qdrant_key)

#         self.collection_name = "physical_ai_book"
#         self.embedding_model = "embed-english-v3.0"
#         self.vector_size = 1024

#     def discover_mdx(self, source_dir: str = "docs/") -> List[str]:
#         pattern = os.path.join(source_dir, "**/*.mdx")
#         files = glob.glob(pattern, recursive=True)
#         logger.info(f"Found {len(files)} MDX files")
#         return files

#     def load_content(self, file_path: str) -> str:
#         with open(file_path, 'r', encoding='utf-8') as f:
#             return f.read()

#     def chunk_text(self, text: str, source_file: str, chunk_size: int = 800, overlap: int = 100) -> List[TextChunk]:
#         chunks = []
#         start = 0
#         index = 0
#         while start < len(text):
#             end = start + chunk_size
#             chunk_text = text[start:end].strip()
#             if not chunk_text:
#                 break

#             chunk_id = hashlib.md5(f"{source_file}_{index}".encode()).hexdigest()

#             chunks.append(TextChunk(
#                 chunk_id=chunk_id,
#                 content=chunk_text,
#                 source_file=source_file,
#                 chunk_index=index
#             ))

#             index += 1
#             start = end - overlap

#         return chunks

#     def generate_embedding(self, text: str) -> List[float]:
#         response = self.co.embed(
#             texts=[text],
#             model=self.embedding_model,
#             input_type="search_document"
#         )
#         return response.embeddings[0]
#     def ensure_collection(self):
#         try:
#             collection_info = self.qdrant.get_collection(self.collection_name)
#             current_size = collection_info.config.params.vectors.size
#             if current_size != self.vector_size:
#               logger.info(f"Collection exists with wrong vector size ({current_size} != {self.vector_size}). Recreating...")
#               self.qdrant.delete_collection(self.collection_name)
#               raise ValueError("Wrong dimension")  # Force creation below
#             else:
#              logger.info(f"Collection '{self.collection_name}' already exists with correct size ({current_size})")
#         except (ValueError, Exception):
#             logger.info("Creating new Qdrant collection with correct dimension...")
#             self.qdrant.create_collection(
#             collection_name=self.collection_name,
#             vectors_config=models.VectorParams(
#                 size=self.vector_size,
#                 distance=models.Distance.COSINE
#             )
#         )

#     # def ensure_collection(self):
#     #     try:
#     #         self.qdrant.get_collection(self.collection_name)
#     #     except:
#     #         logger.info("Creating Qdrant collection...")
#     #         self.qdrant.create_collection(
#     #             collection_name=self.collection_name,
#     #             vectors_config=models.VectorParams(size=self.vector_size, distance=models.Distance.COSINE)
#     #         )

#     def store_in_qdrant(self, chunks: List[TextChunk]):
#         points = []
#         for chunk in chunks:
#             embedding = self.generate_embedding(chunk.content)
#             points.append(models.PointStruct(
#                 id=chunk.chunk_id,
#                 vector=embedding,
#                 payload={
#                     "text": chunk.content,
#                     "source_file": chunk.source_file,
#                     "chunk_index": chunk.chunk_index
#                 }
#             ))

#         self.qdrant.upsert(collection_name=self.collection_name, points=points)
#         logger.info(f"Upserted {len(chunks)} chunks to Qdrant")

#     def store_in_neon(self, chunks: List[TextChunk]):
#         conn = psycopg2.connect(self.neon_url)
#         cur = conn.cursor()

#         cur.execute("""
#             CREATE TABLE IF NOT EXISTS book_chunks (
#                 chunk_id TEXT PRIMARY KEY,
#                 source_file TEXT,
#                 chunk_index INTEGER,
#                 content TEXT,
#                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#             )
#         """)

#         for chunk in chunks:
#             cur.execute("""
#                 INSERT INTO book_chunks (chunk_id, source_file, chunk_index, content)
#                 VALUES (%s, %s, %s, %s)
#                 ON CONFLICT (chunk_id) DO UPDATE SET content = EXCLUDED.content
#             """, (chunk.chunk_id, chunk.source_file, chunk.chunk_index, chunk.content))

#         conn.commit()
#         cur.close()
#         conn.close()
#         logger.info("Metadata stored in Neon")

#     def run(self, source_dir: str = "../docs/"):
#         logger.info("Starting ingestion...")
#         start_time = time.time()

#         self.ensure_collection()
#         files = self.discover_mdx(source_dir)

#         total_chunks = 0
#         for file_path in files:
#             logger.info(f"Processing {file_path}")
#             content = self.load_content(file_path)
#             chunks = self.chunk_text(content, file_path)
#             total_chunks += len(chunks)

#             self.store_in_qdrant(chunks)
#             self.store_in_neon(chunks)

#         duration = time.time() - start_time
#         logger.info(f"Ingestion complete! {len(files)} files, {total_chunks} chunks in {duration:.2f}s")

# if __name__ == "__main__":
#     ingestor = BookIngestor()
#     ingestor.run()


"""
Final Ingest Script for Physical AI Book
Uses Cohere (FREE tier) safely with batching + rate limiting
Stores in Qdrant + Neon
"""

import os
import glob
import time
import hashlib
import logging
from pathlib import Path
from typing import List
from dataclasses import dataclass

import cohere
from cohere.errors import TooManyRequestsError
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
        self.neon_url = os.getenv("NEON_DB_URL")

        if not all([self.cohere_key, self.qdrant_url, self.qdrant_key, self.neon_url]):
            raise ValueError("Missing required env vars. Check .env file.")

        self.co = cohere.Client(self.cohere_key)
        self.qdrant = QdrantClient(url=self.qdrant_url, api_key=self.qdrant_key)

        self.collection_name = "physical_ai_book"
        self.embedding_model = "embed-english-v3.0"
        self.vector_size = 1024

        # Safe settings for Cohere Trial key (100 calls/min)
        self.batch_size = 64          # Safe batch size (<96 max)
        self.delay_between_batches = 1.0  # Seconds to wait between API calls

    def discover_mdx(self, source_dir: str = "../docs/") -> List[str]:
        pattern = os.path.join(source_dir, "**/*.mdx")
        files = glob.glob(pattern, recursive=True)
        logger.info(f"Found {len(files)} MDX files")
        return sorted(files)  # Consistent order

    def load_content(self, file_path: str) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def chunk_text(self, text: str, source_file: str, chunk_size: int = 800, overlap: int = 100) -> List[TextChunk]:
        chunks = []
        start = 0
        index = 0
        text_length = len(text)

        while start < text_length:
            end = min(start + chunk_size, text_length)
            chunk_text = text[start:end].strip()

            if not chunk_text:
                break

            chunk_id = hashlib.md5(f"{source_file}_{index}".encode()).hexdigest()

            chunks.append(TextChunk(
                chunk_id=chunk_id,
                content=chunk_text,
                source_file=source_file,
                chunk_index=index
            ))

            index += 1
            start = end - overlap if end < text_length else text_length

        return chunks

    def generate_embeddings_batched(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings with batching and retry logic"""
        embeddings = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            retries = 0
            max_retries = 5

            while retries <= max_retries:
                try:
                    response = self.co.embed(
                        texts=batch,
                        model=self.embedding_model,
                        input_type="search_document"
                    )
                    embeddings.extend(response.embeddings)
                    logger.info(f"Embedded batch {i//self.batch_size + 1}/{(len(texts)-1)//self.batch_size + 1} ({len(batch)} texts)")
                    break

                except TooManyRequestsError as e:
                    retries += 1
                    wait_time = (2 ** retries) + 1  # Exponential backoff + jitter
                    if retries > max_retries:
                        raise Exception("Max retries exceeded for rate limit")
                    logger.warning(f"Rate limited. Retrying in {wait_time}s (attempt {retries}/{max_retries})...")
                    time.sleep(wait_time)

            # Respect rate limit even on success
            if i + self.batch_size < len(texts):  # Don't delay after last batch
                time.sleep(self.delay_between_batches)

        return embeddings

    def ensure_collection(self):
        try:
            collection_info = self.qdrant.get_collection(self.collection_name)
            current_size = collection_info.config.params.vectors.size
            if current_size != self.vector_size:
                logger.info(f"Recreating collection due to dimension mismatch ({current_size} != {self.vector_size})")
                self.qdrant.delete_collection(self.collection_name)
                raise ValueError("Dimension mismatch")
            else:
                logger.info(f"Collection '{self.collection_name}' exists with correct dimension ({current_size})")
        except Exception:
            logger.info("Creating new Qdrant collection...")
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

        # Extract texts for batch embedding
        texts = [chunk.content for chunk in chunks]
        embeddings = self.generate_embeddings_batched(texts)

        points = []
        for chunk, embedding in zip(chunks, embeddings):
            points.append(models.PointStruct(
                id=chunk.chunk_id,
                vector=embedding,
                payload={
                    "text": chunk.content,
                    "source_file": chunk.source_file,
                    "chunk_index": chunk.chunk_index
                }
            ))

        self.qdrant.upsert(collection_name=self.collection_name, points=points)
        logger.info(f"Upserted {len(chunks)} chunks to Qdrant")

    def store_in_neon(self, chunks: List[TextChunk]):
        if not chunks:
            return

        conn = psycopg2.connect(self.neon_url)
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS book_chunks (
                chunk_id TEXT PRIMARY KEY,
                source_file TEXT,
                chunk_index INTEGER,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        for chunk in chunks:
            cur.execute("""
                INSERT INTO book_chunks (chunk_id, source_file, chunk_index, content)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (chunk_id) DO UPDATE SET 
                    content = EXCLUDED.content,
                    source_file = EXCLUDED.source_file,
                    chunk_index = EXCLUDED.chunk_index
            """, (chunk.chunk_id, chunk.source_file, chunk.chunk_index, chunk.content))

        conn.commit()
        cur.close()
        conn.close()
        logger.info(f"Stored {len(chunks)} chunks metadata in Neon")

    def run(self, source_dir: str = "../docs/"):
        logger.info("Starting safe ingestion (Cohere trial-friendly)...")
        start_time = time.time()

        self.ensure_collection()
        files = self.discover_mdx(source_dir)

        total_chunks = 0
        for file_idx, file_path in enumerate(files, 1):
            logger.info(f"Processing ({file_idx}/{len(files)}): {file_path}")
            try:
                content = self.load_content(file_path)
                chunks = self.chunk_text(content, file_path)
                if not chunks:
                    logger.warning(f"No chunks generated from {file_path}")
                    continue

                total_chunks += len(chunks)

                # Store in both databases
                self.store_in_qdrant(chunks)
                self.store_in_neon(chunks)

            except Exception as e:
                logger.error(f"Failed to process {file_path}: {e}")
                continue  # Continue with next file

        duration = time.time() - start_time
        logger.info(f"Ingestion complete! {len(files)} files processed, {total_chunks} chunks indexed in {duration:.2f} seconds.")

if __name__ == "__main__":
    ingestor = BookIngestor()
    ingestor.run()