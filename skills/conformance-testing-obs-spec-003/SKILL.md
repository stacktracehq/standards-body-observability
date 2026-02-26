---
name: conformance-testing-obs-spec-003
description: Remediate OBS-SPEC-003 (TypeScript LogTape + OTEL Sink) non-conformances.
  Forks into the remediation-agent to fix issues detected by
  `run spec check . --spec OBS-SPEC-003`.
  Invoke after reviewing hook output or diagnosis.
context: fork
agent: standards-body-observability:remediation-agent
---
<!-- GENERATED FILE - DO NOT EDIT -->

## Task

Remediate all non-conformances for **OBS-SPEC-003** (TypeScript LogTape + OTEL Sink) in the repository below. You MUST bring the repository to a READY state by fixing all violations detected by the conformance check.

### Steps

1. Review the conformance check output below to identify all violations
2. Read the specification details provided below to understand requirements
3. Implement fixes for each violation
4. Run quality gates: `pnpm typecheck && pnpm build && pnpm lint && pnpm format && pnpm test`
5. Verify with spec check: $STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-003 --format hook
6. Report results with detailed status and any remaining issues

### Remediation Guidance

1. Install LogTape and OTEL sink: pnpm add @logtape/logtape @logtape/otel
2. Create a logging configuration file that uses getOpenTelemetrySink().
3. Configure LogTape with the OTEL sink targeting localhost:4318.
4. Ensure configure() is called early in the application lifecycle.
5. Verify logs appear in the OTEL Collector output.
6. Run `"$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run" spec check "$REPOSITORY_PATH" --spec OBS-SPEC-003` to verify conformance.

***

## Context

Current State: VIOLATIONS

Repository: !`pwd`

Conformance check output:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-003 2>&1 || true`

Specification details:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec info OBS-SPEC-003 2>&1 || true`

Specifications to enforce:

- **OBS-SPEC-003**: TypeScript LogTape + OTEL Sink

Expected outcome: Repository converges to READY state
