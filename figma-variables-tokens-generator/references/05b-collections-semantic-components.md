# Collections Reference — Part B

> Part A (Primitives → Typography) is in `05a-collections-core.md`

## Semantic Collection — Token Groups

> [!IMPORTANT]
> **This section defines token paths for Semantic in ALL tiers.** The paths are the same whether Semantic has modes (2/3-Tier) or not (4-Tier). The only differences are:
> - **2/3-Tier:** Semantic aliases **Primitives**, has **light/dark modes**
> - **4-Tier:** Semantic aliases **Theme**, has **no modes** (single `semantic.tokens.json`)

**Scopes:** Same rules as Theme — TEXT_FILL, FRAME_FILL+SHAPE_FILL, STROKE, EFFECT_COLOR, etc.

### Rules — Violations Cause Silent Figma Import Failures

**RULE 1 — Feedback alias family names must match Primitives exactly:**
Theme/Semantic feedback tokens alias Primitives colour families. The mapping is strict:
- `error` → alias `primitives/color/red/*`
- `success` → alias `primitives/color/green/*`
- `warning` → alias `primitives/color/yellow/*`
- `info` → alias `primitives/color/blue/*`

Never use `color/error/50` as a target in Primitives — that path does not exist. Primitives uses `color/red/50`.

**RULE 2 — Never use slash in a JSON key:**
`"destructive/text"` as a JSON key is a single literal string. Always nest properly:
```json
"destructive": {
  "default": { ... },
  "text": { ... }
}
```

**RULE 3 — All aliasData targets must exist in the target collection:**
Before writing any `aliasData.targetVariableName`, verify the path actually exists. Common broken paths:
- `border/disabled` — does NOT exist unless explicitly defined
- `action/secondary/disabled` — does NOT exist unless explicitly defined

**RULE 4 — Typography extended roles must alias Responsive paths that exist:**
If you define extended typography roles, their `fontSize/lineHeight/letterSpacing` must alias Responsive paths that were actually generated.

---

## Token Count Intelligence

> [!IMPORTANT]
> **TOKEN COUNTING RULE:** One token = one unique path, regardless of modes. If Semantic has light + dark modes and 94 unique paths, that's **94 tokens**, not 188. Count paths, not mode instances.

### Minimum Token Counts by Density Choice

| Density | Semantic Tokens (unique paths) |
|---|---|
| **Lean** | 55-80 |
| **Standard** | 80-120 |
| **Enterprise** | 120-250+ |

### Semantic Floor Rule (MANDATORY)
The token groups below represent the **FLOOR** — the absolute minimum. The AI MUST generate ALL groups listed below regardless of density choice. For Standard and Enterprise, expand each group with additional variants.

---

## Semantic Token Groups — Production-Grade Reference (~94 paths)

### surface group (12 tokens) → FRAME_FILL + SHAPE_FILL
```
semantic/surface/page             → primitives/color/white (light) / grey/950 (dark)
semantic/surface/default          → primitives/color/white (light) / grey/900 (dark)
semantic/surface/raised           → primitives/color/grey/50 (light) / grey/800 (dark)
semantic/surface/overlay          → primitives/color/white (light) / grey/800 (dark)
semantic/surface/sunken           → primitives/color/grey/100 (light) / grey/950 (dark)
semantic/surface/inverted         → primitives/color/grey/900 (light) / white (dark)
semantic/surface/disabled         → primitives/color/grey/100 (light) / grey/800 (dark)
semantic/surface/brand            → primitives/color/{brand}/500 (light) / {brand}/600 (dark)
semantic/surface/input            → primitives/color/white (light) / grey/900 (dark)
semantic/surface/card             → primitives/color/white (light) / grey/850 (dark)
semantic/surface/modal            → primitives/color/white (light) / grey/800 (dark)
semantic/surface/popover          → primitives/color/white (light) / grey/800 (dark)
```

