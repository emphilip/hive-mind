import { CandidateEdgeRow } from "@/components/CandidateEdgeRow";
import { ConceptDetail } from "@/components/ConceptDetail";
import { ConceptRow } from "@/components/ConceptRow";
import { VocabRow } from "@/components/VocabRow";
import { VocabCreateForm } from "./GraphActions";
import { getGraphConcept, listGraphConcepts, listGraphEdges, listGraphVocabulary } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function GraphPage({ searchParams }: { searchParams: Promise<{ tab?: string; concept_id?: string; search?: string }> }) {
  const params = await searchParams;
  const tab = params.tab || "concepts";
  const [concepts, candidates, vocabulary, detail] = await Promise.all([
    listGraphConcepts({ state: "confirmed,candidate", search: params.search, limit: 50 }),
    listGraphEdges({ state: "candidate", limit: 50 }),
    listGraphVocabulary(),
    params.concept_id ? getGraphConcept(params.concept_id) : Promise.resolve(null),
  ]);
  return (
    <section>
      <h1>Knowledge graph</h1>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <a href="/graph?tab=concepts">Concepts</a>
        <a href="/graph?tab=candidates">Candidate review</a>
        <a href="/graph?tab=vocabulary">Vocabulary</a>
      </nav>
      {detail ? <ConceptDetail concept={detail} /> : tab === "candidates" ? (
        <div><h2>Candidate review</h2>{candidates.items.length ? candidates.items.map((edge) => <CandidateEdgeRow key={edge.edge_id} edge={edge} evidenceEntityIds={edge.evidence_entity_ids} />) : <p>No candidate edges.</p>}</div>
      ) : tab === "vocabulary" ? (
        <div><h2>Vocabulary</h2><VocabCreateForm />{vocabulary.map((item) => <VocabRow key={item.name} item={item} />)}</div>
      ) : (
        <div><h2>Concepts</h2><form><input name="search" placeholder="Search concepts" defaultValue={params.search || ""} /><button>Search</button></form>{concepts.items.length ? concepts.items.map((concept) => <ConceptRow key={concept.concept_id} concept={concept} />) : <p>No concepts.</p>}</div>
      )}
    </section>
  );
}
