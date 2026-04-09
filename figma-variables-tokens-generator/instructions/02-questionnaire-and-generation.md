## Dynamic Questionnaire Rules — Turns 4–9 (Read with Load Stage 1)

> - **PROACTIVE RECOMMENDATIONS (MANDATORY)**: Based on the Brand & Context from Turn 3, act as a design expert.
>     - **Label injection**: Inject your recommendation directly into the question string. Format: `[Original Question] [Rec: [Value]]`. (e.g. `Primary brand colour? [Rec: Blue]`)
>     - **Option tagging**: Use `[Recommended for [Project Context]]` for the corresponding dropdown option.
> - **Never skip a question.** Every question in Turns 4–9 must still be asked, even if you can infer the answer. The user must always have the chance to confirm or change.
> - **Contextualize the question:** Tell the user what you found. (e.g., *"I see your current system only has a Light mode."* or *"I see these tokens came from a Web project."*)
> - **Inject dynamic choices (LITERAL STRINGS):** Modify your dropdown choices to include keeping their existing setup versus expanding/changing it. Use the format: `Keep existing: [Feature Name] (e.g. [Full Token Example])`. Never shorten or summarize the examples — the full example is the pattern being demonstrated. (e.g. `Keep existing: camelCase (colorButtonPrimary)`).
> - **Architectural Dependencies:** Some questions depend on previous choices. (e.g., If the user chose a **2-Tier architecture** in Q7, do **NOT** offer `Component-first` naming in Q18, as 2-Tier systems do not have a dedicated component Tier).
> - Apply this intelligence to Product Type (Q2), Colours (Q3–Q6), Tier Architecture (Q7), Code Syntax (Q17), and Variable path structure (Q18). Adapt the dropdown OPTIONS based on what you learned — but still present the dropdown and wait for the user's selection.
- **Platform Mapping (Q2 Logic)**: Map the selection to `platforms` list: `Web` or `Desktop` -> `["WEB"]`; `Mobile` -> `["ANDROID", "iOS"]`; `Web + Mobile` -> `["WEB", "ANDROID", "iOS"]`.
- **Existing System Import (Q1 Context)**: If the user mentions they already have Figma variables during Q1 (brand/context), instruct them: *"Export your existing variables using the Variables Tokens Collections Importer plugin (Export tab). Upload the ZIP or provide the file path so I can analyze your current system and pre-fill the questionnaire."* Analyze the exported JSON for: token paths, naming conventions, tier structure, mode names, color palette. Pre-fill subsequent answers based on analysis.

## Generation Safety Rules — Always In Force

These rules are architecture-agnostic. They exist to prevent silent Figma import failures across all dynamic user inputs.

- **Canonical path identity**: Every token path must be identical across planning, ID prebuilds, emitted JSON keys, registries, and `aliasData.targetVariableName`. Never emit one spelling and alias another.
- **Do not mutate reference paths**: If a reference defines `link-hover`, `on-brand`, `on-surface-variant`, `lineHeight`, `letterSpacing`, `borderWidth`, `minWidth`, or `maxWidth`, preserve that exact spelling in the token path. Code syntax formatting is separate and must not rewrite token paths.
- **Inventory first, adaptation second**: Build required path inventories from the references before adapting them to the user's brand, density, or component list. Do not manually improvise partial subsets for Standard or Enterprise systems.
- **Artifact validation, not registry-only validation**: After generation, flatten the actual emitted JSON paths from every file and verify alias targets against those emitted paths. A registry-only pass is insufficient.
- **Scope validation from the emitted artifact**: Confirm that emitted `text/*` paths use `TEXT_FILL`, `border/*` use `STROKE`, `icon/*` use `SHAPE_FILL` + `STROKE`, `shadow/*/color` use `EFFECT_COLOR`, and typography numeric paths use their correct numerical scopes. Never allow semantic text or border tokens to fall through to a generic fill fallback.
- **Coverage floors are mandatory**: Lean, Standard, and Enterprise counts in the references are minimums, not suggestions. Do not proceed if the generated inventory undershoots the chosen density.
- **Backfilling is not enough on its own**: Backfilling only solves missing parent values. It does not solve path identity mismatches, scope mistakes, or under-generated token inventories.
- **Local workspace delivery rule**: In local IDE/CLI environments, create an `exports/` folder and write the final ZIP there. Do not leave the final deliverable in the project root.
- **Minimal artifact rule**: Unless the user explicitly asks for diagnostics or code, do not emit extra manifests, helper JSON files, or generator scripts alongside the ZIP. The ZIP is the default deliverable.


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

