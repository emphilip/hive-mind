import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from "./StatCard";

const meta: Meta<typeof StatCard> = {
  title: "Admin/StatCard",
  component: StatCard,
  decorators: [(Story) => <div className="max-w-xs"><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: { label: "Entities", value: 4231 },
};

export const WithDelta: Story = {
  args: { label: "Queries (24h)", value: 182, delta: 12, deltaLabel: "vs prior day" },
};

export const NegativeDelta: Story = {
  args: { label: "Candidate edges", value: 3458, delta: -4 },
};

export const WithSpark: Story = {
  args: {
    label: "Queries (7d)",
    value: 1043,
    delta: 8,
    spark: [
      { x: "Mon", y: 120 },
      { x: "Tue", y: 160 },
      { x: "Wed", y: 90 },
      { x: "Thu", y: 210 },
      { x: "Fri", y: 180 },
      { x: "Sat", y: 60 },
      { x: "Sun", y: 223 },
    ],
  },
};

export const ErrorState: Story = {
  args: { label: "Connectors", value: 0, error: "unreachable" },
};
