import type { Meta, StoryObj } from "@storybook/react";
import { RankedList } from "./RankedList";

const meta: Meta<typeof RankedList> = {
  title: "Admin/RankedList",
  component: RankedList,
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
};
export default meta;

type Story = StoryObj<typeof RankedList>;

export const Default: Story = {
  args: {
    title: "Top sources by entities",
    items: [
      { label: "git", value: 2365, href: "/entities?source=git" },
      { label: "confluence", value: 412 },
      { label: "custom-api", value: 88 },
    ],
  },
};

export const Empty: Story = {
  args: { title: "Top sources by entities", items: [], emptyMessage: "Nothing ingested yet" },
};
