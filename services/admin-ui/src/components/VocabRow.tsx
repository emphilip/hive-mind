"use client";

import type { RelationshipType } from "@hive-mind/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RelationshipTypeBadge } from "./RelationshipTypeBadge";

export function VocabRow({ item }: { item: RelationshipType }) {
  const router = useRouter();
  const [description, setDescription] = useState(item.description);
  async function save() {
    await fetch(`/api/proxy/graph/vocab/${item.name}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description }),
    });
    router.refresh();
  }
  async function deprecate() {
    await fetch(`/api/proxy/graph/vocab/${item.name}/deprecate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "admin deprecation" }),
    });
    router.refresh();
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 100px", gap: 12, padding: 10, borderBottom: "1px solid var(--border)" }}>
      <RelationshipTypeBadge type={item.name} />
      <input aria-label={`${item.name} description`} value={description} onChange={(event) => setDescription(event.target.value)} />
      <span><button onClick={save}>Save</button>{" "}<button onClick={deprecate}>Deprecate</button></span>
    </div>
  );
}
