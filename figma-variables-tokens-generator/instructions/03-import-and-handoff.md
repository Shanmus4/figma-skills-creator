# Figma Variables — Handoff

### 🏁 READ LOAD STAGE 4: Delivery & Handoff
Read this file ONLY after Generation (Turn C) and Token Count Reporting (Turn D) are complete.

## PHASE 4 — IMPORT INSTRUCTIONS

Tell the user:
> "Use the **Variables Tokens Collections Importer plugin** to import your ZIP. The plugin reads the numbered folder structure and imports collections in the correct dependency order automatically."

Also tell the user:
> "If the plugin reports any import errors, copy the error output and paste it back here. I can use that exact error trace to repair the token package."

Also tell the user:
> "If you want changes later, tell me what to update and re-import the revised ZIP through the same plugin. The plugin can synchronize updates over an existing design system."

> [!IMPORTANT]
> **For the AI:** The ZIP's numbered folder prefixes (e.g. `1. Primitives/`, `2. Semantic/`) are critical — the plugin uses them to determine import order. Always generate folders with correct numbering as shown in the import order tables for each tier in `01-architecture.md`.

> **Workspace output rule for local IDE/CLI environments:** Save the final ZIP to an `exports/` folder in the workspace. Do not leave the final deliverable loose in the project root unless the user explicitly asked for that.

> **ZIP structure clarification for the AI:** This is about the ZIP's internal file paths, not the workspace folder layout. The plugin reads numbered paths such as `1. Primitives/primitives.tokens.json` to determine import order. Explicit standalone empty directory records inside the ZIP are optional; the numbered file paths are the real import contract.

---

## PHASE 5 — FOLLOW UP

Ask: "Anything you'd like to change, add, or adjust?"

---

## ZIP Structure Reference

The folder numbering is DYNAMIC — it depends on the user's chosen tier architecture. Numbering must have NO GAPS (skip collections that aren't generated).

### 2-Tier ZIP
| Folder | Figma collection name | Mode file(s) |
|---|---|---|
| `1. Primitives/` | `Primitives` | `primitives.tokens.json` |
| `2. Semantic/` | `Semantic` | `light.tokens.json`, `dark.tokens.json` |
| `3. Responsive/` | `Responsive` | `mobile.tokens.json`, `tablet.tokens.json`, `desktop.tokens.json` |
| `4. Density/` | `Density` | `compact.tokens.json`, `comfortable.tokens.json`, `spacious.tokens.json` |
| `5. Layout/` | `Layout` | `xs.tokens.json` … `xxl.tokens.json` |
| `6. Effects/` | `Effects` | `effects.tokens.json` |
| `7. Typography/` | `Typography` | `typography.tokens.json` |

### 3-Tier ZIP
| Folder | Figma collection name | Mode file(s) |
|---|---|---|
| `1. Primitives/` | `Primitives` | `primitives.tokens.json` |
| `2. Semantic/` | `Semantic` | `light.tokens.json`, `dark.tokens.json` |
| `3. Responsive/` | `Responsive` | `mobile.tokens.json`, `tablet.tokens.json`, `desktop.tokens.json` |
| `4. Density/` | `Density` | `compact.tokens.json`, `comfortable.tokens.json`, `spacious.tokens.json` |
| `5. Layout/` | `Layout` | `xs.tokens.json` … `xxl.tokens.json` |
| `6. Effects/` | `Effects` | `effects.tokens.json` |
| `7. Typography/` | `Typography` | `typography.tokens.json` |
| `8. Component Colors/` | `Component Colors` | `component-colors.tokens.json` |
| `9. Component Dimensions/` | `Component Dimensions` | `component-dimensions.tokens.json` |

### 4-Tier ZIP
| Folder | Figma collection name | Mode file(s) |
|---|---|---|
| `1. Primitives/` | `Primitives` | `primitives.tokens.json` |
| `2. Theme/` | `Theme` | `light.tokens.json`, `dark.tokens.json` |
| `3. Semantic/` | `Semantic` | `semantic.tokens.json` |
| `4. Responsive/` | `Responsive` | `mobile.tokens.json`, `tablet.tokens.json`, `desktop.tokens.json` |
| `5. Density/` | `Density` | `compact.tokens.json`, `comfortable.tokens.json`, `spacious.tokens.json` |
| `6. Layout/` | `Layout` | `xs.tokens.json` … `xxl.tokens.json` |
| `7. Effects/` | `Effects` | `effects.tokens.json` |
| `8. Typography/` | `Typography` | `typography.tokens.json` |
| `9. Component Colors/` | `Component Colors` | `component-colors.tokens.json` |
| `10. Component Dimensions/` | `Component Dimensions` | `component-dimensions.tokens.json` |

> **Note:** Optional collections (Density, Layout, Effects) are only included if the user selected them. When omitted, remaining collections shift up in numbering (no gaps).
