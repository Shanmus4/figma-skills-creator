# DesignTokenGenerator Utility

> You are in Load Stage 3 (Generation). Build the `brand_data` dictionary and execute the script immediately. Prose narration of what the code does adds nothing — the code is its own documentation.

## 1. Core Logic

```python
import json, zipfile, os
from io import BytesIO

class DesignTokenGenerator:
    def __init__(self, brand_name, syntax_format="css", platforms=None):
        self.brand_name = brand_name
        self.syntax_format = syntax_format
        self.platforms = platforms or ["WEB"] # ["WEB", "ANDROID", "iOS"]
        self.output_files = {} # { "1. Collection/mode.json": {} }
        self.token_registry = {} # { "path/to/token": "VariableID:X:Y" }
        self.counters = {} # { namespace: count }

    def to_dict(self):
        """Export state as a plain dict (Zero-dependency persistence fix)"""
        return {
            "brand_name": self.brand_name,
            "syntax_format": self.syntax_format,
            "platforms": self.platforms,
            "output_files": self.output_files,
            "token_registry": self.token_registry,
            "counters": self.counters
        }

    @classmethod
    def from_dict(cls, data):
        """Reconstruct generator from a plain dict"""
        obj = cls(data["brand_name"], data["syntax_format"], data.get("platforms", ["WEB"]))
        obj.output_files = data["output_files"]
        obj.token_registry = data["token_registry"]
        obj.counters = data["counters"]
        return obj

    def next_id(self, ns):
        self.counters[ns] = self.counters.get(ns, 0) + 1
        return f"VariableID:{ns}:{self.counters[ns]}"

    def resolve_id(self, id_map, path):
        """Safe accessor for pre-built ID maps (Fixes KeyError / Case Drift)"""
        key = path.lower()
        if key not in id_map:
            raise KeyError(f"PREBUILD MISS: Path '{key}' not found in ID map. Ensure it was added to prebuild_ids().")
        return id_map[key]

    def canonical_path(self, path):
        """
        Single source of truth for path identity.
        Use this SAME canonical form for:
        - create_token(name)
        - nest_token(path)
        - prebuild_ids(paths)
        - registry lookups
        - aliasData.targetVariableName
        Never emit one spelling and alias another.
        """
        return path.strip()

    def validate_responsive_coverage(self, resp_size, resp_lh, resp_ls):
        """Pre-flight audit for Responsive -> Primitive coverage."""
        missing = []
        for role, modes in resp_size.items():
            for v in (modes if isinstance(modes, list) else modes.values()):
                if f"font/size/{v}" not in self.token_registry: missing.append(f"font/size/{v}")
        for role, modes in resp_lh.items():
            for v in (modes if isinstance(modes, list) else modes.values()):
                if f"font/lineheight/{v}" not in self.token_registry: missing.append(f"font/lineheight/{v}")
        if missing:
            raise KeyError(f"BACKFILL REQUIRED: Missing paths in Primitives. Add them BEFORE saving Primitives: {list(set(missing))}")

    def validate_semantic_coverage(self, cc_map, sem_registry):
        """
        Pre-flight audit for Component Colors -> Semantic coverage.
        Run BEFORE building Component Colors in ALL tiers (3-Tier and 4-Tier).
        Component Colors MUST alias Semantic — never Theme, never Primitives.
        """
        missing = []
        for cc_path, target_sem_path in cc_map.items():
            # Strip the collection prefix if present for lookup
            clean_target = target_sem_path.lower().replace("semantic/", "", 1)
            if clean_target not in sem_registry:
                missing.append(f"{cc_path} -> {target_sem_path}")
        if missing:
            raise KeyError(f"SEMANTIC GAP: Component tokens alias non-existent Semantic paths. Fix before generating: {missing}")

    def create_token(self, name, ns, type, value=None, scope=None, alias_target=None, alias_set=None, vid=None, target_registry=None, hidden_from_publishing=False):
        path = self.canonical_path(name)
        vid = vid or self.next_id(ns)
        self.token_registry[path] = vid
        
        # Real Value / Placeholder Logic (Definitive):
        # 1. Colors: Black placeholder object on aliases.
        # 2. Numbers/Strings: Use the REAL resolved value (safety fallback).
        # 3. Strings: Always include "com.figma.type": "string".
        if alias_target and alias_set:
            if type == "color":
                value = {"colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000"}
            # Numbers and Strings use the 'value' passed into the function.

        ext = {
            "com.figma.variableId": vid,
            "com.figma.codeSyntax": self.get_full_syntax(path)
        }
        if type == "string":
            ext["com.figma.type"] = "string"
        if hidden_from_publishing:
            ext["com.figma.hiddenFromPublishing"] = True
        if scope:
            ext["com.figma.scopes"] = scope
            
        if alias_target:
            target_path = self.canonical_path(alias_target)
            # CRITICAL ALIAS RULE - Strip collection prefix from path for valid JSON
            known_sets = ["primitives/", "theme/", "responsive/", "density/", "layout/", "effects/", "typography/", "semantic/", "component colors/", "component dimensions/"]
            # Automatically add the target collection name to handle arbitrary custom collections
            if alias_set:
                known_sets.append(f"{alias_set.lower()}/")
                
            for s in known_sets:
                if target_path.startswith(s):
                    target_path = target_path.replace(s, "", 1)
                    break  # CRITICAL: Stop after stripping one prefix to prevent double-stripping!
            
            # Use specific target_registry if provided (Fixes Cross-Tier verification)
            registry = target_registry if target_registry is not None else self.token_registry
            target_vid = registry.get(target_path)
            
            # Automated Guard: If an alias target is declared, it MUST exist in the master registry.
            if not target_vid:
                raise KeyError(
                    f"CRITICAL ALIAS GAP: The target path '{target_path}' does NOT exist "
                    f"in the generator's memory. You cannot alias a token that hasn't been created yet. "
                    f"If this is a custom collection string/value, backfill it to Primitives in Turn A. "
                    f"If this is a Component Color, make sure the Semantic token was actually generated."
                )

            ext["com.figma.aliasData"] = {
                "targetVariableId": target_vid or "VariableID:0:0",
                "targetVariableName": target_path,
                "targetVariableSetName": alias_set
            }

        return { "$type": type, "$value": value, "$extensions": ext }

    def get_full_syntax(self, path):
        """Builds the com.figma.codeSyntax object based on active platforms."""
        syntax = {}
        for platform in self.platforms:
            # Keys are case-sensitive strings: WEB, ANDROID, iOS
            syntax[platform] = self.format_syntax(path, platform)
        return syntax

    def format_syntax(self, path, platform="WEB"):
        # Bug 2 Fix: Prevent double hyphens or spaces
        p = path.replace('/', '-').replace(' ', '-')
        while '--' in p: p = p.replace('--', '-')
        
        # Default Logic:
        # WEB: Applied chosen syntax_format (CSS, kebab, camel, etc.)
        # ANDROID: underscore_case (e.g. color_button_primary_background)
        # iOS: PascalCase (e.g. ColorButtonPrimaryBackground)
        if platform == "WEB":
            if self.syntax_format == "css": return f"--{p}"
            if self.syntax_format == "camel":
                parts = p.split('-')
                return parts[0] + ''.join(w.capitalize() for w in parts[1:])
            return p
        elif platform == "ANDROID":
            return p.replace('-', '_')
        elif platform == "iOS":
            return ''.join(w.capitalize() for w in p.split('-'))
        return p

    def nest_token(self, tree, path, token):
        path = self.canonical_path(path)
        parts = path.split('/')
        curr = tree
        for part in parts[:-1]:
            # Guard: If current node is already a token, it cannot be a branch/folder
            if part in curr and isinstance(curr[part], dict) and "$value" in curr[part]:
                raise ValueError(f"NAMING COLLISION: '{part}' in path '{path}' is already a token and cannot be used as a folder.")
            
            if part not in curr: curr[part] = {}
            curr = curr[part]
        
        # Guard: If a folder already exists here, we cannot overwrite it with a token ($value)
        if parts[-1] in curr and isinstance(curr[parts[-1]], dict) and "$value" not in curr[parts[-1]]:
             raise ValueError(f"NAMING COLLISION: '{parts[-1]}' in path '{path}' is already a folder and cannot be overwritten by a token value.")

        curr[parts[-1]] = token

    def save_mode(self, collection_name, mode_name, tree):
        tree["$metadata"] = { "modeName": mode_name }
        self.output_files[f"{collection_name}/{mode_name}.tokens.json"] = tree

    def build_zip(self):
        # Returns ZIP bytes or saves to disk
        pass

    def verify_chain_completeness(self):
        """Recursive alias chain verification. Call after ALL collections built."""
        broken = []
        for filename, data in self.output_files.items():
            self._walk_aliases(data, filename, broken)
        if broken:
            raise ValueError(
                f"CHAIN BREAK: {len(broken)} broken alias links:\n" +
                "\n".join(f"  ✗ {b}" for b in broken[:20]) +
                (f"\n  ...and {len(broken)-20} more" if len(broken) > 20 else "")
            )
        return True

    def _walk_aliases(self, node, context, broken):
        """Recursively find aliasData in JSON tree and verify targets exist."""
        if isinstance(node, dict):
            ad = node.get("$extensions", {}).get("com.figma.aliasData")
            if ad:
                vid = ad.get("targetVariableId", "")
                name = ad.get("targetVariableName", "")
                if vid == "VariableID:0:0" or not vid:
                    broken.append(f"{context}: '{name}' → UNRESOLVED (0:0)")
                elif name and name.lower() not in self.token_registry:
                    broken.append(f"{context}: '{name}' → NOT IN REGISTRY")
            for key, val in node.items():
                if not key.startswith("$"):
                    self._walk_aliases(val, f"{context}/{key}", broken)

    def verify_all_aliases(self):
        return self.verify_chain_completeness()
```

