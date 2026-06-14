import { BarChart } from "@tremor/react";

import { BreakdownCard } from "@/components/BreakdownCard";
import { RankedList } from "@/components/RankedList";
import { StatCard } from "@/components/StatCard";
import {
  listConnectors,
  listEntities,
  listGraphEdges,
  listRecentAudits,
} from "@/lib/api";

export const dynamic = "force-dynamic";

function queriesPerDay(audits: readonly { created_at: string }[]) {
  const byDay = new Map<string, number>();
  for (const a of audits) {
    const day = a.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([day, queries]) => ({ day: day.slice(5), queries }));
}

function topSources(items: readonly { source: string }[]) {
  const bySource = new Map<string, number>();
  for (const e of items) {
    bySource.set(e.source, (bySource.get(e.source) ?? 0) + 1);
  }
  return [...bySource.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label, value]) => ({ label, value, href: `/entities?source=${encodeURIComponent(label)}` }));
}

export default async function HomePage() {
  const [audits, entities, candidateEdges, connectors] = await Promise.all([
    listRecentAudits(100),
    listEntities({ limit: 200 }),
    listGraphEdges({ state: "candidate", limit: 1 }),
    listConnectors(),
  ]);

  const supportedConnectors = connectors.filter((c) => c.supported).length;
  const chartData = queriesPerDay(audits);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Live snapshot of retrievals, catalogue, and the knowledge graph.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Recent queries" value={audits.length} />
        <StatCard label="Entities" value={entities.total} />
        <StatCard label="Candidate edges" value={candidateEdges.total} />
        <StatCard
          label="Connectors"
          value={supportedConnectors}
          error={connectors.length === 0 ? "ingestion unreachable" : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownCard title="Query activity" description="Audited retrievals per day (recent)">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No queries audited yet.</p>
          ) : (
            <BarChart
              data={chartData}
              index="day"
              categories={["queries"]}
              colors={["indigo"]}
              className="h-56"
              showLegend={false}
            />
          )}
        </BreakdownCard>
        <RankedList
          title="Top sources by entities"
          items={topSources(entities.items)}
          emptyMessage="Nothing ingested yet — try make ingest-git REPO=…"
        />
      </div>
    </section>
  );
}
