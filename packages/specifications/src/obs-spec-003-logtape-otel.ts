import { Specification } from "@standards-body/core-specifications/core";
import { OBS_NAMESPACE } from "./constants.ts";

export const OBS_SPEC_003 = Specification.parse({
	id: "OBS-SPEC-003",
	namespace: OBS_NAMESPACE,
	title: "TypeScript LogTape + OTEL Sink",
	directive: "MUST",
	status: "active",
	scope: "every-project",
	category: "instrumentation",
	summary:
		"All TypeScript projects MUST use LogTape with @logtape/otel sink targeting the local OTEL Collector.",
	rationale:
		"LogTape provides structured, context-aware logging for TypeScript. The @logtape/otel sink bridges LogTape output to the OTEL Collector, ensuring all application logs flow through the standardized observability pipeline. Consistent logging libraries across projects reduce cognitive overhead and enable unified log querying.",
	examples: [
		{
			title: "package.json dependencies",
			code: `{
  "dependencies": {
    "@logtape/logtape": "^1.0.0",
    "@logtape/otel": "^1.0.0"
  }
}`,
			language: "json",
		},
		{
			title: "LogTape configuration with OTEL sink",
			code: `import { configure } from "@logtape/logtape";
import { getOpenTelemetrySink } from "@logtape/otel";

await configure({
  sinks: {
    otel: getOpenTelemetrySink(),
  },
  loggers: [
    { category: ["my-app"], sinks: ["otel"], lowestLevel: "info" },
  ],
});`,
			language: "typescript",
		},
	],
	logicalConformanceTestingProcedure: {
		fast: "Scan root package.json (and workspace package.json files if monorepo) for @logtape/logtape and @logtape/otel in dependencies or devDependencies. Both must be present in at least one package.",
		thorough:
			"Fast check plus: grep source files for LogTape configure() call with an OtelSink or getOpenTelemetrySink. Verify the sink targets localhost:4318 or uses OTEL_EXPORTER_OTLP_ENDPOINT env var.",
	},
	remediation: {
		steps: [
			"Install LogTape and OTEL sink: pnpm add @logtape/logtape @logtape/otel",
			"Create a logging configuration file that uses getOpenTelemetrySink().",
			"Configure LogTape with the OTEL sink targeting localhost:4318.",
			"Ensure configure() is called early in the application lifecycle.",
			"Verify logs appear in the OTEL Collector output.",
		],
	},
	version: "1.0.0",
	created: "2026-02-26",
	updated: "2026-02-26",
});