### Mandatory Add-On: Emitted Artifact Validation

Registry validation alone is not enough. A build can look valid internally while the emitted JSON still contains mismatched path spellings or wrong scopes.

After `verify_chain_completeness()`:
1. Flatten the actual emitted JSON paths from `output_files`
2. Verify every alias target against the emitted path inventory for that collection
3. Verify scope families from the emitted artifact:
   - `text/*` → `TEXT_FILL`
   - `border/*` → `STROKE`
   - `icon/*` → `SHAPE_FILL` + `STROKE`
   - `shadow/*/color` → `EFFECT_COLOR`
4. Fail the build if emitted JSON identity differs from registry identity

## How to use in Generation Phase:

### 1. The "Data Map" (IN SCRIPT ONLY)
Instead of calculating every ID manually, organize the choices into maps **inside your Python script**. NEVER build data maps in plain conversation text.
```python
primitives_data = {
    "color/blue/500": "#3B82F6",
    "spacing/16": 16,
    # ... any number of entries
}
```

### 2. The Execution (The Generator)
AI Assistant then writes a short script that loops through the map and calls `create_token` and `nest_token`. This keeps the "bespoke" part of the script extremely small.

### 3. Infinite Permutations
- **Modes**: Just call `save_mode` twice with different values for the same paths.
- **Tiers**: Just change the `alias_set` argument.
- **Special Tokens**: Just add a new key to the data map. Logic remains the same.

