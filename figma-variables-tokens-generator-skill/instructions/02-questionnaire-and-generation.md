> **DYNAMIC INTELLIGENT DROPDOWNS (CRITICAL RULE):**
> If the user provided existing tokens (from Figma or Code in Turns 1/2), you MUST intelligently adapt the questions in Turns 4-9 based on your analysis. 
> - **NEVER SKIP A QUESTION.** Every question in Turns 4-9 MUST still be asked, even if you can infer the answer. The user must always have the chance to confirm or change.
> - **Contextualize the question:** Tell the user what you found. (e.g., *"I see your current system only has a Light mode."* or *"I see these tokens came from a Web project."*)
> - **Inject dynamic choices:** Modify your dropdown choices to include keeping their existing setup versus expanding/changing it. (e.g., `Keep existing: Light mode only`, `Expand to: Light + Dark modes`).
> - **Architectural Dependencies:** Some questions depend on previous choices. (e.g., If the user chose a **2-layer architecture** in Q7, you **MUST NOT** offer `Component-first` naming in Q18, as 2-layer systems do not have a dedicated component layer). 
> - Apply this intelligence to Product Type (Q2), Colours (Q3-Q6), Layer Architecture (Q7), Code Syntax (Q17), and Token naming (Q18). Adapt the dropdown OPTIONS based on what you learned — but still present the dropdown and wait for the user's selection.


### TURN 4 — Product Type + Colours (dropdowns)After the codebase question is resolved, show these four dropdowns together:

**Q2** *(ask_user_input — single_select)*: "What kind of product are you building?"
- `Web app`
- `Mobile app`
- `Web + Mobile`
- `Desktop app`
- `Something else — I'll describe`

**Q3** *(ask_user_input — single_select)*: "Primary brand colour?"
- `I'll paste a hex code (e.g. #3B82F6)`
- `Blue — confident, trustworthy (e.g. #2563EB)`
- `Green — growth, health, success (e.g. #16A34A)`
- `Purple — premium, creative (e.g. #7C3AED)`
- `Orange — energetic, friendly (e.g. #EA580C)`
- `Red — bold, urgent (e.g. #DC2626)`
- `Custom — I'll describe`

**Q4** *(ask_user_input — single_select)*: "Secondary / accent colour direction?"
- `Complementary — opposite on the colour wheel (high contrast, energetic)`
- `Analogous — adjacent tones (harmonious, cohesive)`
- `Neutral accent — muted, desaturated (professional, calm)`
- `Monochromatic — lighter/darker tint of primary (minimal)`
- `Custom — I'll provide the hex`

**Q5** *(ask_user_input — single_select)*: "Neutral / grey palette style?"
- `Cool grey / blue-grey (slight blue tint — e.g. Tailwind Slate)`
- `Warm grey / sand (slight yellow-beige tint — e.g. Tailwind Stone)`
- `Pure neutral grey (no tint — e.g. Tailwind Gray)`
- `Custom — I'll describe`

> If Q3 answer is "I'll paste a hex code" or Q4 is "Custom", ask for the hex as a follow-up open-text question before continuing.

---

### TURN 5 — Colour Modes + Architecture

**Q6** *(ask_user_input — single_select)*: "Colour modes?"
- `Light only`
- `Dark only`
- `Both light and dark`
- `Custom (including High Contrast / accessibility themes)`

**Q7** *(ask_user_input — single_select)*: "Token layer architecture?"
- `1-layer — Primitives + Typography + optional collections. Smallest system. Good for prototypes or tiny teams.`
- `2-layer — Primitives + Theme + Typography + optional. Standard for most products.`
- `3-layer — Primitives + Theme + Component Colors + Typography + optional. Per-component colour tokens. Includes Component Dimensions automatically.`
- `4-layer — Primitives + Theme + Semantic + Component Colors + Typography + optional. Full enterprise depth. Includes Component Dimensions automatically.`

> ARCHITECTURE NOTE: Component Colors AND Component Dimensions are automatically included in 3-layer and 4-layer. Do NOT ask the user again if they want these collections when they have already chosen 3 or 4 layer.

---

### TURN 6 — Optional Collections

