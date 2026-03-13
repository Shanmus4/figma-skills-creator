# Architecture Reference

## The Golden Rule of Scope Ownership
**Scope lives at the TIP of an alias chain.** Middle-chain tokens (Theme, Semantic, Responsive, Density) ALSO get semantically correct scopes — not for picker control, but so the variable is correctly categorised in Figma. The tip scope still wins for the picker.

## Scope Assignment by Chain Position

| Position | Rule |
|---|---|
| Primitives | NO scope key — absent entirely |
| Theme | Apply semantically correct scope per token path |
| Responsive | Apply correct scope (FONT_SIZE, LINE_HEIGHT, LETTER_SPACING, CORNER_RADIUS, STROKE_FLOAT) |
| Semantic | Apply semantically correct scope per token path |
| Density | GAP scope on all tokens |
| Effects | EFFECT_COLOR on colours, EFFECT_FLOAT on numbers |
| Component Colors | Apply correct scope — picker tip for colours |
| Component Dimensions | Apply correct scope — picker tip for dimensions |
| Typography | Apply correct scope — picker tip for font tokens |
| Layout | WIDTH_HEIGHT on all tokens |

## Complete Alias Chains

```
── COLOUR CHAIN ──────────────────────────────────────────
primitives/color/blue/500          hardcoded #3B82F6, NO scope
        ↓
Theme: surface/primary             FRAME_FILL+SHAPE_FILL, aliases Primitives
        ↓ (4-layer only)
Semantic: surface/primary          FRAME_FILL+SHAPE_FILL, aliases Theme
        ↓
Component Colors: color/button/primary/default/background
                                   FRAME_FILL+SHAPE_FILL ← picker tip

── TYPOGRAPHY CHAIN ──────────────────────────────────────
primitives/font/size/16            hardcoded 16, NO scope
        ↓
Responsive: font/size/body         FONT_SIZE — mobile=14, tablet=15, desktop=16 ← picker tip
                                   (Typography aliases this)

primitives/font/family/sans        hardcoded "Inter", NO scope
        ↓
Typography: body/fontFamily        FONT_FAMILY, aliases Primitives directly ← picker tip
            (font/family and font/weight always alias Primitives — NOT Responsive)

Theme: text/primary                TEXT_FILL, aliases Primitives
        ↓
Typography: color/primary          TEXT_FILL, aliases Theme ← picker tip

── SPACING / DENSITY CHAIN ───────────────────────────────
primitives/spacing/16              hardcoded 16, NO scope
        ↓
Density: padding/x/md              GAP — compact=8, comfortable=12, spacious=16 ← picker tip
                                   (Component Dimensions aliases Density for padding/gap)

── RADIUS / BORDER CHAIN ───────────────────────────
primitives/radius/md               hardcoded 8, NO scope
        ↓
Responsive: radius/md              CORNER_RADIUS — mobile=6, tablet=7, desktop=8 ← picker tip
                                   (Component Dimensions aliases Responsive for radius/border)

primitives/borderWidth/sm          hardcoded 1, NO scope
        ↓
Responsive: borderWidth/sm         STROKE_FLOAT — same across breakpoints (or slightly varied) ← picker tip

── SHADOW / EFFECTS CHAIN ────────────────────────────────
primitives/shadow/sm/blur          hardcoded 8, NO scope
        ↓
Effects: shadow/sm/blur            EFFECT_FLOAT, aliases Primitives ← picker tip

Theme: shadow/sm/color             EFFECT_COLOR, aliases primitives/color/black/a16 (light)
                                              or primitives/color/white/a8 (dark)
        ↓
Effects: shadow/sm/color           EFFECT_COLOR, aliases Theme/shadow/sm/color ← picker tip
         (no modes — Theme handles light/dark switching)
```

## Responsive Collection

**Purpose:** Single source for all breakpoint-aware NUMBER tokens. Replaces per-shade radius hardcoding and connects Typography numerical values to breakpoints.

**Modes:** `mobile` / `tablet` / `desktop`
**Aliases:** Primitives
**Contains:**
- `font/size/*` — responsive font sizes (e.g. body: 14→15→16)
- `font/lineHeight/*` — responsive line heights
- `font/letterSpacing/*` — responsive letter spacing
- `radius/none` through `radius/full` — same names as Primitives but breakpoint-appropriate values
- `borderWidth/hairline` through `borderWidth/lg` — forwarded from Primitives (usually same across breakpoints)

**Design-appropriate radius values (NOT a blind forward from Primitives):**
| Token | Mobile | Tablet | Desktop |
|---|---|---|---|
| `radius/none` | 0 | 0 | 0 |
| `radius/xs` | 2 | 2 | 2 |
| `radius/sm` | 3 | 4 | 4 |
| `radius/md` | 6 | 7 | 8 |
| `radius/lg` | 10 | 11 | 12 |
| `radius/xl` | 14 | 15 | 16 |
| `radius/2xl` | 20 | 22 | 24 |
| `radius/full` | 9999 | 9999 | 9999 |

**Design-appropriate font sizes (example — body):**
| Token | Mobile | Tablet | Desktop |
|---|---|---|---|
| `font/size/body` | 14 | 15 | 16 |
| `font/size/body-sm` | 12 | 13 | 14 |
| `font/size/body-lg` | 16 | 17 | 18 |
| `font/size/heading` | 28 | 32 | 36 |
| `font/size/display` | 40 | 48 | 60 |

> ⚠️ Responsive aliases Primitives — it picks the semantically correct Primitives value per breakpoint. E.g. `radius/lg` on mobile aliases `primitives/radius/lg` (12px) is fine, but on mobile you may alias `primitives/radius/md` (8px) instead. The KEY RULE: the mapping must be visually sensible, not a blind 1:1 forward.