### 4. The Universal Cross-Collection Alias Law (CRITICAL)

**Bug Fix: Unresolved Alias Error (VariableID:0:0)**
To guarantee a 100% "SYNCED" import in Figma, you must deeply understand how scopes and keys change between tiers, and NEVER blindly mirror a layer's key into its parent if the parent uses a different structure.

**The Law:**
1. **Numeric Scales use RAW NUMBERS in Primitives:** Any size/scale-based primitive (borderwidth, radius, spacing/gap, opacity, blur, sizing) must be created using the literal physical value as the key (e.g., `borderwidth/1`, `opacity/10`, `spacing/16`). *Note: Primitives hold colors, strings, and booleans too, but for sizes/scales, never use T-shirt names.*
2. **Intermediate Layers use SEMANTIC SIZING (T-Shirt/Intent):** Structural layers (Responsive, Density, Effects, Semantic) use semantic or T-Shirt sizing (e.g., `sm, md, lg`, `compact`, `subtle`).
3. **The Alias Mapping:** When creating an intermediate token, **its target path MUST resolve exactly to the physical primitive's key**. 

```python
# THE PRIMITIVES MAP (Strictly Numbers)
primitives_data = {
    "borderwidth/1": 1,
    "borderwidth/2": 2,
    "radius/8": 8,
    "spacing/16": 16,
    "opacity/50": 0.5
}
```

