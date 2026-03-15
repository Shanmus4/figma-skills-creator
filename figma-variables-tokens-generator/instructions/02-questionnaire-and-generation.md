## Dynamic Questionnaire Rules — Turns 4–9 (Read with Load Stage 1)

> - **PROACTIVE RECOMMENDATIONS (MANDATORY)**: Based on the Brand & Context from Turn 3, act as a design expert.
>     - **Label injection**: Inject your recommendation directly into the question string. Format: `[Original Question] [Rec: [Value]]`. (e.g. `Primary brand colour? [Rec: Blue]`)
>     - **Option tagging**: Use `[Recommended for [Project Context]]` for the corresponding dropdown option.
> - **Never skip a question.** Every question in Turns 4–9 must still be asked, even if you can infer the answer. The user must always have the chance to confirm or change.
> - **Contextualize the question:** Tell the user what you found. (e.g., *"I see your current system only has a Light mode."* or *"I see these tokens came from a Web project."*)
> - **Inject dynamic choices (LITERAL STRINGS):** Modify your dropdown choices to include keeping their existing setup versus expanding/changing it. Use the format: `Keep existing: [Feature Name] (e.g. [Full Token Example])`. Never shorten or summarize the examples — the full example is the pattern being demonstrated. (e.g. `Keep existing: camelCase (colorButtonPrimary)`).
> - **Architectural Dependencies:** Some questions depend on previous choices. (e.g., If the user chose a **2-layer architecture** in Q7, do **NOT** offer `Component-first` naming in Q18, as 2-layer systems do not have a dedicated component layer).
> - Apply this intelligence to Product Type (Q2), Colours (Q3–Q6), Layer Architecture (Q7), Code Syntax (Q17), and Token naming (Q18). Adapt the dropdown OPTIONS based on what you learned — but still present the dropdown and wait for the user's selection.
- **Platform Mapping (Q2 Logic)**: Map the selection to `platforms` list: `Web` or `Desktop` -> `["WEB"]`; `Mobile` -> `["ANDROID", "iOS"]`; `Web + Mobile` -> `["WEB", "ANDROID", "iOS"]`.


### TURN 4 — Product Type + Colours (dropdowns)
After the brand and context are resolved, show these four dropdowns together:

**Q2** *(ask_user_input — single_select)*: "What kind of product are you building? [Rec: [Value]]"
- `Web app (e.g. Next.js, React, SaaS Dashboard)`
- `Mobile app (e.g. iOS, Android, React Native)`
- `Web + Mobile (e.g. Cross-platform design system)`
- `Desktop app (e.g. Electron, Windows/Mac application)`
- `Something else — I'll describe`

**Q3** *(ask_user_input — single_select)*: "Primary brand colour? [Rec: [Value]]"
- `I'll paste a hex code (e.g. #3B82F6)`
- `Blue — confident, trustworthy (e.g. #2563EB)`
- `Green — growth, health, success (e.g. #16A34A)`
- `Purple — premium, creative (e.g. #7C3AED)`
- `Orange — energetic, friendly (e.g. #EA580C)`
- `Red — bold, urgent (e.g. #DC2626)`
- `Custom — I'll describe`

**Q4** *(ask_user_input — single_select)*: "Secondary / accent colour direction? [Rec: [Value]]"
- `Complementary — opposite on the colour wheel (e.g. High contrast, energetic)`
- `Analogous — adjacent tones (e.g. Harmonious, cohesive)`
- `Neutral accent — muted, desaturated (e.g. Professional, calm)`
- `Monochromatic — lighter/darker tint of primary (e.g. Minimalist)`
- `Custom — I'll provide the hex`

**Q5** *(ask_user_input — single_select)*: "Neutral / grey palette style? [Rec: [Value]]"
- `Cool grey / blue-grey (e.g. Tailwind Slate — slight blue tint)`
- `Warm grey / sand (e.g. Tailwind Stone — slight yellow-beige tint)`
- `Pure neutral grey (e.g. Tailwind Gray — no tint)`
- `Custom — I'll describe`

> If Q3 answer is "I'll paste a hex code" or Q4 is "Custom", ask for the hex as a follow-up open-text question before continuing.

---

