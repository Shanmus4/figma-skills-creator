# Generator Utility Reference

Use this standardized Python structure to generate Figma Variables JSON. This prevents "bespoke logic" and ensures format perfection while handling infinite data variations.

## Core Utility (Standardized Logic)

```python
import json, zipfile, os
from io import BytesIO

class DesignTokenGenerator:
    def __init__(self, brand_name, syntax_format="css"):
        self.brand_name = brand_name
        self.syntax_format = syntax_format
        self.output_files = {} # { "1. Collection/mode.json": {} }
        self.token_registry = {} # { "path/to/token": "VariableID:X:Y" }
        self.counters = {} # { namespace: count }

    def next_id(self, ns):
        self.counters[ns] = self.counters.get(ns, 0) + 1
        return f"VariableID:{ns}:{self.counters[ns]}"

    def create_token(self, name, ns, type, value=None, scope=None, alias_target=None, alias_set=None, vid=None):
        path = name.lower()
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
            "com.figma.codeSyntax": { "WEB": self.format_syntax(path) }
        }
        if type == "string":
            ext["com.figma.type"] = "string"
        if scope:
            ext["com.figma.scopes"] = scope
            
        if alias_target:
            target_path = alias_target.lower()
            # Bug 1 Fix: CRITICAL ALIAS RULE - Strip collection prefix from path
            known_sets = ["primitives/", "theme/", "responsive/", "density/", "layout/", "effects/", "typography/", "semantic/", "component colors/", "component dimensions/"]
            for s in known_sets:
                if target_path.startswith(s):
                    target_path = target_path.replace(s, "", 1)
            
            target_vid = self.token_registry.get(target_path)
            
            # Bug 3 & 7 Fix: Automated Backfilling Guard
            if not target_vid and alias_set == "Primitives":
                # If target is missing in Primitives, this token WILL fail.
                # AI must fail-fast here and add the missing primitive first.
                raise KeyError(f"MISSING PRIMITIVE: Target '{target_path}' not found in Primitives registry. You MUST add this primitive before aliasing it.")

            ext["com.figma.aliasData"] = {
                "targetVariableId": target_vid or "VariableID:0:0", # Should not be 0:0 for production
                "targetVariableName": target_path,
                "targetVariableSetName": alias_set
            }

        return { "$type": type, "$value": value, "$extensions": ext }

    def format_syntax(self, path):
        # Implement user choice: css, tailwind, camel, pascal, xml
        # Bug 2 Fix: Prevent double hyphens or spaces
        p = path.replace('/', '-').replace(' ', '-')
        while '--' in p: p = p.replace('--', '-')
        
        if self.syntax_format == "css": return f"--{p}"
        return p

    def nest_token(self, tree, path, token):
        parts = path.split('/')
        curr = tree
        for part in parts[:-1]:
            if part not in curr: curr[part] = {}
            curr = curr[part]
        curr[parts[-1]] = token

    def save_mode(self, collection_name, mode_name, tree):
        tree["$metadata"] = { "modeName": mode_name }
        self.output_files[f"{collection_name}/{mode_name}.tokens.json"] = tree

    def build_zip(self):
        # Returns ZIP bytes or saves to disk
        pass

    def verify_all_aliases(self):
        """Cross-collection verification gate (Bug 2 & 7)"""
        for filename, data in self.output_files.items():
            # (Recursive traversal to find all aliasData and verify target_vid != 0:0)
            pass
```

## How to use in Generation Phase:

### 1. The "Data Map" (The Blueprint)
Instead of calculating every ID manually, Claude organizes the choices into maps:
```python
primitives_data = {
    "color/blue/500": "#3B82F6",
    "spacing/16": 16,
    # ... any number of entries
}
```

### 2. The Execution (The Generator)
Claude then writes a short script that loops through the map and calls `create_token` and `nest_token`. This keeps the "bespoke" part of the script extremely small.

### 3. Infinite Permutations
- **Modes**: Just call `save_mode` twice with different values for the same paths.
- **Layers**: Just change the `alias_set` argument.
- **Special Tokens**: Just add a new key to the data map. Logic remains the same.

### 4. Colour Family Helper — Canonical Pattern (CRITICAL)

When generating a full colour family (shades + alpha variants), always use this exact tuple shape: **(key: str, hex_str: str)** — never include raw r/g/b floats in the tuple. Parse them inside the helper.

```python
# ✅ CORRECT — 2-tuple (key, hex)
ORANGERED_SHADES = [
    ("50",  "#FFF4F1"), ("100", "#FFE5DE"), ("200", "#FFCBBA"),
    ("300", "#FFA588"), ("400", "#F47D47"), ("500", "#D93900"),
    ("600", "#AE2C00"), ("700", "#882100"), ("800", "#631800"), ("900", "#3F0F00"),
]
ORANGERED_ALPHA_BASE = "#D93900"  # hex of the 500 shade for alpha variants

def make_family(gen, tree, family, shades, alpha_hex):
    """shades: list of (key, hex_str). alpha_hex: base hex for alpha variants."""
    for key, h in shades:
        r = int(h[1:3],16)/255; g = int(h[3:5],16)/255; b = int(h[5:7],16)/255
        token = gen.create_token(f"color/{family}/{key}", 10, "color", value={"colorSpace": "srgb", "components": [r, g, b], "alpha": 1, "hex": h})
        gen.nest_token(tree, f"color/{family}/{key}", token)
        
    ar = int(alpha_hex[1:3],16)/255
    ag = int(alpha_hex[3:5],16)/255
    ab = int(alpha_hex[5:7],16)/255
    for a_val, a_key in [(0.08,"a8"),(0.16,"a16"),(0.24,"a24"),(0.32,"a32"),
                         (0.40,"a40"),(0.48,"a48"),(0.56,"a56"),(0.64,"a64"),(1.0,"a100")]:
        path = f"color/{family}/{a_key}"
        token = gen.create_token(path, 10, "color", value={"colorSpace": "srgb", "components": [ar, ag, ab], "alpha": a_val, "hex": alpha_hex})
        gen.nest_token(tree, path, token)
```

**Rule:** Never define a helper that accepts `(key, r, g, b)` or `(key, r, g, b, a, hex)` tuples. The hex string is the single source of truth. Always derive r/g/b from it.

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
- Theme (light + dark)
- Responsive (mobile + tablet + desktop)  
- Density (compact + comfortable + spacious)
- Layout (xs + sm + md + lg + xl + xxl)
