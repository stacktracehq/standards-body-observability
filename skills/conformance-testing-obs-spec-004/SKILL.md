---
name: conformance-testing-obs-spec-004
description: Remediate OBS-SPEC-004 (Hook Logging Convention) non-conformances.
  Forks into the remediation-agent to fix issues detected by
  `run spec check . --spec OBS-SPEC-004`.
  Invoke after reviewing hook output or diagnosis.
context: fork
agent: standards-body-observability:remediation-agent
---
<!-- GENERATED FILE - DO NOT EDIT -->

## Task

Remediate all non-conformances for **OBS-SPEC-004** (Hook Logging Convention) in the repository below. You MUST bring the repository to a READY state by fixing all violations detected by the conformance check.

### Steps

1. Review the conformance check output below to identify all violations
2. Read the specification details provided below to understand requirements
3. Implement fixes for each violation
4. Run quality gates: `pnpm typecheck && pnpm build && pnpm lint && pnpm format && pnpm test`
5. Verify with spec check: $STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-004 --format hook
6. Report results with detailed status and any remaining issues

### Remediation Guidance

1. Import getLogger from @logtape/logtape in each hook file.
2. Set up a logger with category ["standards-body", "<plugin-name>", "hooks", "<hook-name>"].
3. Add a start log with session attributes at the beginning of the hook.
4. Add an end log with duration at the end of the hook.
5. Remove any direct stdout writes (console.log, process.stdout.write of unstructured text).
6. Ensure all output follows the hook JSON protocol.
7. Run `"$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run" spec check "$REPOSITORY_PATH" --spec OBS-SPEC-004` to verify conformance.

***

## Context

Current State: VIOLATIONS

Repository: !`pwd`

Conformance check output:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-004 2>&1 || true`

Specification details:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec info OBS-SPEC-004 2>&1 || true`

Specifications to enforce:

- **OBS-SPEC-004**: Hook Logging Convention

Expected outcome: Repository converges to READY state
