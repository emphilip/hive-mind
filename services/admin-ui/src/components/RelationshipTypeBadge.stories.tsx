import type { Meta, StoryObj } from "@storybook/react";
import { RelationshipTypeBadge } from "./RelationshipTypeBadge";
export default { title: "Graph/RelationshipTypeBadge", component: RelationshipTypeBadge } satisfies Meta<typeof RelationshipTypeBadge>;
type Story = StoryObj<typeof RelationshipTypeBadge>;
export const Default: Story = { args: { type: "depends_on" } };
export const Empty: Story = { args: { type: "unknown" } };
export const Error: Story = { args: { type: "deprecated" } };
