

## Theme Fix: Replace Hardcoded Dark Colors with Semantic Tokens

### Problem
Multiple components use hardcoded dark background colors (like `bg-slate-950`, `bg-slate-900`) and hardcoded text colors (`text-white`, `border-white/`). These look fine in dark mode but create dark cards/panels against a light background in light mode, resulting in a "mixed" appearance.

### Affected Files (8 components)
1. **CIIDashboard.tsx** -- stat cards, chart cards, dialog, table rows all use `bg-slate-950`, `text-white`
2. **IntegrationSettings.tsx** -- tabs, cards, modals use `bg-slate-950`, `bg-slate-900`
3. **LayoutMapper.tsx** -- ship visualization card uses `bg-slate-950`, `text-white`
4. **MotionRiskAnalyzer.tsx** -- vessel simulation uses `bg-slate-900`, `bg-slate-800`
5. **DigitalTwin.tsx** -- 3D visualization area uses `bg-slate-950`
6. **VesselManagement.tsx** -- AI chat panel uses `bg-slate-900`, `bg-slate-950`
7. **SetupPage.tsx** -- config card headers use `bg-slate-900`, `text-slate-100`
8. **VesselsCertification.tsx** -- minor uses of `bg-slate-500/`

### Approach
Replace all hardcoded slate/white color references with semantic design tokens:

| Hardcoded | Replacement |
|-----------|-------------|
| `bg-slate-950` | `bg-card` or `bg-muted/20` |
| `bg-slate-900` | `bg-card` or `bg-muted/10` |
| `bg-slate-950/50` | `bg-muted/30` |
| `bg-slate-800` | `bg-muted/40` |
| `text-white` | `text-foreground` or `text-card-foreground` |
| `text-white/40` | `text-muted-foreground` |
| `text-white/60` | `text-muted-foreground` |
| `text-slate-100` | `text-foreground` |
| `text-slate-200` | `text-foreground/80` |
| `border-white/5` | `border-border` |
| `border-white/10` | `border-border` |
| `border-white/20` | `border-border` |
| `bg-white/5` | `bg-muted/10` |
| `bg-white/[0.02]` | `bg-muted/5` |

For special visualization areas (ship diagram, digital twin, charts) that are intentionally dark canvases, use `dark:bg-slate-950 bg-muted` so they adapt properly.

### Technical Details

Each of the 8 files will be edited to swap hardcoded colors for semantic tokens. The dialog in CIIDashboard will change from `bg-slate-950` to `bg-card` with `text-card-foreground`. Chart tooltip styles will use CSS variables. The recharts grid/axis colors will use `hsl(var(--muted-foreground))` instead of `rgba(255,255,255,...)`.

No new files or dependencies needed. This is purely a CSS class name replacement across the affected components.

