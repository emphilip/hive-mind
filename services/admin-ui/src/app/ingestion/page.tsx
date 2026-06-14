import { ConnectorCard } from "@/components/ConnectorCard";
import { IngestionRunRow } from "@/components/IngestionRunRow";
import { Card } from "@/components/ui/card";
import { listConnectors, listRecentRuns } from "@/lib/api";
import { RunNowPanel } from "./RunNowPanel";

export const dynamic = "force-dynamic";

export default async function IngestionPage() {
  const [connectors, runs] = await Promise.all([listConnectors(), listRecentRuns()]);

  const lastByConnector = new Map<string, string>();
  for (const r of runs) {
    if (!lastByConnector.has(r.connector)) {
      const when = new Date(r.started_at).toLocaleString();
      const summary = `${r.status}${
        r.status === "succeeded" && r.parents != null
          ? ` · ${r.parents} files / ${r.chunks} chunks`
          : ""
      } · ${when}`;
      lastByConnector.set(r.connector, summary);
    }
  }

  return (
    <section>
      <h1>Ingestion</h1>
      <p className="mt-0 text-muted-foreground">
        Connectors configured in this deploy. Run history is in-memory and will
        clear on service restart (durable history lands with a follow-up change).
      </p>

      <section className="mb-4">
        <h2 className="mb-2 text-base font-semibold">Connectors</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
          {connectors.length === 0 ? (
            <div className="text-muted-foreground">
              Could not reach ingestion service — is the stack up?
            </div>
          ) : (
            connectors.map((c) => (
              <ConnectorCard
                key={c.name}
                connector={c}
                lastRunSummary={lastByConnector.get(c.name)}
              />
            ))
          )}
        </div>
      </section>

      <section className="mb-4">
        <h2 className="mb-2 text-base font-semibold">Run now (git)</h2>
        <RunNowPanel />
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">Recent runs</h2>
        {runs.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-muted-foreground">
            No runs yet.
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[100px_1fr_100px_90px_90px_90px] gap-3 border-b bg-muted px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">
              <span>status</span>
              <span>repo</span>
              <span>started</span>
              <span>duration</span>
              <span>files</span>
              <span>chunks</span>
            </div>
            {runs.map((r) => (
              <IngestionRunRow key={r.run_id} run={r} />
            ))}
          </Card>
        )}
      </section>
    </section>
  );
}