Show all optional collection questions as a batch. The Responsive collection is always included (it is mandatory — Typography and Component Dimensions both require it). Only ask about the truly optional ones:

**Q8** *(ask_user_input — single_select)*: "Density collection? Controls padding + gap across compact / comfortable / spacious modes."
- `Yes — include Density`
- `No — use fixed spacing values`

**Q9** *(ask_user_input — single_select)*: "Effects collection? Shadow and blur tokens with structured aliasing."
- `Yes — include Effects`
- `No`

**Q10** *(ask_user_input — single_select)*: "Layout collection? Grid column/margin/gutter specs per breakpoint (xs → xxl)."
- `Yes — include Layout`
- `No`

**Q11** *(ask_user_input — single_select)*: "Any additional custom collections? (e.g. Motion, Z-index, Elevation)"
- `No — that's everything`
- `Yes — I'll describe`

> If Q11 is "Yes", ask follow-up: "Describe each custom collection — name, what kind of tokens it contains, and any modes it needs."

---

### TURN 7 — Component Details
*(Only show if architecture is 3-layer or 4-layer)*

**Q12** *(ask_user_input — single_select)*: "Which components should be included in Component Colors?"
- `All standard components — Includes all interactive (Button, Input, Switch, Tooltip, Dropdown...) and static (Card, Modal, Badge, Navbar, Table...) roles.`
- `Selective — I'll list only the specific components I need`

> If "Selective": ask open-text — "List the exact components you need — I'll map them to the appropriate interactive or static patterns." — wait for response.


Wait for the response. Then show:

**Q13** *(ask_user_input — single_select)*: "How should Component Colors be organised?"
- `Split — interactive (button, input, toggle…) vs non-interactive (card, badge, avatar…)`
- `Flat — all components at the same level`
- `Custom — I'll describe my grouping`

**Q14** *(ask_user_input — single_select)*: "Icon token needs?"
- `Fill + stroke + duotone — standard icons with secondary path support`
- `Fill + stroke + duotone + background — icons inside a coloured container (filled icon buttons, icon chips)`
- `Fill + stroke only — no duotone, no background`

---

### TURN 8 — Typography + Fonts

**Q15** *(ask_user_input — single_select)*: "Typography scale?"
- `Standard 12 roles — display, heading, subheading, body-lg, body, body-sm, label-lg, label, label-sm, caption, overline, code`
- `Extended 16+ roles — adds display-sm, heading-sm, heading-lg, body-strong, numeric/tabular`
- `Custom — I'll describe the roles I need`

**Q16** *(ask_user_input — single_select)*: "Fonts?"
- `Inter for everything (placeholder — easy to swap in Figma later)`
- `Specify now — I'll type the font names`
- `System font stack`

> If "Specify now": ask open-text — "Primary font (body text)? Display/heading font (if different)? Monospace font for code (optional)?" — wait for response before continuing.

---

### TURN 9 — Naming + Code Syntax

**Q17** *(ask_user_input — single_select)*: "Token code syntax format?"
- `CSS Custom Properties — Web standard format using double hyphens (e.g. --color-button-primary-background)`
- `Tailwind / Kebab-case — Standard dash-separated naming for web/apps (e.g. color-button-primary-background)`
- `JavaScript / React camelCase — Standard for JS systems (e.g. colorButtonPrimaryBackground)`
- `Android / XML underscore — Snake_case format for Android development (e.g. color_button_primary_background)`
- `iOS / Swift PascalCase — Capitalized format for iOS development (e.g. ColorButtonPrimaryBackground)`
- `Custom format — I'll describe a different syntax`

**Q18** *(ask_user_input — single_select)*: "Token naming convention?"
> *Rule: If 2-layer architecture was chosen in Q7, OMIT the 'Component-first' option.*
- `Role-based (Recommended) — Logical grouping by function. (e.g. color.surface.primary / color.text.secondary)`
- `Component-first — Grouping by UI element. (e.g. color.button.secondary.default.background)` (HIDDEN if 2-layer chosen)
- `Material Design — Industry standard naming. (e.g. color.surface / color.on-surface / color.surface-variant)`
- `IBM Carbon — Industrial role naming. (e.g. color.background / color.layer-01 / color.text-primary)`
- `Custom — I'll describe a different naming structure`


