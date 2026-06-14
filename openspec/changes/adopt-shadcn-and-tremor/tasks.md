# Tasks — adopt-shadcn-and-tremor

## Phase 1 — Toolchain and theme foundation

- [ ] 1.1 Add deps: `tailwindcss@^3.4`, `postcss`, `autoprefixer`, `tailwindcss-animate`, `@tremor/react`, `next-themes`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`
- [ ] 1.2 `tailwind.config.ts` (darkMode "class", content globs incl. `node_modules/@tremor/**`, Tremor preset + safelist, shadcn token extensions) + `postcss.config.mjs`
- [ ] 1.3 Rewrite `globals.css`: Tailwind layers + shadcn CSS-variable tokens for `:root` and `.dark`
- [ ] 1.4 shadcn init (`components.json`, `src/lib/utils.ts` with `cn()`); add base primitives: button, badge, card, input, select, table, tabs, separator, skeleton, dialog, dropdown-menu, sheet, sonner
- [ ] 1.5 `next build` passes with the new pipeline; no visual migration yet

## Phase 2 — App shell and theming

- [ ] 2.1 `ThemeProvider` (next-themes, class strategy, system default) in `layout.tsx` with `suppressHydrationWarning`
- [ ] 2.2 Sidebar component (nav items + lucide icons + active-route highlight + theme toggle; sheet/drawer below breakpoint) with stories
- [ ] 2.3 Replace the inline-styled header layout with the sidebar shell
- [ ] 2.4 Storybook: theme toolbar decorator toggling `dark` class; remove hard-coded background presets; verify Tailwind compiles in Storybook

## Phase 3 — New dashboard components (stories first)

- [ ] 3.1 `StatCard` + stories (both themes)
- [ ] 3.2 `RankedList` + stories
- [ ] 3.3 `FilterChipBar` + stories
- [ ] 3.4 `BreakdownCard` (Tremor chart wrapper) + stories
- [ ] 3.5 Rebuild `/` as the overview dashboard from existing endpoints only; graceful per-card error states

## Phase 4 — Migrate existing pages and components

- [ ] 4.1 `/queries` + `/queries/[id]` (QueryRow, TokenBar, AuditRecordView)
- [ ] 4.2 `/entities` + `/entities/[id]` (EntityRow, EntityDetail, EntityDetailView; filters via FilterChipBar where it fits)
- [ ] 4.3 `/ingestion` (ConnectorCard, IngestionRunRow, RunNowPanel)
- [ ] 4.4 `/vectors` (VectorHit, VectorExplorer)
- [ ] 4.5 `/graph` (ConceptRow, ConceptDetail, CandidateEdgeRow, RelationshipTypeBadge, VocabRow, GraphActions) — promote/demote/edit/toast behaviour unchanged
- [ ] 4.6 Sweep: no `style={{` static styling outside `src/components/ui/`; no direct `recharts` imports

## Phase 5 — Verification

- [ ] 5.1 `pnpm --filter @hive-mind/admin-ui test` green (update only style-coupled assertions)
- [ ] 5.2 `pnpm --filter @hive-mind/admin-ui build` and `build-storybook` clean
- [ ] 5.3 Manual pass: every page in both themes in the browser against the live stack; toggle persists across reload
- [ ] 5.4 `bash tests/smoke/run.sh` against the live stack (no API changes expected; smoke guards regressions)
- [ ] 5.5 Secret scan staged diff; commit + push
- [ ] 5.6 `openspec archive adopt-shadcn-and-tremor --yes`
