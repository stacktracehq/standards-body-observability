<!-- GENERATED FILE - DO NOT EDIT -->

# standards-body-observability

A pnpm + Turborepo monorepo using Bun as the runtime. Observability standards body — Observability standards: OTEL Collector, Loki, LogTape instrumentation, and hook logging conventions.

## Active Specifications

No specifications defined yet. This is a freshly bootstrapped standards body.

## Structure

See `apps/` and `packages/` directories for current workspace structure. Key files:

```
├── apps/cli/           # CLI application (spec list, spec check, spec info)
├── packages/specifications/  # Specification definitions and conformance checks
├── skills/health/      # Health skill (session status check)
├── agents/             # Subagents (remediation-agent)
├── hooks/              # Session hooks (conformance check on start)
├── bin/run             # Self-bootstrapping CLI entry point
├── turbo.json          # Turborepo task configuration
├── pnpm-workspace.yaml # Workspace definition
└── tsconfig.json       # Shared strict TypeScript config
```

## Prerequisites

- Nix (provides Bun and pnpm via `nix develop`)

## Setup

```bash
nix develop
pnpm install
```

## Commands

```bash
pnpm build        # Build all packages
pnpm typecheck    # Type check all packages
pnpm lint         # Lint all packages (ESLint strictTypeChecked)
pnpm format       # Format all packages (Biome)
run --help        # Run the CLI (via bin/run wrapper)
```

The `bin/run` wrapper:

- Auto-installs dependencies if missing (no manual `pnpm install` needed)
- Runs latest TypeScript code directly via Bun (no build step required)
- Added to PATH by `nix develop` shell
