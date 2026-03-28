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
- **If it dictates semantic usage** (e.g., a custom set of "border-subtle" variants): it should alias `Theme` or `Semantic`.
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

Since all core parents (Primitives, Theme, etc.) will have already been imported by the Figma plugin, the aliases inside your custom collection will resolve perfectly.

- Output: `11. [Custom Collection Name]/`
- Output: `12. [Another Custom Collection Name]/`

## 6. Scoping
The custom collection should be given a semantically correct scope (e.g., `FRAME_FILL` for backgrounds, `GAP` for spacing, `TEXT_CONTENT` for strings, etc.). Use the standard scoping rules defined in `02-scoping-rules.md`.

## 7. Edge Cases & Backfilling (Safety Checks)

If your Custom Collection relies on a new specific raw value (e.g., a specific team hex color, or a specific numeric value) that does NOT exist in the standard `Primitives` scale:

1. **You MUST add that raw value to the Primitives collection first.**
2. If you attempt to alias a path (e.g. `alias_set="Primitives"`) and the target path isn't in your Primitives registry, the `create_token()` Python utility will automatically throw a `KeyError: MISSING PRIMITIVE`. 
3. Do not try to bypass this error! If it triggers, you must inject the missing primitive into the Primitives queue and re-run the generation.

*Note: String tokens do NOT require backfilling in Primitives because they take their raw value directly in the `$value` field and don't need to alias anything.*
