---
name: figma-variables-tokens-generator
description: >
  Generate a fully connected design token system instantly from a chat prompt.
  Supports everything from a simple 1-tier flat architecture, to 2/3-tier systems 
  (Primitives, Semantic with light/dark modes, Component Colors), all the way up to an 
  enterprise 4-tier setup (Primitives, Theme, Semantic, Component Colors + optional collections). The AI will use a 
  dedicated plugin ([Variables Tokens Collections Importer](https://www.figma.com/community/plugin/1619733963699677957)) to instantly 
  get all your variables cleanly generated. View the full documentation and 
  repository to learn more: https://github.com/Shanmus4/figma-variables-tokens-generator. 
  Triggered when user asks to create Figma variables, design tokens, a design system, 
  "Figma token export", "variables for Figma", or any request to set up colours/spacing/
  typography as Figma variables.
---

# Figma Variables Tokens Generator

Generate production-ready Figma Variables JSON ZIPs that import with zero errors.
Approach each system as both senior product designer and senior frontend engineer.
Enforce ID stability across modes and absolute path normalization throughout.

## Non-Negotiable Generation Invariants

These rules apply to every architecture, every collection, every naming style, and every user input combination.

1. **One canonical token path per variable**
   - A token path must have exactly one canonical representation across:
     - planning/data maps
     - `prebuild_ids()`
     - `create_token()`
     - emitted JSON nesting keys
     - `aliasData.targetVariableName`
     - validation registries
   - Never preserve one casing in JSON and a different casing in the registry.
   - Never let alias targets be normalized differently from emitted variable names.

2. **Variable paths are architecture data, not code syntax**
   - `com.figma.codeSyntax` may be camelCase, kebab-case, CSS custom properties, Android, or iOS.
   - The token path itself must remain a stable collection path.
   - Do not convert token paths to match code syntax conventions.
   - Preserve semantic separators exactly as required by the references: for example `link-hover`, `on-brand`, `on-surface-variant`, `lineHeight`, `letterSpacing`, `borderWidth`, `minWidth`, `maxWidth`.

3. **Literal path preservation**
   - When a reference file defines a path literally, emit that path literally.
   - Do not silently rewrite kebab-case to camelCase or remove hyphens from semantic names.
   - Component and custom collections may introduce new paths, but once chosen, that spelling must remain identical end-to-end.

4. **Artifact-level validation is mandatory**
   - Do not trust only the internal registry.
   - After building all files, flatten the actual emitted JSON keys from every collection and validate every alias target against those emitted paths.
   - A build is not safe unless the emitted JSON graph and the internal registry agree exactly.

5. **Scope correctness is mandatory**
   - Validate scopes from the emitted artifact, not just helper intent.
   - `text/*` and all text-role descendants must resolve to `TEXT_FILL`.
   - `border/*` and border-role descendants must resolve to `STROKE`.
   - `icon/*` must resolve to `SHAPE_FILL` + `STROKE`.
   - `shadow/*/color` must resolve to `EFFECT_COLOR`.
   - Numerical typography paths must resolve to `FONT_SIZE`, `LINE_HEIGHT`, `LETTER_SPACING`.
   - If a path is ambiguous, add an explicit rule before generating. Never rely on a broad fill fallback for semantic text or border tokens.

6. **Coverage floors are contractual**
   - If the user selected Lean, Standard, or Enterprise, the generated token inventory must satisfy that density floor in the relevant references.
   - Do not under-generate because a manual data map happened to stop early.
   - Theme/Semantic/Component outputs must be derived from the required path inventories first, then extended as needed.

7. **Backfilling prevents absence, not identity drift**
   - Backfill missing parent values before saving parent collections.
   - But do not assume backfilling solves path-casing, path-spelling, or alias-name mismatches.
   - Missing token and mismatched token are different failure classes and must be validated separately.

**Output format:** Deliver only `.zip` files containing the JSON tokens. Do not output `.skill` files or dump raw Python scripts — users expect ready-to-import ZIPs, not code, and dumping scripts into the chat causes context truncation that breaks the generation.

## Local IDE / CLI Output Rule

When running in a local IDE or CLI workspace:
- Always create an `exports/` folder if it does not exist
- Save the final token ZIP inside `exports/`
- Do not scatter generated artifacts in the project root
- Do not create extra manifests, debug JSON files, helper reports, or generator scripts unless the user explicitly asked for them or they are required to recover from a generation failure

Default expectation:
- one final ZIP in `exports/`
- minimal additional files

## Read Order — STAGED LOADING

To prevent context pollution, read only the files required for your current load stage:

### Load Stage 1: Discovery & Strategy (Read at Turn 1)
| # | File | Purpose |
|---|------|---------|
| 1 | `instructions/01-interview-setup.md` | Initial setup & Turns 1–3 |
| 2 | `instructions/02-questionnaire-and-generation.md` | Questionnaire Turns 4–10, generation |
| 3 | `references/01-architecture.md` | **Mandatory Strategy:** Understanding Tiers and alias rules. |

### Load Stage 2: Architecture Confirmation (Read before Phase 2)
| # | File | Purpose |
|---|------|---------|
| 4 | `references/05a-collections-core.md` | Design specs for Core collections |
| 5 | `references/05b-collections-semantic-components.md` | Design specs for Semantic/Component collections |

### Load Stage 3: Generation Logic (Read before Phase 3)
| # | File | Purpose |
|---|------|---------|
| 6 | `references/02-scoping-rules.md` | Technical scoping tables |
| 7 | `references/03-json-format.md` | Exact W3C JSON structure |
| 8 | `references/04-primitives.md` | Raw hex/spacing/font data |
| 9 | `references/06-generator-utility.md` | Python generation script patterns |
| 10 | `scripts/generator_core.py` | Executable Python engine (for local/IDE environments) |

### Load Stage 4: Delivery & Handoff (Read after ZIP delivery and token count reporting are complete)
| # | File | Purpose |
|---|------|---------|
| 11| `instructions/03-import-and-handoff.md` | Import guide & ZIP reference table |

> Do not read Load Stage 3 implementation files (scoping rules, JSON format, generator utility) until the interview is 100% complete. Reading them early fills context with technical data that is not needed yet.