### text group (15 tokens) → TEXT_FILL
```
semantic/text/primary             → primitives/color/grey/900 (light) / grey/50 (dark)
semantic/text/secondary           → primitives/color/grey/600 (light) / grey/400 (dark)
semantic/text/tertiary            → primitives/color/grey/500 (light) / grey/500 (dark)
semantic/text/placeholder         → primitives/color/grey/400 (light) / grey/600 (dark)
semantic/text/disabled            → primitives/color/grey/300 (light) / grey/700 (dark)
semantic/text/inverse             → primitives/color/white (light) / grey/900 (dark)
semantic/text/link                → primitives/color/{brand}/600 (light) / {brand}/400 (dark)
semantic/text/link-hover          → primitives/color/{brand}/700 (light) / {brand}/300 (dark)
semantic/text/on-brand            → primitives/color/white (both)
semantic/text/on-danger           → primitives/color/white (both)
semantic/text/on-error            → primitives/color/white (both)
semantic/text/on-success          → primitives/color/white (both)
semantic/text/on-warning          → primitives/color/grey/900 (both)
semantic/text/on-info             → primitives/color/white (both)
semantic/text/on-surface-variant  → primitives/color/grey/600 (light) / grey/400 (dark)
```

### border group (11 tokens) → STROKE
```
semantic/border/default           → primitives/color/grey/200 (light) / grey/700 (dark)
semantic/border/subtle            → primitives/color/grey/100 (light) / grey/800 (dark)
semantic/border/strong            → primitives/color/grey/400 (light) / grey/500 (dark)
semantic/border/focus             → primitives/color/{brand}/500 (light) / {brand}/400 (dark)
semantic/border/error             → primitives/color/red/500 (light) / red/400 (dark)
semantic/border/disabled          → primitives/color/grey/200 (light) / grey/800 (dark)
semantic/border/inverse           → primitives/color/white (light) / grey/900 (dark)
semantic/border/brand             → primitives/color/{brand}/500 (light) / {brand}/400 (dark)
semantic/border/success           → primitives/color/green/500 (light) / green/400 (dark)
semantic/border/warning           → primitives/color/yellow/500 (light) / yellow/400 (dark)
semantic/border/info              → primitives/color/blue/500 (light) / blue/400 (dark)
```

### interactive group (24 tokens) → mixed scopes
```
semantic/interactive/primary/default      FRAME_FILL+SHAPE_FILL → {brand}/600 (light) / {brand}/500 (dark)
semantic/interactive/primary/hover        FRAME_FILL+SHAPE_FILL → {brand}/700 (light) / {brand}/400 (dark)
semantic/interactive/primary/pressed      FRAME_FILL+SHAPE_FILL → {brand}/800 (light) / {brand}/600 (dark)
semantic/interactive/primary/disabled     FRAME_FILL+SHAPE_FILL → grey/200 (light) / grey/800 (dark)
semantic/interactive/primary/text         TEXT_FILL             → white (both)
semantic/interactive/primary/border       STROKE                → {brand}/600 (light) / {brand}/500 (dark)

semantic/interactive/secondary/default    FRAME_FILL+SHAPE_FILL → grey/100 (light) / grey/800 (dark)
semantic/interactive/secondary/hover      FRAME_FILL+SHAPE_FILL → grey/200 (light) / grey/700 (dark)
semantic/interactive/secondary/pressed    FRAME_FILL+SHAPE_FILL → grey/300 (light) / grey/600 (dark)
semantic/interactive/secondary/disabled   FRAME_FILL+SHAPE_FILL → grey/100 (light) / grey/900 (dark)
semantic/interactive/secondary/text       TEXT_FILL             → grey/900 (light) / grey/100 (dark)
semantic/interactive/secondary/border     STROKE                → grey/300 (light) / grey/600 (dark)

semantic/interactive/ghost/hover          FRAME_FILL+SHAPE_FILL → grey/100 (light) / grey/800 (dark)
semantic/interactive/ghost/pressed        FRAME_FILL+SHAPE_FILL → grey/200 (light) / grey/700 (dark)
semantic/interactive/ghost/text           TEXT_FILL             → grey/900 (light) / grey/100 (dark)

semantic/interactive/destructive/default  FRAME_FILL+SHAPE_FILL → red/600 (light) / red/500 (dark)
semantic/interactive/destructive/hover    FRAME_FILL+SHAPE_FILL → red/700 (light) / red/400 (dark)
semantic/interactive/destructive/pressed  FRAME_FILL+SHAPE_FILL → red/800 (light) / red/600 (dark)
semantic/interactive/destructive/disabled FRAME_FILL+SHAPE_FILL → grey/200 (light) / grey/800 (dark)
semantic/interactive/destructive/text     TEXT_FILL             → white (both)
semantic/interactive/destructive/border   STROKE                → red/600 (light) / red/500 (dark)

semantic/interactive/link/default         TEXT_FILL → {brand}/600 (light) / {brand}/400 (dark)
semantic/interactive/link/hover           TEXT_FILL → {brand}/700 (light) / {brand}/300 (dark)
semantic/interactive/link/visited         TEXT_FILL → {brand}/800 (light) / {brand}/500 (dark)
```

