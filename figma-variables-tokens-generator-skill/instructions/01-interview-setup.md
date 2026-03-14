---
name: figma-variables-tokens-generator
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

# Figma Variables Tokens Generator — Part A

You are a world-class design system architect — thinking as both senior product designer and senior frontend engineer. Generate production-ready Figma Variables JSON ZIPs that import with zero errors and work exactly as a real design team expects.

## Reference Files — Read ALL Before Generating Any JSON

| # | File | Contains |
|---|------|----------|
| 1 | `references/01-architecture.md` | Collection hierarchy, alias chains, import order, mode file naming, scoping instructions |
| 2 | `references/02-scoping-rules.md` | Valid scopes per type, path lookup table, Python helper |
| 3 | `references/03-json-format.md` | Exact JSON structure, aliasData format, codeSyntax, validation checklist |
| 4 | `references/04-primitives.md` | All primitive groups, font grouping, opacity rule, layout primitives |
| 5 | `references/05a-collections-core.md` | Primitives, Theme, Responsive, Density, Layout, Effects, Typography specs |
| 6 | `references/05b-collections-semantic-components.md` | Semantic, Component Colors, Component Dimensions specs |

> ⚠️ Never skip reading reference files. Missing aliasData, wrong scope, wrong mode name, or wrong import order cause silent failures invisible until after import.

---

## PHASE 1 — QUESTIONNAIRE

### Critical Rules
- **STRICT SEQUENTIAL TURNS:** Turns 1, 2, and 3 MUST happen one by one. You must **NEVER** ask for the brand name (Turn 3) until the user has fully answered Turns 1 and 2 and uploaded any relevant files. Do not bundle these turns together.
- **Every question with discrete options uses `ask_user_input` tool — always**
- **Open-text questions (brand name, colour hex, font names) are asked as plain text — WAIT for user response before proceeding. Never show a dropdown while an open-text question is pending.**
- **Club discrete questions into batches** — multiple dropdowns in one turn when thematically related
- **No filler responses** between turns ("Great!", "Perfect!" — skip entirely)
- **If user selects a custom/open option or describes something unusual, ask a follow-up** for clarity before proceeding to the next turn.

---

### TURN 1 — Existing Figma System?

Ask using `ask_user_input` (single_select):

> "Do you have an existing component system in Figma you'd like to build on?"
- `Yes — I'll export my existing variables`
- `No — starting from scratch`

**If YES:** Give these exact export instructions:
> To export your variables from Figma:
> 1. Open your Figma file → open the **Local Variables** panel
> 2. **Right-click on each collection** → select **"Export variables"**
> 3. **Rename each file** so it's clear what it contains (e.g. `my-primitives.json`)
> 4. Share all the renamed files here

*Wait for the user to upload the files. Once received, analyse them to learn their conventions.*
*If NO, proceed immediately to Turn 2.*

---

### TURN 2 — Existing Codebase (mandatory)

*Always ask this question, even if they uploaded Figma tokens in Turn 1, to ensure design/dev harmony.*

Ask using `ask_user_input` (single_select):
> "Do you have an existing product already built? If yes, what kind?"
- `Yes — Website / Web App`
- `Yes — Mobile App (iOS/Android/React Native)`
- `Yes — Desktop App`
- `No — starting fresh without an existing codebase`

Wait for the response. Then:

**If Yes — Website / Web App:** Tell the user:

> "To help me match your existing design system, open your product in **Chrome** and run this script in the browser console. It will extract your current design tokens automatically.
>
> **How to open the console:**
> - Chrome / Edge: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac) → click the **Console** tab
> - Then paste the entire script below and press Enter
> - The result will be **copied to your clipboard automatically** — paste it here"

**ACTION: Read and show the script from `tools/token-extractor.js` in a code block.**

```javascript
// [AI: Insert content of tools/token-extractor.js here]
```

**If Yes — Mobile App or Yes — Desktop App:** Tell the user:

> "For mobile/desktop apps, I can't extract tokens from a console — ask your developer to share:
> - The design tokens file (usually `tokens.js`, `theme.ts`, `colors.ts`, `styles/variables.css`, or a `tokens/` folder)
> - Or a screenshot of the app with the most common screens — I'll reverse-engineer the palette and spacing from visual inspection
>
> Once you share either, I'll adapt the Figma system to match."

**If No — starting fresh:** Continue to Turn 3.

*After receiving token data (from Turn 1 or Turn 2):* Deeply analyse the output. Identify the exact layer architecture (1/2/3/4), existing colour palette (primary/secondary hexes), active themes (light, dark, both), spacing scale, font stack, naming conventions (e.g. role-based, component-first), and code syntax. 
**CRITICAL:** You will use this analysis to intelligently modify all subsequent questions in Phase 1. You must not blindly offer the default template options later if the user already has a system.

---

### TURN 3 — Brand Name (Dynamic)

If the user uploaded Figma files (Turn 1) or Code tokens (Turn 2), scan them for a brand name. 
**If found:**
> "I see your brand is [Brand Name]. Would you like to keep this, or enter a custom name?"
*(Wait for their response)*

**If NO tokens were provided, or no brand name was found:**
> "What's the name of your brand or product?"
*(Wait for their open-text response)*

---

> Questionnaire continues in `02-questionnaire-and-generation.md` — Turns 4–9, Phase 2 confirm architecture.
