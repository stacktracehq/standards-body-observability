import { Specification } from "@standards-body/core-specifications/core";
import { OBS_NAMESPACE } from "./constants.ts";

export const OBS_SPEC_002 = Specification.parse({
	id: "OBS-SPEC-002",
	namespace: OBS_NAMESPACE,
	title: "Loki Log Backend",
	directive: "MUST",
	status: "active",
	scope: "every-project",
	category: "infrastructure",
	summary:
		"Loki MUST run as a user-level systemd service (Linux) or launchd agent (macOS) accepting OTLP log ingestion.",
	rationale:
		"Loki provides centralized log storage and querying for all observed services. By accepting OTLP ingestion natively, it integrates seamlessly with the OTEL Collector pipeline. Running it as a user-level service ensures logs persist across project sessions without requiring elevated privileges. System-level (root) services are non-conformant because they require sudo for management, hindering autonomous agent workflows.",
	examples: [
		{
			title: "Verify Loki readiness",
			code: `curl -s http://localhost:3100/ready
# Expected: "ready"`,
			language: "bash",
		},
		{
			title: "OTEL Collector exporter targeting Loki",
			code: `exporters:
  otlphttp:
    endpoint: http://localhost:3100/otlp`,
			language: "yaml",
		},
	],
	logicalConformanceTestingProcedure: {
		fast: 'HTTP probe http://localhost:3100/ready — returns 200 with body containing "ready" if Loki is healthy.',
		thorough:
			"Fast check plus: probe the OTLP ingestion endpoint at http://localhost:3100/otlp/v1/logs to verify Loki accepts OTLP log data, and confirm the service is NOT running as a system-level systemd unit.",
	},
	remediation: {
		steps: [
			"Install Loki (e.g., via binary download).",
			"Create config at ~/.config/loki/config.yaml with OTLP ingestion enabled on port 3100.",
			"Create a user-level systemd unit (~/.config/systemd/user/loki.service) or launchd agent.",
			"If running as a system-level service, migrate to a user-level service and remove the system unit.",
			"Enable loginctl enable-linger to persist the service across logouts (Linux).",
			"Start via: systemctl --user enable --now loki",
			"Verify readiness: curl -s http://localhost:3100/ready",
			"Configure the OTEL Collector to export to http://localhost:3100/otlp.",
		],
	},
	version: "1.0.0",
	created: "2026-02-26",
	updated: "2026-02-26",
});
