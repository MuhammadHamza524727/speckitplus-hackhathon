# Quickstart: Book Content Ingestion

## Setup Instructions

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
pip install openai qdrant-client psycopg2-binary python-dotenv langchain
```

### 3. Configure Environment Variables
Ensure your `.env` file contains:
```
GEMINI_API_KEY=your_gemini_api_key_here
QDRANT_URL=your_qdrant_url_here
QDRANT_API_KEY=your_qdrant_api_key_here
NEON_DB_URL=your_neon_db_connection_string_here
```

### 4. Run the Ingestion Script
```bash
python ingest.py
```

## Development
- The main ingestion logic is in `backend/ingest.py`
- The script will automatically discover MDX files in the docs/ directory
- Text will be chunked into 500-character segments with 100-character overlap
- Embeddings will be stored in Qdrant collection 'physical_ai_book'
- Chunk metadata will be stored in Neon table 'chunks_meta'

## Testing
- Run `python -m pytest tests/` to execute all tests
- Ingestion functionality tests are in `tests/unit/test_ingest.py`
- Storage integration tests are in `tests/integration/test_storage.py`