### TURN 5 — Colour Modes + Architecture

**Q6** *(ask_user_input — single_select)*: "Colour modes? [Rec: [Value]]"
- `Light only (e.g. Single theme system)`
- `Dark only (e.g. Dark-first digital products)`
- `Both light and dark (e.g. Adaptive system with full theme support)`
- `Custom (including High Contrast / accessibility themes)`

**Q7** *(ask_user_input — single_select)*: "Token layer architecture? [Rec: [Value]]"
- `1-layer — Primitives + Typography (e.g. Prototypes or minimal systems)`
- `2-layer — Primitives + Theme + Typography (e.g. Standard scale for most apps)`
- `3-layer — Primitives + Theme + Component Colors + Typography (e.g. Design-to-Dev parity with component variables)`
- `4-layer — Primitives + Theme + Semantic + Component Colors + Typography (e.g. Enterprise systems with full semantic aliasing)`

> ARCHITECTURE NOTE: Component Colors AND Component Dimensions are automatically included in 3-layer and 4-layer. Do NOT ask the user again if they want these collections when they have already chosen 3 or 4 layer.

---

### TURN 6 — Optional Collections

Show all optional collection questions as a batch. The Responsive collection is always included (it is mandatory — Typography and Component Dimensions both require it). Only ask about the truly optional ones:

**Q8** *(ask_user_input — single_select)*: "Density collection? Controls padding + gap across compact / comfortable / spacious modes. [Rec: [Value]]"
- `Yes — include Density (e.g. Responsive padding and spacing scales)`
- `No — use fixed spacing values (e.g. Simple fixed-width layouts)`

**Q9** *(ask_user_input — single_select)*: "Effects collection? Shadow and blur tokens with structured aliasing. [Rec: [Value]]"
- `Yes — include Effects (e.g. Elevation1, Shadow/High, Glassmorphism)`
- `No`

**Q10** *(ask_user_input — single_select)*: "Layout collection? Grid column/margin/gutter specs per breakpoint (xs → xxl). [Rec: [Value]]"
- `Yes — include Layout (e.g. Grid margin/gutter variables for web)`
- `No`

**Q11** *(ask_user_input — single_select)*: "Any additional custom collections? (e.g. Motion, Z-index, Elevation) [Rec: [Value]]"
- `No — that's everything`
- `Yes — I'll describe`

> If Q11 is "Yes", ask follow-up: "Describe each custom collection — name, what kind of tokens it contains, and any modes it needs."

---

### TURN 7 — Component Details
*(Only show if architecture is 3-layer or 4-layer)*

**Q12** *(ask_user_input — single_select)*: "Which components should be included in Component Colors? [Rec: [Value]]"
- `All standard components (e.g. Button, Input, Card, Modal, Navbar, Table...)`
- `Selective — I'll list only the specific components I need`

**Q13** *(ask_user_input — single_select)*: "How should Component Colors be organised? [Rec: [Value]]"
- `Split — interactive vs non-interactive (e.g. button/input vs card/badge)`
- `Flat — all components at the same level (e.g. button/primary, card/default)`
- `Custom — I'll describe my grouping`

> If Q12 is "Selective": ask open-text — "List the exact components you need — I'll map them to the appropriate interactive or static patterns." — wait for response.

**Q14** *(ask_user_input — single_select)*: "Icon token needs? [Rec: [Value]]"
- `Fill + stroke + duotone (e.g. standard icons with secondary path support)`
- `Fill + stroke + duotone + background (e.g. icons inside a coloured container)`
- `Fill + stroke only (e.g. Simple stroke-only icon set)`

---

### TURN 8 — Typography + Fonts

**Q15** *(ask_user_input — single_select)*: "Typography scale? [Rec: [Value]]"
- `Standard 12 roles (e.g. Display, Header, Body, Label, Caption, Code)`
- `Extended 16+ roles (e.g. Adding Strong, Large, and Numeric variants)`
- `Custom — I'll describe the roles I need`

**Q16** *(ask_user_input — single_select)*: "Fonts? [Rec: [Value]]"
- `Inter for everything (e.g. Google Fonts / Inter placeholders)`
- `Specify now (e.g. Custom names like 'Roboto' or 'Outfit')`
- `System font stack (e.g. -apple-system, sans-serif)`

