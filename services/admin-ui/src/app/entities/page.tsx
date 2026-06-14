import { EntityRow } from "@/components/EntityRow";
import { Button } from "@/components/ui/button";
import { listEntities } from "@/lib/api";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    source?: string;
    classification?: string;
    freshness_state?: string;
    limit?: string;
    offset?: string;
  }>;
}

function num(v: string | undefined, fallback: number): number {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const inputClass =
  "h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default async function EntitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const limit = Math.min(200, num(params.limit, 50));
  const offset = Math.max(0, num(params.offset, 0));
  const result = await listEntities({
    source: params.source,
    classification: params.classification,
    freshness_state: params.freshness_state,
    limit,
    offset,
  });

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Entities</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {result.total} matching · showing {result.items.length} (offset {offset})
      </p>

      <form
        method="get"
        className="mb-3 flex flex-wrap items-center gap-2 rounded-md border bg-card p-3"
      >
        <input
          name="source"
          placeholder="source (e.g. git)"
          defaultValue={params.source ?? ""}
          className={inputClass}
        />
        <input
          name="classification"
          placeholder="classification"
          defaultValue={params.classification ?? ""}
          className={inputClass}
        />
        <select
          name="freshness_state"
          defaultValue={params.freshness_state ?? ""}
          className={inputClass}
        >
          <option value="">freshness — any</option>
          <option value="fresh">fresh</option>
          <option value="stale">stale</option>
          <option value="unknown">unknown</option>
        </select>
        <input type="hidden" name="limit" value={limit} />
        <Button type="submit" size="sm">
          Apply
        </Button>
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
          No entities match. Try ingesting a repo from the{" "}
          <a href="/ingestion" className="text-primary underline-offset-4 hover:underline">
            ingestion page
          </a>
          .
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <div className="grid grid-cols-[1fr_80px_90px_90px_140px_50px] gap-3 border-b bg-muted px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">
            <span>title / uri</span>
            <span>source</span>
            <span>class</span>
            <span>freshness</span>
            <span>updated</span>
            <span />
          </div>
          {result.items.map((e) => (
            <EntityRow key={e.entity_id} entity={e} />
          ))}
        </div>
      )}

      <Pagination total={result.total} limit={limit} offset={offset} params={params} />
    </section>
  );
}

function Pagination({
  total,
  limit,
  offset,
  params,
}: {
  total: number;
  limit: number;
  offset: number;
  params: Record<string, string | undefined>;
}) {
  const next = offset + limit;
  const prev = Math.max(0, offset - limit);
  const qs = (newOffset: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) u.set(k, v);
    }
    u.set("limit", String(limit));
    u.set("offset", String(newOffset));
    return u.toString();
  };

  if (total <= limit) return null;
  return (
    <nav className="mt-3 flex justify-between text-sm">
      <a
        href={offset > 0 ? `?${qs(prev)}` : undefined}
        className={
          offset > 0
            ? "text-primary underline-offset-4 hover:underline"
            : "text-muted-foreground"
        }
      >
        ← prev
      </a>
      <span className="text-muted-foreground">
        {offset + 1}–{Math.min(total, offset + limit)} of {total}
      </span>
      <a
        href={next < total ? `?${qs(next)}` : undefined}
        className={
          next < total
            ? "text-primary underline-offset-4 hover:underline"
            : "text-muted-foreground"
        }
      >
        next →
      </a>
    </nav>
  );
}
