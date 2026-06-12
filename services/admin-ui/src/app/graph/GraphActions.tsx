"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function send(path: string, method: string, body: object) {
  return fetch(`/api/proxy/graph/${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function ConceptActions({ conceptId }: { conceptId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function transition(action: string) {
    setBusy(true);
    await send(`concepts/${conceptId}/${action}`, "POST", { reason: "admin review" });
    setBusy(false);
    router.refresh();
  }
  async function tombstone() {
    setBusy(true);
    await send(`concepts/${conceptId}`, "DELETE", { reason: "admin review" });
    setBusy(false);
    router.push("/graph");
    router.refresh();
  }
  async function merge() {
    const raw = window.prompt("Comma-separated concept IDs to merge into this concept");
    const fromIds = raw?.split(",").map((item) => item.trim()).filter(Boolean);
    if (!fromIds?.length) return;
    setBusy(true);
    await send("concepts/merge", "POST", {
      into_id: conceptId,
      from_ids: fromIds,
      reason: "admin merge",
    });
    setBusy(false);
    router.refresh();
  }
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <button disabled={busy} onClick={() => transition("promote")}>Promote</button>
      <button disabled={busy} onClick={() => transition("demote")}>Demote</button>
      <button disabled={busy} onClick={merge}>Merge into…</button>
      <button disabled={busy} onClick={tombstone}>Tombstone</button>
    </div>
  );
}

export function VocabCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await send("vocab", "POST", { name: name.trim(), description });
    setName("");
    setDescription("");
    router.refresh();
  }
  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <input aria-label="Relationship name" value={name} onChange={(event) => setName(event.target.value)} placeholder="relationship_name" />
      <input aria-label="Relationship description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
      <button type="submit">Add type</button>
    </form>
  );
}