> *Conversational Tip:* Reassure the user that modern, scalable systems use terms like `surface/page` or `surface/default` for backgrounds, and `text/primary` for main text. They do not need to worry if they don't see the exact phrase "page background" in the examples.

---

### TURN 10 — Final Options

**Q19** *(ask_user_input — single_select)*: "Any other requirements or specific details to include?"
- `No — everything is covered. Proceed to architecture summary.`
- `Yes — I have additional comments or requirements (specific values, naming tweaks, etc.)`

> If "Yes": ask open-text — "Please describe any additional requirements, conventions, or tokens I should include or avoid." — wait for response.


---

## PHASE 2 — CONFIRM ARCHITECTURE

### 🧩 READ PHASE B: System Specifications
Before proceeding, you MUST now read:
- `references/05a-collections-core.md`
- `references/05b-collections-semantic-components.md`

Show this summary before generating anything:

```
ARCHITECTURE SUMMARY
═══════════════════════════════════════════
Brand:      {name}
Product:    {type}
Layer:      {1/2/3/4}-layer

Collections — import in this exact order:
  1.  Primitives             always
  2.  Theme                  always         | {modes}
  3.  Semantic               4-layer only
  4.  Responsive             always         | mobile, tablet, desktop
  5.  Density                {yes/no}       | compact, comfortable, spacious
  6.  Layout                 {yes/no}       | xs→xxl
  7.  Effects                {yes/no}       | (single mode)
  8.  Typography             always         | (single mode)
  9.  Component Colors       3-layer+       | (single mode)
  10. Component Dimensions   3-layer+       | (single mode)
  {custom collections}

Colours:       Primary {hex/name}, Secondary {direction}, Neutral {style}
Fonts:         {specified / "Inter (placeholder)"}
Type scale:    {Standard 12 / Extended 16+ / Custom}
Naming:        {convention}
Code syntax:   {format}
Components:    {list or N/A}
Icon tokens:   {fill+stroke+duotone / +background / basic}
CC split:      {split / flat / N/A}
High contrast: {yes/no}
```

**EVALUATE INITIAL RESOURCES & COMPLEXITY:**
Before asking for confirmation, evaluate the raw size of the requested system against your own context and output token limits. Decide intelligently which generation path to take:

**Path 1: One-Shot Generation**
- Decide this if: You calculate that you can comfortably generate all JSON structures for the requested architecture in a single output window without hitting a timeout or trailing off.
- Tell the user: *"System complexity is well within my limits. I will generate everything in a single ZIP file immediately."*

**Path 2: Phased Generation**
- Decide this if: You calculate the architecture is massive (e.g. 4-layer, or many dense optional collections) and poses a high risk of an output timeout or incomplete JSON generation.
- Tell the user: *"To ensure absolute precision and prevent timeouts while calculating this massive architecture, I will break this into three background phases (Turns A, B, and C). You will only need to type 'Next' when prompted. I will provide ONE combined final ZIP file at the very end."*

Ask using ask_user_input: `Yes — generate everything` / `Change something first`

**Do not generate a single token until the user confirms.**

---

## PHASE 3 — GENERATION

### 🏗️ READ PHASE C: Technical Implementation
Before writing ANY JSON, you MUST now read:
- `references/02-scoping-rules.md`
- `references/03-json-format.md`
- `references/04-primitives.md`
- `references/06-generator-utility.md`

### ⚠️ THINKING BUDGET — RULE #1 (OBEY BEFORE ANYTHING ELSE)
Your `<thought>` block must be a **bulleted summary of under 100 words**. Do NOT narrate hex codes, ID calculations, alias chains, or script logic in your thinking. If you catch yourself writing more than 100 words of reasoning, **STOP and start writing code immediately.**

### Data Blueprint Workflow (MANDATORY)
Follow this exact 3-step pattern for every generation turn. Do NOT deviate:
1. **Step 1 — Data Dictionary**: Summarize the interview answers into a compact `brand_data` Python dictionary (hex codes, mode names, font choices, layer count). This is the ONLY planning you do.
2. **Step 2 — Script**: Write a short Python script that imports `DesignTokenGenerator` from `references/06-generator-utility.md` and loops through your `brand_data` dictionary calling `create_token` and `nest_token`. **You must use the self-correcting prefix stripping and backfilling guards built into the utility.**
3. **Step 3 — Output**: Execute and output the ZIP. No narration between steps.