> If "Specify now": ask open-text — "Primary font (body text)? Display/heading font (if different)? Monospace font for code (optional)?" — wait for response before continuing.

**Q17** *(ask_user_input — single_select)*: "Token code syntax format? [Rec: [Value]]"
- `CSS Custom Properties (e.g. --color-button-background)`
- `Tailwind / Kebab-case (e.g. color-button-background)`
- `JavaScript / React camelCase (e.g. colorButtonBackground)`
- `Android / XML underscore_case (e.g. color_button_background)`
- `iOS / Swift PascalCase (e.g. ColorButtonBackground)`
- `Custom format (I'll describe a different syntax)`

**Q18** *(ask_user_input — single_select)*: "Token naming convention? [Rec: [Value]]"
- `Role-based (e.g. color/surface/primary or color/text/secondary)`
- `Component-first (e.g. color/button/secondary/default/background)` (HIDDEN if 2-layer chosen)
- `Material Design (e.g. color/surface or color/on-surface)`
- `IBM Carbon (e.g. color/background or color/text-primary)`
- `Custom (I'll describe a different naming structure)`


> *Conversational Tip:* Reassure the user that modern, scalable systems use terms like `surface/page` or `surface/default` for backgrounds, and `text/primary` for main text. They do not need to worry if they don't see the exact phrase "page background" in the examples.

---

### TURN 10 — SUMMARY & MANIFEST
Synthesize all answers into a "Collection Manifest" table.
- **Columns**: Collection Name, Token Groups, Total Estimated Tokens, Key Inferences.
- **Goal**: Show the user exactly what's being built before any generation begins.

**Q19** *(ask_user_input — single_select)*: "Shall I proceed with generation as described in the manifest?"
- `Yes — proceed with Generation`
- `No — I have additional comments or requirements`

> If "Yes": proceed. If "No": ask open-text — "Please describe any additional requirements..." — wait for response.


---

## PHASE 2 — CONFIRM ARCHITECTURE

### 🧩 READ LOAD STAGE 2: System Specifications
Before proceeding, you must now read:
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

**AUTONOMOUS PATH SELECTION (MANDATORY):**
You (the AI) must choose the safest generation path independently. Do NOT ask the user to choose between Path 1 and Path 2. 

1.  **Evaluate Complexity**: Based on the confirmed architecture (layers, collections, modes), calculate if a single-shot generation is safe.
2.  **Declare your choice**: Tell the user: *"Based on the architecture complexity, I have chosen [Path 1: One-Shot / Path 2: Phased] to ensure maximum precision and zero timeouts."*
3.  **Final Confirmation**:
    Ask using `ask_user_input` (single_select): *"Should I proceed with the generation as described above?"*
    - `Yes — generate everything`
    - `Change something first (e.g., architecture, naming, syntax)`

**Path 1: One-Shot Generation**
- Decide this if: You calculate that you can comfortably generate all JSON structures for the requested architecture in a single output window without hitting a timeout or trailing off.

**Path 2: Phased Generation**
- Decide this if: You calculate the architecture is massive (e.g. 4-layer, or many dense optional collections) and poses a high risk of an output timeout or incomplete JSON generation. Tell the user: *"To ensure absolute precision and prevent timeouts while calculating this massive architecture, I will break this into three background phases (Turns A, B, and C). You will only need to type 'Next' when prompted. I will provide ONE combined final ZIP file at the very end."*

**Do not generate a single token until the user confirms "Yes — generate everything".**

---

## PHASE 3 — GENERATION

### 🏗️ READ LOAD STAGE 3: Technical Implementation
Before writing ANY JSON, you must now read:
- `references/02-scoping-rules.md`
- `references/03-json-format.md`
- `references/04-primitives.md`
- `references/06-generator-utility.md`

### Generation Thinking Constraint
Extended thinking during generation turns has previously caused context exhaustion — Claude loops through alias chains and hex calculations in its reasoning, hits the context limit, and crashes before writing a single line of script. To prevent this: keep your internal reasoning to a short bulleted summary (target under 50 words). Do not narrate hex codes, ID calculations, alias chains, or script logic in your thought block. Jump directly to Step 1 — Data Dictionary and start writing. If you notice your reasoning expanding beyond a few bullets, stop immediately and write code.

