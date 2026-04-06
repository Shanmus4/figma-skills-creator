## Table of Contents

1. [Token Object Structure](#token-object-structure) — primitive, middle-chain, tip token formats
2. [Complete Alias Chain Samples](#complete-alias-chain-samples) — color, number, string chains by Tier
3. [aliasData Critical Rules](#aliasdata--critical-rules) — three required fields, no prefix contamination
4. [Color Token Value](#color-token-value) — always an object, never a hex string
5. [String Token](#string-token) — com.figma.type requirement
6. [codeSyntax Format](#codesyntax-format) — format table by target platform
7. [$metadata Block](#metadata-block) — modeName per collection
8. [Variable ID Namespaces](#variable-id-namespaces) — namespace table by collection
9. [Architecture Tiers](#architecture-tiers) — chain hierarchy (2/3/4-Tier)
10. [ZIP File Structure](#zip-file-structure) — folder structure and Python builder
11. [Validation Checklist](#validation-checklist) — run before finalising each ZIP

---

## Token Object Structure

> [!IMPORTANT]
> **LITERAL TRANSLATION RULE:** Do NOT attempt to "optimize" or "rewrite" the JSON structure. Use the EXACT keys and nesting shown in the samples below.

### Primitive token (hardcoded, with scope, hidden from publishing)
```json
{
  "$type": "number",
  "$value": 2,
  "$extensions": {
    "com.figma.variableId": "VariableID:10:100",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.scopes": ["EFFECT_FLOAT"],
    "com.figma.codeSyntax": { "WEB": "--primitives-shadow-sm-y" }
  }
}
```

### Middle-chain token WITH scope (Semantic, Theme)
```json
{
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:60:8",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.scopes": ["FRAME_FILL", "SHAPE_FILL"],
    "com.figma.codeSyntax": { "WEB": "--semantic-surface-brand" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:10:5",
      "targetVariableName": "color/orange/500",
      "targetVariableSetName": "Primitives"
    }
  }
}
```

### Tip token with scope and alias (Component Colors, Typography, Effects)
```json
{
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:70:44",
    "com.figma.scopes": ["FRAME_FILL", "SHAPE_FILL"],
    "com.figma.codeSyntax": { "WEB": "--color-button-primary-default-background" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:60:12",
      "targetVariableName": "interactive/primary/default",
      "targetVariableSetName": "Semantic"
    }
  }
}
```

> **$value is MANDATORY (CRITICAL RULE):**
> `$value` is required on EVERY token without exception — including alias/middle-chain tokens.
>
> - **Why?** Figma silently drops any collection containing tokens with a missing `$value` field.
> - **Real Value Rule (Safety First):**
>   - **Numbers / Strings**: Always use the **Actual Resolved Value**.
>   - **Colors**: Use a black placeholder object `{..., "hex": "#000000"}`.
> - **Direct Parent Ownership (Branching Rule)**: Tokens MUST alias their **direct parent** in the chain.
  - **3-Tier**: Component Colors → Aliases `Semantic`
  - **4-Tier**: Component Colors → Aliases `Semantic`
  - **Typography (Triple Alias Rule)**:
    - `fontSize`, `lineHeight`, `letterSpacing` → Alias **`Responsive`**
    - `fontFamily`, `fontWeight` → Alias **`Primitives`**
    - `color/*` → Alias **`Semantic`** (2/3-Tier) or **`Theme`** (4-Tier)
- **String Tokens**: REQUIRE `"com.figma.type": "string"` at every Tier. Primitive String Tokens DO have scopes (FONT_FAMILY, FONT_STYLE).
- **Figma Behavior**: Figma resolves the real data via `aliasData`. The `$value` exists for structural validity and safe fallback.

## Complete Alias Chain Samples

Follow these full structural patterns. Each Tier aliases its **direct parent**.

### 1. Color Chain — 3-Tier (Primitives → Semantic → Components)

**Primitives (Value + Scope)**
```json
"orange-500": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0.918, 0.345, 0.047], "alpha": 1, "hex": "#EA580C" },
  "$extensions": {
    "com.figma.variableId": "VariableID:10:5",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.scopes": ["ALL_FILLS"],
    "com.figma.codeSyntax": { "WEB": "--primitives-color-orange-500" }
  }
}
```

**Semantic with modes (Aliases Primitives — light.tokens.json)**
```json
"brand": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:60:8",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.scopes": ["FRAME_FILL", "SHAPE_FILL"],
    "com.figma.codeSyntax": { "WEB": "--semantic-surface-brand" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:10:5",
      "targetVariableName": "color/orange/500",
      "targetVariableSetName": "Primitives"
    }
  }
}
```

**Component Colors (Aliases Semantic)**
```json
"button-bg": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:70:44",
    "com.figma.scopes": ["FRAME_FILL", "SHAPE_FILL"],
    "com.figma.codeSyntax": { "WEB": "--color-button-primary-default-background" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:60:8",
      "targetVariableName": "surface/brand",
      "targetVariableSetName": "Semantic"
    }
  }
}
```

### 2. Color Chain — 4-Tier (Primitives → Theme → Semantic → Components)

**Theme (Aliases Primitives — has light/dark modes)**
```json
"brand": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:40:8",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.scopes": ["FRAME_FILL", "SHAPE_FILL"],
    "com.figma.codeSyntax": { "WEB": "--theme-surface-brand" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:10:5",
      "targetVariableName": "color/orange/500",
      "targetVariableSetName": "Primitives"
    }
  }
}
```

**Semantic (Aliases Theme — single mode, no light/dark)**
```json
"brand": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:60:8",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.scopes": ["FRAME_FILL", "SHAPE_FILL"],
    "com.figma.codeSyntax": { "WEB": "--semantic-surface-brand" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:40:8",
      "targetVariableName": "surface/brand",
      "targetVariableSetName": "Theme"
    }
  }
}
```

**Component Colors (Aliases Semantic — same as 3-Tier)**
```json
"button-bg": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:70:44",
    "com.figma.scopes": ["FRAME_FILL", "SHAPE_FILL"],
    "com.figma.codeSyntax": { "WEB": "--color-button-primary-default-background" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:60:8",
      "targetVariableName": "surface/brand",
      "targetVariableSetName": "Semantic"
    }
  }
}
```

### 3. Number Chain (Primitives → Density → Components)

**Primitives (Value + Scope)**
```json
"spacing-16": {
  "$type": "number",
  "$value": 16,
  "$extensions": {
    "com.figma.variableId": "VariableID:10:42",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.scopes": ["GAP"],
    "com.figma.codeSyntax": { "WEB": "--primitives-spacing-16" }
  }
}
```

**Density (Aliases Primitives)**
```json
"padding-md": {
  "$type": "number",
  "$value": 16,
  "$extensions": {
    "com.figma.variableId": "VariableID:50:7",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.scopes": ["GAP"],
    "com.figma.codeSyntax": { "WEB": "--density-padding-md" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:10:42",
      "targetVariableName": "spacing/16",
      "targetVariableSetName": "Primitives"
    }
  }
}
```

### 4. String Chain (Primitives → Typography)

**Primitives (Value + Scope + Type)**
```json
"font-sans": {
  "$type": "string",
  "$value": "Inter",
  "$extensions": {
    "com.figma.variableId": "VariableID:10:500",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.type": "string",
    "com.figma.scopes": ["FONT_FAMILY"],
    "com.figma.codeSyntax": { "WEB": "--primitives-font-family-sans" }
  }
}
```

## aliasData — Critical Rules

**Three fields only. Never include `targetVariableSetId`.**

```json
"com.figma.aliasData": {
  "targetVariableId": "VariableID:10:42",
  "targetVariableName": "color/black/opacity/24",
  "targetVariableSetName": "Primitives"
}
```

- `targetVariableId` — the `com.figma.variableId` of the target token
- `targetVariableName` — path using **forward slashes only**
- `targetVariableSetName` — exact, un-numbered collection name: `Primitives`, `Semantic`, `Theme`. **CRITICAL:** Do NOT prepend the import order number.

> **CRITICAL ALIAS RULE: NO PREFIX CONTAMINATION**
> `targetVariableName` must NEVER include the collection name as a prefix.
> - ✗ **BROKEN**: `"targetVariableName": "semantic/shadow/sm/color"`
> - ✓ **CORRECT**: `"targetVariableName": "shadow/sm/color"`

**Every non-primitive token must have aliasData.** No exceptions.

## Naming Collision Rule (The Folder Fallback)

> [!CAUTION]
> **NO VARIABLE/GROUP OVERLAP**: A JSON key cannot contain a `$value` AND child keys.
> - ✗ **BROKEN**: `"destructive": { "$value": { ... }, "text": { ... } }`
> - ✓ **CORRECT**: `"destructive": { "default": { "$value": { ... } }, "text": { ... } }`

## Color Token Value (always an object — never a hex string)
```json
"$value": {
  "colorSpace": "srgb",
  "components": [0.231, 0.510, 0.965],
  "alpha": 1.0,
  "hex": "#3B82F6"
}
```

## String Token
```json
{
  "$type": "string",
  "$value": "SemiBold",
  "$extensions": {
    "com.figma.variableId": "VariableID:25:5",
    "com.figma.type": "string",
    "com.figma.scopes": ["FONT_STYLE"],
    "com.figma.codeSyntax": { "WEB": "--typography-heading-fontWeight" }
  }
}
```

## codeSyntax Format

| Target Platform (Q2) | Generated codeSyntax Keys |
|---|---|
| Web app | `{"WEB": "..."}` |
| Mobile app | `{"ANDROID": "...", "iOS": "..."}` |
| Web + Mobile | `{"WEB": "...", "ANDROID": "...", "iOS": "..."}` |

| Format | Target | Example |
|---|---|---|
| CSS / Kebab | WEB | `--color-button-primary-background` |
| android / XML | ANDROID | `color_button_primary_background` |
| swift / Pascal | iOS | `ColorButtonPrimaryBackground` |

## $metadata Block

Every JSON mode file must end with:
```json
"$metadata": {
  "modeName": "light"
}
```

## Variable ID Namespaces

| Collection | Prefix | Example |
|---|---|---|
| Primitives | 10 | VariableID:10:1 |
| Responsive | 20 | VariableID:20:1 |
| Typography | 25 | VariableID:25:1 |
| Effects | 30 | VariableID:30:1 |
| Theme (4-Tier only) | 40 | VariableID:40:1 |
| Density | 50 | VariableID:50:1 |
| Layout | 55 | VariableID:55:1 |
| Semantic | 60 | VariableID:60:1 |
| Component Colors | 70 | VariableID:70:1 |
| Component Dimensions | 80 | VariableID:80:1 |

## Architecture Tiers

| Tier | Chain |
|---|---|
| 2-Tier | Primitives → **Semantic** (modes: light/dark) |
| 3-Tier | Primitives → **Semantic** (modes) → Component Colors |
| 4-Tier | Primitives → **Theme** (modes) → **Semantic** (no modes) → Component Colors |

**Component Colors ALWAYS aliases Semantic.** Never Theme. Never Primitives.

## ZIP File Structure (CRITICAL)

**Format: `Master.zip` → `{Number}. {Collection Name}/` → `mode.tokens.json`**

### 3-Tier Example
```
design-tokens.zip
├── 1. Primitives/
│   └── primitives.tokens.json
├── 2. Semantic/
│   ├── light.tokens.json
│   └── dark.tokens.json
├── 3. Responsive/
│   ├── mobile.tokens.json
│   ├── tablet.tokens.json
│   └── desktop.tokens.json
├── 4. Density/
│   ├── compact.tokens.json
│   ├── comfortable.tokens.json
│   └── spacious.tokens.json
├── 5. Layout/
│   └── ...
├── 6. Effects/
│   └── effects.tokens.json
├── 7. Typography/
│   └── typography.tokens.json
├── 8. Component Colors/
│   └── component-colors.tokens.json
└── 9. Component Dimensions/
    └── component-dimensions.tokens.json
```

### 4-Tier Example
```
design-tokens.zip
├── 1. Primitives/
├── 2. Theme/
│   ├── light.tokens.json
│   └── dark.tokens.json
├── 3. Semantic/
│   └── semantic.tokens.json
├── 4. Responsive/
├── ...
├── 9. Component Colors/
└── 10. Component Dimensions/
```

> **Dynamic numbering:** Folder numbers match the import order for the chosen tier. Optional collections that are not generated are skipped (no gaps in numbering).

## Validation Checklist — Run Before Finalising Each ZIP

### ALL collections
- [ ] Every token has `$value`
- [ ] Every token has `com.figma.scopes` with correct scope values (including Primitives)
- [ ] Every non-primitive token has `com.figma.aliasData` with all 3 required fields
- [ ] `targetVariableName` uses slashes and has NO collection prefix
- [ ] `targetVariableSetName` matches the un-numbered collection name exactly
- [ ] `targetVariableSetId` is NOT present
- [ ] All color `$value` are objects — never bare hex strings
- [ ] All string tokens have `"com.figma.type": "string"`
- [ ] All files end with `$metadata.modeName`
- [ ] **ID STABILITY**: Multi-mode collections use same `variableId` per token path
- [ ] **Zero VariableID:0:0 references**
- [ ] **Per-Collection Target Verification**: Every targetVariableName exists in its targetVariableSetName

> [!CAUTION]
> **NO PROPRIETARY DUMPING**: Never output JSON in a raw markdown code block. Always deliver inside the final ZIP.

### Primitives
- [ ] All tokens have `com.figma.scopes` with correct values
- [ ] All tokens have `hiddenFromPublishing: true` (except 1-Tier)
- [ ] Zero tokens have aliasData

### Semantic (2/3-Tier — with modes)
- [ ] Both mode files have identical token paths
- [ ] Every token has semantically correct scope
- [ ] Every token has aliasData pointing to **Primitives**
- [ ] Minimum 55 unique token paths (Semantic Floor Rule)

### Semantic (4-Tier — no modes)
- [ ] Single mode file: `semantic.tokens.json`
- [ ] Every token has semantically correct scope
- [ ] Every token has aliasData pointing to **Theme**
- [ ] Minimum 55 unique token paths (Semantic Floor Rule)

### Theme (4-Tier only)
- [ ] Both mode files have identical token paths
- [ ] Every token has semantically correct scope
- [ ] Every token has aliasData pointing to Primitives

### Component Colors (3-Tier and 4-Tier)
- [ ] Every token aliases **Semantic** — never Theme, never Primitives
- [ ] Correct scopes: FRAME_FILL+SHAPE_FILL for backgrounds, TEXT_FILL for text, STROKE for borders
- [ ] Icon group present with fill/stroke/duotone
- [ ] Divider group present

### Hidden from Publishing
- [ ] Per-tier table from `01-architecture.md` is followed exactly
- [ ] Parent-only collections: ALL tokens have `hiddenFromPublishing: true`
- [ ] Tip collections: NO tokens have `hiddenFromPublishing`
