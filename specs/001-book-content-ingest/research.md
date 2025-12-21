# Research: Book Content Ingestion

## Decision: Python version and dependencies
**Rationale**: Python 3.11+ chosen for compatibility with modern libraries needed for the ingestion pipeline. Dependencies selected based on feature specification requirements:
- openai: For OpenAI SDK integration (with Gemini embedding model)
- qdrant-client: For vector database operations with Qdrant Cloud
- psycopg2-binary: For PostgreSQL connectivity with Neon Serverless
- python-dotenv: For environment variable management
- langchain: For text chunking utilities

## Decision: Text chunking approach
**Rationale**: Using character-based chunking with 500-character segments and 100-character overlap to maintain semantic coherence while optimizing for vector search. This approach balances context preservation with search efficiency.

## Decision: Embedding model selection
**Rationale**: Using Gemini text-embedding-004 model via OpenAI SDK for generating vector embeddings. This model provides good balance of accuracy and cost-effectiveness for the RAG system.

## Decision: Storage architecture
**Rationale**: Dual storage approach with Qdrant for vector embeddings (optimized for similarity search) and Neon PostgreSQL for metadata (structured querying capabilities). This separation allows optimized access patterns for each data type.

## Alternatives considered:
- Sentence vs character chunking: Character-based chosen for more consistent segment sizes
- Single vs dual storage: Dual storage chosen for performance optimization (vector DB for embeddings, relational DB for metadata)
- Different embedding models: Gemini text-embedding-004 chosen based on specification requirements