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
    description="Zero-cost RAG using Cohere + Qdrant",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

co = cohere.Client(os.getenv("COHERE_API_KEY"))
qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL", "").strip(),
    api_key=os.getenv("QDRANT_API_KEY", "").strip()
)

COLLECTION = "physical_ai_book"


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


def embed_query(text: str):
    """Embed using Cohere v5 API — supports both float and legacy response"""
    resp = co.embed(
        texts=[text],
        model="embed-english-v3.0",
        input_type="search_query",
        embedding_types=["float"]
    )
    # Cohere v5: resp.embeddings.float_ is a list of float vectors
    if hasattr(resp.embeddings, 'float_') and resp.embeddings.float_:
        return resp.embeddings.float_[0]
    # Fallback for older SDK versions
    return resp.embeddings[0]


def generate_answer(prompt: str) -> str:
    """Generate answer using Cohere v5 chat API"""
    # Cohere v5 uses messages list instead of message=
    response = co.chat(
        model="command-r-plus",
        messages=[{"role": "user", "content": prompt}]
    )
    # v5 response: response.message.content[0].text
    if hasattr(response, 'message') and response.message.content:
        return response.message.content[0].text.strip()
    # Fallback for older SDK
    if hasattr(response, 'text'):
        return response.text.strip()
    return str(response)


@app.post("/rag-query", response_model=QueryResponse)
async def query(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(400, "Query cannot be empty")

    try:
        # 1. Embed the query
        vec = embed_query(req.query)

        # 2. Search Qdrant
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

        # 3. Build context from results
        context = ""
        sources = []
        for r in points:
            p = getattr(r, 'payload', None) or (r.get('payload') if isinstance(r, dict) else {})
            score = getattr(r, 'score', 0.0) or (r.get('score', 0.0) if isinstance(r, dict) else 0.0)

            if p:
                context += f"[Source: {p.get('source_file', 'Unknown')}]\n{p.get('text', '')}\n\n"
                sources.append(Source(
                    file=p.get('source_file', 'Unknown'),
                    chunk_index=p.get('chunk_index', 0),
                    score=round(float(score), 3)
                ))

        # 4. Generate answer
        prompt = f"""You are an expert AI assistant for a Physical AI and Humanoid Robotics textbook.
Answer the question using ONLY the provided book context. Be accurate, clear, and professional.

Context from book:
{context}

Question: {req.query}

Answer:"""

        answer = generate_answer(prompt)
        return QueryResponse(answer=answer, sources=sources, query=req.query)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Error: {str(e)}")


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "cohere_version": cohere.__version__,
        "services": {"cohere": True, "qdrant": True},
        "message": "Cohere v5 + Qdrant RAG system ready!"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