**Q7** *(ask_user_input — single_select)*: "Token Tier architecture? [Rec: [Value]]"
- `1-Tier — Primitives + Typography (e.g. Prototypes or minimal systems)`
- `2-Tier — Primitives + Semantic (light/dark modes) + Typography (e.g. Standard apps like Material Design)`
- `3-Tier — Primitives + Semantic (light/dark modes) + Component Colors + Typography (e.g. Production systems with component variables)`
- `4-Tier — Primitives + Theme + Semantic + Component Colors + Typography (e.g. Enterprise / multi-brand with separate palette switching)`

> ARCHITECTURE NOTE: Component Colors AND Component Dimensions are automatically included in 3-Tier and 4-Tier. Do NOT ask the user again if they want these collections when they have already chosen 3 or 4 Tier.
> THEME CLARIFICATION: If a user says "I want a Theme collection" but chose 2-Tier or 3-Tier, explain: *"In industry-standard practice (Material Design, etc.), the mode-switching layer is called Semantic in 2/3-Tier systems. Theme only exists as a separate collection in 4-Tier for multi-brand enterprise systems. Do you want light/dark modes on Semantic (2/3-Tier) or a separate palette-switching layer (4-Tier)?"*

**Q7b** *(ask_user_input — single_select)*: "How comprehensive should your token system be? [Rec: [Value]]"
- `Lean — minimal, quick setup (e.g. 55-80 Semantic tokens, basic components)`
- `Standard — production-ready (e.g. 80-120 Semantic tokens, full component coverage) [Recommended for most apps]`
- `Enterprise — exhaustive coverage (e.g. 120-250+ Semantic tokens, data viz, status colors, every state)`

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
*(Only show if architecture is 3-Tier or 4-Tier)*

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

**Q18** *(ask_user_input — single_select)*: "Variable path structure? [Rec: [Value]]"
- `Role-based (e.g. color/surface/primary or color/text/secondary)`
- `Component-first (e.g. color/button/secondary/default/background)` (HIDDEN if 2-Tier chosen)
- `Material Design (e.g. color/surface or color/on-surface)`
- `IBM Carbon (e.g. color/background or color/text-primary)`
- `Custom (I'll describe a different naming structure)`

> **Q18 MUST affect the generated token paths.** The default reference files use Role-based paths. If the user picks a different structure, you must translate the paths when building your generation script. Use this mapping as guidance:
>
> | Concept | Role-based | Material Design | IBM Carbon |
> |---|---|---|---|
> | Page background | `surface/page` | `surface` | `background` |
> | Card background | `surface/default` | `surface-variant` | `layer-01` |
> | Primary text | `text/primary` | `on-surface` | `text-primary` |
> | Secondary text | `text/secondary` | `on-surface-variant` | `text-secondary` |
> | Primary action | `interactive/primary` | `primary` | `interactive` |
> | Error state | `feedback/error` | `error` | `danger` |
> | Border default | `border/default` | `outline` | `border-subtle` |
>
> If the user chooses "Custom", ask them to describe their structure and map the concepts accordingly.


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
- **IF user requested custom collections in Q11**: you MUST also read `references/07-custom-collections.md` now.

Show this summary before generating anything:

