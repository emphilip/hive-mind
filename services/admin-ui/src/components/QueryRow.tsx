import Link from "next/link";
import { TokenBar } from "./TokenBar";

export interface QueryRowProps {
  id: number;
  created_at: string;
  principal: string;
  tool: string;
  query: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  outcome: "ok" | "error";
}

export function QueryRow(props: QueryRowProps) {
  const isError = props.outcome === "error";
  return (
    <Link
      href={`/queries/${props.id}`}
      className="grid grid-cols-[120px_100px_80px_1fr_140px_80px_60px] gap-3 border-b px-3 py-2 text-foreground no-underline transition-colors last:border-b-0 hover:bg-accent/50"
    >
      <span className="font-mono text-muted-foreground">
        {new Date(props.created_at).toLocaleTimeString()}
      </span>
      <span>{props.principal}</span>
      <span className="text-muted-foreground">{props.tool}</span>
      <span className="truncate" title={props.query}>
        {props.query}
      </span>
      <TokenBar
        tokens_in={props.tokens_in}
        tokens_out={props.tokens_out}
        compact
      />
      <span className="text-right text-muted-foreground">
        {props.latency_ms} ms
      </span>
      <span
        className={
          isError
            ? "font-semibold text-destructive"
            : "font-semibold text-emerald-600 dark:text-emerald-400"
        }
      >
        {isError ? "ERR" : "OK"}
      </span>
    </Link>
  );
}
