import type { Meta, StoryObj } from "@storybook/react";
import { CandidateEdgeRow } from "./CandidateEdgeRow";
const edge = { edge_id: "e1", tenant: "default", type: "depends_on", from_concept_id: "c1", to_concept_id: "c2", state: "candidate" as const, confidence: 0.72, created_at: "2026-06-12T00:00:00Z", updated_at: "2026-06-12T00:00:00Z" };
export default { title: "Graph/CandidateEdgeRow", component: CandidateEdgeRow } satisfies Meta<typeof CandidateEdgeRow>;
type Story = StoryObj<typeof CandidateEdgeRow>;
export const Default: Story = { args: { edge, evidenceEntityIds: ["chunk-1"] } };
export const Empty: Story = { args: { edge, evidenceEntityIds: [] } };
export const Error: Story = { args: { edge: { ...edge, confidence: 0.1 } } };
