# Data Model: Book Content Ingestion

## Entities

### MDXContent
- **file_path**: string (required) - Path to the MDX file in the docs directory
- **content**: string (required) - Raw text content from the MDX file
- **metadata**: object (optional) - Additional file metadata (size, creation date, etc.)

### TextChunk
- **chunk_id**: string (required) - Unique identifier for the chunk
- **content**: string (required) - Text content (approximately 500 characters)
- **source_file**: string (required) - Original MDX file path
- **chunk_index**: integer (required) - Sequential index of the chunk in the source file
- **overlap_start**: integer (optional) - Character position where overlap with previous chunk starts
- **overlap_end**: integer (optional) - Character position where overlap with next chunk ends

### VectorEmbedding
- **embedding_id**: string (required) - Unique identifier matching chunk_id
- **vector**: array (required) - Numerical vector representation of the text chunk
- **source_chunk_id**: string (required) - Reference to the TextChunk entity
- **model_used**: string (required) - Name of the embedding model (e.g., "text-embedding-004")

### ChunkMetadata
- **chunk_id**: string (required) - Primary key, matches the chunk_id in Qdrant
- **source_file**: string (required) - Original MDX file path
- **chunk_index**: integer (required) - Sequential index of the chunk in the source file
- **text_content**: string (required) - Original text content of the chunk
- **created_at**: datetime (required) - Timestamp of when the chunk was created
- **ingestion_batch**: string (optional) - Identifier for the ingestion batch

## Relationships
- MDXContent contains multiple TextChunks (one-to-many)
- TextChunk generates one VectorEmbedding (one-to-one)
- TextChunk stores one ChunkMetadata record (one-to-one)

## Validation Rules
- TextChunk content must be between 400-600 characters (approximately 500 with 100-char overlap)
- Chunk index must be sequential within each source file
- Vector embeddings must be successfully generated before storing metadata
- Source file paths must exist and be readable