import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Hive Mind — Admin",
  description: "Inspect queries, audits, and provider health.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 24,
            alignItems: "center",
          }}
        >
          <strong>hive-mind</strong>
          <nav style={{ display: "flex", gap: 16 }}>
            <a href="/queries">Queries</a>
            <a href="/vectors">Vectors</a>
            <a href="/entities">Entities</a>
            <a href="/ingestion">Ingestion</a>
            <a href="/graph">Graph</a>
          </nav>
        </header>
        <main style={{ padding: "16px 24px", maxWidth: 1200, margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
