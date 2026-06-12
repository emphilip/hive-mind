import type { Meta, StoryObj } from "@storybook/react";
import { ConceptRow } from "./ConceptRow";
const concept = { concept_id: "c1", tenant: "default", name: "Prompt caching", state: "confirmed" as const, confidence: 0.9, aliases: ["prompt cache"], updated_at: "2026-06-12T00:00:00Z", tombstoned_at: null };
export default { title: "Graph/ConceptRow", component: ConceptRow } satisfies Meta<typeof ConceptRow>;
type Story = StoryObj<typeof ConceptRow>;
export const Default: Story = { args: { concept } };
export const Empty: Story = { args: { concept: { ...concept, aliases: [] } } };
export const Error: Story = { args: { concept: { ...concept, state: "candidate" } } };
