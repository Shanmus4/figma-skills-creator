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

## PHASE 0 — EXISTING FIGMA SYSTEM?

Ask using ask_user_input:

> "Do you have an existing component system in Figma you'd like to build on?"

Options: `Yes — I'll export my existing variables` / `No — starting from scratch`

**If YES:** Give these exact export instructions:

> To export your variables from Figma:
> 1. Open your Figma file → open the **Local Variables** panel (right sidebar or via the main menu)
> 2. **Right-click on each collection** (e.g. "Colours", "Spacing", "Typography") → select **"Export variables"**
> 3. You'll get one JSON file per collection — do this for every collection you have
> 4. **Before sharing: rename each file** so it's clear what it contains — e.g. rename `variables.json` to `my-colours-primitives.json`, `my-spacing.json`, `my-typography.json` etc. This helps me understand your system structure
> 5. Share all the renamed files here

Once received: analyse naming conventions, existing token paths, modes, alias chains. Adapt the generated system to match their conventions.

Then ask using ask_user_input:
> "How would you like to proceed?"

Options: `Migrate + extend existing tokens` / `Start fresh, keep existing as-is`

---

## PHASE 1 — QUESTIONNAIRE

### Critical Rules
- **Every question with discrete options uses `ask_user_input` tool — always**
- **Open-text questions (brand name, colour hex, font names) are asked as plain text — wait for user response before proceeding**
- **Do NOT show a dropdown while an open-text question is pending**
- **Club discrete questions into batches** — multiple dropdowns in one turn when thematically related
- **No filler responses** between turns ("Great!", "Perfect!" — skip entirely)
- **Last option on every dropdown** allows custom input
- **If user selects a custom/open option or describes something unusual, ask a follow-up** for clarity before proceeding to the next turn

---

### TURN 1 — Brand Name (open text only)

Ask only this:

> "What's the name of your brand or product?"

Wait for the response. Do not show any dropdowns yet.

---

### TURN 2 — Existing Codebase (open text + conditional)

Ask only this:

> "Do you have an existing product already built? If yes, what kind — website, web app, or mobile app?"

Wait for the response. Then:

**If website or web app:** Tell the user:

> "To help me match your existing design system, open your product in **Chrome** and run this script in the browser console. It will extract your current design tokens automatically.
>
> **How to open the console:**
> - Chrome / Edge: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac) → click the **Console** tab
> - Then paste the entire script below and press Enter
> - The result will be **copied to your clipboard automatically** — paste it here"

Then show this script in a code block:

