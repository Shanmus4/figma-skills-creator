"""
DesignTokenGenerator — Core engine for Figma Variable JSON generation.

Executable version of the class documented in references/06-generator-utility.md.
This file is written to the user's project by the AI for local environments.

Usage:
    from generator_core import DesignTokenGenerator, prebuild_ids, make_family
"""

import json
import zipfile
import os
from io import BytesIO


class DesignTokenGenerator:
    def __init__(self, brand_name, syntax_format="css", platforms=None):
        self.brand_name = brand_name
        self.syntax_format = syntax_format
        self.platforms = platforms or ["WEB"]  # ["WEB", "ANDROID", "iOS"]
        self.output_files = {}   # { "1. Collection/mode.json": {} }
        self.token_registry = {} # { "path/to/token": "VariableID:X:Y" }
        self.counters = {}       # { namespace: count }

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
        obj = cls(data["brand_name"], data["syntax_format"],
                  data.get("platforms", ["WEB"]))
        obj.output_files = data["output_files"]
        obj.token_registry = data["token_registry"]
        obj.counters = data["counters"]
        return obj

    def next_id(self, ns):
        self.counters[ns] = self.counters.get(ns, 0) + 1
        return f"VariableID:{ns}:{self.counters[ns]}"

    def canonical_path(self, path):
        """
        Single source of truth for token path identity.
        Preserve semantic spelling; normalize only transport noise.
        """
        if not isinstance(path, str):
            raise TypeError(f"Token path must be a string, got {type(path)!r}")
        normalized = path.strip().replace("\\", "/")
        while "//" in normalized:
            normalized = normalized.replace("//", "/")
        return normalized

    def resolve_id(self, id_map, path):
        """Safe accessor for pre-built ID maps (Fixes KeyError / Case Drift)"""
        key = self.canonical_path(path)
        if key not in id_map:
            raise KeyError(
                f"PREBUILD MISS: Path '{key}' not found in ID map. "
                "Ensure it was added to prebuild_ids().")
        return id_map[key]

    def validate_responsive_coverage(self, resp_size, resp_lh, resp_ls):
        """Pre-flight audit for Responsive -> Primitive coverage."""
        missing = []
        for role, modes in resp_size.items():
            for v in (modes if isinstance(modes, list) else modes.values()):
                target = self.canonical_path(f"font/size/{v}")
                if target not in self.token_registry:
                    missing.append(target)
        for role, modes in resp_lh.items():
            for v in (modes if isinstance(modes, list) else modes.values()):
                candidates = [
                    self.canonical_path(f"font/lineHeight/{v}"),
                    self.canonical_path(f"font/lineheight/{v}"),
                ]
                if not any(candidate in self.token_registry for candidate in candidates):
                    missing.append(candidates[0])
        if missing:
            raise KeyError(
                f"BACKFILL REQUIRED: Missing paths in Primitives. "
                f"Add them BEFORE saving Primitives: {list(set(missing))}")

    def validate_semantic_coverage(self, cc_map, sem_registry):
        """Pre-flight audit for Component Colors -> Semantic coverage."""
        missing = []
        for cc_path, target_sem_path in cc_map.items():
            clean_target = self.canonical_path(target_sem_path)
            if clean_target.startswith("semantic/"):
                clean_target = clean_target.replace("semantic/", "", 1)
            if clean_target not in sem_registry:
                missing.append(f"{cc_path} -> {target_sem_path}")
        if missing:
            raise KeyError(
                f"SEMANTIC GAP: Component tokens alias non-existent "
                f"Semantic paths. Fix before generating: {missing}")

    def create_token(self, name, ns, type, value=None, scope=None,
                     alias_target=None, alias_set=None, vid=None,
                     target_registry=None, hidden_from_publishing=False):
        path = self.canonical_path(name)
        vid = vid or self.next_id(ns)
        self.token_registry[path] = vid

        # Alias placeholder: black for colors, real value for numbers/strings
        if alias_target and alias_set:
            if type == "color":
                value = {"colorSpace": "srgb", "components": [0, 0, 0],
                         "alpha": 1, "hex": "#000000"}

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
            known_sets = [
                "primitives/", "theme/", "responsive/", "density/",
                "layout/", "effects/", "typography/", "semantic/",
                "component colors/", "component dimensions/"
            ]
            # Automatically add the target collection name to handle arbitrary custom collections
            if alias_set:
                known_sets.append(f"{self.canonical_path(alias_set).lower()}/")
                
            for s in known_sets:
                if target_path.startswith(s):
                    target_path = target_path.replace(s, "", 1)
                    break

            registry = (target_registry if target_registry is not None
                        else self.token_registry)
            target_vid = registry.get(target_path)

            # Backfilling guards
            if not target_vid and alias_set == "Primitives":
                raise KeyError(
                    f"MISSING PRIMITIVE: Target '{target_path}' not found "
                    "in Primitives registry. Add it before aliasing.")
            elif not target_vid and target_registry is not None:
                raise KeyError(
                    f"CROSS-TIER GAP: Target '{target_path}' not found "
                    f"in {alias_set} registry. This will break the import.")

            ext["com.figma.aliasData"] = {
                "targetVariableId": target_vid or "VariableID:0:0",
                "targetVariableName": target_path,
                "targetVariableSetName": alias_set
            }

        return {"$type": type, "$value": value, "$extensions": ext}

    def get_full_syntax(self, path):
        """Builds the com.figma.codeSyntax object based on active platforms."""
        syntax = {}
        for platform in self.platforms:
            syntax[platform] = self.format_syntax(path, platform)
        return syntax

    def format_syntax(self, path, platform="WEB"):
        p = self.canonical_path(path).replace('/', '-').replace(' ', '-')
        while '--' in p:
            p = p.replace('--', '-')
        # WEB: Uses chosen syntax_format (css, kebab, camel, etc.)
        # ANDROID: underscore_case (e.g. color_button_primary_background)
        # iOS: PascalCase (e.g. ColorButtonPrimaryBackground)
        if platform == "WEB":
            if self.syntax_format == "css":
                return f"--{p}"
            if self.syntax_format == "camel":
                parts = p.split('-')
                return parts[0] + ''.join(
                    w.capitalize() for w in parts[1:])
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
            if part not in curr:
                curr[part] = {}
            curr = curr[part]
        curr[parts[-1]] = token

    def save_mode(self, collection_name, mode_name, tree):
        tree["$metadata"] = {"modeName": mode_name}
        self.output_files[
            f"{collection_name}/{mode_name}.tokens.json"] = tree

    def build_zip(self, output_dir=None, filename="design-tokens"):
        """
        Build ZIP from all saved mode files.
        If output_dir is provided, writes ZIP to disk with auto-numbering.
        Always returns ZIP bytes.
        """
        buf = BytesIO()
        with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
            for filepath, tree in self.output_files.items():
                zf.writestr(filepath, json.dumps(tree, indent=2))

        zip_bytes = buf.getvalue()

        if output_dir is None:
            output_dir = "exports"

        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            base_path = os.path.join(output_dir, f"{filename}.zip")
            if not os.path.exists(base_path):
                final_path = base_path
            else:
                counter = 1
                while True:
                    candidate = os.path.join(
                        output_dir, f"{filename} ({counter}).zip")
                    if not os.path.exists(candidate):
                        final_path = candidate
                        break
                    counter += 1
            with open(final_path, 'wb') as f:
                f.write(zip_bytes)
            abs_path = os.path.abspath(final_path)
            print(f"\n{'=' * 50}")
            print(f"  ZIP saved: {abs_path}")
            print(f"  Size: {len(zip_bytes):,} bytes")
            print(f"  Collections: {len(self.output_files)} files")
            print(f"{'=' * 50}\n")
            return zip_bytes, final_path

        return zip_bytes

    def verify_chain_completeness(self):
        """Recursive alias chain verification. Call after ALL collections built.
        Walks every alias, verifies full chain to Primitives is intact."""
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
                elif name and self.canonical_path(name) not in self.token_registry:
                    broken.append(f"{context}: '{name}' → NOT IN REGISTRY")
            for key, val in node.items():
                if not key.startswith("$"):
                    self._walk_aliases(val, f"{context}/{key}", broken)

    def flatten_emitted_paths(self):
        """Returns {collection_set_name: set(paths)} from the actual emitted JSON."""
        emitted = {}
        for filepath, data in self.output_files.items():
            folder = filepath.split("/", 1)[0]
            collection_name = folder.split(". ", 1)[1] if ". " in folder else folder
            path_set = emitted.setdefault(collection_name, set())
            self._walk_paths(data, "", path_set)
        return emitted

    def verify_emitted_alias_targets(self):
        """
        Validates alias targets against the emitted JSON artifact, not only the registry.
        This catches path identity drift between emitted keys and internal registries.
        """
        emitted = self.flatten_emitted_paths()
        broken = []
        for filepath, data in self.output_files.items():
            self._walk_emitted_aliases(data, filepath, emitted, broken)
        if broken:
            raise ValueError(
                f"EMITTED ARTIFACT BREAK: {len(broken)} invalid emitted alias targets:\n" +
                "\n".join(f"  ✗ {b}" for b in broken[:20]) +
                (f"\n  ...and {len(broken)-20} more" if len(broken) > 20 else "")
            )
        return True

    def verify_emitted_scope_families(self):
        """Checks critical scope families on the emitted artifact."""
        broken = []
        for filepath, data in self.output_files.items():
            self._walk_scopes(data, filepath, broken)
        if broken:
            raise ValueError(
                f"SCOPE BREAK: {len(broken)} emitted scope mismatches:\n" +
                "\n".join(f"  ✗ {b}" for b in broken[:20]) +
                (f"\n  ...and {len(broken)-20} more" if len(broken) > 20 else "")
            )
        return True

    def _walk_paths(self, node, prefix, out):
        if isinstance(node, dict):
            if "$value" in node:
                if prefix:
                    out.add(self.canonical_path(prefix))
                return
            for key, val in node.items():
                if key.startswith("$"):
                    continue
                next_prefix = f"{prefix}/{key}" if prefix else key
                self._walk_paths(val, next_prefix, out)

    def _walk_emitted_aliases(self, node, context, emitted, broken):
        if isinstance(node, dict):
            ad = node.get("$extensions", {}).get("com.figma.aliasData")
            if ad:
                target_set = ad.get("targetVariableSetName", "")
                target_name = self.canonical_path(ad.get("targetVariableName", ""))
                if target_set and target_name:
                    collection_paths = emitted.get(target_set)
                    if collection_paths is None:
                        broken.append(f"{context}: target set '{target_set}' missing from emitted ZIP")
                    elif target_name not in collection_paths:
                        broken.append(f"{context}: '{target_name}' missing from emitted set '{target_set}'")
            for key, val in node.items():
                if not key.startswith("$"):
                    self._walk_emitted_aliases(val, f"{context}/{key}", emitted, broken)

    def _walk_scopes(self, node, context, broken):
        if isinstance(node, dict):
            if "$value" in node:
                token_type = node.get("$type")
                scopes = node.get("$extensions", {}).get("com.figma.scopes", [])
                path = self.canonical_path(context.split("/", 1)[1] if "/" in context else context)
                expected = self._expected_scopes_for_path(path, token_type)
                if expected is not None and scopes != expected:
                    broken.append(f"{context}: expected {expected}, got {scopes}")
                return
            for key, val in node.items():
                if not key.startswith("$"):
                    next_context = f"{context}/{key}" if context else key
                    self._walk_scopes(val, next_context, broken)

    def _expected_scopes_for_path(self, path, token_type):
        p = self.canonical_path(path)
        if token_type == "color":
            if p.startswith("text/") or "/text/" in p or p.startswith("label/") or "/label/" in p or "/on-" in p:
                return ["TEXT_FILL"]
            if p.startswith("border/") or "/border/" in p or p.startswith("outline/") or "/outline/" in p:
                return ["STROKE"]
            if p.startswith("icon/") or "/icon/" in p:
                return ["SHAPE_FILL", "STROKE"]
            if "/shadow/" in p and p.endswith("/color"):
                return ["EFFECT_COLOR"]
            return None
        if token_type == "number":
            if p.startswith("font/size/") or p.endswith("/fontSize") or "/fontSize/" in p:
                return ["FONT_SIZE"]
            if p.startswith("font/lineHeight/") or p.endswith("/lineHeight") or "/lineHeight/" in p:
                return ["LINE_HEIGHT"]
            if p.startswith("font/letterSpacing/") or p.endswith("/letterSpacing") or "/letterSpacing/" in p:
                return ["LETTER_SPACING"]
            return None
        return None

    def verify_all_aliases(self):
        """Cross-collection verification gate. Now delegates to recursive walker."""
        self.verify_chain_completeness()
        self.verify_emitted_alias_targets()
        self.verify_emitted_scope_families()
        return True


