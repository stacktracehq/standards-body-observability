---
name: conformance-testing-obs-spec-002
description: Remediate OBS-SPEC-002 (Loki Log Backend) non-conformances.
  Forks into the remediation-agent to fix issues detected by
  `run spec check . --spec OBS-SPEC-002`.
  Invoke after reviewing hook output or diagnosis.
context: fork
agent: standards-body-observability:remediation-agent
---
<!-- GENERATED FILE - DO NOT EDIT -->

## Task

Remediate all non-conformances for **OBS-SPEC-002** (Loki Log Backend) in the repository below. You MUST bring the repository to a READY state by fixing all violations detected by the conformance check.

### Steps

1. Review the conformance check output below to identify all violations
2. Read the specification details provided below to understand requirements
3. Implement fixes for each violation
4. Run quality gates: `pnpm typecheck && pnpm build && pnpm lint && pnpm format && pnpm test`
5. Verify with spec check: $STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-002 --format hook
6. Report results with detailed status and any remaining issues

### Remediation Guidance

1. Install Loki (e.g., via binary download or package manager).
2. Configure Loki to listen on port 3100 with OTLP ingestion enabled.
3. Start Loki as a system service (systemd on Linux, launchd on macOS).
4. Verify readiness: curl -s http://localhost:3100/ready
5. Configure the OTEL Collector to export to http://localhost:3100/otlp.
6. Run `"$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run" spec check "$REPOSITORY_PATH" --spec OBS-SPEC-002` to verify conformance.

***

## Context

Current State: VIOLATIONS

Repository: !`pwd`

Conformance check output:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-002 2>&1 || true`

Specification details:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec info OBS-SPEC-002 2>&1 || true`

Specifications to enforce:

- **OBS-SPEC-002**: Loki Log Backend

Expected outcome: Repository converges to READY state