### feedback group (16 tokens) → mixed scopes
```
semantic/feedback/error/surface     FRAME_FILL+SHAPE_FILL → red/50 (light) / red/900 (dark)
semantic/feedback/error/border      STROKE                → red/200 (light) / red/700 (dark)
semantic/feedback/error/text        TEXT_FILL              → red/700 (light) / red/300 (dark)
semantic/feedback/error/icon        SHAPE_FILL+STROKE      → red/500 (light) / red/400 (dark)

semantic/feedback/success/surface   FRAME_FILL+SHAPE_FILL → green/50 (light) / green/900 (dark)
semantic/feedback/success/border    STROKE                → green/200 (light) / green/700 (dark)
semantic/feedback/success/text      TEXT_FILL              → green/700 (light) / green/300 (dark)
semantic/feedback/success/icon      SHAPE_FILL+STROKE      → green/500 (light) / green/400 (dark)

semantic/feedback/warning/surface   FRAME_FILL+SHAPE_FILL → yellow/50 (light) / yellow/900 (dark)
semantic/feedback/warning/border    STROKE                → yellow/200 (light) / yellow/700 (dark)
semantic/feedback/warning/text      TEXT_FILL              → yellow/700 (light) / yellow/300 (dark)
semantic/feedback/warning/icon      SHAPE_FILL+STROKE      → yellow/500 (light) / yellow/400 (dark)

semantic/feedback/info/surface      FRAME_FILL+SHAPE_FILL → blue/50 (light) / blue/900 (dark)
semantic/feedback/info/border       STROKE                → blue/200 (light) / blue/700 (dark)
semantic/feedback/info/text         TEXT_FILL              → blue/700 (light) / blue/300 (dark)
semantic/feedback/info/icon         SHAPE_FILL+STROKE      → blue/500 (light) / blue/400 (dark)
```

### icon group (9 tokens) → SHAPE_FILL + STROKE
```
semantic/icon/default     → grey/700 (light) / grey/300 (dark)
semantic/icon/muted       → grey/400 (light) / grey/600 (dark)
semantic/icon/brand       → {brand}/600 (light) / {brand}/400 (dark)
semantic/icon/inverse     → white (light) / grey/900 (dark)
semantic/icon/disabled    → grey/300 (light) / grey/700 (dark)
semantic/icon/error       → red/500 (light) / red/400 (dark)
semantic/icon/success     → green/500 (light) / green/400 (dark)
semantic/icon/warning     → yellow/500 (light) / yellow/400 (dark)
semantic/icon/info        → blue/500 (light) / blue/400 (dark)
```

### overlay group (3 tokens) → ALL_FILLS
```
semantic/overlay/scrim         → primitives/color/black/a48 (light) / black/a64 (dark)
semantic/overlay/tooltip       FRAME_FILL+SHAPE_FILL → grey/900 (light) / grey/100 (dark)
semantic/overlay/backdrop      ALL_FILLS → primitives/color/black/a32 (light) / black/a48 (dark)
```

### shadow colors (4 tokens) → EFFECT_COLOR
```
semantic/shadow/sm/color    → primitives/color/black/a16 (light) / white/a8 (dark)
semantic/shadow/md/color    → primitives/color/black/a24 (light) / white/a16 (dark)
semantic/shadow/lg/color    → primitives/color/black/a32 (light) / white/a24 (dark)
semantic/shadow/xl/color    → primitives/color/black/a40 (light) / white/a32 (dark)
```

### TOTAL FLOOR: ~94 unique token paths

---

## Enterprise Extensions (Standard/Enterprise density only)

For **Standard** and **Enterprise** density, the AI should additionally generate these groups:

### surface extensions (+6 tokens)
```
semantic/surface/brand-subtle     → {brand}/50 (light) / {brand}/900 (dark)
semantic/surface/error-subtle     → red/50 (light) / red/950 (dark)
semantic/surface/success-subtle   → green/50 (light) / green/950 (dark)
semantic/surface/warning-subtle   → yellow/50 (light) / yellow/950 (dark)
semantic/surface/info-subtle      → blue/50 (light) / blue/950 (dark)
semantic/surface/selected         → {brand}/50 (light) / {brand}/900 (dark)
```

