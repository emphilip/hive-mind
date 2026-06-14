import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RankedListItem {
  label: string;
  value: number;
  href?: string;
}

export interface RankedListProps {
  title: string;
  items: RankedListItem[];
  formatValue?: (value: number) => string;
  emptyMessage?: string;
}

export function RankedList({
  title,
  items,
  formatValue = (v) => v.toLocaleString(),
  emptyMessage = "No data",
}: RankedListProps) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">{emptyMessage}</p>}
        {items.map((item) => (
          <div key={item.label} className="relative">
            <div
              className="absolute inset-y-0 left-0 rounded bg-primary/10"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
            <div className="relative flex items-center justify-between px-2 py-1.5 text-sm">
              {item.href ? (
                <Link href={item.href} className="truncate font-medium text-foreground hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="truncate font-medium">{item.label}</span>
              )}
              <span className="ml-2 tabular-nums text-muted-foreground">{formatValue(item.value)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
