import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConceptRow } from "./ConceptRow";
describe("ConceptRow", () => {
  it("links to concept detail", () => {
    render(<ConceptRow concept={{ concept_id: "c1", tenant: "default", name: "Caching", state: "confirmed", confidence: 0.9, aliases: [], updated_at: "2026-06-12T00:00:00Z" }} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/graph?concept_id=c1");
  });
});
