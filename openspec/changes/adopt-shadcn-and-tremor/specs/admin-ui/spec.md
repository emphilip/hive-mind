## ADDED Requirements

### Requirement: Design system and styling conventions

The admin UI SHALL use Tailwind CSS (v3.4, `darkMode: "class"`) as its styling system, with shadcn/ui primitives vendored under `src/components/ui/` and Tremor (`@tremor/react`) for all chart and KPI visuals. Authored app code MUST NOT use inline `style={{...}}` objects for visual styling (dynamic values such as computed bar widths are exempt) and MUST NOT import `recharts` directly. Theme colours MUST be expressed through the shared CSS-variable tokens defined in `globals.css` so both themes resolve correctly.

Vendored files under `src/components/ui/**` are exempt from the `*.stories.tsx` neighbour rule; every authored component directly in `src/components/` retains it.

#### Scenario: No inline styles remain in authored code

- **WHEN** `grep -rn "style={{" services/admin-ui/src/app services/admin-ui/src/components --include "*.tsx"` is run after this change ships, excluding `src/components/ui/`
- **THEN** the only matches (if any) are dynamic computed values (e.g., percentage widths), not static visual styling

#### Scenario: Charts use Tremor only

- **WHEN** `grep -rn "from \"recharts\"" services/admin-ui/src` is run
- **THEN** there are no matches in authored app code

### Requirement: Dark and light themes with a persistent toggle

The admin UI SHALL support light and dark themes via `next-themes` (class strategy), defaulting to the operator's system preference and persisting an explicit choice across sessions. A theme toggle MUST be reachable from every page via the app shell. Every authored component and every vendored primitive in use MUST render legibly in both themes.

#### Scenario: Default follows system preference

- **WHEN** an operator with OS-level dark mode visits any admin UI page with no stored preference
- **THEN** the page renders with the dark theme (`dark` class on the document element) without a flash of the wrong theme

#### Scenario: Explicit choice persists

- **WHEN** an operator clicks the theme toggle to switch from dark to light and then reloads the page
- **THEN** the page renders with the light theme

### Requirement: App shell with sidebar navigation

The admin UI SHALL present a persistent left sidebar containing the product name, navigation links (Overview, Queries, Vectors, Entities, Ingestion, Graph) each with a lucide icon, an active-route highlight, and the theme toggle. On narrow viewports the sidebar SHALL collapse into a toggleable drawer. The previous inline-styled horizontal header is removed.

#### Scenario: Active route is highlighted

- **WHEN** an operator is on `/entities`
- **THEN** the sidebar renders the Entities item in its active state and all other items in their inactive state

#### Scenario: Sidebar collapses on narrow viewports

- **WHEN** the viewport is narrower than the configured breakpoint
- **THEN** the sidebar is hidden behind a menu button that opens it as a drawer

### Requirement: Overview dashboard at /

The admin UI home page SHALL be an overview dashboard composed exclusively from existing pipeline read endpoints (no new API surface): a row of `StatCard`s (recent query count, entity total, candidate-edge count, supported-connector count), a `BreakdownCard` containing a Tremor chart of recent query activity derived from `/audit/recent`, and a `RankedList` of top sources by entity count. If a value is not derivable from existing endpoints the corresponding card is omitted.

#### Scenario: Dashboard renders from existing endpoints

- **WHEN** an operator opens `/` with the stack running
- **THEN** the page issues reads only to existing endpoints (audit, entities, graph edges, ingestion connectors) via the existing proxy pattern
- **AND** stat cards, the activity chart, and the ranked list render with live values

#### Scenario: Dashboard degrades gracefully

- **WHEN** one of the underlying reads fails
- **THEN** the affected card renders an error/empty state
- **AND** the remaining cards render normally

### Requirement: Authored dashboard components with stories

The admin UI SHALL provide four new authored components, each with a `*.stories.tsx` neighbour covering both themes: `StatCard` (label, value, optional delta and sparkline), `RankedList` (top-N rows with proportional value bars), `FilterChipBar` (toggleable chips that drive URL query parameters), and `BreakdownCard` (titled card wrapping a Tremor chart with legend).

#### Scenario: Stories exist for the new components

- **WHEN** `pnpm --filter @hive-mind/admin-ui build-storybook` is run after this change ships
- **THEN** at least one story exists for each of `StatCard`, `RankedList`, `FilterChipBar`, `BreakdownCard`
- **AND** the Storybook build completes without errors

### Requirement: Storybook theme switching

The Storybook instance SHALL compile Tailwind styles and provide a global toolbar control that switches stories between light and dark themes by toggling the `dark` class, replacing the previous hard-coded background presets.

#### Scenario: A story is viewable in both themes

- **WHEN** a reviewer opens any component story and flips the theme toolbar control
- **THEN** the story re-renders with the selected theme's tokens applied

## MODIFIED Requirements

### Requirement: Existing pages and components restyled without behavioural change

All existing routes (`/`, `/queries`, `/queries/[id]`, `/entities`, `/entities/[id]`, `/ingestion`, `/vectors`, `/graph`) and all 17 existing authored components SHALL be restyled with Tailwind + kit primitives. Data fetching, proxy routes, URL parameters, filters, pagination, and actions MUST behave identically to before this change; vitest suites MUST pass unmodified except for assertions that targeted inline styles or class names.

#### Scenario: Graph review workflow unchanged

- **WHEN** an operator promotes a candidate edge from the restyled `/graph` review queue
- **THEN** the UI posts `/graph/edges/{id}/promote` with a reason, removes the row on success, and shows a confirmation toast, exactly as specified in `add-knowledge-graph`

#### Scenario: Entity filters unchanged

- **WHEN** an operator applies source and classification filters on the restyled `/entities` page
- **THEN** the same query parameters are sent to the same proxy route as before this change
