---
description: "Task list for Book Content Ingestion"
---

# Tasks: Book Content Ingestion

**Input**: Design documents from `/specs/001-book-content-ingest/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /sp.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend/ingest.py file structure
- [X] T002 Update requirements.txt with ingestion dependencies (openai, qdrant-client, psycopg2-binary, langchain)
- [X] T003 [P] Verify environment variables are properly configured for Qdrant and Neon

---
## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [X] T004 Implement MDX file discovery function in backend/ingest.py
- [X] T005 [P] Implement text chunking function with 500 chars and 100-char overlap in backend/ingest.py
- [X] T006 [P] Implement error handling for file read operations in backend/ingest.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Book Content Loading (Priority: P1) 🎯 MVP

**Goal**: Load all book content from MDX files in the docs directory structure to prepare for RAG functionality

**Independent Test**: Can verify content loading by running the script and confirming all MDX files are discovered and their content is read

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Create MDX file discovery test in tests/unit/test_ingest.py
- [ ] T008 [P] [US1] Create file reading functionality test in tests/unit/test_ingest.py

### Implementation for User Story 1

- [X] T009 [US1] Implement MDX file loading functionality in backend/ingest.py
- [X] T010 [US1] Add directory traversal for docs/**/*.mdx pattern
- [X] T011 [US1] Test that all MDX files are discovered and loaded successfully

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Text Chunking (Priority: P2)

**Goal**: Break down the loaded book content into smaller, overlapping chunks to optimize for vector search and retrieval

**Independent Test**: Can verify chunking by providing sample text and confirming it's split into 500-char segments with 100-char overlap

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T012 [P] [US2] Create text chunking test in tests/unit/test_ingest.py

### Implementation for User Story 2

- [X] T013 [US2] Implement text chunking with 500-character segments in backend/ingest.py
- [X] T014 [US2] Add 100-character overlap functionality to chunking logic
- [X] T015 [US2] Test chunking preserves context at boundaries

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Content Embedding and Storage (Priority: P3)

**Goal**: Generate vector embeddings for each text chunk using the Gemini text-embedding-004 model and store in Qdrant/Neon

**Independent Test**: Can verify embedding and storage by running the process on sample chunks and confirming they're stored correctly

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T016 [P] [US3] Create embedding generation test in tests/unit/test_ingest.py
- [ ] T017 [P] [US3] Create Qdrant storage test in tests/integration/test_storage.py
- [ ] T018 [P] [US3] Create Neon metadata storage test in tests/integration/test_storage.py

### Implementation for User Story 3

- [X] T019 [US3] Implement Gemini embedding generation via OpenAI SDK in backend/ingest.py
- [X] T020 [US3] Implement Qdrant upsert to 'physical_ai_book' collection with payload in backend/ingest.py
- [X] T021 [US3] Implement Neon storage to 'chunks_meta' table with chunk_id in backend/ingest.py
- [X] T022 [US3] Test complete end-to-end ingestion pipeline

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T023 [P] Add comprehensive logging to backend/ingest.py
- [X] T024 Add progress tracking and reporting to ingestion process
- [X] T025 Run complete ingestion pipeline to populate Qdrant and Neon databases
- [X] T026 Test python backend/ingest.py execution with real MDX content

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 (needs loaded content to chunk)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US2 (needs chunks to embed)

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

### Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Create MDX file discovery test in tests/unit/test_ingest.py"
Task: "Create file reading functionality test in tests/unit/test_ingest.py"

# Launch the implementation:
Task: "Implement MDX file loading functionality in backend/ingest.py"
Task: "Add directory traversal for docs/**/*.mdx pattern"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence