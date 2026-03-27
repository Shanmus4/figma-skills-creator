# Figma Variables — Handoff

### 🏁 READ LOAD STAGE 4: Delivery & Handoff
Read this file ONLY after Generation (Turn C) and Token Count Reporting (Turn D) are complete.

## PHASE 4 — IMPORT INSTRUCTIONS

1. Open Figma → Local Variables panel
2. Import ZIPs in the **exact order shown in the Architecture Summary you confirmed before generation** — each collection must exist before anything that aliases it (Primitives first, Component Colors last)
3. For each ZIP: click **+ next to Collections** (top of the Local Variables panel) → name the collection exactly as shown → import the JSON file(s)
4. After import: verify alias chains resolve correctly by opening a token and checking its chain

---

## PHASE 5 — SCOPING INSTRUCTIONS

After all ZIPs are imported, configure which collections appear in Figma's variable pickers.

**Figma scoping note for user:**
Provide this exact guidance to the user before listing their collections:
> "Because of a Figma JSON import limitation, 'no scope' variables default to 'all scopes' upon import. You must manually turn off scoping (select all variables → remove all scopes) for collections that act purely as alias parents."

**Dynamic Scoping Output Logic:**
Generate a specific list of collections the user must turn off based on their exact generated architecture. Use this logic:

- **1-Tier:** "Do NOT turn off any scopes. Primitives is your only collection, so it must remain visible in pickers."
- **2-Tier:** "Turn off scopes for **Primitives**."
- **3-Tier:** "Turn off scopes for **Primitives**. If you use **Theme** strictly as a parent for Component Colors, turn off its scopes too. (Keep scopes ON for Theme if you apply its tokens directly to your designs)."
- **4-Tier:** "Turn off scopes for **Primitives**. If you use **Theme** and **Semantic** strictly as parents for Component Colors, turn off their scopes too. (Keep scopes ON if you apply their tokens directly to your designs)."
- **Optional Collections (If generated):** "If you generated **Responsive** or **Density**, turn off their scopes, as they only feed into Component Dimensions/Typography and should not be picked directly."

> Note: "Hide from publishing" and "turn off scoping" are two different things. Publishing controls what external library consumers see. Scoping controls what appears in the variable picker when a designer applies a variable to a layer property. Both should be managed. The generated JSON handles `hiddenFromPublishing: true` automatically for:
> - **Always hidden:** Primitives, Responsive, Density (structural parents in every tier)
> - **3/4-Tier:** Theme (becomes a parent when Component Colors is the tip)
> - **4-Tier:** Semantic (becomes a parent when Component Colors is the tip)
> - **2-Tier:** Theme is NOT hidden — it IS the tip collection

---

## PHASE 6 — FOLLOW UP

Ask: "Anything you'd like to change, add, or adjust?"

---

## ZIP Structure Reference

| Folder (inside Master ZIP) | Figma collection name | Mode file(s) |
|---|---|---|
| `1. Primitives/` | `Primitives` | `primitives.tokens.json` |
| `2. Theme/` | `Theme` | `light.tokens.json`, `dark.tokens.json` |
| `3. Responsive/` | `Responsive` | `mobile.tokens.json`, `tablet.tokens.json`, `desktop.tokens.json` |
| `4. Density/` | `Density` | `compact.tokens.json`, `comfortable.tokens.json`, `spacious.tokens.json` |
| `5. Layout/` | `Layout` | `xs.tokens.json` … `xxl.tokens.json` |
| `6. Effects/` | `Effects` | `effects.tokens.json` |
| `7. Typography/` | `Typography` | `typography.tokens.json` |
| `8. Semantic/` | `Semantic` | `semantic.tokens.json` |
| `9. Component Colors/` | `Component Colors` | `component-colors.tokens.json` |
| `10. Component Dimensions/` | `Component Dimensions` | `component-dimensions.tokens.json` |
