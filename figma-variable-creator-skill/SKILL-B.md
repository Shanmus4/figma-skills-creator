### TURN 4 — Product Type + Colours (dropdowns)

After the codebase question is resolved, show these four dropdowns together:

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

**Q12** *(open text)*: "Which components need dedicated colour tokens in Component Colors?

Note: icon, container, and divider are always included.

Component Colors will be split into two groups:
- **Interactive** — components with multiple states (default/hover/pressed/disabled): button, input, checkbox, radio, toggle, switch, tooltip, dropdown
- **Static** — components with fewer/no interaction states: card, modal, badge, tag, navbar, sidebar, table, avatar, alert, banner, chip, progress

List the components you need — I'll assign each to the correct group."

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
- `CSS custom properties — e.g. --color-button-primary-background`
- `Tailwind / kebab-case — e.g. color-button-primary-background`
- `JavaScript camelCase — e.g. colorButtonPrimaryBackground`
- `Android / XML underscore — e.g. color_button_primary_background`
- `iOS / Swift PascalCase — e.g. ColorButtonPrimaryBackground`
- `Custom format — I'll describe`

**Q18** *(ask_user_input — single_select)*: "Token naming convention?"
- `Role-based — color.surface.primary / color.text.secondary`
- `Component-first — color.button.secondary.default.background`
- `Material Design — color.surface / color.on-surface / color.surface-variant`
- `IBM Carbon — color.background / color.layer-01 / color.text-primary`
- `Custom — I'll describe`

> *Conversational Tip:* Reassure the user that modern, scalable systems use terms like `surface/page` or `surface/default` for backgrounds, and `text/primary` for main text. They do not need to worry if they don't see the exact phrase "page background" in the examples.

---

### TURN 10 — Final Options

**Q19** *(open text)*: "Any other requirements — specific token values, tokens to avoid, existing conventions to match, or anything else? (leave blank to proceed)"

Wait for response. If the user describes something requiring follow-up (e.g. a custom collection, a non-standard architecture), ask clarifying questions before proceeding to Phase 2.

---

## PHASE 2 — CONFIRM ARCHITECTURE

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

Read ALL 5 reference files before writing any JSON. 

**OUTPUT CONSTRAINT CRITICAL RULE:**
You must ONLY output valid `.zip` files containing the structured JSON. NEVER output `.skill` files or dump massive scripts to the user. Do not wrap the output in proprietary skill abstractions.

> **CRITICAL PERFORMANCE RULE FOR PATH 2:** Do NOT attempt to write one giant script or generate all JSON in a single turn. You must safely break the generation across multiple turns as instructed below. Wait for the user to reply "Next" before proceeding. 

> **CONSOLIDATED ZIP RULE:** Do NOT output the `.zip` file widget in Turn A or Turn B. Keep the JSON payload in your memory. You must only output the final `design-tokens.zip` widget during **TURN C**. The internal collection zips inside `design-tokens.zip` MUST be numbered by their import order (e.g., `1. Primitives.zip`, `2. Theme.zip`) as governed by the JSON Format reference.

> **ALIAS INTEGRITY RULE — ZERO BROKEN REFERENCES:** Every alias in a downstream collection (Theme, Responsive, Density, Effects, Typography, Semantic, Component Colors, Component Dimensions) MUST point to a token that already exists in its parent collection. If a downstream token needs a Primitive value that wasn't generated yet, you MUST add that token to Primitives first. Never ship a ZIP containing an alias whose target does not exist — Figma will silently fail on import.

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
**Before writing Primitives:** Plan all downstream alias targets (Theme, Responsive, Density, Effects, Typography, Components). Backfill any missing primitive tokens so every future alias has a valid target. Generate Primitives LAST-MILE — after planning all downstream values, add any missing primitive tokens.

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

### Token count reporting — required after generation

After generating all ZIPs, report a count table to the user so they can cross-check the import. Count **unique token paths** (one token = one line item in Figma's variable panel, regardless of how many modes it has). Do not multiply by mode count.

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

---


> Import, scoping, and collection reference in `SKILL-C.md`.
