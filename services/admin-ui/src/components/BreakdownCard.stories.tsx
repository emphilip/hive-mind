import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "@tremor/react";
import { BreakdownCard } from "./BreakdownCard";

const meta: Meta<typeof BreakdownCard> = {
  title: "Admin/BreakdownCard",
  component: BreakdownCard,
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof BreakdownCard>;

const data = [
  { day: "Mon", queries: 32 },
  { day: "Tue", queries: 51 },
  { day: "Wed", queries: 18 },
  { day: "Thu", queries: 64 },
  { day: "Fri", queries: 47 },
];

export const Default: Story = {
  args: {
    title: "Query activity",
    description: "Retrievals per day (last 5 days)",
    children: (
      <BarChart data={data} index="day" categories={["queries"]} colors={["indigo"]} className="h-48" showLegend />
    ),
  },
};
