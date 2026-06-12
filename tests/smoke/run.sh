#!/usr/bin/env bash
# End-to-end smoke test for the thin MVP. Requires:
#   - the dev stack running (`make up-d`)
#   - Ollama reachable at $HIVE_MIND__OLLAMA__BASE_URL with `nomic-embed-text` pulled
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PIPELINE_URL="${PIPELINE_URL:-http://localhost:8000}"
TEST_REPO="${TEST_REPO:-https://github.com/anthropics/anthropic-cookbook}"

say() { printf '\n\e[1;36m▌ %s\e[0m\n' "$*"; }

say "Wait for pipeline /readyz"
for _ in $(seq 1 60); do
  if curl -fsS "$PIPELINE_URL/readyz" >/dev/null 2>&1; then break; fi
  sleep 2
done
curl -fsS "$PIPELINE_URL/readyz"

say "Ingest a small public repo: $TEST_REPO"
docker compose -f "$ROOT/infra/compose/docker-compose.yml" --env-file "$ROOT/.env" \
  exec -T ingestion uv run --package hive-mind-ingestion \
    python -m hive_mind_ingestion.cli git "$TEST_REPO"

say "Query the MCP/pipeline with retrieve_for_context"
RESP="$(curl -fsS -X POST "$PIPELINE_URL/retrieve" \
  -H 'content-type: application/json' \
  -d '{
    "correlation_id": "smoke-test-001",
    "identity": {"principal":"local-dev","roles":["admin","reader"],"tenant":"default"},
    "tool": "retrieve_for_context",
    "query": "How do I do prompt caching?",
    "top_k": 10,
    "token_budget": 2000
  }')"
echo "$RESP" | head -c 2000
echo

say "Verify an audit row was written"
COUNT=$(curl -fsS "$PIPELINE_URL/audit/recent?limit=5" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["items"]))')
if [ "$COUNT" -lt 1 ]; then
  echo "✗ no audit rows found"
  exit 1
fi
echo "✓ $COUNT audit row(s) present"

# ---- add-admin-vector-and-content smoke -----------------------------------

say "Vector search: POST /search/vector"
VS=$(curl -fsS -X POST "$PIPELINE_URL/search/vector" \
  -H 'content-type: application/json' \
  -d '{"query":"prompt caching","top_k":5}')
echo "$VS" | head -c 600
echo
HITS=$(echo "$VS" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["hits"]))')
if [ "$HITS" -lt 1 ]; then
  echo "✗ vector search returned no hits"
  exit 1
fi
echo "✓ vector search returned $HITS hit(s)"

say "Entity list: GET /entities?limit=5"
LIST=$(curl -fsS "$PIPELINE_URL/entities?limit=5")
TOTAL=$(echo "$LIST" | python3 -c 'import json,sys; print(json.load(sys.stdin)["total"])')
if [ "$TOTAL" -lt 1 ]; then
  echo "✗ entity list reports no rows"
  exit 1
fi
echo "✓ entity list reports $TOTAL row(s) total"

