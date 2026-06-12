## 1. Dependency + image

- [ ] 1.1 Add `graphifyy>=0.8,<0.9` to `services/ingestion/pyproject.toml` dependencies
- [ ] 1.2 `uv sync --all-packages` to refresh the lockfile
- [ ] 1.3 Confirm `import graphify` works in the ingestion venv
- [ ] 1.4 Rebuild the ingestion Docker image and confirm size delta (<100 MB increase)

## 2. Storage seed (vocabulary expansion)

- [ ] 2.1 In `infra/postgres/init/040_graph.sql` (which `add-knowledge-graph` will create), seed `relationship_vocab` with the three new names: `calls`, `imports`, `uses` (with `directed=true`, `deprecated_at=null`, and human descriptions). If `040_graph.sql` does not yet exist (i.e., this change ships before `add-knowledge-graph`), this change creates a minimal version of it covering only `relationship_vocab`, `concept`, `relationship_edge`, `relationship_evidence`, and `graph_audit_log`; the full immutability triggers and AGE bootstrap stay in `add-knowledge-graph`.

## 3. Git connector — discovery via graphifyy

- [ ] 3.1 Replace the `walk_repo` body with a call to `graphify.collect_files(repo_path)`. Keep the clone, sha, stable-id derivation, and `GitDocument` construction.
- [ ] 3.2 Delete `TEXT_EXTS` and `SKIP_DIRS` constants (now unused).
- [ ] 3.3 Wrap individual-file errors in try/except so a bad file doesn't abort the iteration.
- [ ] 3.4 Update the connector's existing tests to assert that a Kotlin or Swift file (which our old extension list didn't include) is now yielded.
- [ ] 3.5 Add a test asserting `.graphifyignore` is honoured.

## 4. Symbol chunker

- [ ] 4.1 Add `chunk_code_by_symbols(path, source_text) -> list[Chunk]` to `services/ingestion/src/hive_mind_ingestion/chunking.py`.
- [ ] 4.2 Implementation calls `graphify.extract([path], parallel=False)`, walks the resulting `nodes` list, fetches each symbol's source span by line range from `source_text`, and yields Chunks.
- [ ] 4.3 Chunk metadata MUST carry `symbol_id`, `symbol_kind`, `start_line`, `end_line`, `extractor_version` (from `graphify.__version__`).
- [ ] 4.4 Handle small symbols (< `min_symbol_chars`, default 50) by merging adjacent symbols within the same parent scope.
- [ ] 4.5 Handle large symbols (> `max_symbol_chars`, default 8000) by paragraph-chunking the symbol body and tagging each sub-chunk with the parent `symbol_id`.
- [ ] 4.6 Handle zero-symbol files by falling back to `chunk_text(source_text)` on the whole file.
- [ ] 4.7 Unit tests:
  - Three top-level functions in one Python file → 3 chunks
  - Five tiny adjacent methods in a class → merged
  - One 10k-char function → paragraph-split with parent symbol id on each chunk
  - Pure-config Python file (no defs) → paragraph-split whole file
  - TypeScript file with classes + methods → chunked correctly

## 5. Pipeline runner dispatch

- [ ] 5.1 Add a small helper `is_code_extension(path)` keyed off `set(graphify.detect._DISPATCH.keys())` (or whatever the public path is — verify; otherwise fall back to a static list).
- [ ] 5.2 In `pipeline_runner.ingest_documents`, dispatch each `GitDocument`:
  - If `is_code_extension(path)`: call `chunk_code_by_symbols` then write graph rows via `graph_writer`.
  - Else: call `chunk_text` (unchanged) and skip graph writing for now (LLM extractor lands in `add-knowledge-graph`).
- [ ] 5.3 Chunk id derivation for symbol chunks: `uuid5(ns, f"{doc.entity_id}:{symbol_id}")` (mirror the existing `_chunk_id` helper).
- [ ] 5.4 Emit the new OTel spans `pipeline.graph_extract_code` (per file processed by graphifyy).

## 6. graph_writer module

- [ ] 6.1 Add `services/ingestion/src/hive_mind_ingestion/graph_writer.py` with `write_code_graph(tenant, file_entity_id, graphify_result, *, catalog, conn) -> tuple[int, int]` returning `(concepts_written, edges_written)`.
- [ ] 6.2 For each node in `graphify_result["nodes"]`: upsert a `hive_mind.concept` row keyed on the normalised `dedupe_key(node["label"])`, with `state="confirmed"`, `confidence=1.0`, `extractor_version=f"graphifyy/{graphify.__version__}"`.
- [ ] 6.3 For each edge in `graphify_result["edges"]`:
  - Map `confidence` label → state + numeric confidence:
    - `EXTRACTED` → `state="confirmed"`, `confidence=1.0`
    - `INFERRED` → `state="confirmed"`, `confidence=0.85`
    - `AMBIGUOUS` → `state="candidate"`, `confidence=0.5`
  - Insert into `hive_mind.relationship_edge` with `type = edge["relation"]` (FK on vocab).
  - Insert a `relationship_evidence` row linking the edge to `file_entity_id`.
- [ ] 6.4 Wrap the whole write in a single Postgres transaction so partial writes never leak.
- [ ] 6.5 Unit tests with a fake Postgres pool (mirroring `tests/test_catalog.py`):
  - One node → one concept upsert
  - One `EXTRACTED` edge → confirmed
  - One `AMBIGUOUS` edge → candidate
  - Duplicate node → idempotent (existing concept reused)

## 7. Cross-cutting

- [ ] 7.1 Re-export `chunk_code_by_symbols` from `services/ingestion/src/hive_mind_ingestion/__init__.py` if there's an exposed surface there (otherwise skip).
- [ ] 7.2 Update `docs/OPERATIONS.md` with a short section: "graphifyy is the extractor for code files; configurable via `extraction.code.enabled` (default true)."
- [ ] 7.3 Update `README.md` to credit graphifyy.
- [ ] 7.4 Re-run `uv run pytest` and `pnpm -r test` — every existing test MUST still pass.

## 8. Smoke

- [ ] 8.1 Extend `tests/smoke/run.sh`: after the existing ingest of `anthropic-cookbook`, query the catalog for at least one entity whose `metadata` contains a `symbol_id` field (proves code path ran).
- [ ] 8.2 Query `hive_mind.concept` for at least 5 rows (`SELECT count(*) FROM hive_mind.concept WHERE state='confirmed'`).
- [ ] 8.3 Query `hive_mind.relationship_edge` for at least 5 rows (`SELECT count(*) FROM hive_mind.relationship_edge`).
- [ ] 8.4 Bring the stack up and run the smoke; capture the output for the PR description.

## 9. Commit + push
