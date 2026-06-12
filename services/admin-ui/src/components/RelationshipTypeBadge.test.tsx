import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RelationshipTypeBadge } from "./RelationshipTypeBadge";
describe("RelationshipTypeBadge", () => {
  it("renders the relationship name", () => {
    render(<RelationshipTypeBadge type="depends_on" />);
    expect(screen.getByText("depends_on")).toBeInTheDocument();
  });
});
