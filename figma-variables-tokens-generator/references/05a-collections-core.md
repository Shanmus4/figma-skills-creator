# Collection Specs Reference

## Table of Contents
1. [Primitives](#primitives) — colour palette, spacing, shadow geometry, font primitives
2. [Semantic Collection (2/3-Tier)](#semantic-collection-23-tier) — modes: light/dark, aliases Primitives
3. [Theme Collection (4-Tier only)](#theme-collection-4-tier-only) — modes: light/dark, aliases Primitives
4. [Responsive Collection](#responsive-collection) — font size/lineHeight/letterSpacing × 3 breakpoints
5. [Density Collection](#density-collection) — padding/gap × compact/comfortable/spacious
6. [Layout Collection](#layout-collection) — grid columns/margins/gutters × xs→xxl
7. [Effects Collection](#effects-collection) — shadows and blur tokens
8. [Typography Collection](#typography-collection) — font roles × 5 properties

---

## Primitives
**Mode file:** `primitives.tokens.json`
**$metadata.modeName:** `"primitives"`
**Publishing:** `hiddenFromPublishing: true` on all tokens (except 1-Tier where Primitives is the only collection)
See `04-primitives.md` for full token list.

Key rules:
- All values hardcoded — NO aliasData.
- ALL tokens receive correct scopes via `get_scope()`. For primitive colors: `ALL_FILLS`. For spacing: `GAP`. For radius: `CORNER_RADIUS`. Etc.

---

## Semantic Collection (2/3-Tier)
**Mode files:** `light.tokens.json`, `dark.tokens.json`
**$metadata.modeName:** `"light"`, `"dark"`
**Default mode:** light
**Aliases:** Primitives
**Publishing:** Visible (tip) in 2-Tier; `hiddenFromPublishing: true` in 3-Tier

> [!IMPORTANT]
> **In 2-Tier and 3-Tier, Semantic IS the mode-switching collection.** It replaces what was previously called "Theme." It has light/dark modes and aliases Primitives directly.

Semantic is a mode-switching collection — every token gets a semantically correct scope. This is so variables are correctly categorised in Figma.

**Shadow colour tokens live here:**
```
semantic/shadow/sm/color    EFFECT_COLOR → primitives/color/black/a16 (light) / primitives/color/white/a8 (dark)
semantic/shadow/md/color    EFFECT_COLOR → primitives/color/black/a24 (light) / primitives/color/white/a16 (dark)
semantic/shadow/lg/color    EFFECT_COLOR → primitives/color/black/a32 (light) / primitives/color/white/a24 (dark)
semantic/shadow/xl/color    EFFECT_COLOR → primitives/color/black/a40 (light) / primitives/color/white/a32 (dark)
```

> The full list of Semantic token groups (surface, text, border, interactive, feedback, overlay, icon, shadow) is in `05b-collections-semantic-components.md`. That reference applies to BOTH 2/3-Tier Semantic (with modes) and 4-Tier Semantic (without modes) — the token paths are the same, only the alias target and mode setup differ.

---

## Theme Collection (4-Tier only)
**Mode files:** `light.tokens.json`, `dark.tokens.json`
**$metadata.modeName:** `"light"`, `"dark"`
**Default mode:** light
**Aliases:** Primitives
**Publishing:** `hiddenFromPublishing: true` — Theme is a parent, never consumed directly

> [!IMPORTANT]
> **Theme ONLY exists in 4-Tier architecture.** In 2-Tier and 3-Tier, its role is performed by the Semantic collection (with modes). Do NOT generate a Theme collection for 2-Tier or 3-Tier.

Theme is a palette-switching layer. It provides an extra level of indirection for multi-brand or complex enterprise systems. Every token gets a semantically correct scope.

### Theme Token Groups — Derived from Semantic

**Theme uses the SAME token groups and paths as Semantic.** Read `05b-collections-semantic-components.md` for the complete group definitions (surface, text, border, interactive, feedback, icon, overlay, shadow).

The ONLY differences between Theme and Semantic:
- **Theme aliases Primitives** directly (light/dark mappings per the 05b light/dark patterns)
- **Semantic (4-Tier) aliases Theme** — NOT Primitives
- **Theme has light/dark modes**; Semantic (4-Tier) has NO modes (single `semantic.tokens.json`)

When generating Theme: take every group from 05b, keep the same paths, change alias targets from `semantic/*` to `primitives/*` with appropriate light/dark shade mappings.

> [!IMPORTANT]
> **You are NOT limited to the 94 paths listed in 05b.** If the user's needs (component list, density, custom collections) require additional Semantic/Theme paths, ADD them. The 05b paths are the production floor, not the ceiling. Always expand when the alias chain demands it.

### shadow colors → EFFECT_COLOR (syntax reference)
```
theme/shadow/sm/color    EFFECT_COLOR → primitives/color/black/a16 (light) / primitives/color/white/a8 (dark)
theme/shadow/md/color    EFFECT_COLOR → primitives/color/black/a24 (light) / primitives/color/white/a16 (dark)
theme/shadow/lg/color    EFFECT_COLOR → primitives/color/black/a32 (light) / primitives/color/white/a24 (dark)
theme/shadow/xl/color    EFFECT_COLOR → primitives/color/black/a40 (light) / primitives/color/white/a32 (dark)
```

---

## Responsive Collection
**Mode files:** `mobile.tokens.json`, `tablet.tokens.json`, `desktop.tokens.json`
**$metadata.modeName:** `"mobile"`, `"tablet"`, `"desktop"`
**Default mode:** mobile
**Aliases:** Primitives
**Scopes:** FONT_SIZE, LINE_HEIGHT, LETTER_SPACING, CORNER_RADIUS, STROKE_FLOAT
**Publishing:** `hiddenFromPublishing: true` on all tokens — Responsive is a structural parent, never consumed directly

This collection provides breakpoint-aware values for all numerical tokens used by Typography and Component Dimensions. It aliases Primitives but maps values design-appropriately per breakpoint — NOT a blind 1:1 forward.

> [!IMPORTANT]
> **COVERAGE AUDIT:** Before generating the Responsive JSON, you MUST run `validate_responsive_coverage()` to ensure every value you intend to use (e.g. `lineheight: 52`) already exists as a path in your Primitives registry. If it doesn't, you must backfill it in Primitives BEFORE saving the Primitives mode file.

### font/size/* → FONT_SIZE
```
responsive/font/size/display       mobile→40  tablet→48  desktop→60
responsive/font/size/heading       mobile→28  tablet→32  desktop→36
responsive/font/size/subheading    mobile→18  tablet→20  desktop→20
responsive/font/size/body-lg       mobile→16  tablet→17  desktop→18
responsive/font/size/body          mobile→14  tablet→15  desktop→16
responsive/font/size/body-sm       mobile→12  tablet→13  desktop→14
responsive/font/size/label-lg      mobile→14  tablet→15  desktop→16
responsive/font/size/label         mobile→13  tablet→13  desktop→14
responsive/font/size/label-sm      mobile→11  tablet→11  desktop→12
responsive/font/size/caption       mobile→11  tablet→11  desktop→12
responsive/font/size/overline      mobile→10  tablet→10  desktop→11
responsive/font/size/code          mobile→12  tablet→13  desktop→14
```
(If user chose Extended scale, add: display-sm, heading-sm, heading-lg, body-strong, numeric)

### font/lineHeight/* → LINE_HEIGHT
```
responsive/font/lineHeight/display      mobile→44  tablet→56  desktop→72
responsive/font/lineHeight/heading      mobile→36  tablet→40  desktop→44
responsive/font/lineHeight/subheading   mobile→26  tablet→28  desktop→28
responsive/font/lineHeight/body-lg      mobile→24  tablet→26  desktop→28
responsive/font/lineHeight/body         mobile→20  tablet→22  desktop→24
responsive/font/lineHeight/body-sm      mobile→18  tablet→18  desktop→20
responsive/font/lineHeight/label        mobile→18  tablet→18  desktop→20
responsive/font/lineHeight/caption      mobile→16  tablet→16  desktop→16
responsive/font/lineHeight/overline     mobile→14  tablet→14  desktop→16
responsive/font/lineHeight/code         mobile→18  tablet→18  desktop→20
```

### font/letterSpacing/* → LETTER_SPACING
```
responsive/font/letterSpacing/display     mobile→-1  tablet→-2  desktop→-2
responsive/font/letterSpacing/heading     mobile→0   tablet→-1  desktop→-1
responsive/font/letterSpacing/body        mobile→0   tablet→0   desktop→0
responsive/font/letterSpacing/caption     mobile→1   tablet→1   desktop→1
responsive/font/letterSpacing/overline    mobile→2   tablet→2   desktop→2

**RULE: Extended Roles letterSpacing**
If user chooses Extended Scale, you MUST generate unique Responsive paths for every role to prevent ID collapsing:
- `display-sm` → -2
- `heading-lg` → -1
- `heading-sm` → 0
- `body-strong` → 0
- `label-lg` → 0
- `label` → 0
- `label-sm` → 1
- `numeric` → 0
- `caption` → 1
- `overline` → 2
```

### radius/* → CORNER_RADIUS
```
responsive/radius/none    mobile→0     tablet→0     desktop→0
responsive/radius/xs      mobile→2     tablet→2     desktop→2
responsive/radius/sm      mobile→3     tablet→4     desktop→4
responsive/radius/md      mobile→6     tablet→7     desktop→8
responsive/radius/lg      mobile→10    tablet→11    desktop→12
responsive/radius/xl      mobile→14    tablet→15    desktop→16
responsive/radius/2xl     mobile→20    tablet→22    desktop→24
responsive/radius/full    mobile→9999  tablet→9999  desktop→9999
```

### borderWidth/* → STROKE_FLOAT
```
responsive/borderWidth/hairline   0.3  (all modes)
responsive/borderWidth/thin       0.5  (all modes)
responsive/borderWidth/soft       0.8  (all modes)
responsive/borderWidth/sm         1    (all modes)
responsive/borderWidth/md         2    (all modes)
responsive/borderWidth/lg         4    (all modes)
```

---

## Density Collection
**Mode files:** `compact.tokens.json`, `comfortable.tokens.json`, `spacious.tokens.json`
**$metadata.modeName:** `"compact"`, `"comfortable"`, `"spacious"`
**Default mode:** comfortable
**Aliases:** Primitives/spacing/*
**Scope:** GAP on ALL tokens
**Publishing:** `hiddenFromPublishing: true` on all tokens

```
density/padding/x/xs       GAP   compact=2,   comfortable=4,   spacious=6
density/padding/x/sm       GAP   compact=4,   comfortable=6,   spacious=8
density/padding/x/md       GAP   compact=8,   comfortable=12,  spacious=16
density/padding/y/xs       GAP   compact=2,   comfortable=4,   spacious=6
density/padding/y/sm       GAP   compact=4,   comfortable=6,   spacious=8
density/padding/y/md       GAP   compact=8,   comfortable=12,  spacious=16
... (apply the same xs→4xl nested scale across top, bottom, left, right)
density/gap/xs          GAP   compact=2,   comfortable=4,   spacious=6
density/gap/sm          GAP   compact=4,   comfortable=8,   spacious=12
density/gap/md          GAP   compact=8,   comfortable=12,  spacious=16
density/gap/lg          GAP   compact=12,  comfortable=16,  spacious=24
density/gap/xl          GAP   compact=16,  comfortable=24,  spacious=32
density/gap/2xl         GAP   compact=24,  comfortable=40,  spacious=64
density/gap/3xl         GAP   compact=40,  comfortable=64,  spacious=96
density/gap/4xl         GAP   compact=64,  comfortable=96,  spacious=128
```

---

## Layout Collection
**Mode files:** `xs.tokens.json`, `sm.tokens.json`, `md.tokens.json`, `lg.tokens.json`, `xl.tokens.json`, `xxl.tokens.json`
**$metadata.modeName:** `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"xxl"`
**Aliases:** Primitives `layout/*`
**Scope:** WIDTH_HEIGHT on ALL tokens

```
layout/column/count     → Primitives: layout/{breakpoint}/columns
layout/column/margin    → Primitives: layout/{breakpoint}/margin
layout/column/gutter    → Primitives: layout/{breakpoint}/gutter
layout/column/minWidth  → Primitives: layout/{breakpoint}/minWidth
layout/column/maxWidth  → Primitives: layout/{breakpoint}/maxWidth
```

---

## Effects Collection
**Mode file:** `effects.tokens.json` (SINGLE MODE — no light/dark)
**$metadata.modeName:** `"effects"`
**Shadow colours:** alias Semantic (2/3-Tier) or Theme (4-Tier) — the mode-switching collection
**Shadow geometry:** alias Primitives
**Scope:** EFFECT_COLOR on colours, EFFECT_FLOAT on numbers

Shadow colour tokens point at the mode-switching collection. When designer switches modes (light↔dark), shadow colours automatically update in Effects. No modes needed on Effects itself.

```
effects/shadow/sm/color    EFFECT_COLOR → semantic/shadow/sm/color (2/3-Tier) or theme/shadow/sm/color (4-Tier)
effects/shadow/sm/x        EFFECT_FLOAT → primitives/shadow/sm/x
effects/shadow/sm/y        EFFECT_FLOAT → primitives/shadow/sm/y
effects/shadow/sm/blur     EFFECT_FLOAT → primitives/shadow/sm/blur
effects/shadow/sm/spread   EFFECT_FLOAT → primitives/shadow/sm/spread

effects/shadow/md/color    EFFECT_COLOR → semantic/shadow/md/color or theme/shadow/md/color
effects/shadow/md/x        EFFECT_FLOAT → primitives/shadow/md/x
effects/shadow/md/y        EFFECT_FLOAT → primitives/shadow/md/y
effects/shadow/md/blur     EFFECT_FLOAT → primitives/shadow/md/blur
effects/shadow/md/spread   EFFECT_FLOAT → primitives/shadow/md/spread

effects/shadow/lg/color    EFFECT_COLOR → semantic/shadow/lg/color or theme/shadow/lg/color
effects/shadow/lg/x        EFFECT_FLOAT → primitives/shadow/lg/x
effects/shadow/lg/y        EFFECT_FLOAT → primitives/shadow/lg/y
effects/shadow/lg/blur     EFFECT_FLOAT → primitives/shadow/lg/blur
effects/shadow/lg/spread   EFFECT_FLOAT → primitives/shadow/lg/spread

effects/shadow/xl/color    EFFECT_COLOR → semantic/shadow/xl/color or theme/shadow/xl/color
effects/shadow/xl/x        EFFECT_FLOAT → primitives/shadow/xl/x
effects/shadow/xl/y        EFFECT_FLOAT → primitives/shadow/xl/y
effects/shadow/xl/blur     EFFECT_FLOAT → primitives/shadow/xl/blur
effects/shadow/xl/spread   EFFECT_FLOAT → primitives/shadow/xl/spread

effects/blur/sm    EFFECT_FLOAT → primitives/blur/sm
effects/blur/md    EFFECT_FLOAT → primitives/blur/md
effects/blur/lg    EFFECT_FLOAT → primitives/blur/lg
effects/blur/xl    EFFECT_FLOAT → primitives/blur/xl
```

---

## Typography Collection
**Mode file:** `typography.tokens.json` (SINGLE MODE)
**$metadata.modeName:** `"typography"`
**Aliases:** Responsive (numerical values) + Primitives (font/family, font/weight) + mode-switching collection (colour tokens)

Typography colour tokens alias the **mode-switching collection**: Semantic in 2/3-Tier, Theme in 4-Tier.

> [!IMPORTANT]
> **BACKFILLING CHECK:** Before aliasing any `fontSize`, `lineHeight`, or `letterSpacing` value from `Responsive`, verify that the raw numerical value exists in your **Primitives** collection. If missing, add it to Primitives first.

### Tokens per role — numerical values alias Responsive
```
typography/{role}/fontSize       FONT_SIZE      → Responsive: font/size/{role}
typography/{role}/lineHeight     LINE_HEIGHT    → Responsive: font/lineHeight/{role}
typography/{role}/letterSpacing  LETTER_SPACING → Responsive: font/letterSpacing/{role}
typography/{role}/fontFamily     FONT_FAMILY    → Primitives: font/family/{name}
typography/{role}/fontWeight     FONT_STYLE     → Primitives: font/weight/{name}

> **RULE: LetterSpacing Path Mapping**
> Primitives uses semantic names (e.g. `font/letterspacing/tight`).
> Responsive uses role names (e.g. `responsive/font/letterspacing/display`).
> Typography MUST alias Responsive for numerical compatibility across breakpoints.
```

### Font colour tokens → alias mode-switching collection
```
typography/color/primary    TEXT_FILL → semantic/text/primary (2/3) or theme/text/primary (4)
typography/color/secondary  TEXT_FILL → semantic/text/secondary or theme/text/secondary
typography/color/tertiary   TEXT_FILL → semantic/text/tertiary or theme/text/tertiary
typography/color/disabled   TEXT_FILL → semantic/text/disabled or theme/text/disabled
typography/color/inverse    TEXT_FILL → semantic/text/inverse or theme/text/inverse
typography/color/link       TEXT_FILL → semantic/text/link or theme/text/link
typography/color/error      TEXT_FILL → semantic/feedback/error/text or theme/feedback/error/text
typography/color/success    TEXT_FILL → semantic/feedback/success/text or theme/feedback/success/text
typography/color/warning    TEXT_FILL → semantic/feedback/warning/text or theme/feedback/warning/text
typography/color/on-brand   TEXT_FILL → semantic/text/on-brand or theme/text/on-brand
```

### Standard type roles
| Role | fontWeight | Notes |
|---|---|---|
| display | Bold | Largest, hero text |
| heading | SemiBold | Page titles |
| subheading | SemiBold | Section headers |
| body-lg | Regular | Large body text |
| body | Regular | Default body |
| body-sm | Regular | Small body |
| label-lg | Medium | Large UI labels |
| label | Medium | Standard UI labels |
| label-sm | Medium | Small labels |
| caption | Regular | Captions, footnotes |
| overline | Medium | Eyebrow/overline text |
| code | Regular | Monospace |

---

> Continued in `05b-collections-semantic-components.md` — Semantic token groups, Component Colors, Component Dimensions
