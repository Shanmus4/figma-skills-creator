# JSON Format Reference

## Token Object Structure

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
  "$value": { "colorSpace": "srgb", "components": [0.1, 0.1, 0.1], "alpha": 1, "hex": "#1A1A1A" },
  "$extensions": {
    "com.figma.variableId": "VariableID:40:8",
    "com.figma.scopes": ["TEXT_FILL"],
    "com.figma.codeSyntax": { "WEB": "--theme-text-primary" },
    "com.figma.aliasData": {
      "targetVariableId": "VariableID:10:5",
      "targetVariableName": "color/grey/900",
      "targetVariableSetName": "Primitives"
    }
  }
}
```

### Tip token with scope and alias (Component Colors, Typography, Effects, etc.)
```json
{
  "$type": "number",
  "$value": 16,
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
- `targetVariableSetName` — exact collection name: `Primitives`, `Theme`, `Component Colors`, etc.

**Every non-primitive token must have aliasData.** No exceptions. Dark mode tokens, Typography tokens, Component Colors, Effects numeric tokens — all must have aliasData.

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

Ask the user which format during questionnaire — label it "Code Syntax format for Variables (Tokens)?":

| Format | Example |
|---|---|
| CSS custom properties | `--color-button-primary-background` |
| Tailwind | `color-button-primary-background` |
| JavaScript / camelCase | `colorButtonPrimaryBackground` |
| Android / XML | `color_button_primary_background` |
| iOS / Swift | `ColorButtonPrimaryBackground` |

Apply user's chosen format consistently to every `com.figma.codeSyntax.WEB` value. Apply prefix if user specified one (e.g. `--ds-color-button-primary-background`).

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

## ZIP File Structure

```
Primitives.zip        → Value.tokens.json
Effects.zip           → light.tokens.json, dark.tokens.json
Theme.zip             → light.tokens.json, dark.tokens.json
Density.zip           → compact.tokens.json, comfortable.tokens.json, spacious.tokens.json
Layout.zip            → xs.tokens.json, sm.tokens.json, md.tokens.json, lg.tokens.json, xl.tokens.json, xxl.tokens.json
Typography.zip        → Value.tokens.json
Semantic.zip          → Value.tokens.json
ComponentColors.zip   → Value.tokens.json
ComponentDimensions.zip → mobile.tokens.json, tablet.tokens.json, desktop.tokens.json
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
- [ ] Every non-primitive token has `com.figma.aliasData` with all 3 required fields
- [ ] `targetVariableName` uses slashes: `color/grey/900` not `color.grey.900`
- [ ] `targetVariableSetName` matches collection name exactly
- [ ] `targetVariableSetId` is NOT present (omit entirely)
- [ ] All color `$value` are objects — never bare hex strings
- [ ] All string tokens have `"com.figma.type": "string"`
- [ ] All files end with `$metadata.modeName`

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

### Semantic (4-layer only)
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
- [ ] Variable IDs are unique per mode (NOT reused across light and dark)

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