```python
# THE STRUCTURAL MAP (T-Shirt -> Numeric Alias)
responsive_data = {
    # CORRECT: The T-shirt key points to the physical number
    "borderwidth/sm": "borderwidth/1",   
    "radius/md": "radius/8",
    "opacity/subtle": "opacity/50"
    
    # WARNING: Do NOT do "borderwidth/sm": "borderwidth/sm" unless the user 
    # explicitly commanded you to use T-shirt sizing in Primitives! 
    # Since Primitives default to numbers, blindly mirroring the key will crash the script.
}
```

This universal logic applies to **EVERY** property you generate. You must be implicitly smart about verifying that your alias target actually exists in the collection you are pointing to.

### 5. Colour Family Helper — Canonical Pattern (CRITICAL)

**RULE: Backfill Timing (CRITICAL)**
You MUST perform all `create_token` calls for Primitives (including backfilled values) **BEFORE** calling `save_mode("Primitives", ...)`. Any primitive added after the Primitives collection is saved will exist in the registry but will NOT be written to the output file, causing broken aliases in Responsive.

When generating a full colour family (shades + alpha variants), always use this exact tuple shape: **(key: str, hex_str: str)** — never include raw r/g/b floats in the tuple. Parse them inside the helper.

```python
# ✅ CORRECT — 2-tuple (key, hex)
ORANGERED_SHADES = [
    ("50",  "#FFF4F1"), ("100", "#FFE5DE"), ("200", "#FFCBBA"),
    ("300", "#FFA588"), ("400", "#F47D47"), ("500", "#D93900"),
    ("600", "#AE2C00"), ("700", "#882100"), ("800", "#631800"), ("900", "#3F0F00"),
]
ORANGERED_ALPHA_BASE = "#D93900"  # hex of the 500 shade for alpha variants

def make_family(gen, tree, family, shades, alpha_hex,
                scope=None, hidden_from_publishing=False):
    """
    shades: list of (key, hex_str). alpha_hex: base hex for alpha variants.
    scope: list of Figma scopes (e.g. ["ALL_FILLS"] for Primitives).
    hidden_from_publishing: bool for parent collections.
    """
    for key, h in shades:
        r = int(h[1:3],16)/255; g = int(h[3:5],16)/255; b = int(h[5:7],16)/255
        token = gen.create_token(f"color/{family}/{key}", 10, "color",
            value={"colorSpace": "srgb", "components": [r, g, b], "alpha": 1, "hex": h},
            scope=scope, hidden_from_publishing=hidden_from_publishing)
        gen.nest_token(tree, f"color/{family}/{key}", token)
        
    ar = int(alpha_hex[1:3],16)/255
    ag = int(alpha_hex[3:5],16)/255
    ab = int(alpha_hex[5:7],16)/255
    for a_val, a_key in [(0.08,"a8"),(0.16,"a16"),(0.24,"a24"),(0.32,"a32"),
                         (0.40,"a40"),(0.48,"a48"),(0.56,"a56"),(0.64,"a64"),(1.0,"a100")]:
        path = f"color/{family}/{a_key}"
        token = gen.create_token(path, 10, "color",
            value={"colorSpace": "srgb", "components": [ar, ag, ab], "alpha": a_val, "hex": alpha_hex},
            scope=scope, hidden_from_publishing=hidden_from_publishing)
        gen.nest_token(tree, path, token)
```

**Rule:** Never define a helper that accepts `(key, r, g, b)` or `(key, r, g, b, a, hex)` tuples. The hex string is the single source of truth. Always derive r/g/b from it.

