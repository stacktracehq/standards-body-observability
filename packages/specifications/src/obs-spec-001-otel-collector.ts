import { Specification } from "@standards-body/core-specifications/core";
import { OBS_NAMESPACE } from "./constants.ts";

export const OBS_SPEC_001 = Specification.parse({
	id: "OBS-SPEC-001",
	namespace: OBS_NAMESPACE,
	title: "OTEL Collector Service",
	directive: "MUST",
	status: "active",
	scope: "every-project",
	category: "infrastructure",
	summary:
		"The OpenTelemetry Collector MUST run as a host system service listening on standard OTLP ports (4317 gRPC, 4318 HTTP).",
	rationale:
		"A locally running OTEL Collector provides a consistent telemetry ingestion point for all projects. It decouples application instrumentation from backend storage, allowing exporters to be reconfigured without changing application code. The memory_limiter processor prevents runaway memory usage on the host.",
	examples: [
		{
			title: "Minimal OTEL Collector config with memory limiter",
			code: `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512

exporters:
  otlphttp:
    endpoint: http://localhost:3100/otlp

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [memory_limiter]
      exporters: [otlphttp]`,
			language: "yaml",
		},
	],
	logicalConformanceTestingProcedure: {
		fast: "HTTP probe http://localhost:4318/v1/logs — returns 200 if the collector is listening on the standard OTLP HTTP port.",
		thorough:
			"Fast check plus: read the OTEL Collector config file (/etc/otelcol/config.yaml on Linux, ~/Library/otelcol/config.yaml on macOS), validate it contains a memory_limiter processor, and verify at least one exporter is configured.",
	},
	remediation: {
		steps: [
			"Install the OpenTelemetry Collector (e.g., via package manager or binary download).",
			"Create a config file at /etc/otelcol/config.yaml (Linux) or ~/Library/otelcol/config.yaml (macOS).",
			"Configure OTLP receivers on ports 4317 (gRPC) and 4318 (HTTP).",
			"Add a memory_limiter processor with appropriate limits.",
			"Configure at least one exporter (e.g., otlphttp to Loki).",
			"Start the collector as a system service (systemd on Linux, launchd on macOS).",
			"Verify with: curl -s http://localhost:4318/v1/logs",
		],
	},
	version: "1.0.0",
	created: "2026-02-26",
	updated: "2026-02-26",
});