## Effects Collection (Updated)

**Modes:** NONE — single `effects.tokens.json` file
**Shadow colours:** alias `Theme` (Theme handles light/dark switching via its own modes)
**Shadow geometry:** alias `Primitives` directly

Effects has NO modes of its own. When the designer switches the Theme mode (light↔dark), the shadow colours in Effects automatically update because Effects → Theme → Primitives.

## Component Dimensions (Updated)

**Modes:** NONE — single `component-dimensions.tokens.json` file
**Padding + gap:** alias `Density` (Density handles compact/comfortable/spacious switching)
**Radius + border width:** alias `Responsive` (Responsive handles mobile/tablet/desktop switching)

Component Dimensions has NO modes. Breakpoint and density switching is controlled by swapping modes on Responsive and Density collections respectively.

## Import Order — CRITICAL, must be exact

| # | Collection | Depends on | Notes |
|---|---|---|---|
| 1 | Primitives | nothing | Always first |
| 2 | Theme | Primitives | Colour chains start here |
| 3 | Semantic | Theme | 4-layer only. Aliases Theme only — import immediately after Theme |
| 4 | Responsive | Primitives | Must exist before Typography + Component Dimensions |
| 5 | Density | Primitives | Must exist before Component Dimensions |
| 6 | Layout | nothing | Independent |
| 7 | Effects | Primitives + Theme | Colours alias Theme, geometry aliases Primitives |
| 8 | Typography | Primitives + Theme + Responsive | Font numbers from Responsive, colours from Theme |
| 9 | Component Colors | Semantic (4-layer) or Theme (2/3-layer) | Colour tip |
| 10 | Component Dimensions | Density + Responsive | Dimension tip |

> Semantic is now position 3 — it only aliases Theme, so it belongs immediately after Theme.
> Effects is position 7 (after Theme) because shadow colour tokens alias Theme.
> Responsive is position 4 because Typography and Component Dimensions both depend on it.

## Mode File Naming — No Generic "Value" Names

Every collection mode file must have a unique, descriptive name. No two collections should share the same mode name.

| Collection | Mode file name(s) |
|---|---|
| Primitives | `primitives.tokens.json` |
| Theme | `light.tokens.json`, `dark.tokens.json` |
| Responsive | `mobile.tokens.json`, `tablet.tokens.json`, `desktop.tokens.json` |
| Density | `compact.tokens.json`, `comfortable.tokens.json`, `spacious.tokens.json` |
| Layout | `xs.tokens.json`, `sm.tokens.json`, `md.tokens.json`, `lg.tokens.json`, `xl.tokens.json`, `xxl.tokens.json` |
| Effects | `effects.tokens.json` |
| Typography | `typography.tokens.json` |
| Semantic | `semantic.tokens.json` |
| Component Colors | `component-colors.tokens.json` |
| Component Dimensions | `component-dimensions.tokens.json` |

The `$metadata.modeName` field inside each file must match the file name (without `.tokens.json`):
- `"modeName": "primitives"` not `"modeName": "Value"`
- `"modeName": "typography"` not `"modeName": "Value"`
- `"modeName": "semantic"` not `"modeName": "Value"`

## Scoping Instructions for User (End of Generation)

Tell the user which collections to **turn off scoping** on (hide from variable pickers) based on their layer choice and whether optional collections act purely as alias parents. 

**CRITICAL FIGMA BUG:** "No scope" variables in JSON default to "all scopes" upon import. Users must manually turn off scoping (select all variables → remove all scopes) for intermediate parent collections.

The general rule: **only TIP collections should appear in pickers.** Hide intermediate collections.

| Layer | Hide from picker | Keep visible (tips) |
|---|---|---|
| 1-layer | Nothing | Primitives |
| 2-layer | Primitives, Responsive*, Density* | Theme, Typography, Layout, Effects, Component Dimensions* |
| 3-layer | Primitives, Theme (suggested), Responsive*, Density* | Component Colors, Component Dimensions, Typography, Layout, Effects |
| 4-layer | Primitives, Theme (suggested), Semantic (suggested), Responsive*, Density* | Component Colors, Component Dimensions, Typography, Layout, Effects |

*\*If generated.*

**Key notes:**
- 1-layer: Primitives is the only collection. Never turn it off here.
- 2-layer: Theme IS the colour tip (no Component Colors). Only hide Primitives (and structural parents).
- 3/4-layer: Hiding Theme and Semantic are suggestions only — tell user to verify and keep scoping ON if they apply those tokens directly to layers instead of going through Component Colors.
- "Hide from publishing" (library sharing) is different from picker visibility (scope control per variable). Both should be set correctly — the JSON already handles Primitives `hiddenFromPublishing: true` naturally.

## Collection Names — No Brand Prefix Ever

| Collection | Figma name (exact) |
|---|---|
| Primitives | `Primitives` |
| Theme | `Theme` |
| Responsive | `Responsive` |
| Density | `Density` |
| Layout | `Layout` |
| Effects | `Effects` |
| Typography | `Typography` |
| Semantic | `Semantic` |
| Component Colors | `Component Colors` |
| Component Dimensions | `Component Dimensions` |

## Figma Known Behaviour

- Primitives show `ALL_SCOPES` in Figma's variable panel even with no scope key in JSON. This is Figma's default display — cannot be overridden from JSON. Not a bug.
- Effects with no modes: Figma accepts single-mode collections. The mode name (`effects`) is just a label.
- Component Dimensions with no modes: same as above — single-mode collection is valid.
