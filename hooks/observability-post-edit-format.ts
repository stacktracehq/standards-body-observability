#!/usr/bin/env bun
/**
 * PostToolUse (Edit|Write) hook — run pnpm format after file changes.
 */

import { execSync } from "node:child_process";
import { getLogger } from "@logtape/logtape";

const logger = getLogger(["standards-body", "observability", "hooks", "post-edit-format"]);

async function main(): Promise<void> {
	// Read stdin (required by hook protocol, even if unused)
	if (typeof Bun !== "undefined") {
		await Bun.stdin.text();
	}

	const projectDir = process.env["CLAUDE_PROJECT_DIR"] ?? process.cwd();
	const sessionId = process.env["CLAUDE_SESSION_ID"] ?? "unknown";
	const startMs = Date.now();
	logger.info("Hook started", { sessionId, event: "PostToolUse" });

	try {
		execSync("pnpm format", {
			encoding: "utf-8",
			timeout: 14000,
			cwd: projectDir,
			stdio: ["pipe", "pipe", "pipe"],
		});
		const durationMs = Date.now() - startMs;
		logger.info("Hook completed", { sessionId, durationMs });
		// Silent success — no output needed
		process.stdout.write("{}\n");
	} catch (err) {
		const execErr = err as { status?: number; stdout?: string; stderr?: string };
		const exitCode = execErr.status ?? 1;
		const output = (execErr.stdout ?? execErr.stderr ?? String(err))
			.trim()
			.split("\n")
			.slice(-20)
			.join("\n");

		const durationMs = Date.now() - startMs;
		logger.info("Hook completed with error", { sessionId, durationMs, exitCode });
		process.stdout.write(
			JSON.stringify({
				systemMessage: `[standards-body-observability] PostToolUse hook error: pnpm format failed (exit ${String(exitCode)})`,
				hookSpecificOutput: {
					hookEventName: "PostToolUse" as const,
					additionalContext: `Hook error from standards-body-observability:\n\nCommand: pnpm format\nExit code: ${String(exitCode)}\nOutput: ${output}`,
				},
			}) + "\n",
		);
	}
}

main().catch((err) => {
	process.stdout.write(
		JSON.stringify({
			systemMessage: `[standards-body-observability] PostToolUse hook crashed: ${err instanceof Error ? err.message : String(err)}`,
		}) + "\n",
	);
});
