import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { SparkAreaChart } from "@tremor/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  spark?: { x: string; y: number }[];
  error?: string;
}

export function StatCard({ label, value, delta, deltaLabel, spark, error }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2">
        {error ? (
          <span className="text-sm text-destructive">{error}</span>
        ) : (
          <div>
            <div className="text-2xl font-semibold tabular-nums">{value}</div>
            {delta !== undefined && (
              <div
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs",
                  delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                )}
              >
                {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(delta).toLocaleString()}%{deltaLabel ? ` ${deltaLabel}` : ""}
              </div>
            )}
          </div>
        )}
        {spark && spark.length > 1 && (
          <SparkAreaChart
            data={spark}
            index="x"
            categories={["y"]}
            colors={["indigo"]}
            className="h-10 w-24"
          />
        )}
      </CardContent>
    </Card>
  );
}
