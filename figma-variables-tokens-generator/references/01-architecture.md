# Architecture Reference

## Tier Definitions

### 1-Tier — Prototypes
```
Primitives + Typography
Optional: Responsive
```
- Primitives is the only color collection. Designers pick directly from Primitives.
- Typography aliases Primitives for strings, Responsive for numbers (if Responsive exists).

### 2-Tier — Small/Medium Apps
```
Primitives
  └── Semantic (modes: light/dark) ← aliases Primitives
        └── Typography (colors → Semantic, numbers → Responsive)
Optional: Responsive, Density, Effects, Layout
```
- **Semantic has light/dark modes.** It is the picker tip for colors.
- No Component Colors — designers pick directly from Semantic.
- This matches Material Design 3's architecture (Reference → System tokens).

### 3-Tier — Production Systems
```
Primitives
  └── Semantic (modes: light/dark) ← aliases Primitives
        └── Component Colors ← aliases Semantic (picker tip)
        └── Component Dimensions ← aliases Density + Responsive
        └── Typography (colors → Semantic, numbers → Responsive)
Optional: Responsive (recommended), Density, Effects, Layout
```
- **Semantic has light/dark modes.** Same as 2-Tier but with a Component layer.
- Component Colors is the picker tip — designers pick from here, not Semantic.
- Semantic is hidden from publishing in this tier.

### 4-Tier — Enterprise / Multi-Brand
```
Primitives
  └── Theme (modes: light/dark) ← aliases Primitives (palette switching)
        └── Semantic (NO modes) ← aliases Theme (intent mapping)
              └── Component Colors ← aliases Semantic (picker tip)
              └── Component Dimensions ← aliases Density + Responsive
              └── Typography (colors → Theme, numbers → Responsive)
Optional: Responsive (recommended), Density, Effects, Layout
```
- **Theme has light/dark modes.** Semantic does NOT have modes.
- Theme provides an extra indirection for swapping entire palettes (multi-brand).
- Both Theme and Semantic are hidden from publishing.

> **If a user asks for a "Theme collection" in 2/3-Tier:** Explain that in industry-standard practice, the mode-switching layer is called Semantic in simpler architectures. Ask: *"Do you specifically need a separate palette-switching layer (4-Tier), or do you want light/dark modes on your Semantic collection (2/3-Tier)?"* If they insist on Theme, upgrade them to 4-Tier.

---

## The Golden Rule of Scope Ownership
**Every token in every collection receives semantically correct scopes via `get_scope()`.** There are no exceptions — including Primitives. The plugin's `autoScope` checkbox handles stripping scopes from hidden collections during import.

## Scope Assignment by Chain Position

| Position | Rule |
|---|---|
| Primitives | Apply `get_scope()` — same rules as all other collections. For colors: `ALL_FILLS` fallback. |
| Semantic (2/3-Tier) | Apply semantically correct scope per token path |
| Theme (4-Tier only) | Apply semantically correct scope per token path |
| Responsive | Apply correct scope (FONT_SIZE, LINE_HEIGHT, LETTER_SPACING, CORNER_RADIUS, STROKE_FLOAT) |
| Density | GAP scope on all tokens |
| Layout | WIDTH_HEIGHT on all tokens |
| Effects | EFFECT_COLOR on colours, EFFECT_FLOAT on numbers |
| Component Colors | Apply correct scope — picker tip for colours |
| Component Dimensions | Apply correct scope — picker tip for dimensions |
| Typography | Apply correct scope — picker tip for font tokens |

---

## Complete Alias Chains

### Colour Chain — 2-Tier
```
primitives/color/blue/500          hardcoded #3B82F6, ALL_FILLS
        ↓
Semantic: surface/primary          FRAME_FILL+SHAPE_FILL, aliases Primitives
                                   (modes: light aliases blue/50, dark aliases blue/900)
                                   ← picker tip
```

### Colour Chain — 3-Tier
```
primitives/color/blue/500          hardcoded #3B82F6, ALL_FILLS
        ↓
Semantic: surface/primary          FRAME_FILL+SHAPE_FILL, aliases Primitives
                                   (modes: light aliases blue/50, dark aliases blue/900)
        ↓
Component Colors: color/button/primary/default/background
                                   FRAME_FILL+SHAPE_FILL
                                   Aliases Semantic ← picker tip
```

### Colour Chain — 4-Tier
```
primitives/color/blue/500          hardcoded #3B82F6, ALL_FILLS
        ↓
Theme: surface/primary             FRAME_FILL+SHAPE_FILL, aliases Primitives
                                   (modes: light aliases blue/50, dark aliases blue/900)
        ↓
Semantic: surface/primary          FRAME_FILL+SHAPE_FILL, aliases Theme
                                   (single mode — no light/dark)
        ↓
Component Colors: color/button/primary/default/background
                                   FRAME_FILL+SHAPE_FILL
                                   Aliases Semantic ← picker tip
```

### Typography Chain (Triple Alias Rule — all tiers)
```
1. Numerical (fontSize, lineHeight, letterSpacing):
   primitives/font/size/16 → Responsive: font/size/body → Typography: body/fontSize

2. Strings (fontFamily, fontWeight):
   primitives/font/family/sans → Typography: body/fontFamily (Direct to Primitives)

3. Colors:
   2/3-Tier: primitives/color/grey/900 → Semantic: text/primary → Typography: color/primary
   4-Tier:   primitives/color/grey/900 → Theme: text/primary → Typography: color/primary
```

### Spacing / Density Chain
```
primitives/spacing/16              hardcoded 16, GAP
        ↓
Density: padding/x/md              GAP — compact=8, comfortable=12, spacious=16 ← picker tip
                                   (Component Dimensions aliases Density for padding/gap)
```

