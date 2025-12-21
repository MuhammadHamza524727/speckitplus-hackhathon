# Feature Specification: Book Content Ingestion

**Feature Branch**: `001-book-content-ingest`
**Created**: 2025-12-13
**Status**: Draft
**Input**: User description: "Ingest book content: Load all docs/**/*.mdx files, chunk text (500 chars, 100 overlap), embed with Gemini text-embedding-004 via OpenAI SDK, upsert to Qdrant collection 'physical_ai_book' with payload {source_file, chunk_index, text}, store chunk_id in Neon table 'chunks_meta'."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Book Content Loading (Priority: P1)

Content management system needs to load all book content from MDX files in the docs directory structure to prepare for RAG functionality. The system must be able to discover and read all MDX files recursively.

**Why this priority**: This is the foundational step that enables all downstream processing. Without loading the content, no other ingestion steps can proceed.

**Independent Test**: The system can be tested by running the loader against a sample directory structure with MDX files and verifying that all files are discovered and their content is read correctly.

**Acceptance Scenarios**:

1. **Given** a directory structure with MDX files, **When** the content loader runs, **Then** all files matching docs/**/*.mdx pattern are loaded and their content is accessible
2. **Given** the content loader is running, **When** it encounters different MDX files, **Then** it processes each file without errors and preserves the original content

---

### User Story 2 - Text Chunking (Priority: P2)

The system needs to break down the loaded book content into smaller, overlapping chunks to optimize for vector search and retrieval. Each chunk should be approximately 500 characters with 100-character overlap to maintain context.

**Why this priority**: Proper chunking is critical for effective retrieval in the RAG system. Without appropriate chunking, the quality of retrieved results will be significantly impacted.

**Independent Test**: The chunking functionality can be tested by providing sample text content and verifying that it's correctly split into chunks of approximately 500 characters with 100-character overlap.

**Acceptance Scenarios**:

1. **Given** a large text document, **When** the chunking process runs, **Then** the text is divided into chunks of approximately 500 characters with 100-character overlap
2. **Given** chunked text, **When** the process completes, **Then** no important context is lost at chunk boundaries and semantic coherence is maintained

---

### User Story 3 - Content Embedding and Storage (Priority: P3)

The system must generate vector embeddings for each text chunk using the Gemini text-embedding-004 model and store them in Qdrant vector database while maintaining metadata in Neon PostgreSQL database.

**Why this priority**: This is the core RAG functionality that enables semantic search and retrieval. Without proper embedding and storage, the RAG system cannot function effectively.

**Independent Test**: The system can be tested by running the embedding process on sample chunks and verifying that embeddings are created and stored correctly in both Qdrant and Neon databases.

**Acceptance Scenarios**:

1. **Given** text chunks, **When** the embedding process runs, **Then** vector embeddings are generated using Gemini text-embedding-004 model and stored in Qdrant collection 'physical_ai_book'
2. **Given** embedded chunks, **When** metadata is stored, **Then** chunk_id is stored in Neon table 'chunks_meta' with associated source_file, chunk_index, and text payload

---

## Edge Cases

- What happens when a MDX file is corrupted or cannot be read?
- How does the system handle very large MDX files that might cause memory issues?
- What occurs if the Qdrant or Neon database is temporarily unavailable during ingestion?
- How does the system handle files with special characters or encoding issues?
- What happens if the embedding API returns an error or rate-limits the requests?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load all MDX files from docs/**/* pattern recursively
- **FR-002**: System MUST chunk text content into approximately 500-character segments with 100-character overlap
- **FR-003**: System MUST generate embeddings using Gemini text-embedding-004 via OpenAI SDK
- **FR-004**: System MUST upsert embeddings to Qdrant collection 'physical_ai_book' with payload {source_file, chunk_index, text}
- **FR-005**: System MUST store chunk_id in Neon table 'chunks_meta' with associated metadata
- **FR-006**: System MUST handle file read errors gracefully and continue processing other files
- **FR-007**: System MUST preserve original text content and file structure information during processing

### Key Entities

- **MDX Content**: The original book content loaded from MDX files in the docs directory
- **Text Chunks**: Segments of approximately 500 characters with 100-character overlap created from original content
- **Vector Embeddings**: Numerical representations of text chunks generated by the Gemini embedding model
- **Qdrant Storage**: Vector database collection 'physical_ai_book' containing embeddings with metadata payload
- **Neon Metadata**: PostgreSQL table 'chunks_meta' containing chunk_id references and additional metadata

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All MDX files in docs directory structure are successfully loaded without errors
- **SC-002**: Text content is consistently chunked into 500-character segments with 100-character overlap
- **SC-003**: Embeddings are generated with less than 1% failure rate during the ingestion process
- **SC-004**: All chunks are successfully stored in Qdrant collection 'physical_ai_book' with correct payload structure
- **SC-005**: Chunk metadata is accurately stored in Neon table 'chunks_meta' with corresponding chunk_id references
