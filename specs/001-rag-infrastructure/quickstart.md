# Quickstart: RAG Infrastructure

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Create Backend Directory
```bash
mkdir -p backend
cd backend
```

### 3. Install Dependencies
```bash
pip install fastapi uvicorn openai langchain qdrant-client psycopg2-binary python-dotenv
```

### 4. Create Environment Configuration
Create a `.env` file with the following content:
```
GEMINI_API_KEY=your_gemini_api_key_here
QDRANT_URL=your_qdrant_url_here
QDRANT_API_KEY=your_qdrant_api_key_here
NEON_DB_URL=your_neon_db_connection_string_here
```

### 5. Run the Application
```bash
uvicorn app:app --reload
```

### 6. Test Health Endpoint
Visit `http://localhost:8000/health` to verify the system is running.

## Development
- The main application code is in `app.py`
- The health endpoint is available at `/health`
- All configuration is managed through environment variables

## Testing
- Run `python -m pytest` to execute tests
- Health endpoint tests are in `tests/unit/test_health.py`