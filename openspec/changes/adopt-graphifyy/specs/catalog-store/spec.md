## MODIFIED Requirements

### Requirement: Source lineage

For every catalog row the system SHALL retain the lineage chain: which connector ran, which source revision, and the parent entity if the row was derived. This change MODIFIES the chunk-id derivation rule:

- **Paragraph chunks** (text, markdown, future PDF / HTML / MDX) MUST continue to use `uuid5(ns, f"{parent_entity_id}:{chunk_index}")`.
- **Symbol chunks** (code files processed by `chunk_code_by_symbols`) MUST use `uuid5(ns, f"{parent_entity_id}:{symbol_id}")` where `symbol_id` is graphifyy's stable per-symbol identifier.

Both schemes MUST be deterministic: re-ingest of an unchanged input MUST produce the same chunk id.

#### Scenario: Stable symbol-chunk id across re-ingest

- **WHEN** a Python file with three functions is ingested twice without changes
- **THEN** the same three `entity_id` values appear in `hive_mind.entity` both times
- **AND** the upsert path is taken (no duplicate rows)

#### Scenario: Adding a function above existing ones does not renumber

- **WHEN** a developer adds a new function `helper_a` at the top of a Python file that previously had `existing_b` and `existing_c`
- **THEN** the chunks for `existing_b` and `existing_c` retain their original `entity_id` values
- **AND** a new chunk row is created for `helper_a`
- **AND** the vector index does not require re-upserting the unchanged chunks
