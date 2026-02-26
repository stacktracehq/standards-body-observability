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
	summary: "Loki MUST run as a host system service accepting OTLP log ingestion.",
	rationale:
		"Loki provides centralized log storage and querying for all observed services. By accepting OTLP ingestion natively, it integrates seamlessly with the OTEL Collector pipeline. Running it as a host service ensures logs persist across project sessions.",
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
			"Fast check plus: probe the OTLP ingestion endpoint at http://localhost:3100/otlp/v1/logs to verify Loki accepts OTLP log data.",
	},
	remediation: {
		steps: [
			"Install Loki (e.g., via binary download or package manager).",
			"Configure Loki to listen on port 3100 with OTLP ingestion enabled.",
			"Start Loki as a system service (systemd on Linux, launchd on macOS).",
			"Verify readiness: curl -s http://localhost:3100/ready",
			"Configure the OTEL Collector to export to http://localhost:3100/otlp.",
		],
	},
	version: "1.0.0",
	created: "2026-02-26",
	updated: "2026-02-26",
});
