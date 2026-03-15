# Figma Variables Tokens Generator — Part A

Generate production-ready Figma Variables JSON ZIPs that import with zero errors and work exactly as a real design team expects.

## Reference Files — Load Stage 1: Discovery & Strategy

Read these **3 files ONLY** before starting the questionnaire. Other reference files will be requested at specific stages (Load Stage 2 and 3).

| # | File | Purpose |
|---|------|---------|
| 1 | `instructions/01-interview-setup.md` | (This file) Initial turns & extraction |
| 2 | `instructions/02-questionnaire-and-generation.md` | Turns 4–10 |
| 3 | `references/01-architecture.md` | **Mandatory:** Understanding naming, layering, and alias strategy. |

> Do NOT read the implementation files (JSON syntax, scoping tables, or collection specs) yet. Stay focused on strategy and the questionnaire — loading them now fills context with data that is not needed until generation.

---

### Critical Rules for the AI (Never Ignore)

1.  **Strict Sequential Turns**: Proceed exactly Turn-by-Turn as defined. Never skip a Turn. Never group turns together (e.g., do not show Turn 4 and Turn 5 in the same message).
2.  **Mandatory Dropdowns (ask_user_input)**: Every question labeled `ask_user_input` must be sent as a real tool call. Do not "infer" answers from context unless specifically told to do so by a dynamic rule.
3.  **Literal Dropdown Labels (MANDATORY)**: Use the exact text provided in the instructions for dropdown labels. Do NOT remove "e.g." or shorten the examples. If an example is provided (e.g. `(e.g. colorButtonPrimaryBasis)`), it must appear in the tool call exactly as written. Shortening examples causes users to miss the pattern being demonstrated.
4.  **Wait for User**: After every `ask_user_input` call, STOP and wait for the user's response. Do not generate internal thoughts about next steps until the user replies.

---

## PHASE 1 — QUESTIONNAIRE

**Turn 1**: Existing Figma system?
**Turn 2**: Existing codebase tokens?
**Turn 3**: Brand & Context
**Turn 4**: Product Type + Colours
**Turn 5**: Colour Modes + Architecture
**Turn 6**: Optional Collections
**Turn 7**: Component Details (3/4 layer only)
**Turn 8**: Typography + Fonts
**Turn 9**: Naming + Code Syntax
**Turn 10**: Summary & Manifest — final confirmation before generation (⛔ HARD STOP)
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

**⛔ STOP HERE.** Send this message and wait for the user's response. Do NOT include Turn 2 or Turn 3 in this same message. Your next message (after the user responds) will be Turn 2.

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
> - **Note**: If Chrome shows a security warning, type `allow pasting` first and press Enter.
> - Then paste the entire script below and press Enter
> - Wait for the **"✅ Tokens copied"** message — then paste it here"

**ACTION: Read and show the script from `scripts/token-extractor.js` in a code block.**

```javascript
// [AI: Insert content of scripts/token-extractor.js here]
```

**If Yes — Mobile App or Yes — Desktop App:** Tell the user:

> "For mobile/desktop apps, I can't extract tokens from a console — ask your developer to share:
> - The design tokens file (usually `tokens.js`, `theme.ts`, `colors.ts`, `styles/variables.css`, or a `tokens/` folder)
> - Or a screenshot of the app with the most common screens — I'll reverse-engineer the palette and spacing from visual inspection
>
> Once you share either, I'll adapt the Figma system to match."

**If No — starting fresh:** Proceed to Turn 3 **in your next message** (not this one).

**⛔ STOP HERE.** Send this message and wait for the user's response. Do NOT include Turn 3 in this same message.

*After receiving token data (from Turn 1 or Turn 2):* Deeply analyse the output. Identify the exact layer architecture (1/2/3/4), existing colour palette (primary/secondary hexes), active themes (light, dark, both), spacing scale, font stack, naming conventions (e.g. role-based, component-first), and code syntax. 
**CRITICAL:** You will use this analysis to intelligently adapt (NOT skip) all subsequent questions in Phase 1. You MUST still ask every question — but modify the dropdown choices to include "Keep existing" options alongside expansion options. Never skip a question just because you can infer the answer.

---

### TURN 3 — Brand & Context (Dynamic Inference)

Proactively infer the Brand Name and Project Context to minimize user typing. 
1. **Source 1 (High)**: Analyzed Figma/Code data from Turns 1/2.
2. **Source 2 (Med)**: Current workspace path or Repository name.
3. **Source 3 (Low)**: Fallback to "Generic [Context]" based on user prompt.

**ACTION**: Present the inferred data for confirmation. Do NOT ask an open-ended "What is your name?" as the first step.

Ask using `ask_user_input` (single_select):
> "I've inferred your project is **[Brand Name]** for a **[Project Type]** (e.g. SaaS, E-commerce). Should I proceed with these defaults?"
- `Yes — use [Brand Name] and [Project Type]`
- `Change name only — I'll type a different brand name`
- `Change context only — I'll type a different project context`
- `Let me type both from scratch`

> If anything other than "Yes" is selected, ask follow-up open-text: "Please provide the correct Brand Name and/or Project Context (e.g. Fintech App, Retail Dashboard)." — wait for response.


---

> Questionnaire continues in `02-questionnaire-and-generation.md` — Turns 4–10, Phase 2 confirm architecture.

---
*Copyright (c) 2026 Shanmugha Sundaram Srinivasan. All rights reserved. Licensed under Proprietary Source Available License.*