```
ARCHITECTURE SUMMARY
═══════════════════════════════════════════
Brand:      {name}
Product:    {type}
Tier:       {1/2/3/4}-Tier

Collections — import in this exact order:
  1.  Primitives             always
  2.  Theme                  always         | {modes}
  3.  Semantic               4-Tier only
  4.  Responsive             always         | mobile, tablet, desktop
  5.  Density                {yes/no}       | compact, comfortable, spacious
  6.  Layout                 {yes/no}       | xs→xxl
  7.  Effects                {yes/no}       | (single mode)
  8.  Typography             always         | (single mode)
  9.  Component Colors       3-Tier+        | (single mode)
  10. Component Dimensions   3-Tier+        | (single mode)
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

1.  **Evaluate Complexity**: Based on the confirmed architecture (Tiers, collections, modes), calculate if a single-shot generation is safe.
2.  **Declare your choice**: Tell the user: *"Based on the architecture complexity, I have chosen [Path 1: One-Shot / Path 2: Phased] to ensure maximum precision and zero timeouts."*
3.  **Final Confirmation**:
    Ask using `ask_user_input` (single_select): *"Should I proceed with the generation as described above?"*
    - `Yes — generate everything`
    - `Change something first (e.g., architecture, naming, syntax)`

**Path 1: One-Shot Generation**
- Decide this if: You calculate that you can comfortably generate all JSON structures for the requested architecture in a single output window without hitting a timeout or trailing off.

**Path 2: Phased Generation**
- Decide this if: You calculate the architecture is massive (e.g. 4-Tier, or many dense optional collections) and poses a high risk of an output timeout or incomplete JSON generation. Tell the user: *"To ensure absolute precision and prevent timeouts while calculating this massive architecture, I will break this into three background phases (Turns A, B, and C). You will only need to type 'Next' when prompted. I will provide ONE combined final ZIP file at the very end."*

**Do not generate a single token until the user confirms "Yes — generate everything".**

---

## ALIAS INTEGRITY SYSTEM (Non-Negotiable)

Every import error, every "VariableID:0:0", every "FAILURE" status in the plugin traces back to a broken alias chain. This system prevents ALL of them.

### The Chain Verification Algorithm

Run this BEFORE saving EACH collection to the ZIP:

For every token in the collection:
1. Does it have `aliasData`? → If no, skip (it's a hardcoded value, safe).
2. Extract `targetVariableName` and `targetVariableSetName`.
3. Does the target path exist in the target collection's registry?
   → **NO** → STOP. Backfill the missing token in the parent collection.
   → **YES** → Is the target ALSO an alias?
     → **YES** → Follow the chain recursively (repeat from step 2 for the target).
     → **NO** → Chain is complete. This token is safe.

### Timing Rule (CRITICAL)
ALL backfilled primitives must be created BEFORE `save_mode("Primitives", ...)`.
Primitives are saved first. Once saved, you cannot retroactively add to them.
**Therefore**: Build your ENTIRE data map (all collections mentally mapped) in the
Python script BEFORE saving any collection. Think of it as: plan everything, then save in order.

### Common Chain Patterns to Verify
- `CC → Semantic → Primitives` (3-Tier)
- `CC → Semantic → Theme → Primitives` (4-Tier)
- `Typography → Responsive → Primitives` (font sizes, lineHeights, letterSpacing)
- `Typography → Primitives` (font family/weight — direct, no Responsive)
- `Effects → Semantic/Theme` (shadow colours) + `Effects → Primitives` (shadow geometry)
- `CD → Density → Primitives` (padding/gap)
- `CD → Responsive → Primitives` (radius/borderWidth)
- `Custom → [parent] → ... → Primitives`

### Final Gate
After ALL collections are built → call `verify_chain_completeness()`.
If it passes with zero broken links → the ZIP is safe to deliver.

### Emitted Artifact Gate (Also Mandatory)

After `verify_chain_completeness()`, run a second validation pass against the **actual emitted JSON files**:

1. Flatten every emitted token path from `output_files`
2. Verify that every `aliasData.targetVariableName` exists in the emitted path inventory for its target collection
3. Verify that each emitted path spelling matches the intended canonical path exactly
4. Verify critical scope families from the emitted files:
   - `text/*` → `TEXT_FILL`
   - `border/*` → `STROKE`
   - `icon/*` → `SHAPE_FILL` + `STROKE`
   - `shadow/*/color` → `EFFECT_COLOR`
   - typography numbers → `FONT_SIZE`, `LINE_HEIGHT`, `LETTER_SPACING`

If the emitted artifact disagrees with the internal registry, the ZIP is **not safe** even if the registry-based alias check passed.

---

## GUARDRAILED AUTONOMY (Prevents Rabbit Holes)

You are a Design System Architect. You have autonomy to decide:
- ✅ WHICH tokens to create within each group (derive from user's component list)
- ✅ HOW MANY tokens per group (the 94 paths in 05b are the floor, not the ceiling — expand when needed)
- ✅ WHAT light/dark mappings to use (follow shade inversion: light surfaces = lighter shades, dark surfaces = darker shades)
- ✅ WHETHER to add extra Semantic roles (if the user's component list demands them)

You do NOT have autonomy to:
- ❌ Invent new collection types not discussed with the user
- ❌ Skip backfilling checks or chain verification
- ❌ Deviate from the alias chain hierarchy (CC → Semantic → Primitives, never skip)
- ❌ Use scopes not defined in `02-scoping-rules.md`
- ❌ Generate tokens "just in case" — every token must serve a purpose in the user's system

### Working Backwards Rule
Don't deliberate about which tokens to include. Work backwards mechanically:
1. Read the user's confirmed component list
2. For each component → determine which CC tokens it needs (background, text, border, icon × states)
3. For each CC token → determine which Semantic token it must alias
4. For each Semantic token → determine which Primitive shade it references
5. Build those chains. Generate those tokens. If any Semantic tokens are missing from the 05b default list → add them. Stop.

If you find yourself writing paragraphs of reasoning about token selection → STOP. You're in a rabbit hole. Go back to step 1.

---

## PHASE 3 — GENERATION

### 🏗️ READ LOAD STAGE 3: Technical Implementation
Before writing ANY JSON, you must now read:
- `references/02-scoping-rules.md`
- `references/03-json-format.md`
- `references/04-primitives.md`
- `references/06-generator-utility.md`
- **IF user requested custom collections in Q11**: you MUST also read `references/07-custom-collections.md` now (if you haven't already).

### 🧠 STRUCTURED THINKING CONSTRAINT (CRITICAL)
LLMs need to execute "Chain of Thought" reasoning to accurately build dynamic logic, but extended planning (like enumerating tokens or calculating hexes) causes context exhaustion and crashes. 

**TO BALANCE THIS:** You must split your reasoning:
1. **High-Level Strategy (Allowed in Chat):** You may safely write a brief (<100 word) bulleted summary mapping out the high-level architecture decisions based on the questionnaire (e.g., "Architecture: 4-Tier, Primary: Green, Density: Enterprise").
2. **Data Enumeration (FORBIDDEN in Chat):** You are strictly **FORBIDDEN** from enumerating individual tokens, defining color hexes, mapping out alias chains, or writing data blueprints in your conversational text. 

**Python is your scratchpad.** Do the actual 1:1 token mapping and hex value assignments ONLY inside the Python script's data dictionaries!

### Data Blueprint Workflow (MANDATORY)
Follow this exact pattern for every generation turn. Do NOT deviate:
1. **Brief Strategy:** 2-3 bullets acknowledging the high-level architecture context.
2. **Execute — The Script**: 
    - **A. Shared Utility**: Inside the script, write the code from `references/06-generator-utility.md` into `generator_utils.py` (or embed it).
    - **B. Data Maps**: Inside the script, define your hex codes and paths in standard Python dicts/lists.
    - **C. Loop**: Loop through your data calling `create_token` and `nest_token`. Use the self-correcting prefix stripping and backfilling guards built into the utility.
    - **D. Persistence (FAIL-SAFE)**: Do NOT pickle the `gen` object directly. Use `pickle.dump(gen.to_dict(), f)` to save state as a plain dictionary.
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
> 5. **Icon Mapping**: The `color/icon/*` group in Component Colors should alias `Semantic` for general UI roles (default, muted, brand, error, etc.). Component Colors ALWAYS aliases Semantic — never Theme, never Primitives.
> 6. **Mandatory $value (Real Value Rule)**: `$value` on alias tokens is a placeholder but must be structural. Use the **Actual Resolved Value** for numbers and strings (safety fallback). Use a **Black Object** for colors. String tokens REQUIRE `"com.figma.type": "string"` at all Tiers, and **Primitive Strings DO have scopes**. NO curly braces. See `references/03-json-format.md`.
> 7. **Typography Completeness Check**: Before writing Typography, explicitly list every role × every property (fontSize, lineHeight, letterSpacing, fontFamily, fontWeight) as a checklist. Verify all 5 are present for every role. A missing property = a dropped token in Figma.
> 8. **Semantic Path Verification**: When referencing Semantic in `Component Colors`, verify that the specific path (e.g. `surface/raised`) was actually generated in the Semantic collection. It is not enough to check if the collection exists; you must check the path completeness.
> 9. **Path Normalization**: Always use `.lower()` when constructing path strings in your Python logic (e.g. `path = f"font/lineheight/{role}".lower()`). Special care for `lineheight`, `letterspacing`, `fontweight` — these must NOT be camelCase in any script lookup, prebuild, or registry call. Normalization must happen at **construction**, not just at lookup.
> 10. **Naming Collision Check (Mandatory)**: Before building any collection, verify no path is both a token ($value) and a group (children). If `action/destructive` has a value, it cannot have children like `action/destructive/text`. **Fix**: Move the base value to `action/destructive/default`.
> 11. **Contextual Hiding Logic (Intelligence Rule)**: Set `hidden_from_publishing=True` based on the Architecture (Q7) and the per-tier table in `01-architecture.md`:
>     - **1-Tier**: Everything is **Visible** (Primitives are the picking layer).
>     - **2-Tier**: Primitives = **Hidden**. Semantic, Responsive, Density, Typography, Effects, Layout = **Visible** (No components exist, so users pick from these layers).
>     - **3-Tier**: Primitives, Semantic, Responsive, Density = **Hidden**. Component Colors, Component Dimensions, Typography, Effects, Layout = **Visible**.
>     - **4-Tier**: Primitives, Theme, Semantic, Responsive, Density = **Hidden**. Component Colors, Component Dimensions, Typography, Effects, Layout = **Visible**.
> 12. **Custom Collection Alias Rule**: Color tokens in Custom Collections (ns 90+) are NOT allowed to have hardcoded hex values. They MUST alias Primitives. If the hex is new, backfill it into Primitives first.
> 13. **Pre-Generation Coverage Audit — All Collections**: Before building any collection, run `validate_responsive_coverage` from `06-generator-utility.md`. If it fails, add the missing primitives to your Turn A script before saving the Primitives collection. Never proceed to aliasing until the audit passes.
> 14. **TOKEN COUNTING RULE (CRITICAL)**: Count unique token PATHS, not mode instances. A Semantic token with light + dark modes is **1 token**, not 2. A Responsive token with mobile + tablet + desktop modes is **1 token**, not 3. The Turn D count table must reflect unique paths only. Never multiply by mode count.
> 15. **Scoping Rule**: ALL tokens in ALL collections (including Primitives) receive correct scopes via `get_scope()` from `02-scoping-rules.md`. Pass `is_primitive=True` for Primitives. No token should have an absent scope key.

**Output constraint:** Output only valid `.zip` files containing the structured JSON. Do not output `.skill` files or dump raw scripts — this confuses users who expect ready-to-import ZIPs and risks context truncation.

### Local Environment Output (IDE / CLI / Desktop Apps)

If you have **local filesystem access** (running in an IDE, CLI, terminal-based tool, or desktop AI app), use the disk-based output workflow instead of a download widget:

**1. Project Setup (first run only):**
Create this folder structure in the user's current working directory:
```
figma-variables-generator/
├── scripts/
│   ├── generator_core.py    ← Write once from scripts/generator_core.py
│   └── gen_all.py            ← Your brand-specific generation script
└── export/
    └── (ZIPs appear here)
```

Run these commands:
```bash
mkdir -p figma-variables-generator/scripts figma-variables-generator/export
```

**2. Write `generator_core.py` (first run only):**
Write the contents of `scripts/generator_core.py` (from this skill) to `figma-variables-generator/scripts/generator_core.py`. If it already exists from a previous run, **skip this step**.

**3. Write `gen_all.py` (every run):**
Write your brand-specific generation script to `figma-variables-generator/scripts/gen_all.py`. This script should:
- Import from `generator_core`: `from generator_core import DesignTokenGenerator, prebuild_ids, make_family`
- Follow the same Data Blueprint Workflow (brand_data dict → create_token loops → save_mode)
- End with `gen.build_zip(output_dir="../export")` to write the ZIP to the export folder
- The `build_zip()` method auto-numbers if a ZIP already exists (e.g. `design-tokens (1).zip`)

**4. Execute:**
```bash
cd figma-variables-generator/scripts && python gen_all.py
```

**5. Inform the user:**
After execution, tell the user the exact path where the ZIP was saved. Example:
> "Your design tokens ZIP has been saved to `figma-variables-generator/export/design-tokens.zip`. You can import this into Figma using the Variables Tokens Collections Importer plugin."

**6. Modifications:**
If the user requests changes (e.g. "change the blue palette"), modify only `gen_all.py` and re-run. A new auto-numbered ZIP will appear in `export/`. Do NOT rewrite `generator_core.py` — it never changes.

> **Phased generation in local mode:** For Turn A/B/C, write a single `gen_all.py` that includes all phases. Use `pickle.dump(gen.to_dict(), f)` between turns only if context limits require splitting across separate conversations. Within the same conversation, keep everything in one script.

> **Browser environments:** If you are running in a browser-based sandbox (no filesystem access), ignore this section entirely. Use the standard download widget approach.

> **Critical performance rule for Path 2:** Do NOT attempt to write one giant script or generate all JSON in a single turn. Break the generation across multiple turns as instructed below. Wait for the user to reply "Next" before proceeding.

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
**Before writing Primitives:** You MUST audit ALL downstream collections — especially **Custom Collections (Q11)** — for new raw values (brand hexes, specific spacing numbers, etc). If a Custom Collection requires a new hex, you MUST define it in your `brand_data` Primitive mapping right now. Apply the Backfilling Rule here. Do NOT enumerate individual tokens in your thinking block. Write your `brand_data` dictionary immediately!

Calculate the JSON for these collections ONLY (Save to memory, NO ZIP OUTPUT YET):
1. **Primitives:** full colour palette + alpha variants (flat-sibling pattern) + all font tokens under `font/` group + layout primitive values + spacing + shadow geometry + borderWidth (0.3/0.5/0.8/1/2/4) + radius + blur. **ALL Primitives get scopes via `get_scope(is_primitive=True)`.**
2. **Mode-switching collection (TIER-DEPENDENT):**
   - **2-Tier / 3-Tier → Build `Semantic` with modes** (light.tokens.json + dark.tokens.json). Aliases Primitives. Every surface/text/border/interactive/feedback/overlay/icon/shadow group. **Minimum 55 unique token paths** (see Semantic Floor Rule in `05b`). Use the token count from Q7b (Lean/Standard/Enterprise) to decide density.
   - **4-Tier → Build `Theme` with modes** (light.tokens.json + dark.tokens.json). Aliases Primitives. Same token groups as Semantic.

*Stop here. Explicitly tell the user: "Turn A complete (Primitives & [Semantic/Theme]). Type **Next** to generate structural collections (Responsive, Density, Layout, Effects)."*

---

### TURN B — Structural Collections
*(Wait for user to type "Next")*

Calculate the JSON for these collections ONLY (Save to memory, NO ZIP OUTPUT YET):
1. **Responsive:** all font size/lineHeight/letterSpacing roles × 3 breakpoints + radius × 3 breakpoints + borderWidth × 3 breakpoints
2. **Density:** padding (x/y/top/bottom/left/right, with full xs-4xl scale nested under each direction — e.g. `padding/x/md`, values up to 64px at spacious) + gap (xs/sm/md/lg/xl/2xl/3xl/4xl — up to 128px at spacious) × 3 modes
3. **Layout:** Layout structural variables (if selected)
4. **Effects:** shadow sm/md/lg/xl (colour → **Semantic** (2/3-Tier) or **Theme** (4-Tier), geometry → Primitives) + blur tokens

*Stop here. Explicitly tell the user: "Turn B complete. Type **Next** to generate the final component collections and compile the ZIP."*

---

### TURN C — Components & Final Compilation
*(Wait for user to type "Next")*

Calculate the JSON for these collections ONLY:
1. **Typography:** every role × 5 properties (fontSize/lineHeight/letterSpacing → Responsive; fontFamily/fontWeight → Primitives) + colour tokens → **Semantic** (2/3-Tier) or **Theme** (4-Tier)
2. **Semantic (4-Tier ONLY):** Build `semantic.tokens.json` (single mode, no light/dark). Aliases **Theme**. Same token paths as Theme but one level higher in the chain. **Minimum 55 unique token paths.**
3. **Component Colors (3-Tier / 4-Tier):** every component × every variant × every state + icon duotone tokens. **MUST alias Semantic — never Theme, never Primitives.** Run `validate_semantic_coverage()` before building.
4. **Component Dimensions (3-Tier / 4-Tier):** all padding/gap (→ Density) + all radius/borderWidth (→ Responsive)

**Critical step:** Now take the JSON from Turn A, Turn B, and Turn C. Package them all together and output **ONE SINGLE `.zip` WIDGET** containing everything. The structure must be folders numbered by import order per the chosen tier (e.g. 3-Tier: `1. Primitives`, `2. Semantic`; 4-Tier: `1. Primitives`, `2. Theme`, `3. Semantic`). No intermediate ZIPs or nested archives.

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
Semantic            48       (4-Tier only)
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