say "Pick the first listed entity, tombstone it, verify timestamp"
ID=$(echo "$LIST" | python3 -c 'import json,sys; print(json.load(sys.stdin)["items"][0]["entity_id"])')
echo "tombstoning $ID"
TS=$(curl -fsS -X DELETE "$PIPELINE_URL/entities/$ID")
echo "$TS"
HAS_TS=$(echo "$TS" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("yes" if d.get("tombstoned_at") else "no")')
if [ "$HAS_TS" != "yes" ]; then
  echo "✗ tombstoned_at did not round-trip"
  exit 1
fi
echo "✓ tombstone applied"

say "Ingestion connectors via pipeline proxy"
CONN=$(curl -fsS "$PIPELINE_URL/ingestion/connectors")
echo "$CONN"
HAS_GIT=$(echo "$CONN" | python3 -c 'import json,sys; print("yes" if any(c["name"]=="git" and c["supported"] for c in json.load(sys.stdin)) else "no")')
if [ "$HAS_GIT" != "yes" ]; then
  echo "✗ git connector not advertised as supported"
  exit 1
fi
echo "✓ git connector advertised"

say "Graph populated by graphifyy: at least 5 concepts and 5 edges"
PSQL="docker compose -f $ROOT/infra/compose/docker-compose.yml --env-file $ROOT/.env exec -T postgres psql -U hive -d hivemind -tAc"
CONCEPT_COUNT=$($PSQL "SELECT count(*) FROM hive_mind.concept WHERE state='confirmed'" | tr -d '[:space:]')
EDGE_COUNT=$($PSQL "SELECT count(*) FROM hive_mind.relationship_edge" | tr -d '[:space:]')
SYMBOL_COUNT=$($PSQL "SELECT count(*) FROM hive_mind.entity WHERE metadata ? 'symbol_id'" | tr -d '[:space:]')
echo "concepts: $CONCEPT_COUNT · edges: $EDGE_COUNT · symbol_chunks: $SYMBOL_COUNT"
if [ "${CONCEPT_COUNT:-0}" -lt 5 ] || [ "${EDGE_COUNT:-0}" -lt 5 ] || [ "${SYMBOL_COUNT:-0}" -lt 5 ]; then
  echo "✗ code graph not populated (concepts=$CONCEPT_COUNT, edges=$EDGE_COUNT, symbol_chunks=$SYMBOL_COUNT)"
  exit 1
fi
echo "✓ code graph populated"

say "Knowledge graph vocabulary contains the seven seeded semantic relations"
VOCAB=$(curl -fsS "$PIPELINE_URL/graph/vocab")
EXPECTED_VOCAB="depends_on defined_in supersedes mentions related_to causes derived_from"
MISSING_VOCAB=$(echo "$VOCAB" | python3 -c '
import json, sys
expected = set(sys.argv[1].split())
actual = {item["name"] for item in json.load(sys.stdin)["items"]}
print(" ".join(sorted(expected - actual)))
' "$EXPECTED_VOCAB")
if [ -n "$MISSING_VOCAB" ]; then
  echo "✗ missing seeded relationship names: $MISSING_VOCAB"
  exit 1
fi
echo "✓ seven seeded relationship names present"

say "Candidate review queue contains an extracted relationship"
CANDIDATES=$(curl -fsS "$PIPELINE_URL/graph/edges?state=candidate&limit=5")
CANDIDATE_COUNT=$(echo "$CANDIDATES" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["items"]))')
if [ "$CANDIDATE_COUNT" -lt 1 ]; then
  echo "✗ graph extraction produced no candidate edges"
  exit 1
fi
EDGE_ID=$(echo "$CANDIDATES" | python3 -c 'import json,sys; print(json.load(sys.stdin)["items"][0]["edge_id"])')
CONCEPT_ID=$(echo "$CANDIDATES" | python3 -c 'import json,sys; print(json.load(sys.stdin)["items"][0]["from_concept_id"])')
echo "✓ candidate edge $EDGE_ID found"

say "Traverse from a known concept returns a non-empty subgraph"
TRAVERSE=$(curl -fsS "$PIPELINE_URL/graph/traverse?concept_id=$CONCEPT_ID&depth=2&include_candidates=true")
TRAVERSE_EDGES=$(echo "$TRAVERSE" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)["edges"]))')
if [ "$TRAVERSE_EDGES" -lt 1 ]; then
  echo "✗ graph traversal returned no edges"
  exit 1
fi
echo "✓ graph traversal returned $TRAVERSE_EDGES edge(s)"

say "Promote one candidate and verify its append-only audit row"
PROMOTED=$(curl -fsS -X POST "$PIPELINE_URL/graph/edges/$EDGE_ID/promote" \
  -H 'content-type: application/json' \
  -d '{"reason":"end-to-end smoke verification"}')
PROMOTED_STATE=$(echo "$PROMOTED" | python3 -c 'import json,sys; print(json.load(sys.stdin)["state"])')
if [ "$PROMOTED_STATE" != "confirmed" ]; then
  echo "✗ promoted edge did not return confirmed state"
  exit 1
fi
GRAPH_AUDIT_COUNT=$($PSQL "SELECT count(*) FROM hive_mind.graph_audit_log WHERE target_kind='edge' AND target_id='$EDGE_ID'::uuid AND to_state='confirmed'" | tr -d '[:space:]')
if [ "${GRAPH_AUDIT_COUNT:-0}" -lt 1 ]; then
  echo "✗ no graph audit row found for promoted edge"
  exit 1
fi
echo "✓ candidate promoted and graph audit row written"

say "Smoke test PASSED"