> **PERFORMANCE & STABILITY GUARDRAILS:**
> 1. **No Bespoke Logic:** Do NOT "invent" custom loop logic. Use the patterns in `references/06-generator-utility.md`.
> 2. **Resumption Rule:** if interrupted (Continue button), pick up immediately from where you left off in the script. Do NOT repeat reasoning.
> 3. **Script Conciseness:** Rely on the blueprint patterns to keep the Python payload small.

> **ALIAS INTEGRITY & BACKFILLING (CRITICAL):**
> Broken aliases cause silent Figma import failures. You must verify every link:
> 1. **The Backfilling Rule (Fail-Fast)**: If a structural collection (Density, Responsive, Layout) requires a value NOT in your current Primitives scale (e.g., 30px lineHeight), you **must stop immediately** and add that value to the `Primitives` collection. The `create_token` utility will raise a `KeyError` if you attempt to alias a missing Primitive — do not ignore this.
> 2. **Verification Step**: Before outputting Turn C, run a mental "Pre-flight" check. Every `aliasData` targetVariableName MUST exist in the parent file. Check every token for mandatory `$value`.
> 3. **Icon Mapping**: The `color/icon/*` group in Component Colors should alias `Theme` for general UI roles (default, muted, brand, error, etc.), unless a specific 4-layer semantic icon layer was requested.
> 4. **Mandatory $value (Real Value Rule)**: `$value` on alias tokens is a placeholder but must be structural. Use the **Actual Resolved Value** for numbers and strings (safety fallback). Use a **Black Object** for colors. String tokens REQUIRE `"com.figma.type": "string"` at all layers, and **Primitive Strings DO have scopes**. NO curly braces. See `references/03-json-format.md`.
> 5. **Typography Completeness Check**: Before writing Typography, explicitly list every role × every property (fontSize, lineHeight, letterSpacing, fontFamily, fontWeight) as a checklist. Verify all 5 are present for every role. A missing property = a dropped token in Figma.
> 6. **Semantic Path Verification**: When referencing Semantic in `Component Colors`, verify that the specific path (e.g. `surface/raised`) was actually generated in the Semantic collection. It is not enough to check if the collection exists; you must check the path completeness.
> 8. **Path Normalization (MANDATORY)**: Always use `.lower()` when constructing path strings in your Python logic. Special care for `lineheight`, `letterspacing`, `fontweight` — these must NOT be camelCase in the script lookup or registry.

**OUTPUT CONSTRAINT CRITICAL RULE:**
You must ONLY output valid `.zip` files containing the structured JSON. NEVER output `.skill` files or dump massive scripts to the user. Do not wrap the output in proprietary skill abstractions.

> **CRITICAL PERFORMANCE RULE FOR PATH 2:** Do NOT attempt to write one giant script or generate all JSON in a single turn. You must safely break the generation across multiple turns as instructed below. Wait for the user to reply "Next" before proceeding. 

> **CONSOLIDATED ZIP RULE**: Do NOT output the `.zip` file widget in Turn A or Turn B. Keep the JSON payload in your memory. You must only output the final `design-tokens.zip` widget during **TURN C**. The internal structure MUST be **folders** numbered by their import order (e.g., `1. Primitives/`, `2. Theme/`) as governed by the JSON Format reference. No nested ZIPs.

---

### PATH 1: ONE-SHOT GENERATION
*(Execute immediately after user confirms "Yes", skipping Turns A/B/C)*
Generate all collections (Primitives, Theme, Responsive, Typography, plus any selected optional collections). 
Compile all JSON data and output **ONE single `.zip` widget** containing all files. 
Then, jump directly to **Turn D (Token count reporting)**.

---

### PATH 2: PHASED GENERATION 
*(Execute if complexity requires chunking)*

