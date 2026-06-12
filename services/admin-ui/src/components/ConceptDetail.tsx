import type { ConceptDetail as ConceptDetailType } from "@hive-mind/shared";
import { ConceptActions } from "../app/graph/GraphActions";
import { CandidateEdgeRow } from "./CandidateEdgeRow";

export function ConceptDetail({ concept }: { concept: ConceptDetailType }) {
  return (
    <article style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 16 }}>
      <h2>{concept.name}</h2>
      <ConceptActions conceptId={concept.concept_id} />
      <p>{concept.description || "No description."}</p>
      <p><strong>State:</strong> {concept.state} · <strong>Aliases:</strong> {concept.aliases.join(", ") || "none"}</p>
      <h3>Confirmed neighbours</h3>
      {concept.neighbours_confirmed.length ? concept.neighbours_confirmed.map((item) => <CandidateEdgeRow key={item.edge.edge_id} edge={item.edge} evidenceEntityIds={[...item.evidence_entity_ids]} />) : <p>No confirmed neighbours.</p>}
      <h3>Candidate neighbours</h3>
      {concept.neighbours_candidate.length ? concept.neighbours_candidate.map((item) => <CandidateEdgeRow key={item.edge.edge_id} edge={item.edge} evidenceEntityIds={[...item.evidence_entity_ids]} />) : <p>No candidate neighbours.</p>}
    </article>
  );
}
