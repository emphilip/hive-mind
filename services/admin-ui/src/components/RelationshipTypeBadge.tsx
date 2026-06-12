export function RelationshipTypeBadge({ type }: { type: string }) {
  return (
    <code style={{ padding: "2px 6px", borderRadius: 4, background: "var(--code-bg)" }}>
      {type}
    </code>
  );
}
