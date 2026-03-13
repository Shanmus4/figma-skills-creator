# Scoping Rules Reference

## The Key-Absent Rule

Primitives and all intermediate chain tokens have **no `com.figma.scopes` key at all** — not an empty array, not `null`. The key must be completely absent from the JSON object.

```json
// ✅ CORRECT — primitive or middle-chain token
{
  "$type": "number",
  "$value": 16,
  "$extensions": {
    "com.figma.variableId": "VariableID:10:42",
    "com.figma.hiddenFromPublishing": true
  }
}

// ❌ WRONG — empty array still triggers scope picker
{
  "$extensions": {
    "com.figma.scopes": []
  }
}

// ❌ WRONG — ALL_SCOPES on a number primitive
{
  "$extensions": {
    "com.figma.scopes": ["ALL_SCOPES"]
  }
}
```

## Valid Scope Strings by Variable Type

### COLOR type
| Scope | What it controls in Figma |
|---|---|
| `FRAME_FILL` | Frame and component background fills |
| `SHAPE_FILL` | Shape/vector fills |
| `TEXT_FILL` | Text layer colour |
| `STROKE` | Stroke/border colour |
| `EFFECT_COLOR` | Shadow colour, glow colour |
| `ALL_FILLS` | All fills including text — use only for general-purpose overlay/scrim colours |

### NUMBER type
| Scope | What it controls in Figma |
|---|---|
| `WIDTH_HEIGHT` | Fixed width and height fields |
| `GAP` | Auto-layout gap between children AND all 6 padding fields (x, y, top, bottom, left, right) |
| `CORNER_RADIUS` | Corner radius |
| `STROKE_FLOAT` | Stroke width |
| `EFFECT_FLOAT` | Shadow blur, spread, offsetX, offsetY |
| `OPACITY` | Layer opacity (0–100) — NOTE: this is a NUMBER token for the opacity field, separate from alpha in a colour value |
| `FONT_SIZE` | Font size |
| `LINE_HEIGHT` | Line height |
| `LETTER_SPACING` | Letter spacing / tracking |
| `PARAGRAPH_SPACING` | Paragraph spacing |
| `PARAGRAPH_INDENT` | Paragraph indent |

### STRING type
| Scope | What it controls in Figma |
|---|---|
| `FONT_FAMILY` | Font family picker |
| `FONT_STYLE` | Font weight/style picker — value is a named string: "Regular", "Medium", "SemiBold", "Bold" etc |
| `TEXT_CONTENT` | Text layer content override |

### BOOLEAN type
| Scope | What it controls in Figma |
|---|---|
| `ALL_SCOPES` | Layer visibility — **this is the ONLY valid use of ALL_SCOPES** |

## Scope Lookup by Token Path

Use this table. Never guess. If a path doesn't match, add it rather than defaulting to ALL_SCOPES.

| Path contains | Type | Scope |
|---|---|---|
| `/background/`, `/surface/`, `/fill/`, `/container/`, `/scrim/`, `/overlay/` | color | `["FRAME_FILL", "SHAPE_FILL"]` |
| `/text/`, `/label/`, `/on-` | color | `["TEXT_FILL"]` |
| `/border/`, `/outline/` | color | `["STROKE"]` |
| `/icon/` | color | `["SHAPE_FILL", "STROKE"]` |
| `/shadow/color`, `/shadow/*/color` | color | `["EFFECT_COLOR"]` ← never FRAME_FILL |
| general overlay / scrim with opacity | color | `["ALL_FILLS"]` |
| `/shadow/blur`, `/shadow/spread`, `/shadow/offsetX`, `/shadow/offsetY` | number | `["EFFECT_FLOAT"]` ← never WIDTH_HEIGHT |
| `/blur/` (background blur) | number | `["EFFECT_FLOAT"]` |
| `/shadow/opacity`, `/opacity` | number | `["OPACITY"]` |
| `/height/`, `/width/`, `/iconSize` | number | `["WIDTH_HEIGHT"]` |
| `/paddingX`, `/paddingY`, `/padding/`, `/padding.top`, `/padding.bottom`, `/padding.left`, `/padding.right` | number | `["GAP"]` ← padding is GAP scope in Figma autolayout |
| `/gap` | number | `["GAP"]` |
| `/radius` | number | `["CORNER_RADIUS"]` |
| `/borderWidth`, `/border/width/` | number | `["STROKE_FLOAT"]` |
| `/fontSize`, `/font/size/`, `/responsive/font/size/` | number | `["FONT_SIZE"]` |
| `/lineHeight`, `/font/lineHeight/`, `/responsive/font/lineHeight/` | number | `["LINE_HEIGHT"]` |
| `/letterSpacing`, `/font/letterSpacing/`, `/responsive/font/letterSpacing/` | number | `["LETTER_SPACING"]` |
| `/responsive/radius/`, `/responsive/borderWidth/` follow normal radius/borderWidth rules | number | `["CORNER_RADIUS"]` / `["STROKE_FLOAT"]` |
| `/fontFamily`, `/font/family/` | string | `["FONT_FAMILY"]` |
| `/fontStyle`, `/fontWeight`, `/font/weight/` | string | `["FONT_STYLE"]` |
| `/state/`, boolean visibility | boolean | `["ALL_SCOPES"]` |