### Radius / Border Chain
```
primitives/radius/md               hardcoded 8, CORNER_RADIUS
        ↓
Responsive: radius/md              CORNER_RADIUS — mobile=6, tablet=7, desktop=8 ← picker tip
                                   (Component Dimensions aliases Responsive for radius/border)

primitives/borderWidth/sm          hardcoded 1, STROKE_FLOAT
        ↓
Responsive: borderWidth/sm         STROKE_FLOAT — same across breakpoints ← picker tip
```

### Shadow / Effects Chain
```
primitives/shadow/sm/blur          hardcoded 8, EFFECT_FLOAT
        ↓
Effects: shadow/sm/blur            EFFECT_FLOAT, aliases Primitives ← picker tip

2/3-Tier: Semantic: shadow/sm/color  EFFECT_COLOR, aliases primitives/color/black/a16 (light mode)
4-Tier:   Theme: shadow/sm/color     EFFECT_COLOR, aliases primitives/color/black/a16 (light mode)
        ↓
Effects: shadow/sm/color           EFFECT_COLOR, aliases Semantic (2/3-Tier) or Theme (4-Tier)
         (no modes — mode-switching collection handles light/dark)
```

---

## Import Order — CRITICAL, must be exact

### 2-Tier Import Order
| # | Collection | Depends on |
|---|---|---|
| 1 | Primitives | nothing |
| 2 | Semantic | Primitives |
| 3 | Responsive* | Primitives |
| 4 | Density* | Primitives |
| 5 | Layout* | nothing |
| 6 | Effects* | Primitives + Semantic |
| 7 | Typography | Primitives + Semantic + Responsive |

### 3-Tier Import Order
| # | Collection | Depends on |
|---|---|---|
| 1 | Primitives | nothing |
| 2 | Semantic | Primitives |
| 3 | Responsive* | Primitives |
| 4 | Density* | Primitives |
| 5 | Layout* | nothing |
| 6 | Effects* | Primitives + Semantic |
| 7 | Typography | Primitives + Semantic + Responsive |
| 8 | Component Colors | Semantic |
| 9 | Component Dimensions | Density + Responsive |

### 4-Tier Import Order
| # | Collection | Depends on |
|---|---|---|
| 1 | Primitives | nothing |
| 2 | Theme | Primitives |
| 3 | Semantic | Theme |
| 4 | Responsive* | Primitives |
| 5 | Density* | Primitives |
| 6 | Layout* | nothing |
| 7 | Effects* | Primitives + Theme |
| 8 | Typography | Primitives + Theme + Responsive |
| 9 | Component Colors | Semantic |
| 10 | Component Dimensions | Density + Responsive |

*If generated.

> **Dynamic numbering rule:** The ZIP folder numbering must match the import order for the user's chosen tier. A 2-Tier ZIP starts with `1. Primitives/`, `2. Semantic/`. A 4-Tier ZIP has `1. Primitives/`, `2. Theme/`, `3. Semantic/`.

---

## Mode File Naming — No Generic "Value" Names

Every collection mode file must have a unique, descriptive name.

| Collection | Mode file name(s) |
|---|---|
| Primitives | `primitives.tokens.json` |
| Semantic (2/3-Tier) | `light.tokens.json`, `dark.tokens.json` |
| Semantic (4-Tier) | `semantic.tokens.json` |
| Theme (4-Tier only) | `light.tokens.json`, `dark.tokens.json` |
| Responsive | `mobile.tokens.json`, `tablet.tokens.json`, `desktop.tokens.json` |
| Density | `compact.tokens.json`, `comfortable.tokens.json`, `spacious.tokens.json` |
| Layout | `xs.tokens.json`, `sm.tokens.json`, `md.tokens.json`, `lg.tokens.json`, `xl.tokens.json`, `xxl.tokens.json` |
| Effects | `effects.tokens.json` |
| Typography | `typography.tokens.json` |
| Component Colors | `component-colors.tokens.json` |
| Component Dimensions | `component-dimensions.tokens.json` |

The `$metadata.modeName` field inside each file must match the file name (without `.tokens.json`).

---

## Hidden from Publishing

`hiddenFromPublishing: true` is set on ALL tokens in parent-only (non-tip) collections. The plugin's `autoScope` checkbox strips scopes from hidden tokens on import.

| Collection | 1-Tier | 2-Tier | 3-Tier | 4-Tier |
|---|---|---|---|---|
| Primitives | Visible | **Hidden** | **Hidden** | **Hidden** |
| Semantic | N/A | Visible (tip) | **Hidden** | **Hidden** |
| Theme | N/A | N/A | N/A | **Hidden** |
| Responsive | N/A | **Hidden** | **Hidden** | **Hidden** |
| Density | N/A | **Hidden** | **Hidden** | **Hidden** |
| Component Colors | N/A | N/A | Visible (tip) | Visible (tip) |
| Component Dimensions | N/A | N/A | Visible (tip) | Visible (tip) |
| Typography | Visible | Visible | Visible | Visible |
| Effects | N/A | Visible | Visible | Visible |
| Layout | N/A | Visible | Visible | Visible |

---

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

- Primitives and all collections show `ALL_SCOPES` in Figma's variable panel if the plugin's `autoScope` checkbox is unchecked. When checked, the plugin clears scopes on all `hiddenFromPublishing` tokens.
- Effects with no modes: Figma accepts single-mode collections. The mode name (`effects`) is just a label.
- Component Dimensions with no modes: same as above — single-mode collection is valid.