```javascript
(function () {
  const tokens = {
    colors: new Set(), fontSizes: new Set(), fontFamilies: new Set(),
    fontWeights: new Set(), lineHeights: new Set(), letterSpacings: new Set(),
    spacing: new Set(), radii: new Set(), shadows: new Set(),
    zIndex: new Set(), cssVariables: {}, transitions: new Set()
  };

  function parseColor(v) {
    v = v.trim();
    if (!v || v === 'transparent' || v === 'none' || v === 'inherit' || v === 'currentColor') return null;
    if (v === 'rgba(0, 0, 0, 0)' || v === 'rgb(0, 0, 0, 0)') return null;
    if (v.startsWith('#')) return v;
    const rgb = v.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
    if (rgb) {
      const hex = [rgb[1], rgb[2], rgb[3]]
        .map(n => Math.round(parseFloat(n)).toString(16).padStart(2, '0')).join('');
      return '#' + hex;
    }
    const hsl = v.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/);
    if (hsl) {
      let [h, s, l] = [parseFloat(hsl[1]) / 360, parseFloat(hsl[2]) / 100, parseFloat(hsl[3]) / 100];
      const hue = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q-p)*6*t; if (t < 1/2) return q; if (t < 2/3) return p + (q-p)*(2/3-t)*6; return p; };
      if (s === 0) { const v = Math.round(l * 255); return '#' + v.toString(16).padStart(2,'0').repeat(3); }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      return '#' + [hue(p,q,h+1/3), hue(p,q,h), hue(p,q,h-1/3)].map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('');
    }
    return v;
  }

  const colorProps = ['color','background-color','border-color','border-top-color',
    'border-bottom-color','border-left-color','border-right-color',
    'outline-color','fill','stroke','caret-color','text-decoration-color'];

  function scanElement(el) {
    try {
      const s = getComputedStyle(el);
      colorProps.forEach(p => { const c = parseColor(s.getPropertyValue(p)); if (c) tokens.colors.add(c); });
      const fs = s.getPropertyValue('font-size'); if (fs && fs !== '0px') tokens.fontSizes.add(fs);
      const ff = s.getPropertyValue('font-family'); if (ff) tokens.fontFamilies.add(ff.split(',')[0].replace(/['"]/g,'').trim());
      const fw = s.getPropertyValue('font-weight'); if (fw) tokens.fontWeights.add(fw);
      const lh = s.getPropertyValue('line-height'); if (lh && lh !== 'normal') tokens.lineHeights.add(lh);
      const ls = s.getPropertyValue('letter-spacing'); if (ls && ls !== 'normal') tokens.letterSpacings.add(ls);
      ['margin','margin-top','margin-bottom','margin-left','margin-right',
       'padding','padding-top','padding-bottom','padding-left','padding-right',
       'gap','row-gap','column-gap'].forEach(p => { const v = s.getPropertyValue(p); if (v && v !== '0px') tokens.spacing.add(v); });
      const r = s.getPropertyValue('border-radius'); if (r && r !== '0px') tokens.radii.add(r);
      const sh = s.getPropertyValue('box-shadow'); if (sh && sh !== 'none') tokens.shadows.add(sh);
      const z = s.getPropertyValue('z-index'); if (z && z !== 'auto' && z !== '0') tokens.zIndex.add(z);
      const tr = s.getPropertyValue('transition'); if (tr && tr !== 'none' && tr !== 'all 0s ease 0s') tokens.transitions.add(tr);
      if (el.shadowRoot) el.shadowRoot.querySelectorAll('*').forEach(scanElement);
    } catch(e) {}
  }

  document.querySelectorAll('*').forEach(scanElement);

  const sheets = [...document.styleSheets];
  const allStyleTags = [...document.querySelectorAll('style')];
  allStyleTags.forEach(tag => {
    try {
      if (tag.sheet && !sheets.includes(tag.sheet)) sheets.push(tag.sheet);
    } catch(e) {}
  });

  sheets.forEach(sheet => {
    try {
      const rules = [...(sheet.cssRules || [])];
      rules.forEach(rule => {
        if (rule.style) {
          [...rule.style].forEach(prop => {
            if (prop.startsWith('--')) {
              tokens.cssVariables[prop] = rule.style.getPropertyValue(prop).trim();
            }
          });
        }
        if (rule.cssRules) {
          [...rule.cssRules].forEach(r => {
            if (r.style) [...r.style].forEach(p => {
              if (p.startsWith('--')) tokens.cssVariables[p] = r.style.getPropertyValue(p).trim();
            });
          });
        }
      });
    } catch(e) {}
  });

  const cssVarCount = Object.keys(tokens.cssVariables).length;
  const colorList = [...tokens.colors].sort();
  const spacingList = [...tokens.spacing].sort((a,b) => parseFloat(a)-parseFloat(b));

  const result = {
    cssVariables: tokens.cssVariables,
    colors: colorList,
    fontSizes: [...tokens.fontSizes].sort((a,b) => parseFloat(a)-parseFloat(b)),
    fontFamilies: [...tokens.fontFamilies].sort(),
    fontWeights: [...tokens.fontWeights].sort(),
    lineHeights: [...tokens.lineHeights].sort(),
    letterSpacings: [...tokens.letterSpacings].sort(),
    spacing: spacingList,
    radii: [...tokens.radii].sort(),
    shadows: [...tokens.shadows].sort(),
    zIndex: [...tokens.zIndex].sort(),
    transitions: [...tokens.transitions].sort()
  };

  const out = JSON.stringify(result, null, 2);
  try { copy(out); console.log('%c✅ Copied to clipboard!', 'color:green;font-weight:bold'); }
  catch(e) { console.warn('copy() not available — manually copy the JSON below'); }
  console.log('%cDESIGN TOKENS EXTRACTED', 'color:#7C3AED;font-size:14px;font-weight:bold');
  console.log(result);
  console.log(`CSS vars: ${cssVarCount} | Colors: ${colorList.length} | Font sizes: ${result.fontSizes.length} | Spacing values: ${spacingList.length} | Radii: ${result.radii.length}`);
  return out;
})();
```

**If mobile app:** Tell the user:

> "For mobile apps (iOS/Android/React Native), I can't extract tokens from a console — ask your developer to share:
> - The design tokens file (usually `tokens.js`, `theme.ts`, `colors.ts`, `styles/variables.css`, or a `tokens/` folder)
> - Or a screenshot of the app with the most common screens — I'll reverse-engineer the palette and spacing from visual inspection
>
> Once you share either, I'll adapt the Figma system to match."

**If no existing product:** Continue to Turn 3.

After receiving token data (from script or developer files): Analyse the output — identify the existing colour palette, spacing scale, font stack, naming conventions, and any CSS variable naming patterns. Use this to inform the generated system: match existing hex values in Primitives, match naming style in token paths.

---


> Questionnaire continues in `SKILL-B.md` — Turns 3–9, Phase 2 confirm architecture.
