import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FilterChipBar } from "./FilterChipBar";

const meta: Meta<typeof FilterChipBar> = {
  title: "Admin/FilterChipBar",
  component: FilterChipBar,
};
export default meta;

type Story = StoryObj<typeof FilterChipBar>;

const options = [
  { value: "git", label: "git" },
  { value: "internal", label: "internal" },
  { value: "fresh", label: "fresh" },
  { value: "stale", label: "stale" },
];

function Interactive() {
  const [selected, setSelected] = useState<string[]>(["git"]);
  return (
    <FilterChipBar
      label="Filters:"
      options={options}
      selected={selected}
      onToggle={(value) =>
        setSelected((prev) =>
          prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
        )
      }
    />
  );
}

export const Default: Story = { render: () => <Interactive /> };
export const NoneSelected: Story = {
  args: { options, selected: [], onToggle: () => {} },
};
