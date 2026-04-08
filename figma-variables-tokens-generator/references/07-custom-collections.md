# Custom Collections Reference

When the user requests an arbitrary custom collection (e.g. "Teams", "Elevation", "Z-Index", "Shadows", etc.) in the questionnaire, you must rely on the rules in this file to construct it. The standard reference files only cover the 10 core collections.

## 1. ID Namespaces
Use the `90–99` range for namespaces for any custom collections to avoid colliding with the core 1-80 collections.
- First custom collection: namespace `90`
- Second custom collection: namespace `91`
- etc.

## 2. Parent Dependencies & Alias Chains
Custom collections MUST alias a structural parent unless they are deliberately hardcoded lists (which is rare).
- **If it defines raw hex colors** (e.g., brand team palettes): it should alias `Primitives`.
- **If it dictates semantic usage** (e.g., a custom set of "border-subtle" variants): it should alias the mode-switching collection — `Semantic` (2/3-Tier) or `Theme` (4-Tier).
- **If it dictates spacing/sizing**: it should alias `Primitives`, `Density`, or `Responsive`.

> **CRITICAL RULE:** Do NOT alias a custom collection directly to Component Colors or other tip collections. Custom collections usually sit in the middle of the chain.

## 3. String Tokens
String tokens (like text content overrides, team names, labels, etc.) are fully supported.
- You **MUST** include `"com.figma.type": "string"` in the token's `$extensions`.
- The `com.figma.scopes` for generic string tokens should be `["TEXT_CONTENT"]` unless it's specifically a font family/weight.
- String tokens use the **real string value** in `$value` (e.g., `"$value": "Real Madrid"`).

## 4. Multi-Mode Pre-build Rule (CRITICAL)
If a custom collection has multiple modes (e.g., 10 different teams, or 3 different elevation themes):
**You MUST use the `prebuild_ids` utility pattern** to guarantee that every mode file leverages the EXACT same `variableId` for the same token path. Figma relies on the ID to match modes together.

```python
# Call ONCE before building any modes for the custom collection
custom_paths = ["color/team/primary", "color/team/secondary", "name"]
custom_id_map = prebuild_ids(gen, custom_paths, ns=90)

# Then pass this ID map when creating tokens for EACH mode:
vid = gen.resolve_id(custom_id_map, path)
token = gen.create_token(..., vid=vid)
```

## 5. ZIP Import Order & Numbering
The user must import collections in dependency order. The safest and easiest approach is to append custom collections to the absolute end of the numbering sequence after the core 10 collections. 

Since all core parents (Primitives, Semantic, Theme, etc.) will have already been imported by the Figma plugin, the aliases inside your custom collection will resolve perfectly.

- Output: `11. [Custom Collection Name]/`
- Output: `12. [Another Custom Collection Name]/`

## 6. Scoping
The custom collection should be given a semantically correct scope (e.g., `FRAME_FILL` for backgrounds, `GAP` for spacing, `TEXT_CONTENT` for strings, etc.). Use the standard scoping rules defined in `02-scoping-rules.md`.

## 7. Edge Cases & Backfilling (Safety Checks)

If your Custom Collection relies on a new specific raw value (e.g., a specific team hex color, a numeric sizing value, or a **raw string value** like "Flixnet Sports") that does NOT exist in the standard `Primitives` scale:

1. **You MUST add that raw value to the Primitives collection BEFORE saving it in Turn A.**
   - Yes, this includes Strings! E.g. `Primitives/strings/channel-name`. 
   - No custom collection can ever have a hardcoded `$value` unless it is essentially a primitive collection itself. ALL tokens in a custom collection should ideally alias Primitives.
2. When creating the custom collection later (in Turn B or C), alias the Primitives path. If the target path isn't in your Primitives registry, the `create_token()` Python utility will automatically throw a `KeyError: MISSING PRIMITIVE`.
3. Do not try to bypass this error! You must audit your custom collections during Turn A and inject the missing primitives into the Primitives queue before it is saved.

---

## 8. Dynamic Decision Checklist

For EVERY custom collection, run through this checklist in order. Don't deliberate — just answer each question and the correct architecture falls out:

