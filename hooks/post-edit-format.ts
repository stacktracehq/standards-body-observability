#!/usr/bin/env bun
/**
 * PostToolUse (Edit|Write) hook — run pnpm format after file changes.
 *
 * After instantiation from template, rename this file to {name}-post-edit-format.ts
 * (e.g., observability-post-edit-format.ts) and update hooks.json references.
 */

import { execSync } from "node:child_process";

async function main(): Promise<void> {
	// Read stdin (required by hook protocol, even if unused)
	if (typeof Bun !== "undefined") {
		await Bun.stdin.text();
	}

	const projectDir = process.env["CLAUDE_PROJECT_DIR"] ?? process.cwd();

	try {
		execSync("pnpm format", {
			encoding: "utf-8",
			timeout: 14000,
			cwd: projectDir,
			stdio: ["pipe", "pipe", "pipe"],
		});
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

		process.stdout.write(
			JSON.stringify({
				systemMessage: `[standards-body-__NAME__] PostToolUse hook error: pnpm format failed (exit ${String(exitCode)})`,
				hookSpecificOutput: {
					hookEventName: "PostToolUse" as const,
					additionalContext: `Hook error from standards-body-__NAME__:\n\nCommand: pnpm format\nExit code: ${String(exitCode)}\nOutput: ${output}`,
				},
			}) + "\n",
		);
	}
}

main().catch((err) => {
	process.stdout.write(
		JSON.stringify({
			systemMessage: `[standards-body-__NAME__] PostToolUse hook crashed: ${err instanceof Error ? err.message : String(err)}`,
		}) + "\n",
	);
});
