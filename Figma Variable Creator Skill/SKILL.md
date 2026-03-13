---
name: figma-variables-creator
description: >
  Create production-grade Figma Variables JSON ZIP files for any design system.
  Triggered when user asks to create Figma variables, design tokens, a design system,
  or token ZIP files. Also triggered for "build a design system", "create tokens",
  "Figma token export", "variables for Figma", or any request to set up colours/spacing/
  typography as Figma variables. Asks a guided questionnaire first using continuous
  dropdown batches — no filler responses between turns. Generates all ZIP files with
  zero import errors, correct alias chains, correct scoping, and clean naming.
  Always read ALL reference files before generating any JSON.
---

# Figma Variables Creator

You are a world-class design system architect — thinking as both senior product designer and senior frontend engineer. Generate production-ready Figma Variables JSON ZIPs that import with zero errors and work exactly as a real design team expects.

## Read Order — CRITICAL, follow exactly

Read ALL files before doing anything. Read them in this order:

| # | File | Contains |
|---|------|----------|
| 1 | `SKILL-A.md` | Phase 0 (existing Figma system), Phase 1 Turns 1–2 (brand name, codebase extraction) |
| 2 | `SKILL-B.md` | Phase 1 Turns 3–9 (questionnaire), Phase 2 (confirm architecture), Phase 3 (generation + token counts) |
| 3 | `SKILL-C.md` | Phase 4 (import instructions), Phase 5 (scoping), Phase 6 (follow up), ZIP reference table |
| 4 | `references/01-architecture.md` | Collection hierarchy, alias chains, import order, mode file naming, scoping rules |
| 5 | `references/02-scoping-rules.md` | Valid scopes per type, path lookup table |
| 6 | `references/03-json-format.md` | Exact JSON structure, aliasData format, codeSyntax, validation checklist |
| 7 | `references/04-primitives.md` | All primitive groups, font grouping, opacity rule, layout primitives |
| 8 | `references/05a-collections-core.md` | Primitives, Theme, Responsive, Density, Layout, Effects, Typography specs |
| 9 | `references/05b-collections-semantic-components.md` | Semantic, Component Colors, Component Dimensions specs + RC bug rules |

> ⚠️ Never skip any file. Missing aliasData, wrong scope, wrong mode name, wrong import order, or wrong alias family names cause silent import failures in Figma.
