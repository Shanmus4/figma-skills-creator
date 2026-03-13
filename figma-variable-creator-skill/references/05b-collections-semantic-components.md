# Collections Reference — Part B

> Part A (Primitives → Typography) is in `05a-collections-core.md`

## Semantic Collection (4-layer only)
**Mode file:** `semantic.tokens.json`
**$metadata.modeName:** `"semantic"`
**Aliases:** Theme
**Scopes:** Same as Theme — TEXT_FILL, FRAME_FILL+SHAPE_FILL, STROKE, EFFECT_COLOR

### Critical bug rules — violations cause silent Figma import failures

**RC1 — Feedback alias family names must match Primitives exactly:**
Theme feedback tokens alias Primitives colour families. The mapping is strict:
- `error` → alias `primitives/color/red/*`
- `success` → alias `primitives/color/green/*`
- `warning` → alias `primitives/color/yellow/*`
- `info` → alias `primitives/color/blue/*`

Never use `color/error/50` as a target in Primitives — that path does not exist. Primitives uses `color/red/50`. Using the wrong family name generates a fresh VariableID pointing to nothing — Figma silently drops all feedback tokens (−16 tokens per layer).

**RC2 — Never use slash in a JSON key:**
`"destructive/text"` as a JSON key is a single literal string — Figma reads it as a broken path, not a nested token. Always nest properly:
```json
"destructive": {
  "default": { ... },
  "text": { ... }
}
```
Not: `"destructive/text": { ... }` — this drops the token entirely.

**RC3 — All aliasData targets must exist in the target collection:**
Before writing any `aliasData.targetVariableName`, verify the path actually exists in the target collection. Common broken paths that cause CC token drops:
- `border/disabled` — does NOT exist in Semantic. Use `border/default` for disabled border or add `border/disabled` to Semantic explicitly.
- `action/secondary/disabled` — does NOT exist unless explicitly defined. Define all states you alias.
Using a non-existent path generates a fresh VariableID that resolves to nothing — Figma silently drops the token.

**RC4 — Typography extended roles must alias Responsive paths that exist:**
If you define extended typography roles (display-sm, heading-lg, body-strong etc.), their `fontSize/lineHeight/letterSpacing` must alias Responsive paths that were actually generated. Don't reference `responsive/font/size/display-sm` if that path wasn't included in the Responsive collection.

```
semantic/surface/page        FRAME_FILL+SHAPE_FILL → theme/surface/page
semantic/surface/card        FRAME_FILL+SHAPE_FILL → theme/surface/default
semantic/surface/modal       FRAME_FILL+SHAPE_FILL → theme/surface/overlay
semantic/surface/input       FRAME_FILL+SHAPE_FILL → theme/surface/sunken
semantic/text/primary        TEXT_FILL → theme/text/primary
semantic/text/secondary      TEXT_FILL → theme/text/secondary
semantic/text/disabled       TEXT_FILL → theme/text/disabled
semantic/text/inverse        TEXT_FILL → theme/text/inverse
semantic/text/link           TEXT_FILL → theme/text/link
semantic/border/default      STROKE → theme/border/default
semantic/border/focus        STROKE → theme/border/focus
semantic/border/error        STROKE → theme/border/error
semantic/border/brand        STROKE → theme/border/brand
semantic/action/primary/default   FRAME_FILL+SHAPE_FILL → theme/interactive/primary/default
semantic/action/primary/hover     FRAME_FILL+SHAPE_FILL → theme/interactive/primary/hover
semantic/action/primary/text      TEXT_FILL → theme/interactive/primary/text
semantic/action/secondary/default FRAME_FILL+SHAPE_FILL → theme/interactive/secondary/default
semantic/action/secondary/text    TEXT_FILL → theme/interactive/secondary/text
semantic/action/destructive       FRAME_FILL+SHAPE_FILL → theme/interactive/destructive/default
semantic/action/destructive/text  TEXT_FILL → theme/interactive/destructive/text
semantic/feedback/error/surface   FRAME_FILL+SHAPE_FILL → theme/feedback/error/surface
semantic/feedback/error/border    STROKE → theme/feedback/error/border
semantic/feedback/error/text      TEXT_FILL → theme/feedback/error/text
(repeat pattern for success, warning, info)
```

