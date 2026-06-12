import type { Meta, StoryObj } from "@storybook/react";
import { VocabRow } from "./VocabRow";
const item = { name: "depends_on", description: "A requires B", inverse: null, directed: true, deprecated_at: null };
export default { title: "Graph/VocabRow", component: VocabRow } satisfies Meta<typeof VocabRow>;
type Story = StoryObj<typeof VocabRow>;
export const Default: Story = { args: { item } };
export const Empty: Story = { args: { item: { ...item, description: "" } } };
export const Error: Story = { args: { item: { ...item, deprecated_at: "2026-06-12T00:00:00Z" } } };