### interactive extensions (+6 tokens)
```
semantic/interactive/tertiary/default     FRAME_FILL+SHAPE_FILL
semantic/interactive/tertiary/hover       FRAME_FILL+SHAPE_FILL
semantic/interactive/tertiary/pressed     FRAME_FILL+SHAPE_FILL
semantic/interactive/tertiary/text        TEXT_FILL
semantic/interactive/tertiary/border      STROKE
semantic/interactive/tertiary/disabled    FRAME_FILL+SHAPE_FILL
```

### data visualization (Enterprise only, +8 tokens)
```
semantic/data/chart-1 through semantic/data/chart-8    ALL_FILLS
```

### status (Enterprise only, +4 tokens)
```
semantic/status/online     SHAPE_FILL → green/500
semantic/status/offline    SHAPE_FILL → grey/400
semantic/status/busy       SHAPE_FILL → red/500
semantic/status/away       SHAPE_FILL → yellow/500
```

---

> **SEMANTIC FLOOR RULE:** The Semantic token groups above (~94 paths) are a "floor." If a Component Color token needs a variant not listed here (e.g. `border/subtle`), you MUST explicitly add it to Semantic and alias it to the corresponding Primitive token BEFORE building the component tier. Never alias Primitives from CC directly.

---

## Component Colors Collection
**Mode file:** `component-colors.tokens.json`
**$metadata.modeName:** `"component-colors"`
**Aliases:** Semantic — ALWAYS. Never Theme. Never Primitives.
**Scopes:** FRAME_FILL+SHAPE_FILL on backgrounds, TEXT_FILL on text, STROKE on borders, SHAPE_FILL+STROKE on icons

> [!IMPORTANT]
> **STRICT RULE:** Component Colors MUST alias **Semantic** in ALL tiers (3-Tier and 4-Tier). This is the industry-standard chain: Component → Semantic → Primitives (3-Tier) or Component → Semantic → Theme → Primitives (4-Tier). Aliasing Theme directly from Component Colors is a "short-circuit" violation.

### Mandatory groups (always generate)
- `icon` — fill, stroke, duotone, background (if user confirmed)
- `container` — background variants
- `divider` — default, subtle

### Icon tokens
```
color/icon/default/fill       SHAPE_FILL
color/icon/default/stroke     STROKE
color/icon/default/duotone    SHAPE_FILL  ← LOW OPACITY fill for duotone/secondary path
color/icon/brand/fill         SHAPE_FILL
color/icon/brand/stroke       STROKE
color/icon/brand/duotone      SHAPE_FILL
color/icon/muted/fill         SHAPE_FILL
color/icon/muted/stroke       STROKE
color/icon/muted/duotone      SHAPE_FILL
color/icon/inverse/fill       SHAPE_FILL
color/icon/inverse/duotone    SHAPE_FILL
color/icon/error/fill         SHAPE_FILL
color/icon/error/duotone      SHAPE_FILL
color/icon/success/fill       SHAPE_FILL
color/icon/success/duotone    SHAPE_FILL
color/icon/warning/fill       SHAPE_FILL
color/icon/warning/duotone    SHAPE_FILL
color/icon/background         FRAME_FILL+SHAPE_FILL (if user confirmed icon bg)
                                     → semantic/surface/sunken
```

> DUOTONE RULE: The `duotone` token should alias the same colour as `fill` but through the alpha/a20 or a24 variant from Primitives.

### Divider tokens
```
color/divider/default   STROKE → semantic/border/default
color/divider/subtle    STROKE → semantic/border/subtle
```

### Container tokens
```
color/container/default    FRAME_FILL+SHAPE_FILL → semantic/surface/card
color/container/raised     FRAME_FILL+SHAPE_FILL → semantic/surface/raised
color/container/sunken     FRAME_FILL+SHAPE_FILL → semantic/surface/sunken
color/container/brand      FRAME_FILL+SHAPE_FILL → semantic/surface/brand
color/container/overlay    FRAME_FILL+SHAPE_FILL → semantic/surface/overlay
```

