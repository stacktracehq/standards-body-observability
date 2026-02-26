import { Specification } from "@standards-body/core-specifications/core";
import { OBS_NAMESPACE } from "./constants.ts";

export const OBS_SPEC_004 = Specification.parse({
	id: "OBS-SPEC-004",
	namespace: OBS_NAMESPACE,
	title: "Hook Logging Convention",
	directive: "MUST",
	status: "active",
	scope: "every-project",
	category: "instrumentation",
	summary:
		"Claude Code hooks MUST log start/end events with timing and session-identifying attributes via LogTape.",
	rationale:
		"Hooks execute during Claude Code sessions and need observability for debugging and performance analysis. Structured logging via LogTape ensures hook events flow through the OTEL pipeline. Start/end timing enables duration tracking. Session attributes enable correlating hook logs across a session.",
	examples: [
		{
			title: "Hook with LogTape start/end logging",
			code: `import { getLogger } from "@logtape/logtape";

const logger = getLogger(["standards-body", "my-plugin", "hooks", "session-start"]);

const start = performance.now();
logger.info("Hook started", { sessionId, event: "SessionStart" });

// ... hook logic ...

const durationMs = Math.round(performance.now() - start);
logger.info("Hook completed", { sessionId, durationMs });`,
			language: "typescript",
		},
	],
	logicalConformanceTestingProcedure: {
		fast: "Find hook TypeScript files (hooks/*.ts pattern). Check each imports from @logtape/logtape. Check for log calls that include timing (start/end pattern with performance.now() or Date.now()).",
		thorough:
			'Fast check plus: verify LogTape category format matches ["standards-body", "<plugin-name>", "hooks", "<hook-name>"]. Verify hooks do not write unstructured output to stdout.',
	},
	remediation: {
		steps: [
			"Import getLogger from @logtape/logtape in each hook file.",
			'Set up a logger with category ["standards-body", "<plugin-name>", "hooks", "<hook-name>"].',
			"Add a start log with session attributes at the beginning of the hook.",
			"Add an end log with duration at the end of the hook.",
			"Remove any direct stdout writes (console.log, process.stdout.write of unstructured text).",
			"Ensure all output follows the hook JSON protocol.",
		],
	},
	version: "1.0.0",
	created: "2026-02-26",
	updated: "2026-02-26",
});
