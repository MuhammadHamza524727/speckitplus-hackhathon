from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from typing import List, Optional
from datetime import datetime, timedelta
import cohere
from qdrant_client import QdrantClient
from jose import JWTError, jwt
import bcrypt as _bcrypt
import psycopg2
import psycopg2.extras
import os
import hashlib
import base64

load_dotenv()

# ─── App ──────────────────────────────────────────────
app = FastAPI(title="Physical AI Book API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Config ───────────────────────────────────────────
SECRET_KEY   = os.getenv("JWT_SECRET", "physicalai-super-secret-key-2024")
ALGORITHM    = "HS256"
TOKEN_EXPIRE = 60 * 24 * 7   # 7 days in minutes

CHAT_MODEL   = "command-r-plus-08-2024"
EMBED_MODEL  = "embed-english-v3.0"
COLLECTION   = "physical_ai_book"

# ─── Clients ──────────────────────────────────────────
co     = cohere.ClientV2(os.getenv("COHERE_API_KEY")) if os.getenv("COHERE_API_KEY") else None
qdrant = QdrantClient(url=os.getenv("QDRANT_URL","").strip(), api_key=os.getenv("QDRANT_API_KEY","").strip()) if os.getenv("QDRANT_URL") else None

bearer = HTTPBearer(auto_error=False)

def _hash_password(password: str) -> str:
    """SHA-256 then bcrypt — avoids 72-byte limit, no passlib needed."""
    digest = base64.b64encode(hashlib.sha256(password.encode()).digest())
    return _bcrypt.hashpw(digest, _bcrypt.gensalt(12)).decode()

def _verify_password(password: str, hashed: str) -> bool:
    digest = base64.b64encode(hashlib.sha256(password.encode()).digest())
    return _bcrypt.checkpw(digest, hashed.encode())

# ─── DB Helper ────────────────────────────────────────
def get_db():
    return psycopg2.connect(os.getenv("NEON_DB_URL"))

def init_db():
    """Create all tables on startup"""
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id         SERIAL PRIMARY KEY,
                name       TEXT NOT NULL,
                email      TEXT UNIQUE NOT NULL,
                password   TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS reading_progress (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
                chapter     TEXT NOT NULL,
                completed   BOOLEAN DEFAULT FALSE,
                progress_pct INTEGER DEFAULT 0,
                last_read   TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, chapter)
            );

            CREATE TABLE IF NOT EXISTS chat_history (
                id         SERIAL PRIMARY KEY,
                user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
                question   TEXT NOT NULL,
                answer     TEXT NOT NULL,
                sources    TEXT,
                chapter    TEXT DEFAULT 'general',
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS quiz_results (
                id         SERIAL PRIMARY KEY,
                user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
                chapter    TEXT NOT NULL,
                score      INTEGER NOT NULL,
                total      INTEGER NOT NULL,
                answers    TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)
        conn.commit()
        cur.close()
        conn.close()
        print("✓ Database tables ready")
    except Exception as e:
        print(f"⚠ DB init warning: {e}")

init_db()

# ─── JWT Helpers ──────────────────────────────────────
def create_token(user_id: int, email: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE)
    return jwt.encode({"sub": str(user_id), "email": email, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload  = decode_token(creds.credentials)
        user_id  = int(payload["sub"])
        email    = payload["email"]
        return {"id": user_id, "email": email}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_optional_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    if not creds:
        return None
    try:
        payload = decode_token(creds.credentials)
        return {"id": int(payload["sub"]), "email": payload["email"]}
    except:
        return None

# ─── Schemas ──────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

class ProgressUpdate(BaseModel):
    chapter: str
    completed: bool = False
    progress_pct: int = 0

class ChatSave(BaseModel):
    question: str
    answer: str
    sources: Optional[str] = ""
    chapter: Optional[str] = "general"

class QuizResult(BaseModel):
    chapter: str
    score: int
    total: int
    answers: Optional[str] = ""

class QueryRequest(BaseModel):
    query: str
    chapter: Optional[str] = "general"

class Source(BaseModel):
    file: str
    chunk_index: int
    score: float

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]
    query: str = ""

# ─── AUTH ROUTES ──────────────────────────────────────
@app.post("/auth/signup", response_model=AuthResponse)
def signup(req: SignupRequest):
    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("SELECT id FROM users WHERE email=%s", (req.email,))
        if cur.fetchone():
            raise HTTPException(400, "Email already registered")

        hashed = _hash_password(req.password)
        cur.execute(
            "INSERT INTO users (name, email, password) VALUES (%s,%s,%s) RETURNING id, name, email",
            (req.name, req.email, hashed)
        )
        user = dict(cur.fetchone())
        conn.commit()
        cur.close(); conn.close()

        token = create_token(user["id"], user["email"])
        return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Signup error: {str(e)}")


@app.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest):
    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("SELECT * FROM users WHERE email=%s", (req.email,))
        user = cur.fetchone()
        cur.close(); conn.close()

        if not user or not _verify_password(req.password, user["password"]):
            raise HTTPException(401, "Invalid email or password")

        token = create_token(user["id"], user["email"])
        return {
            "token": token,
            "user": {"id": user["id"], "name": user["name"], "email": user["email"]}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Login error: {str(e)}")


@app.get("/auth/me")
def get_me(current_user = Depends(get_current_user)):
    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, name, email, created_at FROM users WHERE id=%s", (current_user["id"],))
        user = cur.fetchone()
        cur.close(); conn.close()
        if not user:
            raise HTTPException(404, "User not found")
        return dict(user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

# ─── PROGRESS ROUTES ──────────────────────────────────
@app.post("/user/progress")
def save_progress(req: ProgressUpdate, current_user = Depends(get_current_user)):
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            INSERT INTO reading_progress (user_id, chapter, completed, progress_pct, last_read)
            VALUES (%s, %s, %s, %s, NOW())
            ON CONFLICT (user_id, chapter)
            DO UPDATE SET completed=EXCLUDED.completed,
                          progress_pct=EXCLUDED.progress_pct,
                          last_read=NOW()
        """, (current_user["id"], req.chapter, req.completed, req.progress_pct))
        conn.commit()
        cur.close(); conn.close()
        return {"message": "Progress saved"}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/user/progress")
def get_progress(current_user = Depends(get_current_user)):
    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT chapter, completed, progress_pct, last_read FROM reading_progress WHERE user_id=%s ORDER BY last_read DESC", (current_user["id"],))
        rows = [dict(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return {"progress": rows}
    except Exception as e:
        raise HTTPException(500, str(e))

# ─── CHAT HISTORY ROUTES ──────────────────────────────
@app.post("/user/chat")
def save_chat(req: ChatSave, current_user = Depends(get_current_user)):
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "INSERT INTO chat_history (user_id, question, answer, sources, chapter) VALUES (%s,%s,%s,%s,%s)",
            (current_user["id"], req.question, req.answer, req.sources, req.chapter)
        )
        conn.commit()
        cur.close(); conn.close()
        return {"message": "Chat saved"}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/user/chat-history")
def get_chat_history(limit: int = 20, current_user = Depends(get_current_user)):
    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "SELECT id, question, answer, chapter, created_at FROM chat_history WHERE user_id=%s ORDER BY created_at DESC LIMIT %s",
            (current_user["id"], limit)
        )
        rows = [dict(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return {"history": rows}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.delete("/user/chat-history")
def clear_chat_history(current_user = Depends(get_current_user)):
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("DELETE FROM chat_history WHERE user_id=%s", (current_user["id"],))
        conn.commit()
        cur.close(); conn.close()
        return {"message": "Chat history cleared"}
    except Exception as e:
        raise HTTPException(500, str(e))

# ─── QUIZ ROUTES ──────────────────────────────────────
@app.post("/user/quiz")
def save_quiz(req: QuizResult, current_user = Depends(get_current_user)):
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "INSERT INTO quiz_results (user_id, chapter, score, total, answers) VALUES (%s,%s,%s,%s,%s)",
            (current_user["id"], req.chapter, req.score, req.total, req.answers)
        )
        conn.commit()
        cur.close(); conn.close()
        return {"message": "Quiz result saved"}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/user/quiz-results")
def get_quiz_results(current_user = Depends(get_current_user)):
    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "SELECT chapter, score, total, created_at FROM quiz_results WHERE user_id=%s ORDER BY created_at DESC",
            (current_user["id"],)
        )
        rows = [dict(r) for r in cur.fetchall()]
        cur.close(); conn.close()
        return {"results": rows}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/quiz/generate")
def generate_quiz(chapter: str, current_user = Depends(get_current_user)):
    """Generate MCQ quiz from chapter using Cohere"""
    if not co:
        raise HTTPException(503, "AI service not configured")
    try:
        prompt = f"""Generate 5 multiple choice questions about "{chapter}" from a Physical AI and Humanoid Robotics textbook.

Format EXACTLY like this JSON (no extra text):
[
  {{
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "answer": "A"
  }}
]

Make questions educational and relevant to robotics/AI students."""

        response = co.chat(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.message.content[0].text.strip()
        # Extract JSON from response
        import json, re
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            questions = json.loads(match.group())
            return {"chapter": chapter, "questions": questions}
        return {"chapter": chapter, "questions": [], "raw": text}
    except Exception as e:
        raise HTTPException(500, f"Quiz generation error: {str(e)}")

# ─── RAG QUERY ────────────────────────────────────────
def embed_query(text: str) -> list:
    resp = co.embed(texts=[text], model=EMBED_MODEL, input_type="search_query", embedding_types=["float"])
    return resp.embeddings.float_[0]

def generate_answer(prompt: str) -> str:
    response = co.chat(model=CHAT_MODEL, messages=[{"role": "user", "content": prompt}])
    return response.message.content[0].text.strip()

@app.post("/rag-query", response_model=QueryResponse)
async def rag_query(req: QueryRequest, current_user = Depends(get_optional_user)):
    if not req.query.strip():
        raise HTTPException(400, "Query cannot be empty")
    if not co or not qdrant:
        raise HTTPException(503, "AI service not configured")

    try:
        vec     = embed_query(req.query)
        results = qdrant.query_points(collection_name=COLLECTION, query=vec, limit=5, with_payload=True)
        points  = results.points if hasattr(results, 'points') else results

        if not points:
            return QueryResponse(answer="No relevant information found in the book for this query.", sources=[], query=req.query)

        context, sources = "", []
        for r in points:
            p     = getattr(r, 'payload', {}) or {}
            score = float(getattr(r, 'score', 0.0))
            if p:
                context += f"[Source: {p.get('source_file','Unknown')}]\n{p.get('text','')}\n\n"
                sources.append(Source(file=p.get('source_file','Unknown'), chunk_index=p.get('chunk_index',0), score=round(score,3)))

        prompt = f"""You are an expert AI assistant for a Physical AI and Humanoid Robotics textbook.
Answer using ONLY the book context below. Be accurate, clear, and professional.

Context:
{context}
Question: {req.query}
Answer:"""

        answer = generate_answer(prompt)

        # Auto-save chat if user is logged in
        if current_user:
            try:
                conn = get_db()
                cur  = conn.cursor()
                sources_str = ", ".join([s.file for s in sources])
                cur.execute(
                    "INSERT INTO chat_history (user_id, question, answer, sources, chapter) VALUES (%s,%s,%s,%s,%s)",
                    (current_user["id"], req.query, answer, sources_str, req.chapter)
                )
                conn.commit()
                cur.close(); conn.close()
            except:
                pass  # Don't fail RAG if chat save fails

        return QueryResponse(answer=answer, sources=sources, query=req.query)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG pipeline error: {str(e)}")

# ─── MISC ─────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "Physical AI Book API v3 — Auth + RAG + Progress + Quiz"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "version": "3.0",
        "features": ["auth", "rag", "progress", "chat-history", "quiz"],
        "cohere": co is not None,
        "qdrant": qdrant is not None,
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
