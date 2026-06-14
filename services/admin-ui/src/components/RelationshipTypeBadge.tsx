import { Badge } from "@/components/ui/badge";

export function RelationshipTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="secondary" className="font-mono font-normal">
      {type}
    </Badge>
  );
}