## Critical Shadow Rule

Shadow tokens are the most commonly wrong. Memorise:
- Shadow **colour** → `EFFECT_COLOR` (COLOR type) — never FRAME_FILL, never SHAPE_FILL
- Shadow **blur, spread, offsetX, offsetY** → `EFFECT_FLOAT` (NUMBER type) — never WIDTH_HEIGHT
- Background **blur** → `EFFECT_FLOAT` (NUMBER type) — never WIDTH_HEIGHT

## Opacity in Colour Values vs OPACITY Scope

These are two completely different things:

1. **Alpha in a colour value** — `"alpha": 0.24` baked into the colour object. This is how `primitives.color.black.opacity.24` works. It's a COLOR type. No OPACITY scope needed — the alpha IS the value.

2. **OPACITY scope** — a NUMBER type token (0–100) that drives Figma's layer opacity field. Used when you want to control the entire layer's opacity as a variable.

## Python get_scope Helper

```python
def get_scope(path: str, token_type: str) -> list:
    """Returns correct Figma scope(s). Raises ValueError if unknown."""
    p = path.lower()

    if token_type == "color":
        if "/shadow/" in p and p.endswith("/color"): return ["EFFECT_COLOR"]
        if "/icon/" in p:                             return ["SHAPE_FILL", "STROKE"]
        if any(x in p for x in ["/text/", "/label/", "/on-"]): return ["TEXT_FILL"]
        if any(x in p for x in ["/border/", "/outline/"]): return ["STROKE"]
        if any(x in p for x in ["/background/", "/surface/", "/fill/",
                                  "/container/", "/scrim/", "/overlay/"]):
            return ["FRAME_FILL", "SHAPE_FILL"]
        return ["FRAME_FILL", "SHAPE_FILL"]  # safe colour fallback

    if token_type == "number":
        # Effects — must be EFFECT_FLOAT, never WIDTH_HEIGHT
        if any(x in p for x in ["/shadow/blur", "/shadow/spread",
                                  "/shadow/offsetx", "/shadow/offsety"]):
            return ["EFFECT_FLOAT"]
        if "/blur/" in p or p.endswith("/blur"):  return ["EFFECT_FLOAT"]
        if "/opacity" in p:                        return ["OPACITY"]
        # Fixed dimensions
        if any(x in p for x in ["/height/", "/width/", "/iconsize"]):
            return ["WIDTH_HEIGHT"]
        # All padding and gap → GAP scope
        if any(x in p for x in ["/paddinx", "/paddingy", "/padding",
                                  "/gap"]):
            return ["GAP"]
        if "/radius" in p:         return ["CORNER_RADIUS"]
        if "/borderwidth" in p:    return ["STROKE_FLOAT"]
        if "/fontsize" in p:       return ["FONT_SIZE"]
        if "/lineheight" in p:     return ["LINE_HEIGHT"]
        if "/letterspacing" in p:  return ["LETTER_SPACING"]
        raise ValueError(f"Unknown number scope for: {path}")

    if token_type == "string":
        if "/fontfamily" in p:                      return ["FONT_FAMILY"]
        if "/fontstyle" in p or "/fontweight" in p: return ["FONT_STYLE"]
        return ["TEXT_CONTENT"]

    if token_type == "boolean":
        return ["ALL_SCOPES"]

    raise ValueError(f"Unknown type '{token_type}' for: {path}")
```

**Always call this function. Never hardcode scopes inline.**
