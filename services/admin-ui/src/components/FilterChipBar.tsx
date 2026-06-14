"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FilterChip {
  value: string;
  label: string;
}

export interface FilterChipBarProps {
  options: FilterChip[];
  selected: string[];
  onToggle: (value: string) => void;
  label?: string;
}

export function FilterChipBar({ options, selected, onToggle, label }: FilterChipBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            aria-pressed={active}
            className="focus-visible:outline-none"
          >
            <Badge
              variant={active ? "default" : "outline"}
              className={cn("cursor-pointer gap-1 px-2.5 py-0.5", !active && "text-muted-foreground")}
            >
              {option.label}
              {active && <X className="h-3 w-3" />}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
