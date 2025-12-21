<!-- SYNC IMPACT REPORT:
Version change: 1.0.0 → 1.0.0 (initial creation)
Modified principles: None (new document)
Added sections: All sections (new document)
Removed sections: None
Templates requiring updates: ✅ updated / ⚠ pending
Follow-up TODOs: None
-->
# RAG Chatbot for Physical AI & Humanoid Robotics Textbook Constitution

## Core Principles

### Spec-Driven Development
All development work must follow a spec-driven approach with step-by-step implementation; No features or functionality should be implemented without clear specifications; Documentation and implementation must remain synchronized throughout the development process.

### No Hallucinations Policy
All technical claims and generated responses must be grounded in the textbook content; No fabricated information, data, or references allowed; Generated responses must be traceable to specific source content from the book.

### FastAPI Backend Architecture
Backend services must be built using FastAPI framework for optimal performance and developer experience; API endpoints must follow RESTful principles with proper error handling; All endpoints must include comprehensive documentation via automatic OpenAPI generation.

### Qdrant Vector Storage Integration
All book content must be chunked into 500-token segments and stored in Qdrant collection 'physical_ai_book'; Vector embeddings must be generated using appropriate embedding models; Content retrieval must return top-5 most relevant chunks for RAG queries.

### Neon Postgres Metadata Management
Document metadata must be stored in Neon Serverless Postgres table 'chunks' with proper schema design; Metadata tracking must include source file, chunk position, and content references; Database operations must be optimized for serverless deployment patterns.

### Gemini Integration via OpenAI SDK
Content generation must use OpenAI SDK with Gemini model for responses; API keys must be securely stored in .env files and never committed to version control; Response generation must properly augment prompts with retrieved context.

### Docusaurus Frontend Integration
Frontend integration must be embedded within existing Docusaurus site structure; Text selection functionality must trigger floating "Ask" button for seamless user experience; Modal/chat UI must be lightweight with minimal dependencies.

### Reference Accuracy and Documentation
All external references must use exact URLs as specified (https://qdrant.tech, https://neon.tech, https://fastapi.tiangolo.com); Code documentation must include file references with exact paths (backend/app.py, backend/ingest.py, src/components/RagChat.js); Implementation steps must be clearly documented with expected outputs.

## Technical Standards

### File Organization and Structure
Backend code must be organized in backend/ directory with clear separation of concerns; Frontend components must follow Docusaurus component patterns in src/ directory; Configuration files must be properly structured and version-controlled.

### Testing and Validation Protocol
Backend endpoints must be tested with uvicorn during development; Frontend integration must be validated with npx docusaurus start; All components must pass integration testing before deployment.

### Security and Configuration Management
API keys and sensitive information must be managed through environment variables only; No hardcoded credentials or secrets in source code; Proper input validation must be implemented for all user-facing endpoints.

### Content Ingestion Pipeline
MDX file parsing must handle all textbook content formats properly; Chunking algorithm must maintain semantic coherence within 500-token limits; Ingestion pipeline must track and log all processing steps for debugging.

## Development Workflow

### Implementation Phases
Development must proceed in logical phases: ingestion → backend → frontend → integration testing; Each phase must be validated before proceeding to the next; Progress must be tracked with clear milestones and deliverables.

### File Creation and Management
All specified files must be created at exact paths: backend/app.py, backend/ingest.py, src/components/RagChat.js; File naming and location must follow project conventions; Dependencies must be properly declared and managed.

### Quality Assurance Process
Code must be validated for adherence to all specified principles before acceptance; Integration testing must verify end-to-end functionality; Performance and security checks must pass before deployment.

## Governance

This constitution governs all contributions to the RAG Chatbot for Physical AI & Humanoid Robotics textbook project. All developers and contributors must comply with these principles. Amendments require documented justification and approval from the project maintainers. Code reviews must verify adherence to all principles before acceptance.

**Version**: 1.0.0 | **Ratified**: 2025-12-13 | **Last Amended**: 2025-12-13