### TURN A — Core Foundations
**Before writing Primitives:** Ensure all downstream alias targets are covered by including necessary primitive tokens. Apply the Backfilling Rule — do NOT enumerate individual tokens in your thinking block. Write your `brand_data` dictionary immediately, then generate:

Calculate the JSON for these collections ONLY (Save to memory, NO ZIP OUTPUT YET):
1. **Primitives:** full colour palette + alpha variants (flat-sibling pattern) + all font tokens under `font/` group + layout primitive values + spacing + shadow geometry + borderWidth (0.3/0.5/0.8/1/2/4) + radius + blur
2. **Theme:** every surface/text/border/interactive/feedback/overlay group, all states + shadow colour tokens

*Stop here. Explicitly tell the user: "Phase A complete (Primitives & Theme). Type **Next** to generate structural collections (Responsive, Density, Layout, Effects)."*

---

### TURN B — Structural Collections
*(Wait for user to type "Next")*

Calculate the JSON for these collections ONLY (Save to memory, NO ZIP OUTPUT YET):
1. **Responsive:** all font size/lineHeight/letterSpacing roles × 3 breakpoints + radius × 3 breakpoints + borderWidth × 3 breakpoints
2. **Density:** padding (x/y/top/bottom/left/right, with full xs-4xl scale nested under each direction — e.g. `padding/x/md`, values up to 64px at spacious) + gap (xs/sm/md/lg/xl/2xl/3xl/4xl — up to 128px at spacious) × 3 modes
3. **Layout:** Layout structural variables (if selected)
4. **Effects:** shadow sm/md/lg/xl (colour → Theme, geometry → Primitives) + blur tokens

*Stop here. Explicitly tell the user: "Phase B complete. Type **Next** to generate the final component collections and compile the ZIP."*

---

### TURN C — Components & Final Compilation
*(Wait for user to type "Next")*

Calculate the JSON for these collections ONLY:
1. **Typography:** every role × 5 properties (fontSize/lineHeight/letterSpacing → Responsive; fontFamily/fontWeight → Primitives) + colour tokens → Theme
2. **Semantic (if applicable):** as per 4-layer architecture rules
3. **Component Colors:** every component × every variant × every state × every layer + icon duotone tokens
4. **Component Dimensions:** all padding/gap (→ Density) + all radius/borderWidth (→ Responsive)

**CRITICAL STEP:** Now take the JSON from Turn A, Turn B, and Turn C. Package them all together and output **ONE SINGLE `.zip` WIDGET** containing everything.

*Automatically proceed to Turn D.*

---

### Token count reporting (TURN D)

After delivering Turn C ZIPs, report a count table to the user so they can cross-check the import. Count **unique token paths** (one token = one line item in Figma's variable panel, regardless of how many modes it has). Do not multiply by mode count.

Example format:
```
TOKENS GENERATED
══════════════════════════════════
Collection          Tokens
──────────────────────────────────
Primitives          142
Theme               87
Responsive          54
Density             14
Layout              5
Effects             18
Typography          72
Semantic            48       (4-layer only)
Component Colors    186
Component Dimensions 28
──────────────────────────────────
Total               654
══════════════════════════════════
```
Tell the user: "These counts reflect unique tokens (one per row in Figma), not multiplied by modes."

### Mode file naming (critical — no "Value" names)
- Primitives: `primitives.tokens.json` with `"modeName": "primitives"`
- Typography: `typography.tokens.json` with `"modeName": "typography"`
- Effects: `effects.tokens.json` with `"modeName": "effects"`
- Semantic: `semantic.tokens.json` with `"modeName": "semantic"`
- Component Colors: `component-colors.tokens.json` with `"modeName": "component-colors"`
- Component Dimensions: `component-dimensions.tokens.json` with `"modeName": "component-dimensions"`
- All other collections use their natural mode names (light, dark, mobile, compact etc.)

### Default modes
- Theme: light is default
- Responsive: mobile is default
- Density: comfortable is default

Run the validation checklist from `references/03-json-format.md` before finalising each ZIP.

---


> Import, scoping, and collection reference in `03-import-and-handoff.md`.

---
*Copyright (c) 2026 Shanmugha Sundaram Srinivasan. All rights reserved. Licensed under Proprietary Source Available License.*
