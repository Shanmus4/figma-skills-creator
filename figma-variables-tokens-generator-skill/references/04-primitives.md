# Primitives Reference

## Rules (non-negotiable)
1. Hardcoded values ONLY — no aliases, no scope key (absent entirely, not empty array)
2. `hiddenFromPublishing: true` on every token
3. `codeSyntax.WEB` on every token
4. Color values are objects (colorSpace/components/alpha/hex) — never hex strings
5. Zero aliasData on any token
6. Mode file name: `primitives.tokens.json` — NOT `Value.tokens.json`
7. `$metadata.modeName` must be `"primitives"` (not `"Value"`)

---

## CRITICAL: Opacity Pattern

Alpha variants sit as **flat siblings** alongside solid shades inside the same colour family folder. This avoids the mixed token+group Figma bug.

**Solid shades:** numeric keys `50`, `100`…`900`
**Alpha variants:** `a`-prefixed siblings at same level: `a8`, `a16`, `a24`, `a32`, `a40`, `a48`, `a56`, `a64`
**Base shade for alpha:** `500` for brand colours, `700` for grey, `600` for semantic colours (red/green/yellow/blue)
**White and black:** alpha-only families — `a8` through `a64` plus `a100` (the opaque solid)

```json
"azure": {
  "50":  { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0.961,0.973,1.0], "alpha": 1, "hex": "#F5F8FF" }, "$extensions": { "com.figma.variableId": "VariableID:10:1001", "com.figma.hiddenFromPublishing": true, "com.figma.codeSyntax": { "WEB": "--primitives-color-azure-50" } } },
  "500": { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0.188,0.369,1.0], "alpha": 1, "hex": "#305EFF" }, "$extensions": { "com.figma.variableId": "VariableID:10:1005", "com.figma.hiddenFromPublishing": true, "com.figma.codeSyntax": { "WEB": "--primitives-color-azure-500" } } },
  "900": { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0.078,0.157,0.427], "alpha": 1, "hex": "#14286D" }, "$extensions": { "com.figma.variableId": "VariableID:10:1009", "com.figma.hiddenFromPublishing": true, "com.figma.codeSyntax": { "WEB": "--primitives-color-azure-900" } } },
  "a8":  { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0.188,0.369,1.0], "alpha": 0.08, "hex": "#305EFF" }, "$extensions": { ... } },
  "a16": { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0.188,0.369,1.0], "alpha": 0.16, "hex": "#305EFF" }, "$extensions": { ... } },
  "a24": { ... alpha: 0.24 ... },
  "a32": { ... alpha: 0.32 ... },
  "a40": { ... alpha: 0.40 ... },
  "a48": { ... alpha: 0.48 ... },
  "a56": { ... alpha: 0.56 ... },
  "a64": { ... alpha: 0.64 ... }
}
```

White and black (alpha-only):
```json
"white": {
  "a8":   { "$type": "color", "$value": { "colorSpace": "srgb", "components": [1,1,1], "alpha": 0.08, "hex": "#FFFFFF" }, ... },
  "a16":  { ... alpha: 0.16 ... },
  "a24":  { ... alpha: 0.24 ... },
  "a32":  { ... alpha: 0.32 ... },
  "a40":  { ... alpha: 0.40 ... },
  "a48":  { ... alpha: 0.48 ... },
  "a56":  { ... alpha: 0.56 ... },
  "a64":  { ... alpha: 0.64 ... },
  "a100": { "$type": "color", "$value": { "colorSpace": "srgb", "components": [1,1,1], "alpha": 1, "hex": "#FFFFFF" }, ... }
},
"black": {
  "a8":   { ... alpha: 0.08 ... },
  "a16":  { ... },
  "a24":  { ... },
  "a32":  { ... },
  "a40":  { ... },
  "a48":  { ... },
  "a56":  { ... },
  "a64":  { ... },
  "a100": { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0,0,0], "alpha": 1, "hex": "#000000" }, ... }
}
```

---

## CRITICAL: Font Variables — All Under `font/` Group

All font tokens MUST nest under `font/`. NOT as separate top-level groups.

