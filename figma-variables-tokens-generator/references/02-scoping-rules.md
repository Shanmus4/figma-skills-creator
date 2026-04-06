# Scoping Rules Reference

## The Universal Scoping Rule

**ALL tokens in ALL collections receive semantically correct scopes via `get_scope()`.** There are no exceptions. This includes Primitives, Responsive, Density, and every other parent collection.

The plugin's `autoScope` checkbox handles stripping scopes from `hiddenFromPublishing` tokens during import. The JSON must always include correct scopes so both paths work (checkbox ON or OFF).

> **Figma Behaviour Note:** When no `com.figma.scopes` key is present, Figma defaults to `ALL_SCOPES` — meaning the variable appears in every picker. This is NOT desirable for production systems. Always include explicit scopes.

## Valid Scope Strings by Variable Type

### COLOR type
| Scope | What it controls in Figma |
|---|---|
| `FRAME_FILL` | Frame and component background fills |
| `SHAPE_FILL` | Shape/vector fills |
| `TEXT_FILL` | Text layer colour |
| `STROKE` | Stroke/border colour |
| `EFFECT_COLOR` | Shadow colour, glow colour |
| `ALL_FILLS` | All fills including text — use for general-purpose colours (Primitives) and overlay/scrim |

### NUMBER type
| Scope | What it controls in Figma |
|---|---|
| `WIDTH_HEIGHT` | Fixed width and height fields |
| `GAP` | Auto-layout gap between children AND all 6 padding fields |
| `CORNER_RADIUS` | Corner radius |
| `STROKE_FLOAT` | Stroke width |
| `EFFECT_FLOAT` | Shadow blur, spread, offsetX, offsetY |
| `OPACITY` | Layer opacity (0–100) |
| `FONT_SIZE` | Font size |
| `LINE_HEIGHT` | Line height |
| `LETTER_SPACING` | Letter spacing / tracking |
| `PARAGRAPH_SPACING` | Paragraph spacing |
| `PARAGRAPH_INDENT` | Paragraph indent |

### STRING type
| Scope | What it controls in Figma |
|---|---|
| `FONT_FAMILY` | Font family picker |
| `FONT_STYLE` | Font weight/style picker |
| `TEXT_CONTENT` | Text layer content override |

### BOOLEAN type
| Scope | What it controls in Figma |
|---|---|
| `ALL_SCOPES` | Layer visibility — **the ONLY valid use of ALL_SCOPES for booleans** |

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
| `/paddingX`, `/paddingY`, `/padding/`, `/padding.top`, etc. | number | `["GAP"]` |
| `/gap` | number | `["GAP"]` |
| `/radius` | number | `["CORNER_RADIUS"]` |
| `/borderWidth`, `/border/width/` | number | `["STROKE_FLOAT"]` |
| `/fontSize`, `/font/size/` | number | `["FONT_SIZE"]` |
| `/lineHeight`, `/font/lineHeight/` | number | `["LINE_HEIGHT"]` |
| `/letterSpacing`, `/font/letterSpacing/` | number | `["LETTER_SPACING"]` |
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

1. **Alpha in a colour value** — `"alpha": 0.24` baked into the colour object. This is how `primitives.color.black.opacity.24` works. It's a COLOR type. No OPACITY scope needed.

2. **OPACITY scope** — a NUMBER type token (0–100) that drives Figma's layer opacity field.

## Python get_scope Helper

```python
def get_scope(path: str, token_type: str, is_primitive: bool = False) -> list:
    """Returns correct Figma scope(s). Raises ValueError if unknown."""
    p = path.lower()

    if token_type == "color":
        # Primitives: ALL_FILLS (raw colours usable anywhere)
        if is_primitive: return ["ALL_FILLS"]
        if "/shadow/" in p and p.endswith("/color"): return ["EFFECT_COLOR"]
        if "/icon/" in p:                             return ["SHAPE_FILL", "STROKE"]
        if any(x in p for x in ["/text/", "/label/", "/on-"]): return ["TEXT_FILL"]
        if any(x in p for x in ["/border/", "/outline/"]): return ["STROKE"]
        if any(x in p for x in ["/background/", "/surface/", "/fill/",
                                  "/container/", "/scrim/", "/overlay/"]):
            return ["FRAME_FILL", "SHAPE_FILL"]
        return ["FRAME_FILL", "SHAPE_FILL"]  # safe colour fallback

    if token_type == "number":
        if any(x in p for x in ["/shadow/blur", "/shadow/spread",
                                  "/shadow/offsetx", "/shadow/offsety"]):
            return ["EFFECT_FLOAT"]
        if "/blur/" in p or p.endswith("/blur"):  return ["EFFECT_FLOAT"]
        if "/opacity" in p:                        return ["OPACITY"]
        if any(x in p for x in ["/height/", "/width/", "/iconsize"]):
            return ["WIDTH_HEIGHT"]
        if any(x in p for x in ["/paddinx", "/paddingy", "/padding",
                                  "/gap"]):
            return ["GAP"]
        if "/radius" in p:         return ["CORNER_RADIUS"]
        if "/borderwidth" in p:    return ["STROKE_FLOAT"]
        if "/fontsize" in p or "/font/size/" in p:       return ["FONT_SIZE"]
        if "/lineheight" in p or "/font/lineheight/" in p:     return ["LINE_HEIGHT"]
        if "/letterspacing" in p or "/font/letterspacing/" in p:  return ["LETTER_SPACING"]
        # Primitives: spacing → GAP, layout → WIDTH_HEIGHT
        if is_primitive:
            if "/spacing/" in p: return ["GAP"]
            if "/layout/" in p: return ["WIDTH_HEIGHT"]
        raise ValueError(f"Unknown number scope for: {path}")

    if token_type == "string":
        if "/fontfamily" in p or "/font/family/" in p:    return ["FONT_FAMILY"]
        if "/fontstyle" in p or "/fontweight" in p or "/font/weight/" in p: return ["FONT_STYLE"]
        return ["TEXT_CONTENT"]

    if token_type == "boolean":
        return ["ALL_SCOPES"]

    raise ValueError(f"Unknown type '{token_type}' for: {path}")
```

**Always call this function for ALL tokens (including Primitives). Never hardcode scopes inline. Pass `is_primitive=True` for Primitives collection tokens.**
