## PHASE 4 — IMPORT INSTRUCTIONS

1. Open Figma → Local Variables panel
2. Import ZIPs in the **exact order listed in Phase 2** — each collection must exist before anything that aliases it
3. For each ZIP: click **+ next to Collections** (top of the Local Variables panel) → name the collection exactly as shown → import the JSON file(s)
4. After import: verify alias chains resolve correctly by opening a token and checking its chain

---

## PHASE 5 — SCOPING INSTRUCTIONS

After all ZIPs are imported, configure which collections appear in Figma's variable pickers.

**CRITICAL FIGMA BUG EXPLANATION FOR USER:**
Provide this exact guidance to the user before listing their collections:
> "Because of a Figma JSON import limitation, 'no scope' variables default to 'all scopes' upon import. You must manually turn off scoping (select all variables → remove all scopes) for collections that act purely as alias parents."

**Dynamic Scoping Output Logic:**
Generate a specific list of collections the user must turn off based on their exact generated architecture. Use this logic:

- **1-layer:** "Do NOT turn off any scopes. Primitives is your only collection, so it must remain visible in pickers."
- **2-layer:** "Turn off scopes for **Primitives**."
- **3-layer:** "Turn off scopes for **Primitives**. If you use **Theme** strictly as a parent for Component Colors, turn off its scopes too. (Keep scopes ON for Theme if you apply its tokens directly to layers)."
- **4-layer:** "Turn off scopes for **Primitives**. If you use **Theme** and **Semantic** strictly as parents for Component Colors, turn off their scopes too. (Keep scopes ON if you apply their tokens directly to layers)."
- **Optional Collections (If generated):** "If you generated **Responsive** or **Density**, turn off their scopes, as they only feed into Component Dimensions/Typography and should not be picked directly."

> Note: "Hide from publishing" and "turn off scoping" are two different things. Publishing controls what external library consumers see. Scoping controls what appears in the variable picker when a designer applies a variable to a layer property. Both should be managed. The generated JSON handles Primitives `hiddenFromPublishing: true` already.

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
