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

# Add CORS middleware to allow requests from Docusaurus frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

co = cohere.Client(os.getenv("COHERE_API_KEY"))
qdrant = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))

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
    resp = co.embed(texts=[text], model="embed-english-v3.0", input_type="search_query")
    return resp.embeddings[0]

@app.post("/rag-query", response_model=QueryResponse)
async def query(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(400, "Query empty hai bhai")

    try:
        vec = embed_query(req.query)

        results = qdrant.query_points(
            collection_name=COLLECTION,
            query=vec,
            limit=5,
            with_payload=True
        )

        # Handle QueryResponse object (newer Qdrant API)
        if hasattr(results, 'points'):
            points = results.points
        else:
            points = results  # Fallback to older API

        if not points:
            return QueryResponse(answer="Book mein is topic pe info nahi mili.", sources=[], query=req.query)

        context = ""
        sources = []
        for r in points:
            # Check if r is a ScoredPoint object or has different structure
            if hasattr(r, 'payload'):
                p = r.payload
                score = getattr(r, 'score', 0.0)
            elif isinstance(r, dict) and 'payload' in r:
                p = r['payload']
                score = r.get('score', 0.0)
            else:
                # For newer Qdrant versions, the structure might be different
                p = getattr(r, 'payload', {})
                score = getattr(r, 'score', 0.0)

            if p:  # Check if payload exists and is not empty
                context += f"[Source: {p.get('source_file', 'Unknown')}]\n{p.get('text', '')}\n\n"
                sources.append(Source(
                    file=p.get('source_file', 'Unknown'),
                    chunk_index=p.get('chunk_index', 0),
                    score=round(score, 3)
                ))

        prompt = f"""Answer the question using ONLY the book context below. Be accurate and professional.

Context:
{context}

Question: {req.query}

Answer:"""

        # Using command-nightly model which should be available
        chat_resp = co.chat(message=prompt, model="command-nightly", temperature=0.1)
        answer = chat_resp.text.strip()

        return QueryResponse(answer=answer, sources=sources, query=req.query)

    except Exception as e:
        raise HTTPException(500, f"Error: {str(e)}")

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "services": {
            "cohere": True,
            "qdrant": True
        },
        "message": "Cohere + Qdrant RAG system ready!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)