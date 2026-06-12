import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VocabRow } from "./VocabRow";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
describe("VocabRow", () => {
  it("renders editable description", () => {
    render(<VocabRow item={{ name: "depends_on", description: "dependency", directed: true }} />);
    expect(screen.getByDisplayValue("dependency")).toBeInTheDocument();
  });
});