### Data Blueprint Workflow (MANDATORY)
Follow this exact 3-step pattern for every generation turn. Do NOT deviate:
1. **Step 1 — Data Dictionary**: Summarize the interview answers into a compact `brand_data` Python dictionary (hex codes, mode names, font choices, layer count). This is the ONLY planning you do.
2. **Step 2 — Script**: 
    - **A. Shared Utility**: Write the code from `references/06-generator-utility.md` into a file named `generator_utils.py`.
    - **B. Generation Script**: Write your generation script (Turn A, B, or C). Import the generator using `from generator_utils import DesignTokenGenerator`. 
    - **C. Platform Initialization**: Initialize with `DesignTokenGenerator(brand_name, syntax_format, platforms)`. Ensure the `platforms` list matches the mappings from Q2.
    - **D. Persistence (FAIL-SAFE)**: Do NOT pickle the `gen` object directly. Use `pickle.dump(gen.to_dict(), f)` to save state as a plain dictionary. In the next turn, load the dict and reconstruct with `gen = DesignTokenGenerator.from_dict(pickle.load(f))`. This removes all module-path dependencies and ensures the state is always loadable regardless of the script's `__main__` context.
    - **D. Loop**: Loop through your `brand_data` calling `create_token` and `nest_token`. Use the self-correcting prefix stripping and backfilling guards built into the utility.
3. **Step 3 — Output**: Execute and output the ZIP.
    - **Zero narration during generation**: Do not explain the output or summarize what was generated. Deliver the ZIP widget, then proceed to Turn D (token count table). The follow-up conversation in Phase 6 of the handoff file happens after this.

> **Performance & Stability Guardrails** — Serialization errors and script timeouts silently break the output ZIP. Follow these to prevent them:
> 1. **Default to Single-Script Generation**: Always write all generation phases in a **single `gen_all.py`** script. This runs all phases sequentially in memory and avoids all serialization problems (The "No Wasted Runs" Rule). Only split into separate scripts if token count exceeds ~1000 and context truncation is a critical risk.
> 2. **No Cross-Script Pickle of Class Instances**: Never pickle a `DesignTokenGenerator` instance across different scripts. Pickle stores class module paths (e.g. `__main__`) which break when loaded in a different script. If splitting is unavoidable, define the class in a shared `generator_core.py`, OR save state as a plain JSON dict via `to_dict()`.
> 3. **No Bespoke Logic**: Do NOT "invent" custom loop logic. Use the patterns in `references/06-generator-utility.md`.
> 4. **Resumption Rule**: If interrupted (Continue button), pick up immediately from where you left off in the script. Do NOT repeat reasoning.
> 5. **Script Conciseness**: Rely on the blueprint patterns to keep the Python payload small.

