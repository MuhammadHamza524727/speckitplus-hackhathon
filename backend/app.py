from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

import cohere
from qdrant_client import QdrantClient
import os
from typing import List

load_dotenv()

app = FastAPI(
    title="Physical AI Book RAG - Hackathon Edition",
    description="Zero-cost RAG using Cohere v5 + Qdrant",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cohere v5 — use ClientV2 for new messages API
co = cohere.ClientV2(os.getenv("COHERE_API_KEY"))

qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL", "").strip(),
    api_key=os.getenv("QDRANT_API_KEY", "").strip()
)

COLLECTION = "physical_ai_book"
CHAT_MODEL = "command-r-plus-08-2024"
EMBED_MODEL = "embed-english-v3.0"


class QueryRequest(BaseModel):
    query: str


class Source(BaseModel):
    file: str
    chunk_index: int
    score: float


class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]
    query: str = ""


@app.get("/")
def home():
    return {"message": "Physical AI Book RAG is LIVE! Go to /docs to test"}


def embed_query(text: str) -> list:
    """Embed text using Cohere v5 ClientV2"""
    resp = co.embed(
        texts=[text],
        model=EMBED_MODEL,
        input_type="search_query",
        embedding_types=["float"]
    )
    return resp.embeddings.float_[0]


def generate_answer(prompt: str) -> str:
    """Generate answer using Cohere v5 ClientV2 chat"""
    response = co.chat(
        model=CHAT_MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.message.content[0].text.strip()


@app.post("/rag-query", response_model=QueryResponse)
async def query(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        # 1. Embed the query
        vec = embed_query(req.query)

        # 2. Search Qdrant for relevant chunks
        results = qdrant.query_points(
            collection_name=COLLECTION,
            query=vec,
            limit=5,
            with_payload=True
        )

        points = results.points if hasattr(results, 'points') else results

        if not points:
            return QueryResponse(
                answer="No relevant information found in the book for this query.",
                sources=[],
                query=req.query
            )

        # 3. Build context from top results
        context = ""
        sources = []
        for r in points:
            if isinstance(r, dict):
                p = r.get('payload', {})
                score = r.get('score', 0.0)
            else:
                p = getattr(r, 'payload', {}) or {}
                score = float(getattr(r, 'score', 0.0))

            if p:
                context += f"[Source: {p.get('source_file', 'Unknown')}]\n{p.get('text', '')}\n\n"
                sources.append(Source(
                    file=p.get('source_file', 'Unknown'),
                    chunk_index=p.get('chunk_index', 0),
                    score=round(score, 3)
                ))

        # 4. Build prompt and generate answer
        prompt = f"""You are an expert AI assistant for a Physical AI and Humanoid Robotics textbook.
Answer the question using ONLY the provided book context below. Be accurate, clear, and professional.
If the context does not contain enough information, say so honestly.

Book Context:
{context}
Question: {req.query}

Answer:"""

        answer = generate_answer(prompt)
        return QueryResponse(answer=answer, sources=sources, query=req.query)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG pipeline error: {str(e)}")


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "cohere_version": cohere.__version__,
        "chat_model": CHAT_MODEL,
        "embed_model": EMBED_MODEL,
        "message": "Cohere v5 ClientV2 + Qdrant ready!"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
