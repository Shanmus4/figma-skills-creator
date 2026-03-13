## PHASE 4 — IMPORT INSTRUCTIONS

1. Open Figma → Local Variables panel
2. Import ZIPs in the **exact order listed in Phase 2** — each collection must exist before anything that aliases it
3. For each ZIP: click **+ next to Collections** (top of the Local Variables panel) → name the collection exactly as shown → import the JSON file(s)
4. After import: verify alias chains resolve correctly by opening a token and checking its chain

---

## PHASE 5 — SCOPING INSTRUCTIONS

After all ZIPs are imported, configure which collections appear in Figma's variable pickers.

**Two separate controls in Figma — both need to be set:**

1. **Scoping** (per variable) — controls which property types the variable appears in. Set on each variable via Edit Variable → Scopes. Already set correctly in the generated JSON.
2. **Hide from publishing** (per collection) — controls what library consumers see. Set per collection. Already set on Primitives via `hiddenFromPublishing: true` in the JSON.

**What to turn off scoping for** (so intermediate collections don't clutter pickers):

The goal is that designers only see tip collections in pickers. Intermediate collections should have their scoping turned off — meaning set every variable in that collection to **no scopes** (empty scope list), so they disappear from all property pickers.

The fastest way in Figma: select all variables in the collection → Edit Variable → remove all scopes.

Provide this guidance based on the user's layer choice:

**1-layer:** Nothing to change — Primitives is the only collection, designers use it directly.

**2-layer:** Turn off scoping on **Primitives only**. Theme is the colour tip in 2-layer — keep it visible.

**3-layer:** Turn off scoping on **Primitives** and **Theme**. Suggested — verify first. If you have frames where you applied Theme tokens directly, re-enable scoping on Theme selectively for those token paths.
Tip collections (keep scoping on): Component Colors, Component Dimensions, Typography, Responsive, Density, Layout, Effects.

**4-layer:** Turn off scoping on **Primitives**, **Theme**, and **Semantic**. Same caveat — check usage before turning off Semantic.
Tip collections (keep scoping on): Component Colors, Component Dimensions, Typography, Responsive, Density, Layout, Effects.

> Note: "Hide from publishing" and "turn off scoping" are two different things. Publishing controls what external library consumers see. Scoping controls what appears in the variable picker when a designer applies a variable to a layer property. You need to manage both. The generated JSON handles Primitives `hiddenFromPublishing: true` already — do the rest manually after import.

---

## PHASE 6 — FOLLOW UP

Ask: "Anything you'd like to change, add, or adjust?"

---

## Collection Names and ZIP Reference

| ZIP | Figma collection name | Mode file(s) |
|---|---|---|
| `Primitives.zip` | `Primitives` | `primitives.tokens.json` |
| `Theme.zip` | `Theme` | `light.tokens.json`, `dark.tokens.json` |
| `Responsive.zip` | `Responsive` | `mobile.tokens.json`, `tablet.tokens.json`, `desktop.tokens.json` |
| `Density.zip` | `Density` | `compact.tokens.json`, `comfortable.tokens.json`, `spacious.tokens.json` |
| `Layout.zip` | `Layout` | `xs.tokens.json` … `xxl.tokens.json` |
| `Effects.zip` | `Effects` | `effects.tokens.json` |
| `Typography.zip` | `Typography` | `typography.tokens.json` |
| `Semantic.zip` | `Semantic` | `semantic.tokens.json` |
| `ComponentColors.zip` | `Component Colors` | `component-colors.tokens.json` |
| `ComponentDimensions.zip` | `Component Dimensions` | `component-dimensions.tokens.json` |
