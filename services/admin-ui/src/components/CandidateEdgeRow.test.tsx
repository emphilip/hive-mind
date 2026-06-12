import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CandidateEdgeRow } from "./CandidateEdgeRow";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
describe("CandidateEdgeRow", () => {
  it("renders relation and review actions", () => {
    render(<CandidateEdgeRow edge={{ edge_id: "e1", tenant: "default", type: "depends_on", from_concept_id: "c1", to_concept_id: "c2", state: "candidate", confidence: 0.7, created_at: "2026-06-12T00:00:00Z", updated_at: "2026-06-12T00:00:00Z" }} />);
    expect(screen.getByText("depends_on")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Promote" })).toBeInTheDocument();
  });
});
