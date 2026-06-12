import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConceptDetail } from "./ConceptDetail";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
describe("ConceptDetail", () => {
  it("renders empty neighbour states", () => {
    render(<ConceptDetail concept={{ concept_id: "c1", tenant: "default", name: "Caching", dedupe_key: "caching", state: "confirmed", aliases: [], created_at: "2026-06-12T00:00:00Z", updated_at: "2026-06-12T00:00:00Z", neighbours_confirmed: [], neighbours_candidate: [] }} />);
    expect(screen.getByText("No confirmed neighbours.")).toBeInTheDocument();
    expect(screen.getByText("No candidate neighbours.")).toBeInTheDocument();
  });
});
