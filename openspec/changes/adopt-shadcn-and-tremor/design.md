# Design — adopt-shadcn-and-tremor

## D1. Tailwind 3.4, not Tailwind 4

**Decision:** Pin `tailwindcss@^3.4` with a classic `tailwind.config.ts` + PostCSS setup.

**Rationale:** `@tremor/react` (3.x, the current stable) ships a Tailwind **preset** and depends on v3 config semantics (safelisted color scales, `content` scanning of `node_modules/@tremor/**`). Tailwind 4's CSS-first config has no preset mechanism Tremor supports today. shadcn/ui supports both v3 and v4, so v3.4 is the intersection.

**Alternative considered:** Tailwind 4 + "Tremor Raw" (copy-in charts). Rejected: Tremor Raw means vendoring chart code we'd have to maintain, and v4 migration buys nothing for an internal operator UI. Revisit when Tremor publishes v4 support.

## D2. shadcn/ui as vendored code under `src/components/ui/`

**Decision:** Use the shadcn CLI (`pnpm dlx shadcn@latest add …`) to copy primitives into `src/components/ui/`. These files are treated as vendored third-party code: lint applies, but the project's "every shared component has a `*.stories.tsx` neighbour" rule does **not** apply to `src/components/ui/**`. Authored components in `src/components/` keep the rule.

**Rationale:** The stories rule exists so *our* components stay reviewable in isolation. shadcn primitives are upstream-documented and unmodified-by-default; writing stories for ~12 vendored files is busywork. The boundary is the directory.

**Risk:** drift if we hand-edit vendored files. Mitigation: edits to `ui/*` files must be commented at the edit site.

## D3. Theme switching via next-themes class strategy

**Decision:** `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>` in `layout.tsx`; `suppressHydrationWarning` on `<html>`; theme tokens expressed as CSS variables in `globals.css` under `:root` and `.dark`, consumed by both shadcn (`hsl(var(--…))`) and Tremor (`dark:` variants).

**Rationale:** Class strategy is what both kits are built for; `next-themes` handles SSR flash and `localStorage` persistence for free. The toggle component (sun/moon, lucide icons) lives in the sidebar footer.

**Alternative considered:** hand-rolled context + cookie. Rejected: solved problem, and the SSR-flash edge cases are fiddly.

## D4. Storybook integration

**Decision:** Keep `@storybook/react-vite`. Add PostCSS (Tailwind) to the Storybook Vite pipeline (vite picks up `postcss.config.mjs` automatically once `globals.css` is imported in `preview.ts` — already the case). Add a global toolbar item ("theme": light/dark) implemented as a decorator that toggles the `dark` class on `document.documentElement` and sets a matching canvas background. Remove the hard-coded `backgrounds` presets.

**Rationale:** This is the smallest change that gives per-story dark-mode review, which the spec makes mandatory for every authored component.

**Gotcha carried forward:** do NOT switch to `@storybook/nextjs` (incompatible with Next 15.5); keep the `next/link` + `next/navigation` mocks.

## D5. Migration is big-bang within the change, page by page in commits

**Decision:** All 8 routes and all 17 authored components are migrated in this change (no long-lived mixed styling), but implementation proceeds page-by-page (shell → home dashboard → queries → entities → ingestion → vectors → graph) so each commit is reviewable and Storybook/vitest stay green throughout.

**Rationale:** A mixed inline-style/Tailwind UI is worse than either endpoint — the theme toggle would half-work. The admin UI is small enough (~25 files) that big-bang within one change is tractable.

**Risk:** visual regressions with no pixel tests. Mitigation: Storybook stories double as the visual review surface; each migrated component's stories must be eyeballed in both themes before its task is checked.

## D6. Charts come from Tremor only

**Decision:** All charts/sparklines/progress visuals use `@tremor/react` components. No direct `recharts` imports in app code.

**Rationale:** One charting vocabulary; Tremor wraps recharts with theme-consistent defaults. Direct recharts usage would bypass the token system and break dark mode.

## D7. Home page becomes the overview dashboard

**Decision:** `/` is rebuilt as the dashboard from the reference design: a `StatCard` row (recent query count, entity total, candidate-edge count, connector status), a `BreakdownCard` with a Tremor bar chart (queries per day from `/audit/recent`), and a `RankedList` (top sources by entity count, derived client-side from `/entities` facets). **No new pipeline endpoints** — the dashboard composes existing reads only. If an aggregate isn't derivable from existing endpoints, the card is omitted rather than adding API surface in a UI change.

**Rationale:** Keeps this change presentation-only. A `add-dashboard-metrics` follow-up can add purpose-built aggregate endpoints once we know which cards earn their keep.

## Open questions

- None blocking. Sidebar collapse behaviour on mobile is implementer's choice (sheet/drawer via shadcn `Sheet` is the default path).
