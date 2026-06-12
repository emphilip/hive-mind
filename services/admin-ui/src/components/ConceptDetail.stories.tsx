import type { Meta, StoryObj } from "@storybook/react";
import { ConceptDetail } from "./ConceptDetail";
const concept = { concept_id: "c1", tenant: "default", name: "Caching", dedupe_key: "caching", state: "confirmed" as const, confidence: 0.9, aliases: [], created_at: "2026-06-12T00:00:00Z", updated_at: "2026-06-12T00:00:00Z", neighbours_confirmed: [], neighbours_candidate: [] };
export default { title: "Graph/ConceptDetail", component: ConceptDetail } satisfies Meta<typeof ConceptDetail>;
type Story = StoryObj<typeof ConceptDetail>;
export const Default: Story = { args: { concept: { ...concept, description: "Caches prompts." } } };
export const Empty: Story = { args: { concept } };
export const Error: Story = { args: { concept: { ...concept, state: "candidate" } } };
