## Table of Contents

1. [Token Object Structure](#token-object-structure) — primitive, middle-chain, tip token formats
2. [Complete Alias Chain Samples](#complete-alias-chain-samples) — color, number, string chains by Tier
3. [aliasData Critical Rules](#aliasdata--critical-rules) — three required fields, no prefix contamination
4. [Color Token Value](#color-token-value) — always an object, never a hex string
5. [String Token](#string-token) — com.figma.type requirement
6. [codeSyntax Format](#codesyntax-format) — format table by target platform
7. [$metadata Block](#metadata-block) — modeName per collection
8. [Variable ID Namespaces](#variable-id-namespaces) — namespace table by collection
9. [Architecture Tiers](#architecture-tiers) — chain hierarchy (1/2/3/4-Tier)
10. [ZIP File Structure](#zip-file-structure) — folder structure and Python builder
11. [Validation Checklist](#validation-checklist) — run before finalising each ZIP

---

## Token Object Structure

> [!IMPORTANT]
> **LITERAL TRANSLATION RULE:** Do NOT attempt to "optimize" or "rewrite" the JSON structure. You must use the EXACT keys and nesting shown in the samples below. If a sample shows `$extensions`, do not omit it. If a sample shows `targetVariableSetName`, it must be present. You are a literal translator, not an architect.

### Primitive token (hardcoded, no alias, no scope key)
```json
{
  "$type": "number",
  "$value": 2,
  "$extensions": {
    "com.figma.variableId": "VariableID:10:100",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.codeSyntax": { "WEB": "--primitives-shadow-sm-y" }
  }
}
```

### Middle-chain token WITH scope (Theme, Semantic)
```json
{
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:40:8",
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

### Tip token with scope and alias (Component Colors, Typography, Effects, etc.)
```json
{
  "$type": "number",
  "$value": 0,
  "$extensions": {
    "com.figma.variableId": "VariableID:50:12",
    "com.figma.scopes": ["GAP"],
    "com.figma.codeSyntax": { "WEB": "--density-padding-x" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:10:42",
      "targetVariableName": "spacing/16",
      "targetVariableSetName": "Primitives"
    }
  }
}
```

> **$value is MANDATORY (CRITICAL RULE):**
> `$value` is required on EVERY token without exception — including alias/middle-chain tokens.
>
> *"`$value` on alias tokens is a placeholder. It must always be present and valid but Figma ignores it — `aliasData` is what drives the actual resolved value. Never omit `$value` even on alias tokens."*
>
> - **Why?** Figma silently drops any collection containing tokens with a missing `$value` field.
> - **Real Value Rule (Safety First):**
>   - **Numbers / Strings**: Always use the **Actual Resolved Value** (e.g. `12` or `"Inter"`). If alias resolution fails, Figma may fallback to this value.
>   - **Colors**: Use a black placeholder object `{..., "hex": "#000000"}`.
> - **Direct Parent Ownership (Branching Rule)**: Tokens MUST alias their **direct parent** in the chain.
  - **4-Tier**: Component Colors → Aliases `Semantic`
  - **2-Tier / 3-Tier**: Component Colors → Aliases `Theme` (skips non-existent Semantic)
  - **Typography (Triple Alias Rule)**:
    - `fontSize`, `lineHeight`, `letterSpacing` → Alias **`Responsive`**
    - `fontFamily`, `fontWeight` → Alias **`Primitives`**
    - `color/*` → Alias **`Theme`**
- **String Tokens**: REQUIRE `"com.figma.type": "string"` at every Tier. Unlike other primitives, **Primitive String Tokens DO have scopes** (FONT_FAMILY, FONT_STYLE).
- **Figma Behavior**: Figma resolves the real data via `aliasData`. The `$value` exists for structural validity and safe fallback. No curly-brace syntax or hex inheritance is used.

## Complete Alias Chain Samples

Follow these full structural patterns. Each Tier aliases its **direct parent**.

### 1. Color Chain (4-Tier: Primitives → Theme → Semantic → Components)

**Primitives (Value)**
```json
"orange-500": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0.918, 0.345, 0.047], "alpha": 1, "hex": "#EA580C" },
  "$extensions": {
    "com.figma.variableId": "VariableID:10:5",
    "com.figma.hiddenFromPublishing": true,
    "com.figma.codeSyntax": { "WEB": "--primitives-color-orange-500" }
  }
}
```

**Theme (Aliases Primitives)**
```json
"surface-brand": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:40:8",
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

**Semantic (Aliases Theme)**
```json
"action-primary": {
  "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000" },
  "$extensions": {
    "com.figma.variableId": "VariableID:60:12",
    "com.figma.scopes": ["FRAME_FILL", "SHAPE_FILL"],
    "com.figma.codeSyntax": { "WEB": "--semantic-action-primary-default" },
    "com.figma.comment": "Aliases Theme (4-Tier architecture only)",
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:40:8",
      "targetVariableName": "surface/brand",
      "targetVariableSetName": "Theme"
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
    "com.figma.comment": "Aliases Semantic (4-Tier) or Theme (2/3-Tier)",
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:60:12",
      "targetVariableName": "action/primary/default",
      "targetVariableSetName": "Semantic"
    }
  }
}
```

### 2. Number Chain (3-Tier: Primitives → Density → Components)

**Primitives (Value)**
```json
"spacing-16": {
  "$type": "number",
  "$value": 16,
  "$extensions": {
    "com.figma.variableId": "VariableID:10:42",
    "com.figma.hiddenFromPublishing": true,
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

**Component Dimensions (Aliases Density)**
```json
"button-padding": {
  "$type": "number",
  "$value": 16,
  "$extensions": {
    "com.figma.variableId": "VariableID:80:3",
    "com.figma.scopes": ["GAP"],
    "com.figma.codeSyntax": { "WEB": "--dimensions-button-padding" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:50:7",
      "targetVariableName": "padding/md",
      "targetVariableSetName": "Density"
    }
  }
}
```

### 3. String Chain (2-Tier: Primitives → Typography)

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

**Typography (Aliases Primitives + Type)**
```json
"body-font": {
  "$type": "string",
  "$value": "Inter",
  "$extensions": {
    "com.figma.variableId": "VariableID:25:10",
    "com.figma.type": "string",
    "com.figma.scopes": ["FONT_FAMILY"],
    "com.figma.codeSyntax": { "WEB": "--typography-body-font-family" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:10:500",
      "targetVariableName": "font/family/sans",
      "targetVariableSetName": "Primitives"
    }
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
- `targetVariableName` — path using **forward slashes only**, mirroring JSON nesting depth. `sdfdsf/Color`, `color/black/opacity/24`, `spacing/16`
- `targetVariableSetName` — exact, un-numbered collection name: `Primitives`, `Theme`, `Component Colors`. **CRITICAL:** Do NOT prepend the import order number to this field (e.g. use `Primitives` not `1. Primitives`), otherwise Figma aliases will break.

> **CRITICAL ALIAS RULE: NO PREFIX CONTAMINATION**
> `targetVariableName` must NEVER include the collection name as a prefix. 
> - ✗ **BROKEN**: `"targetVariableName": "theme/shadow/sm/color", "targetVariableSetName": "Theme"`
> - ✓ **CORRECT**: `"targetVariableName": "shadow/sm/color", "targetVariableSetName": "Theme"`
> If your data map or vmap contains the collection name (e.g. `theme/surface/default`), you MUST strip the `theme/` prefix before writing to `targetVariableName`. The set is already defined by `targetVariableSetName`.

**Every non-primitive token must have aliasData.** No exceptions. Dark mode tokens, Typography tokens, Component Colors, Effects numeric tokens — all must have aliasData.

## Naming Collision Rule (The Folder Fallback)

In Figma, a path cannot be both a **Variable** and a **Group (Folder)**.

> [!CAUTION]
> **NO VARIABLE/GROUP OVERLAP**: A JSON key cannot contain a `$value` AND child keys.
> - ✗ **BROKEN**: `"destructive": { "$value": { ... }, "text": { ... } }` — Here, `destructive` is a variable, so it cannot be a folder for `text`.
> - ✓ **CORRECT**: `"destructive": { "default": { "$value": { ... } }, "text": { ... } }` — Here, `destructive` is purely a folder.
>
> If a semantic or component group has multiple sub-states (like `brand-primary`, `brand-secondary`), you must never put a base value on the parent `brand` key if other `brand/*` tokens exist. Use a internal `default` or `surface` key for the base value.


## Color Token Value (always an object — never a hex string)
```json
"$value": {
  "colorSpace": "srgb",
  "components": [0.231, 0.510, 0.965],
  "alpha": 1.0,
  "hex": "#3B82F6"
}
```
`components` = [R÷255, G÷255, B÷255]. Opacity variants: `"alpha": 0.24` for 24% opacity.

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
String tokens **must** include `"com.figma.type": "string"`.

## codeSyntax Format

The `com.figma.codeSyntax` object supports three platform keys: **WEB**, **ANDROID**, and **iOS** (case-sensitive). The AI populates these based on the **Product Type (Q2)** selection:

| Target Platform (Q2) | Generated codeSyntax Keys |
|---|---|
| Web app | `{"WEB": "..."}` |
| Mobile app | `{"ANDROID": "...", "iOS": "..."}` |
| Web + Mobile | `{"WEB": "...", "ANDROID": "...", "iOS": "..."}` |

### Format mapping by platform:

| Format | Target | Example |
|---|---|---|
| CSS / Kebab | WEB | `--color-button-primary-background` |
| android / XML | ANDROID | `color_button_primary_background` |
| swift / Pascal | iOS | `ColorButtonPrimaryBackground` |

Apply the chosen format from **Q17** (or the platform default if multiple are selected) consistently to every target. Apply prefix if user specified one (e.g. `--ds-color-button-primary-background`).

## $metadata Block

Every JSON mode file must end with:
```json
"$metadata": {
  "modeName": "light"
}
```
For no-mode collections (Primitives, Typography, Semantic, Component Colors): `"modeName": "Value"`

## Variable ID Namespaces

| Collection | Prefix | Example |
|---|---|---|
| Primitives | 10 | VariableID:10:1 |
| Typography | 25 | VariableID:25:1 |
| Effects | 30 | VariableID:30:1 |
| Theme | 40 | VariableID:40:1 |
| Density | 50 | VariableID:50:1 |
| Layout | 55 | VariableID:55:1 |
| Semantic | 60 | VariableID:60:1 |
| Component Colors | 70 | VariableID:70:1 |
| Component Dimensions | 80 | VariableID:80:1 |

Increment the second number per token. Each mode in a collection shares the same token IDs — the same `variableId` appears in light.tokens.json and dark.tokens.json for the same token. Do NOT use the same ID for different tokens across collections.

## ZIP File Structure (CRITICAL)

To ensure the designer imports collections in the exact correct order, you must generate a **single master `.zip` file**. Inside this ZIP, you must create **folders** named with a numeric prefix. Each folder represents one collection and contains the relevant mode JSON files.

**Format: `Master.zip` → `{Number}. {Collection Name}/` → `mode.tokens.json`**

```
design-tokens.zip
├── 1. Primitives/
│   └── primitives.tokens.json
├── 2. Theme/
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
│   ├── xs.tokens.json
│   ├── sm.tokens.json
│   └── ... (all breakpoints)
├── 6. Effects/
│   └── effects.tokens.json
├── 7. Typography/
│   └── typography.tokens.json
├── 8. Semantic/
│   └── semantic.tokens.json
├── 9. Component Colors/
│   └── component-colors.tokens.json
└── 10. Component Dimensions/
    └── component-dimensions.tokens.json
```

## Python ZIP Builder

```python
import json, zipfile

def write_zip(zip_name: str, files: dict):
    """files = {filename: token_dict}"""
    with zipfile.ZipFile(f"/mnt/user-data/outputs/{zip_name}", 'w') as zf:
        for filename, tokens in files.items():
            zf.writestr(filename, json.dumps(tokens, indent=2))
```

## Validation Checklist — Run Before Finalising Each ZIP

### ALL collections
- [ ] Every token has `$value` — including alias tokens in Theme, Semantic, Responsive, Density, Effects, Typography, Component Colors, Component Dimensions. No exceptions.
- [ ] Every non-primitive token has `com.figma.aliasData` with all 3 required fields
- [ ] `targetVariableName` uses slashes: `color/grey/900` not `color.grey.900`
- [ ] `targetVariableSetName` matches the un-numbered collection name exactly (e.g. `Primitives` — never `1. Primitives`)
- [ ] `targetVariableSetId` is NOT present (omit entirely)
- [ ] All color `$value` are objects — never bare hex strings
- [ ] All string tokens have `"com.figma.type": "string"`
- [ ] All files end with `$metadata.modeName`
- [ ] **NO targetVariableName contains a collection prefix** (e.g. no `theme/` or `semantic/` inside the path)
- [ ] **ID STABILITY CHECK**: Every mode file in a multi-mode collection (Theme, Responsive, Density, Layout) uses the EXACT same `variableId` for the same token path.
- [ ] **Zero VariableID:0:0 references**: Every alias ID must be a real, generated ID from the registry.
- [ ] **Per-Collection Target Verification**: Every targetVariableName must exist in the specific targetVariableSetName. (e.g., if set is `Semantic`, path must exist in `semantic.tokens.json`).

> [!CAUTION]
> **NO PROPRIETARY DUMPING**: Never output JSON in a raw markdown code block. It must ALWAYS be delivered inside the final ZIP file structure. Dumping tokens in the chat window causes context truncation and broken files.

### Python Pre-ZIP Validation Script (Safety Gate)
Run this check inside your script before calling `build_zip`:
```python
def validate_tokens(files, registries):
    """
    files: { "path/to/file.json": data_dict }
    registries: { "CollectionName": { "token/path": "VariableID" } }
    """
    sets = ["Primitives", "Theme", "Responsive", "Density", "Layout", "Effects", "Typography", "Semantic", "Component Colors", "Component Dimensions"]
    sets.extend(list(registries.keys()))
    for filename, data in files.items():
        for token in data.values():
            if isinstance(token, dict) and "$extensions" in token:
                ext = token["$extensions"]
                vid = ext.get("com.figma.variableId", "")
                is_custom = vid.startswith("VariableID:9") # ns 90-99
                
                # Custom Collection Alias Check:
                # Color tokens in ns 90+ MUST have aliasData (no hardcoded hex allowed)
                if is_custom and token.get("$type") == "color" and "com.figma.aliasData" not in ext:
                     raise ValueError(f"CONSISTENCY ERROR: Custom color token '{vid}' is hardcoded. It MUST alias a Primitive.")

                if "com.figma.aliasData" in ext:
                    alias = ext["com.figma.aliasData"]
                    target_set = alias["targetVariableSetName"]
                    target_name = alias["targetVariableName"]
                    
                    if alias["targetVariableId"] == "VariableID:0:0":
                         raise ValueError(f"CRITICAL: Broken alias 'VariableID:0:0' detected for '{target_name}'.")

                    if target_set in registries and target_name not in registries[target_set]:
                        raise ValueError(f"CROSS-TIER GAP: Token aliases '{target_name}' in '{target_set}', but that path does not exist in the target collection.")

                    for s in sets:
                        if target_name.startswith(s.lower() + "/"):
                            raise ValueError(f"CRITICAL: Token path '{target_name}' contains illegal collection prefix '{s}/'")
                
                syntax = ext.get("com.figma.codeSyntax", {}).get("WEB", "")
                if "  " in syntax:
                    raise ValueError(f"CRITICAL: Double-space detected in codeSyntax: {syntax}")
```

### Primitives
- [ ] Zero tokens have `com.figma.scopes` key (absent entirely — not empty array)
- [ ] All tokens have `hiddenFromPublishing: true`
- [ ] All tokens have `codeSyntax.WEB`
- [ ] Zero tokens have aliasData
- [ ] Shadow geometry group present: `shadow/sm/x`, `shadow/sm/y`, `shadow/sm/blur`, `shadow/sm/spread` etc.
- [ ] Opacity variants exist per-shade for ALL colour families (not just at root)
- [ ] White and black are clean tokens — NO mixed token+group. Structure: `color/white` = token, `color/white-opacity/8` = separate group key, NOT `color/white/opacity/8` (would make white both token and folder)

### Theme
- [ ] Both mode files have identical token paths
- [ ] Every token has semantically correct scope (TEXT_FILL, FRAME_FILL+SHAPE_FILL, STROKE, EFFECT_COLOR, etc.)
- [ ] Every token has aliasData pointing to Primitives

### Semantic (4-Tier only)
- [ ] Every token has semantically correct scope (same rules as Theme)
- [ ] Every token has aliasData pointing to Theme

### Typography
- [ ] Imported AFTER Theme (Typography color tokens alias Theme)
- [ ] Font colour tokens (`color/*`) alias Theme with TEXT_FILL scope
- [ ] FONT_SIZE, LINE_HEIGHT, LETTER_SPACING on number tokens
- [ ] FONT_FAMILY, FONT_STYLE on string tokens

### Effects
- [ ] Shadow colour tokens → EFFECT_COLOR, alias Primitives
- [ ] Shadow numeric tokens (x, y, blur, spread) → EFFECT_FLOAT, alias Primitives shadow geometry
- [ ] Blur tokens → EFFECT_FLOAT, alias Primitives blur

### Layout
- [ ] All tokens have `["WIDTH_HEIGHT"]` scope
- [ ] Six mode files ordered xs → sm → md → lg → xl → xxl
- [ ] Column counts: xs=4, sm=4, md=8, lg=12, xl=12, xxl=12

### Component Colors
- [ ] Single mode file
- [ ] Every token has correct scope: FRAME_FILL+SHAPE_FILL for backgrounds, TEXT_FILL for text, STROKE for borders
- [ ] Icon group present with fill (SHAPE_FILL) and stroke (STROKE) tokens
- [ ] Divider group present
- [ ] Every token aliases Semantic or Theme — never Primitives directly

### Component Dimensions
- [ ] No colour tokens, no height/width tokens
- [ ] padding/* → GAP, gap/* → GAP, radius/* → CORNER_RADIUS, border/width/* → STROKE_FLOAT
- [ ] Padding aliases Density if Density exists, else Primitives spacing
