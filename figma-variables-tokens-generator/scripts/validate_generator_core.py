import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from generator_core import DesignTokenGenerator, prebuild_ids


def token_color():
    return {"colorSpace": "srgb", "components": [0, 0, 0], "alpha": 1, "hex": "#000000"}


def build_scope_fixture():
    gen = DesignTokenGenerator("Fixture", syntax_format="camel", platforms=["WEB"])

    primitives = {}
    for path in [
        "color/brand/500",
        "color/grey/900",
        "color/grey/200",
        "color/white",
        "color/black/a32",
        "font/size/16",
        "font/lineHeight/24",
        "font/letterSpacing/normal",
    ]:
        token_type = "number" if path.startswith("font/") else "color"
        value = 16 if path == "font/size/16" else 24 if path == "font/lineHeight/24" else 0 if path == "font/letterSpacing/normal" else token_color()
        if token_type == "color":
            scope = ["ALL_FILLS"]
        elif path.startswith("font/size/"):
            scope = ["FONT_SIZE"]
        elif path.startswith("font/lineHeight/"):
            scope = ["LINE_HEIGHT"]
        else:
            scope = ["LETTER_SPACING"]
        token = gen.create_token(path, 10, token_type, value=value, scope=scope)
        gen.nest_token(primitives, path, token)
    gen.save_mode("1. Primitives", "primitives", primitives)

    theme = {}
    theme_cases = [
        ("text/primary", ["TEXT_FILL"], "color/grey/900"),
        ("text/on-brand", ["TEXT_FILL"], "color/white"),
        ("border/default", ["STROKE"], "color/grey/200"),
        ("icon/default", ["SHAPE_FILL", "STROKE"], "color/brand/500"),
        ("overlay/scrim", ["FRAME_FILL", "SHAPE_FILL"], "color/black/a32"),
        ("shadow/sm/color", ["EFFECT_COLOR"], "color/black/a32"),
    ]
    for path, scope, target in theme_cases:
        token = gen.create_token(path, 40, "color", value=token_color(), scope=scope, alias_target=f"primitives/{target}", alias_set="Primitives", target_registry=gen.token_registry, hidden_from_publishing=True)
        gen.nest_token(theme, path, token)
    gen.save_mode("2. Theme", "light", theme)

    responsive = {}
    resp_cases = [
        ("font/size/body", ["FONT_SIZE"], "font/size/16", 16),
        ("font/lineHeight/body", ["LINE_HEIGHT"], "font/lineHeight/24", 24),
        ("font/letterSpacing/body", ["LETTER_SPACING"], "font/letterSpacing/normal", 0),
    ]
    ids = prebuild_ids(gen, [case[0] for case in resp_cases], 20)
    for path, scope, target, value in resp_cases:
        token = gen.create_token(path, 20, "number", value=value, scope=scope, alias_target=f"primitives/{target}", alias_set="Primitives", target_registry=gen.token_registry, hidden_from_publishing=True, vid=gen.resolve_id(ids, path))
        gen.nest_token(responsive, path, token)
    gen.save_mode("3. Responsive", "mobile", responsive)

    gen.verify_all_aliases()


def build_identity_fixture():
    gen = DesignTokenGenerator("Fixture", syntax_format="camel", platforms=["WEB"])

    primitives = {}
    base = gen.create_token("color/brand/500", 10, "color", value=token_color(), scope=["ALL_FILLS"])
    gen.nest_token(primitives, "color/brand/500", base)
    gen.save_mode("1. Primitives", "primitives", primitives)

    theme = {}
    ids = prebuild_ids(gen, ["text/on-brand", "text/link-hover", "surface/brand-subtle"], 40)
    cases = [
        ("text/on-brand", "color/brand/500"),
        ("text/link-hover", "color/brand/500"),
        ("surface/brand-subtle", "color/brand/500"),
    ]
    for path, target in cases:
        token = gen.create_token(path, 40, "color", value=token_color(), scope=["TEXT_FILL"] if path.startswith("text/") else ["FRAME_FILL", "SHAPE_FILL"], alias_target=f"primitives/{target}", alias_set="Primitives", target_registry=gen.token_registry, hidden_from_publishing=True, vid=gen.resolve_id(ids, path))
        gen.nest_token(theme, path, token)
    gen.save_mode("2. Theme", "light", theme)

    emitted = gen.flatten_emitted_paths()
    assert "text/on-brand" in emitted["Theme"]
    assert "text/link-hover" in emitted["Theme"]
    assert "surface/brand-subtle" in emitted["Theme"]
    gen.verify_all_aliases()


def main():
    build_scope_fixture()
    build_identity_fixture()
    print("generator-core-regressions: ok")


if __name__ == "__main__":
    main()