### Button example (generate for all user-requested components)
```
color/button/primary/default/background   FRAME_FILL+SHAPE_FILL → semantic/interactive/primary/default
color/button/primary/default/text         TEXT_FILL             → semantic/interactive/primary/text
color/button/primary/default/border       STROKE                → semantic/interactive/primary/border
color/button/primary/default/icon         SHAPE_FILL            → semantic/icon/inverse
color/button/primary/hover/background     FRAME_FILL+SHAPE_FILL → semantic/interactive/primary/hover
color/button/primary/hover/text           TEXT_FILL             → semantic/interactive/primary/text
color/button/primary/hover/border         STROKE                → semantic/interactive/primary/border
color/button/primary/pressed/background   FRAME_FILL+SHAPE_FILL → semantic/interactive/primary/pressed
color/button/primary/focused/border       STROKE                → semantic/border/focus
color/button/primary/disabled/background  FRAME_FILL+SHAPE_FILL → semantic/interactive/primary/disabled
color/button/primary/disabled/text        TEXT_FILL             → semantic/text/disabled
color/button/primary/disabled/border      STROKE                → semantic/border/disabled
(repeat for secondary, ghost, danger)
```

> BORDER ≠ BACKGROUND: Button border tokens MUST alias border/stroke semantic tokens. Never alias the same background colour for both background and border.

### Pre-Generation Semantic Audit (MANDATORY)
Before building Component Colors, the AI MUST:
1. Build a flat `cc_to_sem` intent map (every CC path → its target Semantic path)
2. Call `validate_semantic_coverage()` against this map
3. If any Semantic path is missing → add it to Semantic FIRST
4. Only then build Component Colors

---

## Component Dimensions Collection
**Mode file:** `component-dimensions.tokens.json` (SINGLE MODE — no mobile/tablet/desktop)
**$metadata.modeName:** `"component-dimensions"`
**Padding + gap:** alias Density
**Radius + border width:** alias Responsive
**Scope:** GAP for padding+gap, CORNER_RADIUS for radius, STROKE_FLOAT for border width

No modes needed — breakpoint switching is handled by Responsive, density switching by Density.

### Padding tokens (GAP) — alias Density
```
dimensions/padding/x/sm      GAP → density/padding/x/sm
dimensions/padding/x/md      GAP → density/padding/x/md
dimensions/padding/y/sm      GAP → density/padding/y/sm
dimensions/padding/y/md      GAP → density/padding/y/md
... (apply the same xs→4xl nested scale across all directions: top, bottom, left, right)
```

### Gap tokens (GAP) — alias Density
```
dimensions/gap/xs    GAP → density/gap/xs
dimensions/gap/sm    GAP → density/gap/sm
dimensions/gap/md    GAP → density/gap/md
dimensions/gap/lg    GAP → density/gap/lg
dimensions/gap/xl    GAP → density/gap/xl
dimensions/gap/2xl   GAP → density/gap/2xl
dimensions/gap/3xl   GAP → density/gap/3xl
dimensions/gap/4xl   GAP → density/gap/4xl
```

### Radius tokens (CORNER_RADIUS) — alias Responsive
```
dimensions/radius/none   CORNER_RADIUS → responsive/radius/none
dimensions/radius/xs     CORNER_RADIUS → responsive/radius/xs
dimensions/radius/sm     CORNER_RADIUS → responsive/radius/sm
dimensions/radius/md     CORNER_RADIUS → responsive/radius/md
dimensions/radius/lg     CORNER_RADIUS → responsive/radius/lg
dimensions/radius/xl     CORNER_RADIUS → responsive/radius/xl
dimensions/radius/2xl    CORNER_RADIUS → responsive/radius/2xl
dimensions/radius/full   CORNER_RADIUS → responsive/radius/full
```

### Border width tokens (STROKE_FLOAT) — alias Responsive
```
dimensions/border/width/hairline  STROKE_FLOAT → responsive/borderWidth/hairline
dimensions/border/width/thin      STROKE_FLOAT → responsive/borderWidth/thin
dimensions/border/width/soft      STROKE_FLOAT → responsive/borderWidth/soft
dimensions/border/width/sm        STROKE_FLOAT → responsive/borderWidth/sm
dimensions/border/width/md        STROKE_FLOAT → responsive/borderWidth/md
dimensions/border/width/lg        STROKE_FLOAT → responsive/borderWidth/lg
```
