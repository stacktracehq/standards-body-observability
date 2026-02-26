---
name: conformance-testing-obs-spec-001
description: Remediate OBS-SPEC-001 (OTEL Collector Service) non-conformances.
  Forks into the remediation-agent to fix issues detected by
  `run spec check . --spec OBS-SPEC-001`.
  Invoke after reviewing hook output or diagnosis.
context: fork
agent: standards-body-observability:remediation-agent
---
<!-- GENERATED FILE - DO NOT EDIT -->

## Task

Remediate all non-conformances for **OBS-SPEC-001** (OTEL Collector Service) in the repository below. You MUST bring the repository to a READY state by fixing all violations detected by the conformance check.

### Steps

1. Review the conformance check output below to identify all violations
2. Read the specification details provided below to understand requirements
3. Implement fixes for each violation
4. Run quality gates: `pnpm typecheck && pnpm build && pnpm lint && pnpm format && pnpm test`
5. Verify with spec check: $STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-001 --format hook
6. Report results with detailed status and any remaining issues

### Remediation Guidance

1. Install the OpenTelemetry Collector (e.g., via package manager or binary download).
2. Create a config file at /etc/otelcol/config.yaml (Linux) or ~/Library/otelcol/config.yaml (macOS).
3. Configure OTLP receivers on ports 4317 (gRPC) and 4318 (HTTP).
4. Add a memory_limiter processor with appropriate limits.
5. Configure at least one exporter (e.g., otlphttp to Loki).
6. Start the collector as a system service (systemd on Linux, launchd on macOS).
7. Run `"$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run" spec check "$REPOSITORY_PATH" --spec OBS-SPEC-001` to verify conformance.

***

## Context

Current State: VIOLATIONS

Repository: !`pwd`

Conformance check output:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-001 2>&1 || true`

Specification details:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec info OBS-SPEC-001 2>&1 || true`

Specifications to enforce:

- **OBS-SPEC-001**: OTEL Collector Service

Expected outcome: Repository converges to READY state
