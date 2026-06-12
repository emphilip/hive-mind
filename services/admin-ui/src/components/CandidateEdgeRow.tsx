"use client";

import type { RelationshipEdge } from "@hive-mind/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RelationshipTypeBadge } from "./RelationshipTypeBadge";

export function CandidateEdgeRow({ edge, evidenceEntityIds = [] }: { edge: RelationshipEdge; evidenceEntityIds?: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function action(name: "promote" | "demote") {
    setBusy(true);
    await fetch(`/api/proxy/graph/edges/${edge.edge_id}/${name}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "admin review" }),
    });
    setBusy(false);
    router.refresh();
  }
  async function remove() {
    setBusy(true);
    await fetch(`/api/proxy/graph/edges/${edge.edge_id}`, { method: "DELETE", body: JSON.stringify({ reason: "admin review" }) });
    setBusy(false);
    router.refresh();
  }
  async function edit() {
    const type = window.prompt("Relationship type", edge.type);
    if (!type || type === edge.type) return;
    setBusy(true);
    await fetch(`/api/proxy/graph/edges/${edge.edge_id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, reason: "admin edit" }),
    });
    setBusy(false);
    router.refresh();
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 80px 230px", gap: 12, padding: 10, borderBottom: "1px solid var(--border)", alignItems: "center" }}>
      <RelationshipTypeBadge type={edge.type} />
      <span>{edge.from_concept_id} → {edge.to_concept_id}<br />{evidenceEntityIds.map((id) => <a key={id} href={`/entities/${id}`} style={{ marginRight: 8 }}>evidence</a>)}</span>
      <span>{edge.confidence.toFixed(2)}</span>
      <span><button disabled={busy} onClick={() => action("promote")}>Promote</button>{" "}<button disabled={busy} onClick={() => action("demote")}>Demote</button>{" "}<button disabled={busy} onClick={edit}>Edit</button>{" "}<button disabled={busy} onClick={remove}>Delete</button></span>
    </div>
  );
}