---

## Component Colors Collection
**Mode file:** `component-colors.tokens.json`
**$metadata.modeName:** `"component-colors"`
**Aliases:** Semantic (4-layer) or Theme (2/3-layer)
**Scopes:** FRAME_FILL+SHAPE_FILL on backgrounds, TEXT_FILL on text, STROKE on borders, SHAPE_FILL+STROKE on icons

### Mandatory groups (always generate)
- `icon` — fill, stroke, duotone, background (if user confirmed)
- `container` — background variants
- `divider` — default, subtle

### Icon tokens
```
color/icon/default/fill       SHAPE_FILL
color/icon/default/stroke     STROKE
color/icon/default/duotone    SHAPE_FILL  ← LOW OPACITY fill for duotone/secondary path
                                            alias same source as fill but via alpha variant
                                            e.g. → theme colour at a20 alpha
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
color/icon/background         FRAME_FILL  (if user confirmed icon bg)
```

> DUOTONE RULE: The `duotone` token should alias the same colour as `fill` but through the alpha/a20 or a24 variant from Primitives. For example if `fill` → `theme/text/primary` which resolves to `primitives/color/grey/900`, then `duotone` → `primitives/color/grey/a24`. This matches the SVG `opacity="0.2"` pattern for the secondary path of a duotone icon.

### Divider tokens
```
color/divider/default   STROKE → theme/border/default
color/divider/subtle    STROKE → theme/border/subtle
```

### Container tokens
```
color/container/default    FRAME_FILL+SHAPE_FILL
color/container/raised     FRAME_FILL+SHAPE_FILL
color/container/sunken     FRAME_FILL+SHAPE_FILL
color/container/brand      FRAME_FILL+SHAPE_FILL
color/container/overlay    FRAME_FILL+SHAPE_FILL
```

### Button example (generate for all user-requested components)
```
color/button/primary/default/background   FRAME_FILL+SHAPE_FILL
color/button/primary/default/text         TEXT_FILL
color/button/primary/default/border       STROKE
                                          ↑ MUST alias a BORDER/STROKE colour token
                                          from Theme — NOT the same as background
color/button/primary/default/icon         SHAPE_FILL
color/button/primary/hover/background     FRAME_FILL+SHAPE_FILL
color/button/primary/hover/text           TEXT_FILL
color/button/primary/hover/border         STROKE
color/button/primary/pressed/background   FRAME_FILL+SHAPE_FILL
color/button/primary/focused/border       STROKE
color/button/primary/disabled/background  FRAME_FILL+SHAPE_FILL
color/button/primary/disabled/text        TEXT_FILL
color/button/primary/disabled/border      STROKE
(repeat for secondary, ghost, danger)
```

> BORDER ≠ BACKGROUND: Button border tokens MUST alias border/stroke colour tokens from Theme (e.g. `theme/border/default` or `theme/interactive/primary/default` when it's a coloured outline). Never alias the same background colour for both background and border tokens — this was a previous bug.

---

## Component Dimensions Collection
**Mode file:** `component-dimensions.tokens.json` (SINGLE MODE — no mobile/tablet/desktop)
**$metadata.modeName:** `"component-dimensions"`
**Padding + gap:** alias Density
**Radius + border width:** alias Responsive
**Scope:** GAP for padding+gap, CORNER_RADIUS for radius, STROKE_FLOAT for border width

No modes needed — breakpoint switching is handled by Responsive, density switching by Density.

### Padding tokens (GAP) — alias Density
Each direction must alias the full nested scale (xs through 4xl) from Density.
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
