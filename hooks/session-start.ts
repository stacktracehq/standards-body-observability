#!/usr/bin/env bun
/**
 * SessionStart hook — run conformance checks and report status.
 *
 * After instantiation from template, rename this file to {name}-session-start.ts
 * (e.g., observability-session-start.ts) and update hooks.json references.
 */

import { execSync } from "node:child_process";

const PLUGIN_ROOT =
	process.env["CLAUDE_PLUGIN_ROOT"] ?? new URL("..", import.meta.url).pathname.replace(/\/$/, "");

async function main(): Promise<void> {
	// Read stdin (required by hook protocol, even if unused)
	if (typeof Bun !== "undefined") {
		await Bun.stdin.text();
	}

	// Persist plugin root for subagent Bash commands
	// NOTE: Rename STANDARDS_BODY_TEMPLATE_ROOT to match your plugin (e.g., STANDARDS_BODY_OBSERVABILITY_ROOT)
	const envFile = process.env["CLAUDE_ENV_FILE"];
	if (envFile) {
		const { appendFileSync } = await import("node:fs");
		appendFileSync(envFile, `export STANDARDS_BODY_TEMPLATE_ROOT="${PLUGIN_ROOT}"\n`);
	}

	const projectDir = process.env["CLAUDE_PROJECT_DIR"] ?? process.cwd();
	const startMs = Date.now();

	let output: string;
	let exitCode: number;
	try {
		output = execSync(`"${PLUGIN_ROOT}/bin/run" spec check "${projectDir}" --format hook`, {
			encoding: "utf-8",
			timeout: 8000,
			cwd: projectDir,
		}).trim();
		exitCode = 0;
	} catch (err) {
		const execErr = err as { status?: number; stdout?: string; stderr?: string };
		exitCode = execErr.status ?? 1;
		output = (execErr.stdout ?? execErr.stderr ?? String(err)).trim();
	}

	const elapsedMs = Date.now() - startMs;

	// Check if output matches the expected format from `run spec check --format hook`
	if (output.includes("READY") || output.includes("VIOLATIONS")) {
		process.stdout.write(
			JSON.stringify({
				hookSpecificOutput: {
					hookEventName: "SessionStart" as const,
					additionalContext: `[standards-body-__NAME__] ${output} (${String(elapsedMs)}ms)`,
				},
			}) + "\n",
		);
	} else {
		process.stdout.write(
			JSON.stringify({
				systemMessage: `[standards-body-__NAME__] SessionStart hook error: bin/run spec check failed (exit ${String(exitCode)})`,
				hookSpecificOutput: {
					hookEventName: "SessionStart" as const,
					additionalContext: `Hook error from standards-body-__NAME__:\n\nCommand: bin/run spec check $PROJECT_DIR --format hook\nExit code: ${String(exitCode)}\nOutput: ${output}`,
				},
			}) + "\n",
		);
	}
}

main().catch((err) => {
	process.stdout.write(
		JSON.stringify({
			systemMessage: `[standards-body-__NAME__] SessionStart hook crashed: ${err instanceof Error ? err.message : String(err)}`,
		}) + "\n",
	);
});