```json
"font": {
  "family": {
    "sans":  { "$type": "string", "$value": "Inter", "$extensions": { "com.figma.type": "string", "com.figma.variableId": "VariableID:10:500", "com.figma.hiddenFromPublishing": true, "com.figma.codeSyntax": { "WEB": "--primitives-font-family-sans" } } },
    "serif": { "$type": "string", "$value": "Playfair Display", ... },
    "mono":  { "$type": "string", "$value": "JetBrains Mono", ... }
  },
  "weight": {
    "thin":      { "$type": "string", "$value": "Thin", "$extensions": { "com.figma.type": "string", ... } },
    "light":     { "$type": "string", "$value": "Light", ... },
    "regular":   { "$type": "string", "$value": "Regular", ... },
    "medium":    { "$type": "string", "$value": "Medium", ... },
    "semibold":  { "$type": "string", "$value": "SemiBold", ... },
    "bold":      { "$type": "string", "$value": "Bold", ... },
    "extrabold": { "$type": "string", "$value": "ExtraBold", ... },
    "black":     { "$type": "string", "$value": "Black", ... }
  },
  "size": {
    "10": { "$type": "number", "$value": 10, ... },
    "11": { "$type": "number", "$value": 11, ... },
    "12": { "$type": "number", "$value": 12, ... },
    "13": { "$type": "number", "$value": 13, ... },
    "14": { "$type": "number", "$value": 14, ... },
    "15": { "$type": "number", "$value": 15, ... },
    "16": { "$type": "number", "$value": 16, ... },
    "17": { "$type": "number", "$value": 17, ... },
    "18": { "$type": "number", "$value": 18, ... },
    "20": { "$type": "number", "$value": 20, ... },
    "22": { "$type": "number", "$value": 22, ... },
    "24": { "$type": "number", "$value": 24, ... },
    "28": { "$type": "number", "$value": 28, ... },
    "30": { "$type": "number", "$value": 30, ... },
    "32": { "$type": "number", "$value": 32, ... },
    "36": { "$type": "number", "$value": 36, ... },
    "40": { "$type": "number", "$value": 40, ... },
    "48": { "$type": "number", "$value": 48, ... },
    "56": { "$type": "number", "$value": 56, ... },
    "60": { "$type": "number", "$value": 60, ... },
    "72": { "$type": "number", "$value": 72, ... }
  },
  "lineHeight": {
    "16": { "$type": "number", "$value": 16, ... },
    "18": { "$type": "number", "$value": 18, ... },
    "20": { "$type": "number", "$value": 20, ... },
    "22": { "$type": "number", "$value": 22, ... },
    "24": { "$type": "number", "$value": 24, ... },
    "26": { "$type": "number", "$value": 26, ... },
    "28": { "$type": "number", "$value": 28, ... },
    "30": { "$type": "number", "$value": 30, ... },
    "32": { "$type": "number", "$value": 32, ... },
    "36": { "$type": "number", "$value": 36, ... },
    "40": { "$type": "number", "$value": 40, ... },
    "48": { "$type": "number", "$value": 48, ... },
    "60": { "$type": "number", "$value": 60, ... },
    "72": { "$type": "number", "$value": 72, ... }
  },
  "letterSpacing": {
    "tight":   { "$type": "number", "$value": -2, ... },
    "normal":  { "$type": "number", "$value": 0, ... },
    "wide":    { "$type": "number", "$value": 1, ... },
    "wider":   { "$type": "number", "$value": 2, ... },
    "widest":  { "$type": "number", "$value": 4, ... }
  }
}
```

String tokens (`font/family/*` and `font/weight/*`) MUST include `"com.figma.type": "string"` in extensions.

> IMPORTANT: `font/family/*` and `font/weight/*` are aliased directly by Typography (not via Responsive).
> `font/size/*`, `font/lineHeight/*`, `font/letterSpacing/*` are aliased by the Responsive collection first, then by Typography via Responsive.

---

## CRITICAL: Layout Primitive Values — for Layout Collection to Alias

```json
"layout": {
  "xs":  { "columns": 4,  "margin": 16, "gutter": 8,  "minWidth": 0,    "maxWidth": 599  },
  "sm":  { "columns": 4,  "margin": 24, "gutter": 16, "minWidth": 600,  "maxWidth": 904  },
  "md":  { "columns": 8,  "margin": 32, "gutter": 24, "minWidth": 905,  "maxWidth": 1239 },
  "lg":  { "columns": 12, "margin": 48, "gutter": 24, "minWidth": 1240, "maxWidth": 1439 },
  "xl":  { "columns": 12, "margin": 64, "gutter": 32, "minWidth": 1440, "maxWidth": 1919 },
  "xxl": { "columns": 12, "margin": 80, "gutter": 32, "minWidth": 1920, "maxWidth": 9999 }
}
```
Each sub-key is a `$type: number` token with `hiddenFromPublishing: true`.

---

## Shadow Geometry — for Effects to Alias

```
shadow/sm/x=0,  shadow/sm/y=2,  shadow/sm/blur=8,  shadow/sm/spread=0
shadow/md/x=0,  shadow/md/y=4,  shadow/md/blur=16, shadow/md/spread=0
shadow/lg/x=0,  shadow/lg/y=8,  shadow/lg/blur=24, shadow/lg/spread=0
shadow/xl/x=0,  shadow/xl/y=16, shadow/xl/blur=48, shadow/xl/spread=0
```
These are number tokens, no scope key, hiddenFromPublishing.

---

## All Value Groups

### color/{family}/{shade} + alpha siblings
Families: brand primary, brand secondary (if any), grey/neutral, red, green, yellow, blue, white, black
Shades per family: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
Alpha siblings: a8, a16, a24, a32, a40, a48, a56, a64 (at same level as shades)

### spacing/{value}
0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160

### size/{value} (component heights, icon sizes)
16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 120, 160

### radius/{name} (raw scale — Responsive maps these to breakpoints)
```
none=0, xs=2, sm=4, md=8, lg=12, xl=16, 2xl=24, full=9999
```

### borderWidth/{name}
```
hairline=0.3, thin=0.5, soft=0.8, sm=1, md=2, lg=4
```

### blur/{name}
```
none=0, sm=4, md=8, lg=16, xl=24, 2xl=40
```

### font/* (see Font Variables section above)

### shadow/{scale}/{property} (see Shadow Geometry section above)

### layout/{breakpoint}/{property} (see Layout Primitives section above)

### number/{name} (z-index)
```
zIndex/base=0, raised=10, dropdown=100, sticky=200, modal=300, toast=400, tooltip=500
```

---

## Token Count Expectations
350–500 tokens total. Do not generate a minimalist subset.
- Colour solids: ~70 tokens (7 families × 10 shades)
- Colour alpha: ~72 tokens (9 families × 8 alpha steps)
- font/*: ~55 tokens (sizes × 21 + lineHeights × 12 + letterSpacing × 5 + weights × 8 + families × 3)
- spacing × 14, size × 15, radius × 8, borderWidth × 6, blur × 6, shadow geometry × 16, z-index × 7
- layout × 30 (6 breakpoints × 5 properties)