# ─── Standalone Helpers ────────────────────────────────────────────────────────

def prebuild_ids(gen, paths, ns):
    """
    Call ONCE before building any mode in a multi-mode collection.
    Returns {path: variableId} — pass this map into every mode builder.
    """
    id_map = {}
    for path in paths:
        id_map[gen.canonical_path(path)] = gen.next_id(ns)
    return id_map


def make_family(gen, tree, family, shades, alpha_hex,
                scope=None, hidden_from_publishing=False):
    """
    Generate a full colour family (shades + alpha variants).
    shades: list of (key, hex_str). alpha_hex: base hex for alpha variants.
    scope: list of Figma scopes (e.g. ["ALL_FILLS"] for Primitives).
    hidden_from_publishing: bool for parent collections.
    """
    for key, h in shades:
        r = int(h[1:3], 16) / 255
        g = int(h[3:5], 16) / 255
        b = int(h[5:7], 16) / 255
        token = gen.create_token(
            f"color/{family}/{key}", 10, "color",
            value={"colorSpace": "srgb", "components": [r, g, b],
                   "alpha": 1, "hex": h},
            scope=scope,
            hidden_from_publishing=hidden_from_publishing)
        gen.nest_token(tree, f"color/{family}/{key}", token)

    ar = int(alpha_hex[1:3], 16) / 255
    ag = int(alpha_hex[3:5], 16) / 255
    ab = int(alpha_hex[5:7], 16) / 255
    for a_val, a_key in [(0.08, "a8"), (0.16, "a16"), (0.24, "a24"),
                         (0.32, "a32"), (0.40, "a40"), (0.48, "a48"),
                         (0.56, "a56"), (0.64, "a64"), (1.0, "a100")]:
        path = f"color/{family}/{a_key}"
        token = gen.create_token(
            path, 10, "color",
            value={"colorSpace": "srgb", "components": [ar, ag, ab],
                   "alpha": a_val, "hex": alpha_hex},
            scope=scope,
            hidden_from_publishing=hidden_from_publishing)
        gen.nest_token(tree, path, token)
