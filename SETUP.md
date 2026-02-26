# Standards Body Template Setup

This is a template repository for creating new standards bodies. To use it:

## 1. Create the new repo from this template

Use "Use this template" on GitHub, or clone manually.

## 2. Replace placeholder tokens

Search and replace the following tokens throughout the repository:

| Token | Description | Example |
|-------|-------------|---------|
| `__NAME__` | Lowercase hyphenated name | `documentation` |
| `__NAMESPACE__` | Uppercase hyphenated namespace for spec IDs | `DOCUMENTATION` |
| `__DISPLAY_NAME__` | Human-readable display name | `Documentation` |
| `__DOMAIN_DESCRIPTION__` | Short domain description | `Documentation standards: structure, style, audience, and maintenance specifications` |

Files containing tokens:

- `conformance.json` — namespace, displayName
- `.claude-plugin/plugin.json` — name, description
- `package.json` — name
- `packages/specifications/package.json` — name
- `apps/cli/package.json` — name, dependency
- `apps/cli/tsconfig.json` — paths key
- `apps/cli/src/commands/spec/check.ts` — imports, hook prefix
- `apps/cli/src/commands/spec/list.ts` — imports
- `apps/cli/src/commands/spec/info.ts` — imports
- `packages/specifications/src/index.ts` — doc comment
- `packages/specifications/src/registry.ts` — doc comments
- `packages/specifications/src/module-registry.ts` — namespace constants, registry variable
- `CLAUDE.md` — display name, domain description, CLI examples
- `README.md` — name, display name, domain description
- `flake.nix` — description
- `hooks/run-hook.sh` — plugin name in error message
- `hooks/session-start.ts` — plugin name in messages, display name in output matching
- `hooks/post-edit-format.ts` — plugin name in error messages
- `agents/remediation-agent.md` — display name, namespace, plugin name
- `agents/remediation-agent.md.mdx` — display name, namespace, plugin name

## 3. Rename environment variable

In `bin/run` and `hooks/session-start.ts`, rename `STANDARDS_BODY_TEMPLATE_ROOT` to match your plugin. Use uppercase with underscores (e.g., `STANDARDS_BODY_DOCUMENTATION_ROOT` for name `documentation`).

## 4. Rename hook files

Hook filenames must be namespaced with the plugin name to prevent collisions when multiple plugins are installed. Rename and update `hooks/hooks.json` references:

- `hooks/session-start.ts` → `hooks/{name}-session-start.ts`
- `hooks/post-edit-format.ts` → `hooks/{name}-post-edit-format.ts`

## 5. Register in core

Add an entry to `standards-body-core/packages/specifications/src/registry-of-bodies.ts`.

## 6. Fix module-registry variable name

In `packages/specifications/src/module-registry.ts`, the registry variable is named `__NAMESPACE___REGISTRY`. Rename it to match your namespace (e.g., `DOCUMENTATION_REGISTRY`). Also rename the constant variables `__NAMESPACE___NAMESPACE` and `__NAMESPACE___DISPLAY_NAME`.

## 7. Install and verify

```bash
pnpm install
pnpm typecheck && pnpm build && pnpm lint && pnpm format && pnpm test
bin/run spec list
```

## 8. Set up worktrees

```bash
git branch installed
git worktree add ../standards-body-{name}-installed installed
```
