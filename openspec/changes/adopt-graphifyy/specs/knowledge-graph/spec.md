## MODIFIED Requirements

### Requirement: Named relationship types

The graph schema SHALL represent concept-to-concept relationships as named edges drawn from a curated, extensible vocabulary stored in `hive_mind.relationship_vocab`. The seeded vocabulary set MODIFIES from seven to **ten** names: the original `depends_on`, `defined_in`, `supersedes`, `mentions`, `related_to`, `causes`, `derived_from`, PLUS three new entries `calls`, `imports`, `uses` to host graphifyy-extracted code edges.

The new names MUST be inserted with `directed = true`, `deprecated_at = null`, and human-readable descriptions:
- `calls`: function A invokes function B (`EXTRACTED` or `INFERRED` via tree-sitter)
- `imports`: module/file A pulls a symbol from module/file B
- `uses`: symbol A references symbol B's identifier without invoking it

All vocabulary CRUD requirements from `add-knowledge-graph` continue to apply unchanged.

#### Scenario: Ten seeded vocabulary entries

- **WHEN** the database first starts under this change
- **THEN** `relationship_vocab` contains the ten seeded names listed above with `deprecated_at IS NULL`

#### Scenario: Graphifyy edge of type `calls` is accepted

- **WHEN** the ingestion service inserts a relationship_edge with `type = "calls"` derived from a graphifyy result
- **THEN** the FK to `relationship_vocab.name` succeeds
- **AND** the row is queryable through the traverse API

### Requirement: Automatic relationship extraction

Ingestion SHALL extract concepts and relationships from every ingested file. This change MODIFIES the extraction path: extraction is **bifurcated** by file type.

**Code files** (extensions in the graphifyy code-extensions set) MUST be processed by `graphify.extract([path])`. The graphifyy nodes and edges MUST be persisted directly to `hive_mind.concept` and `hive_mind.relationship_edge` by the new `graph_writer` module. Code extraction MUST NOT call any chat model; no `extractor_errors` counter for "chat unavailable" applies on this path.

**Non-code files** (markdown, plain text, restructured text, future PDF / HTML / MDX) MUST be processed by the LLM extractor (`extract_for_chunk` from `add-knowledge-graph`). That path remains unchanged from `add-knowledge-graph` and continues to write `candidate`-state rows for review.

If a code file is processed but produces zero graphifyy nodes (e.g., a config script that ended up in the code path), the LLM extractor MUST NOT be invoked as a fallback for that file — graph extraction simply skips. The text/embedding path still produces the catalog row and vector point via the paragraph fallback established in the `ingestion` spec.

#### Scenario: Python file extraction is fully deterministic

- **WHEN** ingestion processes a Python file containing two classes and a top-level function
- **THEN** `graphify.extract` is called exactly once for that file
- **AND** no chat-model call is made for any chunk derived from that file
- **AND** `hive_mind_extractor_errors_total{reason="chat_unavailable"}` is NOT incremented

#### Scenario: Markdown file extraction uses LLM

- **WHEN** ingestion processes a markdown file
- **THEN** `graphify.extract` is NOT called for that file
- **AND** the LLM extractor is invoked per chunk as specified in `add-knowledge-graph`

#### Scenario: Code file with zero symbols skips graph extraction

- **WHEN** ingestion processes a Python file that contains only configuration constants (no functions, no classes)
- **THEN** the paragraph chunker handles embedding
- **AND** no graph rows are written for that file
- **AND** the LLM extractor is NOT invoked as a backup

### Requirement: Review, promote, edit, and delete

The admin API MUST continue to expose endpoints to list, promote, edit, and delete candidate concepts and edges as established by `add-knowledge-graph`. This change MODIFIES the row-creation contract:

- Graphifyy-extracted nodes MUST land in `state = "confirmed"` directly with `confidence = 1.0` and `extractor_version = f"graphifyy/{version}"` for `EXTRACTED`-labelled outputs.
- Graphifyy `INFERRED`-labelled edges MUST land in `state = "confirmed"` with `confidence = 0.85`.
- Graphifyy `AMBIGUOUS`-labelled edges MUST land in `state = "candidate"` with `confidence = 0.5` — they pass through the review queue.
- LLM-extracted nodes and edges MUST continue to land in `state = "candidate"` with the model's confidence, per `add-knowledge-graph`.

Reviewer actions (promote / demote / edit / delete) MUST work identically on rows from either source; the row's `extractor_version` indicates provenance.

#### Scenario: `EXTRACTED` edge is auto-confirmed

- **WHEN** the graph writer persists an edge with graphifyy confidence label `EXTRACTED`
- **THEN** the row's `state` is `confirmed` and `confidence` is `1.0`

#### Scenario: `AMBIGUOUS` edge enters the review queue

- **WHEN** the graph writer persists an edge with graphifyy confidence label `AMBIGUOUS`
- **THEN** the row's `state` is `candidate` and `confidence` is `0.5`
- **AND** the edge appears in `GET /graph/edges?state=candidate`

#### Scenario: Reviewer can demote an auto-confirmed code edge

- **WHEN** an admin posts `POST /graph/edges/{id}/demote` on a graphifyy-extracted edge that they believe is wrong
- **THEN** the edge's `state` becomes `candidate`
- **AND** a `graph_audit_log` row records the demotion with the actor and reason

## ADDED Requirements

### Requirement: Symbol identity flows through the catalog

The catalog `metadata` JSONB on chunks produced by `chunk_code_by_symbols` MUST include:
- `symbol_id` (the graphifyy stable id, e.g., `auth.middleware.verify_token`)
- `symbol_kind` (one of `class`, `function`, `method`, `interface`, `module`)
- `start_line`, `end_line` (integers)
- `extractor_version` (e.g., `graphifyy/0.8.38`)

These fields MUST be queryable via the existing `GET /entities/{id}` endpoint without changes to the route schema (they sit inside `metadata`).

The chunk's `entity_id` MUST be derived as `uuid5(ns, f"{parent_entity_id}:{symbol_id}")` so re-ingest of an unchanged file produces stable IDs and upserts are idempotent.

#### Scenario: Symbol chunk metadata is queryable

- **WHEN** an admin calls `GET /entities/{chunk_id}` on a symbol chunk
- **THEN** the response's `metadata` block contains `symbol_id`, `symbol_kind`, `start_line`, `end_line`, and `extractor_version`

#### Scenario: Idempotent re-ingest of unchanged code

- **WHEN** a repo is re-ingested without changes
- **THEN** existing symbol chunks have unchanged `entity_id` values
- **AND** the catalog rows upsert in place (no new rows)
- **AND** the existing graph concepts and edges are unchanged
