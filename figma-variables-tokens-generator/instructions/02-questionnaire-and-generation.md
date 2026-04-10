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

**AUTONOMOUS PATH SELECTION:**
Since the `generator_core.py` SDK has been upgraded internally to handle complexity automatically, you only need to confirm the user wants to proceed.

1.  **Final Confirmation**:
    Ask using `ask_user_input` (single_select): *"Should I proceed with the generation as described above?"*
    - `Yes — generate everything`
    - `Change something first (e.g., architecture, naming, syntax)`

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
    - **A. Shared Utility**: Write `generator_core.py` from `scripts/generator_core.py` (or confirm it exists from a previous run).
    - **B. Brand Data**: Inside `gen_all.py`, define your brand color hex codes as shade lists.
    - **C. Builder Calls**: Call `build_*()` methods for standard collections. Use `create_token()` only for custom collections.
    - **Zero narration during generation**: Do not explain the output or summarize what was generated. Deliver the ZIP archive, then proceed to the token count table.

> **Performance & Stability Guardrails**
> 1. **Single-Script Generation Is Mandatory**: Always write all generation code in a **single `gen_all.py`** script and execute it once.
> 2. **NO PICKLE / STATE SAVING**: Never try to chunk the generation, save state, or use `pickle`. The Builder API is concise enough (40-80 lines) to execute the entire system safely in one go.
> 3. **Use Builder Methods**: For ALL standard collections, use `build_*()` methods from `references/06-generator-utility.md`. Only use `create_token()` for custom collections (Q11).
> 4. **Resumption Rule**: If interrupted (Continue button), pick up immediately from where you left off.

> **What the SDK Handles Automatically** — You do NOT need to manually manage these:
> 1. **Scoping**: Auto-derived from path + type via `get_scope()`. Override with explicit `scope=` only for unusual custom tokens.
> 2. **hiddenFromPublishing**: Auto-derived from tier + collection. Override with explicit `hidden_from_publishing=` only if needed.
> 3. **Number Backfilling**: Missing number primitives (e.g., `spacing/12`) are auto-created. Color/string primitives still require manual definition.
> 4. **ID Pre-building**: Builder methods handle `prebuild_ids()` internally for multi-mode collections.
> 5. **Alias Path Stripping**: Collection prefixes are auto-stripped from alias targets.
> 6. **Batch Error Reporting**: The SDK collects all errors instead of crashing. The generation report shows auto-fixes and remaining issues.
> 7. **Default Scales**: Primitives include 22 spacing values, 25 font sizes, 8 radius levels, 6 border widths, feedback colors, etc.
> 8. **Semantic Shade Mapping**: Light/dark shade inversion is built into `build_semantic()`.

> **What You Still Must Handle:**
> 1. **Brand Color Hex Codes**: Define the user's brand color shades (11 shades: 50-950).
> 2. **Custom Collections (Q11)**: Use `create_token()` for any non-standard collections. Backfill Primitives for custom color needs.
> 3. **Extra Semantic Tokens**: Pass `extra_tokens={}` to `build_semantic()` for brand-specific semantic tokens beyond the standard ~94.
> 4. **Component List**: Pass the component list from Q9 to `build_component_colors()`.
> 5. **Font Choices**: Pass user's font selections to `build_primitives()` and `build_typography()`.
> 6. **Naming Collision Check**: No path can be both a token ($value) and a group (children). Fix: move base value to `/default`.
> 7. **TOKEN COUNTING RULE**: Count unique token PATHS, not mode instances. A Semantic token with light + dark modes is **1 token**, not 2.
> 8. **Custom Typography & Scaling**: If you define completely custom roles (e.g. `man-lg`) in `build_typography`, you **MUST** also inject those specific size primitives into the system using `gen.build_responsive(extra_size_map={"man-lg": ...})`. If you do not map the underlying base primitives, the alias validation gate will block the run.

**Output constraint:** Output only valid `.zip` files containing the structured JSON. Do not output `.skill` files or dump raw scripts.

### Local Environment Output (IDE / CLI / Desktop Apps)

If you have **local filesystem access**, use the disk-based output workflow:

**1. Project Setup (first run only):**
```
figma-variables-generator/
├── scripts/
│   ├── generator_core.py    ← Write once from scripts/generator_core.py
│   └── gen_all.py            ← Your brand-specific generation script
└── export/
    └── (ZIPs appear here)
```

**2. Write `generator_core.py` (first run only):**
Write the contents of `scripts/generator_core.py` to the user's scripts folder. If it already exists, **skip this step**. NEVER modify this file.

**3. Write `gen_all.py` (every run):**
A complete `gen_all.py` using the builder API:

```python
from generator_core import DesignTokenGenerator

# ── Brand data ──
BRAND_SHADES = [
    ("50","#..."), ("100","#..."), ..., ("950","#..."),
]

gen = DesignTokenGenerator("BrandName", tier=3, syntax_format="css")

gen.build_primitives(
    brand_colors={"brand": BRAND_SHADES},
    grey_family="slate",
    font_families={"sans": "Inter", "serif": "Playfair Display", "mono": "JetBrains Mono"},
)
gen.build_semantic(brand="brand", grey="slate")
gen.build_responsive()
gen.build_density()
gen.build_layout()
gen.build_effects()
gen.build_typography(body_font="sans", display_font="sans", mono_font="mono")
gen.build_component_colors(components=["button", "input", "card"])
gen.build_component_dimensions()

gen.verify_all_aliases()
gen.build_zip(output_dir="../export")
```

**4. Execute:** `cd figma-variables-generator/scripts && python gen_all.py`

**5. Modifications:** If the user requests changes, modify only `gen_all.py` and re-run. **NEVER rewrite `generator_core.py`.**

> **Browser environments:** If running in a browser sandbox (no filesystem), use the standard download widget approach.

---

### GENERATION (SINGLE SHOT)
*(Execute immediately after user confirms "Yes")*
Generate all collections using builder methods in a single `gen_all.py` script. Run the script to produce **ONE `.zip` archive**.
Then jump to **Token count reporting**.

---

### Token count reporting (TURN D)

After delivering the ZIP, report a count table. Count **unique token paths** (not multiplied by modes).

Example:
```
TOKENS GENERATED
══════════════════════════════════
Collection          Tokens
──────────────────────────────────
Primitives          309
Semantic            94
Responsive          41
Density             18
Layout              5
Effects             24
Typography          68
Component Colors    103
Component Dimensions 32
──────────────────────────────────
Total               694
══════════════════════════════════
```

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
