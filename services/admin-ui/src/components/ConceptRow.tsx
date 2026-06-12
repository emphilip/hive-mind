import Link from "next/link";
import type { ConceptListItem } from "@hive-mind/shared";

export function ConceptRow({ concept }: { concept: ConceptListItem }) {
  return (
    <Link
      href={`/graph?concept_id=${concept.concept_id}`}
      style={{ display: "grid", gridTemplateColumns: "1fr 110px 100px", gap: 12, padding: 10, borderBottom: "1px solid var(--border)", color: "inherit", textDecoration: "none" }}
    >
      <span><strong>{concept.name}</strong><br /><small style={{ color: "var(--muted)" }}>{concept.aliases.join(", ") || "no aliases"}</small></span>
      <span>{concept.state}</span>
      <span>{concept.confidence?.toFixed(2) ?? "n/a"}</span>
    </Link>
  );
}