> **Alias Integrity & Backfilling** — Broken aliases cause silent Figma import failures (the variable panel shows VariableID:0:0 with no warning). Verify every link:
> 1. **The Backfilling Rule**: If a structural collection (Density, Responsive, Layout) requires a value NOT in your current Primitives scale (e.g., 30px lineHeight), stop immediately and add that value to the `Primitives` collection. The `create_token` utility will raise a `KeyError` if you attempt to alias a missing Primitive — do not ignore this.
> 2. **Verification Step**: Before outputting Turn C, run a mental "Pre-flight" check. Every `aliasData` targetVariableName must exist in the parent file. Check every token for mandatory `$value`.
> 3. **Pre-Generation Coverage Audit**: 
>     - Before Turn A: N/A.
>     - Before Turn B: Run `validate_responsive_coverage`.
>     - Before Turn C: Run `validate_semantic_coverage`.
> 4. **Mandatory Pre-CC Semantic Audit**: Before writing Component Colors, build a flat `cc_to_sem` intent map and call `validate_semantic_coverage()` against it. If any gap is found (e.g. `border/subtle` missing from Semantic), add it to Semantic first. Never allow a "VariableID:0:0" to be written to Component Colors.
> 5. **Icon Mapping**: The `color/icon/*` group in Component Colors should alias `Theme` for general UI roles (default, muted, brand, error, etc.), unless a specific 4-layer semantic icon layer was requested.
> 6. **Mandatory $value (Real Value Rule)**: `$value` on alias tokens is a placeholder but must be structural. Use the **Actual Resolved Value** for numbers and strings (safety fallback). Use a **Black Object** for colors. String tokens REQUIRE `"com.figma.type": "string"` at all layers, and **Primitive Strings DO have scopes**. NO curly braces. See `references/03-json-format.md`.
> 7. **Typography Completeness Check**: Before writing Typography, explicitly list every role × every property (fontSize, lineHeight, letterSpacing, fontFamily, fontWeight) as a checklist. Verify all 5 are present for every role. A missing property = a dropped token in Figma.
> 8. **Semantic Path Verification**: When referencing Semantic in `Component Colors`, verify that the specific path (e.g. `surface/raised`) was actually generated in the Semantic collection. It is not enough to check if the collection exists; you must check the path completeness.
> 9. **Path Normalization**: Always use `.lower()` when constructing path strings in your Python logic (e.g. `path = f"font/lineheight/{role}".lower()`). Special care for `lineheight`, `letterspacing`, `fontweight` — these must NOT be camelCase in any script lookup, prebuild, or registry call. Normalization must happen at **construction**, not just at lookup.
> 10. **Pre-Generation Coverage Audit — All Collections**: Before building any collection, run `validate_responsive_coverage` from `06-generator-utility.md`. If it fails, add the missing primitives to your Turn A script before saving the Primitives collection. Never proceed to aliasing until the audit passes.

**Output constraint:** Output only valid `.zip` files containing the structured JSON. Do not output `.skill` files or dump raw scripts — this confuses users who expect ready-to-import ZIPs and risks context truncation.

> **Critical performance rule for Path 2:** Do NOT attempt to write one giant script or generate all JSON in a single turn. Break the generation across multiple turns as instructed below. Wait for the user to reply "Next" before proceeding.

> **Consolidated ZIP rule**: Do NOT output a ZIP widget in Turn A or Turn B. Only the final `design-tokens.zip` widget should be delivered during **TURN C**. Hold the JSON data in memory or session state until the final compilation phase.

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

*Stop here. Explicitly tell the user: "Turn A complete (Primitives & Theme). Type **Next** to generate structural collections (Responsive, Density, Layout, Effects)."*

---

### TURN B — Structural Collections
*(Wait for user to type "Next")*

Calculate the JSON for these collections ONLY (Save to memory, NO ZIP OUTPUT YET):
1. **Responsive:** all font size/lineHeight/letterSpacing roles × 3 breakpoints + radius × 3 breakpoints + borderWidth × 3 breakpoints
2. **Density:** padding (x/y/top/bottom/left/right, with full xs-4xl scale nested under each direction — e.g. `padding/x/md`, values up to 64px at spacious) + gap (xs/sm/md/lg/xl/2xl/3xl/4xl — up to 128px at spacious) × 3 modes
3. **Layout:** Layout structural variables (if selected)
4. **Effects:** shadow sm/md/lg/xl (colour → Theme, geometry → Primitives) + blur tokens

*Stop here. Explicitly tell the user: "Turn B complete. Type **Next** to generate the final component collections and compile the ZIP."*

---

### TURN C — Components & Final Compilation
*(Wait for user to type "Next")*

Calculate the JSON for these collections ONLY:
1. **Typography:** every role × 5 properties (fontSize/lineHeight/letterSpacing → Responsive; fontFamily/fontWeight → Primitives) + colour tokens → Theme
2. **Semantic (if applicable):** as per 4-layer architecture rules
3. **Component Colors:** every component × every variant × every state × every layer + icon duotone tokens
4. **Component Dimensions:** all padding/gap (→ Density) + all radius/borderWidth (→ Responsive)

**Critical step:** Now take the JSON from Turn A, Turn B, and Turn C. Package them all together and output **ONE SINGLE `.zip` WIDGET** containing everything. The structure must be folders numbered by import order (e.g. `1. Primitives`, `2. Theme`). No intermediate ZIPs or nested archives.

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
