import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface BreakdownCardProps {
  title: string;
  description?: string;
  /** A Tremor chart (BarChart, AreaChart, DonutChart, ...) */
  children: ReactNode;
}

export function BreakdownCard({ title, description, children }: BreakdownCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
