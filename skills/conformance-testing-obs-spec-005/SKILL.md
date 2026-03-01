---
name: conformance-testing-obs-spec-005
description: Remediate OBS-SPEC-005 (Grafana Dashboard Service) non-conformances.
  Forks into the remediation-agent to fix issues detected by
  `run spec check . --spec OBS-SPEC-005`.
  Invoke after reviewing hook output or diagnosis.
context: fork
agent: standards-body-observability:remediation-agent
---
<!-- GENERATED FILE - DO NOT EDIT -->

## Task

Remediate all non-conformances for **OBS-SPEC-005** (Grafana Dashboard Service) in the repository below. You MUST bring the repository to a READY state by fixing all violations detected by the conformance check.

### Steps

1. Review the conformance check output below to identify all violations
2. Read the specification details provided below to understand requirements
3. Implement fixes for each violation
4. Run quality gates: `pnpm typecheck && pnpm build && pnpm lint && pnpm format && pnpm test`
5. Verify with spec check: $STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-005 --format hook
6. Report results with detailed status and any remaining issues

### Remediation Guidance

1. Download Grafana OSS tarball and extract to ~/.local/share/grafana/.
2. Symlink grafana-server to ~/.local/bin/.
3. Create config at ~/.config/grafana/custom.ini with anonymous access enabled.
4. Provision Loki data source via ~/.config/grafana/provisioning/datasources/loki.yaml.
5. Create a user-level systemd unit (~/.config/systemd/user/grafana.service) or launchd agent.
6. Enable loginctl enable-linger to persist the service across logouts (Linux).
7. Start via: systemctl --user enable --now grafana
8. Verify with: curl -s http://localhost:3000/api/health
9. Run `"$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run" spec check "$REPOSITORY_PATH" --spec OBS-SPEC-005` to verify conformance.

***

## Context

Current State: VIOLATIONS

Repository: !`pwd`

Conformance check output:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec check "$(pwd)" --spec OBS-SPEC-005 2>&1 || true`

Specification details:

!`$STANDARDS_BODY_OBSERVABILITY_ROOT/bin/run spec info OBS-SPEC-005 2>&1 || true`

Specifications to enforce:

- **OBS-SPEC-005**: Grafana Dashboard Service

Expected outcome: Repository converges to READY state
