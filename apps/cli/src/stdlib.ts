/**
 * Minimal CLI framework — inlined from @standards-body/cli-stdlib.
 *
 * Re-exports the @optique/core primitives needed by the spec commands,
 * plus the custom runCLI/sealCommand dispatch layer.
 */

// Optique CLI framework — constructs
export { object, or } from "@optique/core/constructs";
// Optique CLI framework — messages
export { message } from "@optique/core/message";
// Optique CLI framework — modifiers
export { optional, withDefault } from "@optique/core/modifiers";
// Optique CLI framework — types
export type { InferValue } from "@optique/core/parser";

import type { Parser } from "@optique/core/parser";
import { parseSync } from "@optique/core/parser";

// Optique CLI framework — primitives
export { argument, command, constant, option } from "@optique/core/primitives";
// Optique CLI framework — value parsers
export { string } from "@optique/core/valueparser";

// @optique/run — top-level runner
import { or } from "@optique/core/constructs";
import type { RunOptions } from "@optique/run";
import { runSync } from "@optique/run";

/**
 * A CLI command that pairs a parser with its execution logic.
 */
export interface Command<T = unknown> {
	readonly parser: Parser<"sync", T>;
	readonly execute: (result: T) => Promise<number> | number;
}

/**
 * A type-erased command that can be stored in heterogeneous collections.
 */
export interface SealedCommand {
	readonly parser: Parser;
	tryRun(args: readonly string[]): Promise<number> | number | undefined;
}

/**
 * Erases the type parameter of a Command by capturing T in a closure.
 */
export function sealCommand<T>(cmd: Command<T>): SealedCommand {
	return {
		parser: cmd.parser,
		tryRun(args) {
			const result = parseSync(cmd.parser, args);
			if (result.success) return cmd.execute(result.value);
			return undefined;
		},
	};
}

/**
 * Runs a CLI by trying each command's parser in order until one matches.
 */
export async function runCLI(
	commands: readonly SealedCommand[],
	options?: RunOptions,
): Promise<number> {
	const rawArgs = options?.args ?? process.argv.slice(2);

	for (const cmd of commands) {
		const exitCode = cmd.tryRun(rawArgs);
		if (exitCode !== undefined) return await exitCode;
	}

	const combinedParser = or(...commands.map((c) => c.parser)) as Parser;
	runSync(combinedParser, { aboveError: "help", ...options });

	throw new Error("No command matched");
}
