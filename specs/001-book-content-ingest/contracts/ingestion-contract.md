# Ingestion API Contract

## Process: Ingest MDX Content

### Description
The ingestion process loads MDX files from the docs directory, chunks the content, generates embeddings, and stores them in the appropriate databases.

### Input Parameters
- **source_dir**: string (required) - Directory path containing MDX files (default: "docs/")
- **chunk_size**: integer (required) - Size of text chunks in characters (default: 500)
- **overlap_size**: integer (required) - Overlap size between chunks in characters (default: 100)
- **qdrant_collection**: string (required) - Name of Qdrant collection (default: "physical_ai_book")
- **neon_table**: string (required) - Name of Neon table (default: "chunks_meta")

### Process Flow

#### 1. File Discovery
- Scans source directory for all files matching pattern `**/*.mdx`
- Validates file accessibility and format
- Creates file list for processing

#### 2. Content Loading
- Reads content from each MDX file
- Preserves original file path information
- Handles file read errors gracefully

#### 3. Text Chunking
- Splits content into overlapping chunks of specified size
- Maintains chunk order within each source file
- Preserves context across chunk boundaries

#### 4. Embedding Generation
- Sends text chunks to Gemini embedding API
- Handles API rate limits and errors
- Creates vector embeddings for each chunk

#### 5. Storage
- Upserts embeddings to Qdrant collection with payload
  - Payload includes: source_file, chunk_index, text
- Stores chunk_id reference in Neon table chunks_meta
- Maintains consistency between both storage systems

### Output

#### Success Output
```json
{
  "status": "completed",
  "total_files_processed": 10,
  "total_chunks_created": 150,
  "qdrant_collection": "physical_ai_book",
  "neon_table": "chunks_meta",
  "processing_time_seconds": 45.2,
  "errors": 0
}
```

#### Error Output
```json
{
  "status": "failed",
  "total_files_processed": 5,
  "total_chunks_created": 75,
  "qdrant_collection": "physical_ai_book",
  "neon_table": "chunks_meta",
  "processing_time_seconds": 20.1,
  "errors": 2,
  "error_details": [
    {
      "file_path": "docs/chapter1.mdx",
      "error": "File not found"
    },
    {
      "file_path": "docs/chapter2.mdx",
      "error": "API rate limit exceeded"
    }
  ]
}
```

### Performance Requirements
- Process rate: Should handle 100+ MDX files efficiently
- Memory usage: Should process large files without excessive memory consumption
- API handling: Should gracefully handle rate limits and connection issues