### 4.1 Loop Safety & Unpacking (CRITICAL)
**THE ERROR:** `ValueError: too many values to unpack (expected 2)`
**THE CAUSE:** Unpacking a 3-item tuple into 2 variables: `for key, val in [("a", 1, "#f00")]`.
**THE GUARDRAIL:** Always use explicit unpacking or index access if the data structure is complex. When generating primitives in loops, verify the tuple length matches the unpacking statement exactly. Preferred pattern:
```python
# Use 2-tuples for simple (path, value) mapping
for path, hex_str in [("white", "#ffffff"), ("black", "#000000")]:
    ...
```

### 4.2 White/Black Alpha-Only Families — Canonical Pattern (CRITICAL)
White and black are special cases — they have NO solid shades, only alpha variants. 
ALWAYS use this exact 3-variable unpacking pattern. Never use 2-variable unpacking.

```python
# ✅ CORRECT — 3-tuple unpacking
for family, components, hex_str in [
    ("white", [1, 1, 1], "#FFFFFF"),
    ("black", [0, 0, 0], "#000000")
]:
    for a_val, a_key in [(0.08,"a8"),(0.16,"a16"),(0.24,"a24"),(0.32,"a32"),
                         (0.40,"a40"),(0.48,"a48"),(0.56,"a56"),(0.64,"a64"),(1.0,"a100")]:
        path = f"color/{family}/{a_key}"
        t = gen.create_token(path, 10, "color",
            value={"colorSpace":"srgb","components":components,"alpha":a_val,"hex":hex_str})
        gen.nest_token(prim_tree, path, t)

# ❌ WRONG — 2-variable unpacking on a 3-tuple
for family, rgb in [("white",[1,1,1],"#FFFFFF"), ...]:  # ValueError!
```

**Why this is different from colour families:** `make_family()` handles brand-colored families (green, red, etc.) automatically. White and black are NOT passed to `make_family()` — they must be written manually using this pattern every time.

### 5. Multi-Mode ID Stability Rule (CRITICAL)

**THE RULE:** Every token in a multi-mode collection (Theme, Responsive, Density, Layout) MUST have the SAME `variableId` across all its mode files. Figma uses the ID — not the path — to match modes to the same variable.

**THE FIX — prebuild IDs before writing any mode:**
```python
def prebuild_ids(gen, paths, ns):
    """
    Call ONCE before building any mode.
    Returns {path: variableId} — pass this map into every mode builder.
    """
    id_map = {}
    for path in paths:
        id_map[path.lower()] = gen.next_id(ns)
    return id_map

# Usage Example:
theme_paths = ["surface/page", "surface/default", "text/primary"]
theme_id_map = prebuild_ids(gen, theme_paths, ns=40)

# Then in EACH mode builder (light and dark), reuse the same ID:
for path in theme_paths:
    vid = theme_id_map[path.lower()] # Same ID used for light.tokens.json and dark.tokens.json
    token = gen.create_token(path, 40, "color", ..., vid=vid)
```

**Collections that REQUIRE prebuild:**
- Semantic (light + dark — in 2/3-Tier)
- Theme (light + dark — in 4-Tier only)
- Responsive (mobile + tablet + desktop)  
- Density (compact + comfortable + spacious)
- Layout (xs + sm + md + lg + xl + xxl)

### 6. Canonical Path Normalization (CRITICAL)

**RULE:** Always lowercase all path segments inside your Python script construction. Never use camelCase in path strings passed to `prebuild_ids` or `resolve_id`.

| Logical Segment | Canonical Lowercase Segment (Literal) |
|---|---|
| `lineHeight` | `lineheight` |
| `letterSpacing` | `letterspacing` |
| `fontFamily` | `fontfamily` |
| `fontWeight` | `fontweight` |
| `fontSize` | `fontsize` |

**Example of safe construction:**
```python
# ❌ WRONG — Case drift risk
path = f"font/lineHeight/{role}" 

# ✓ CORRECT — Absolute lowercase
path = f"font/lineheight/{role}".lower()
vid = gen.resolve_id(resp_id_map, path)
```
