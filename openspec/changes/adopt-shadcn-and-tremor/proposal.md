## Why

The admin UI shipped with `bootstrap-thin-mvp` is functional but visually primitive: no CSS framework, every component styled with inline `style={{...}}` objects against a handful of CSS custom properties, light theme only, and a bare horizontal header for navigation. As the surface grew (`/queries`, `/vectors`, `/entities`, `/ingestion`, `/graph`), three costs compounded:

1. **No reusable visual vocabulary.** Each of the 17 shared components hand-rolls its own paddings, borders, badge colours, and table grids. Visual drift is already visible between pages.
2. **No charts.** The product brief calls for an observability-grade dashboard (token consumption, latency, ingest volume, candidate-queue depth) and the reference design the user provided (an "Eval Alignment"-style dark SaaS dashboard with stat cards, bar charts, filter chips, and a sidebar) is not buildable with inline styles.
3. **No dark mode.** The user explicitly asked for a dark/light toggle. Retrofitting one onto inline styles means touching every style object; adopting a token-based system makes it a class swap.

The fix is a one-time adoption of an industry-standard kit: **Tailwind CSS** (utility tokens + `dark:` variants), **shadcn/ui** (copy-in Radix-based primitives — buttons, inputs, tables, tabs, dialogs, toasts), **Tremor** (dashboard/chart components built on the same Tailwind base), **next-themes** (class-strategy theme switching), and **lucide-react** (icons, the set both kits assume).

## What Changes

- **Tailwind CSS 3.4 becomes the styling system.** PostCSS pipeline added to the admin UI; `globals.css` is rewritten as Tailwind layers plus the shadcn CSS-variable theme tokens (light + dark palettes). Inline `style={{...}}` objects are removed from app code; component styling uses Tailwind utilities and kit primitives.
- **shadcn/ui primitives vendored under `src/components/ui/`.** Copy-in components (button, input, select, table, tabs, badge, card, dialog, dropdown-menu, toast/sonner, skeleton, separator…) added as needed. These are vendored third-party code: they are exempt from the `*.stories.tsx` neighbour rule; the rule continues to apply to every component we author in `src/components/`.
- **Tremor adopted for dashboard visuals** (`@tremor/react`): bar/area/donut charts, spark lines, progress bars, and KPI layout primitives for current and future pages.
- **Dark mode with a persistent toggle.** `next-themes` provider (class strategy, `defaultTheme="system"`, persisted to `localStorage`) wraps the app; a sun/moon toggle lives in the app shell. All kit components and all authored components MUST render correctly in both themes.
- **App shell rebuilt: sidebar navigation.** `layout.tsx`'s inline-styled header is replaced by a left sidebar (product name, nav items with lucide icons and active-route highlight, theme toggle, collapsible on small viewports) matching the reference design's structure.
- **New authored dashboard components (with stories):** `StatCard` (KPI value + delta + spark), `RankedList` (top-N rows with value bars), `FilterChipBar` (toggleable filter chips driving query params), `BreakdownCard` (titled card wrapping a Tremor chart with legend). These power a restyled home page `/` that becomes a real overview dashboard (counts from existing endpoints: recent queries, entities, candidate edges, connector status).
- **All 17 existing authored components and all 8 routes migrated** to Tailwind + kit primitives. Behaviour, data fetching, routes, and proxy handlers are unchanged — this is a presentation-layer change only.
- **Storybook gains theming.** Tailwind/PostCSS wired into the `@storybook/react-vite` build; a global toolbar switch toggles the `dark` class so every story can be inspected in both themes. Existing hard-coded background presets are replaced by the theme decorator.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `admin-ui`: ADDs design-system, theming, app-shell, and dashboard-component requirements; MODIFIES the component conventions (Tailwind utilities instead of inline styles; vendored `src/components/ui/` exempt from the stories rule). No API, route, or data-shape changes.

## Impact

- `services/admin-ui/package.json`: + `tailwindcss@3.4`, `postcss`, `autoprefixer`, `tailwindcss-animate`, `@tremor/react`, `next-themes`, `lucide-react`, plus shadcn peer utilities (`class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/*` as primitives are added).
- New config: `tailwind.config.ts` (content globs incl. Tremor, shadcn + Tremor presets/safelist, `darkMode: "class"`), `postcss.config.mjs`, `components.json` (shadcn manifest).
- `src/app/globals.css` rewritten (Tailwind layers + theme tokens). `src/app/layout.tsx` rebuilt (ThemeProvider + sidebar shell, `suppressHydrationWarning` on `<html>`).
- Every file under `src/components/` and `src/app/**/page.tsx` is touched (styling only).
- `.storybook/main.ts` / `preview.ts`: PostCSS wiring + theme decorator/toolbar.
- No pipeline, ingestion, MCP, database, or compose changes. No new services. Bundle size grows (Radix + Tremor/recharts); acceptable for an operator-facing internal UI.
- Tests: existing vitest suites must stay green; Storybook build must stay clean. Smoke is unaffected (no API changes) but is still run before commit per project rules.
