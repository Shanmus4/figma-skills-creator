# Figma Variables Tokens Generator Skill

*Developed by Shanmu*

## What it is
A specialized skill for Anthropic's Claude that acts as an expert interviewer and code generator for creating massive, production-ready Figma Variable JSON files. It guides users through architectural decisions and generates complex token systems (Primitives, Theme, Responsive, Typography, Density, etc.) based on their exact brand needs.

## Who it is for
Designers, Design System Engineers, and Developers who need to bootstrap a robust, multi-layer variable architecture in Figma without manually creating hundreds of tokens.

## Technologies Used
- **Claude (Anthropic):** The AI engine running the skill.
- **Figma Variables:** The target destination for the generated tokens.
- **W3C Design Tokens Community Group (DTCG) format:** The JSON structure used for the generated ZIP files.

## How it works
1. **Interview Phase:** Claude asks the user a series of targeted questions about their brand, typography, spacing, and desired layer architecture (1-layer to 4-layer).
2. **Scoping Rules:** The skill ensures all tokens are built with strict Figma scoping rules (e.g., locking colors to specific properties).
3. **Phased Generation:** To avoid AI timeouts when generating 700+ tokens, Claude chunk-generates the ZIP files in phases (Core Foundations → Structural Collections → Components & Semantics).

## Setup Instructions
1. Download this repository.
2. In Claude (Claude.ai or Claude Code), use the `claude-skill-creator` to package the `figma-variables-tokens-generator-skill` folder into a `.skill` file, or simply copy-paste the contents of `SKILL.md`, `instructions/01-interview-setup.md`, `instructions/02-questionnaire-and-generation.md`, and `instructions/03-import-and-handoff.md` into a new project context.
3. Prompt Claude to begin the Figma Variables Tokens Generator interview.

## Live Demo
*Not applicable — this is an AI skill prompt system, not a web application.*

## Troubleshooting
- **Claude times out during generation:** Ensure Claude is following the "Phased Generation" rules in `instructions/02-questionnaire-and-generation.md`. Do not ask Claude to generate all ZIP files at once.
- **Figma scopes are wrong after import:** Because of a Figma JSON import limitation, "no scope" variables default to "all scopes" upon import. You must manually turn off scoping for collections that act purely as alias parents (like Primitives or Responsive) in the Figma UI.
- **Other issues:** Please open an issue in the repository.