### Step 1: What type of values does it hold?
Determines `$type`, `com.figma.type`, and base scope selection.
- Colors → `$type: "color"`, no extra type extension
- Numbers → `$type: "number"`, no extra type extension
- Strings → `$type: "string"`, MUST include `"com.figma.type": "string"` in extensions
- Booleans → `$type: "boolean"`, no extra type extension

### Step 2: What does it alias?
- Raw values (hex colors, font names, numbers) → alias **Primitives**
  - Backfill any missing values into Primitives BEFORE saving Primitives
- Semantic usage (surface colours, text colours, etc.) → alias **Semantic** (2/3-Tier) or **Theme** (4-Tier)
- Structural values (sizes per breakpoint, density levels) → alias **Responsive** or **Density**

### Step 3: Does another collection alias FROM this one?
- **YES** → `hiddenFromPublishing: true` (it's a structural parent — designers shouldn't see it directly)
- **NO** → `hiddenFromPublishing: false` (it's a final consumer — designers use it)
- **Unsure?** → Default to `true` (hidden is always safe; visible when unnecessary clutters pickers)

### Step 4: How many modes?
- **1 mode** → simple single-mode file, no prebuild needed
- **2+ modes** → MUST use `prebuild_ids()` for ID stability across mode files
  - One call to `prebuild_ids()` before building ANY mode
  - Reuse the SAME ID map for EVERY mode file

### Step 5: What scope?
Derive from the token's purpose using `02-scoping-rules.md`:
- Font family names → `FONT_FAMILY`
- Font weights → `FONT_STYLE`
- String labels/names → `TEXT_CONTENT`
- Background colours → `FRAME_FILL` + `SHAPE_FILL`
- Text colours → `TEXT_FILL`
- Border colours → `STROKE`
- Spacing/padding → `GAP`
- Numeric sizes → `WIDTH_HEIGHT` or `FONT_SIZE` (based on context)

### Step 6: Where in the ZIP order?
After ALL its alias parents. Use numbering 11+ (after the 10 core collections).

---

## 9. Scope Inference — Don't Hardcode, Derive

When the user requests a custom collection with unfamiliar token types, don't guess scopes. Follow this logic:

1. Identify what the token **controls** in the Figma UI (fill? text? stroke? size?)
2. Look up the matching scope in `02-scoping-rules.md`
3. If a token serves multiple purposes (e.g., a colour used for both fills and strokes), combine scopes: `["FRAME_FILL", "SHAPE_FILL", "STROKE"]`
4. If genuinely uncertain → use `ALL_FILLS` for colours, `ALL_SCOPES` for numbers (but this is a last resort — specific scopes are always better)

---

## 10. Reference Example: Multi-Mode Custom Collection

> [!IMPORTANT]
> This example shows the **REASONING PROCESS**, not a template to copy. The AI must apply the same checklist logic to ANY custom collection — different token types, different mode counts, different chain positions.

**Scenario**: User wants 5 brand typefaces switchable per mode, with a downstream Typography collection aliasing this custom collection.

**Decision trace (following the checklist above):**

| Step | Question | Answer |
|---|---|---|
| 1 | What type? | Font family strings → `$type: "string"`, `com.figma.type: "string"` |
| 2 | What does it alias? | Primitives/font/family/* (each mode points to a different primitive font) |
| 3 | Does something alias FROM it? | Yes (Typography aliases it) → `hiddenFromPublishing: true` |
| 4 | How many modes? | 5 → MUST use `prebuild_ids(gen, paths, ns=90)` |
| 5 | What scope? | Font family → `FONT_FAMILY` |
| 6 | ZIP order? | After Primitives, before Typography → `11. Brand Fonts/` |

**Backfill check**: Do ALL 5 font family values exist in `Primitives/font/family/*`? If any are missing (e.g., user wants "Playfair Display" but Primitives only has "Inter", "Roboto", "JetBrains Mono"), add them to Primitives BEFORE saving it.

**The same reasoning applies to**: team colour palettes (5 team modes × brand colours), white-label themes (3 client modes × full semantic palette), region-specific content (4 locale modes × string tokens), or any other multi-mode structure the user requests.

