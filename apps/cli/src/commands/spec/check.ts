import * as fs from "node:fs/promises";
import * as path from "node:path";
import { ConformanceConfig } from "@standards-body/core-specifications/core";
import type {
	ConformanceResult,
	SpecificationModule,
} from "@standards-body/observability-specifications";
import {
	argument,
	constant,
	message,
	object,
	option,
	optional,
	or,
	string,
	withDefault,
} from "../../stdlib.ts";

/**
 * Parser for `spec check` command options.
 */
export const specCheckParser = object({
	type: constant("spec-check" as const),
	target: or(
		argument(string({ metavar: "TARGET" }), {
			description: message`Path to target repository root directory`,
		}),
		option("--target", string(), {
			description: message`Path to target repository root directory`,
		}),
	),
	specId: optional(
		option("--spec", string(), {
			description: message`Specification ID to check`,
		}),
	),
	thorough: withDefault(
		option("--thorough", { description: message`Run thorough checks instead of fast` }),
		false,
	),
	format: optional(option("--format", string(), { description: message`Output format: hook` })),
});

/**
 * Execute the spec check command.
 */
export async function specCheck(args: {
	target: string;
	specId: string | undefined;
	thorough: boolean;
	format: string | undefined;
}): Promise<number> {
	const { getActiveSpecificationModules, getSpecificationModule } = await import(
		"@standards-body/observability-specifications/module-registry"
	);

	const resolved = path.resolve(args.target);
	try {
		const stats = await fs.stat(resolved);
		if (!stats.isDirectory()) {
			process.stderr.write(`Error: target is not a directory: ${resolved}\n`);
			return 1;
		}
	} catch {
		process.stderr.write(`Error: target directory does not exist: ${resolved}\n`);
		return 1;
	}
	const repoRoot = resolved;

	if (args.specId) {
		const id = args.specId.toUpperCase();
		const mod = getSpecificationModule(id);
		if (!mod) {
			process.stderr.write(`Error: No specification module found for ${id}\n`);
			return 1;
		}
		const result = args.thorough
			? await mod.checkThorough(repoRoot)
			: await mod.checkFast(repoRoot);
		return outputResults([result], args);
	}

	// Check all active specs, filtered by scope
	const allModules = getActiveSpecificationModules();
	if (allModules.length === 0) {
		process.stdout.write("No active specifications to check\n");
		return 0;
	}

	// Read conformance.json to determine project kind for scope filtering
	const configPath = path.join(repoRoot, "conformance.json");
	let projectKind: "project" | "standards-body" = "project";
	let configNamespace: string | undefined;
	try {
		const raw = await fs.readFile(configPath, "utf-8");
		const parsed = ConformanceConfig.safeParse(JSON.parse(raw) as unknown);
		if (parsed.success) {
			projectKind = parsed.data.kind;
			if (parsed.data.kind === "standards-body") {
				configNamespace = parsed.data.namespace;
			}
		}
	} catch {
		// Missing or invalid config — treat as "project" for filtering.
	}

	// Filter modules by scope
	const modules = allModules.filter((mod: SpecificationModule) => {
		const scope = mod.spec.scope;
		if (scope === "every-project") return true;
		if (scope === "every-standards-body") return projectKind === "standards-body";
		// this-project-only: run only if standards-body with matching namespace
		return projectKind === "standards-body" && configNamespace === mod.spec.namespace;
	});

	const results: ConformanceResult[] = [];
	for (const mod of modules) {
		const result = args.thorough
			? await mod.checkThorough(repoRoot)
			: await mod.checkFast(repoRoot);
		results.push(result);
	}

	return outputResults(results, args);
}

function outputResults(
	results: ConformanceResult[],
	args: { thorough: boolean; format: string | undefined },
): number {
	const allConformant = results.every((r) => r.conformant);
	const mode = args.thorough ? "thorough" : "fast";

	// Hook format
	if (args.format === "hook") {
		if (allConformant) {
			const allIds = results.map((r) => r.specId).join(", ");
			process.stdout.write(`Observability: READY (${allIds})\n`);
		} else {
			const failed = results.filter((r) => !r.conformant);
			const failedIds = failed.map((r) => r.specId).join(", ");
			process.stdout.write(`Observability: VIOLATIONS (${failedIds})\n`);
			const skills = failed
				.map((r) => `/conformance-testing-${r.specId.toLowerCase()}`)
				.join(" ");
			process.stdout.write(`Remediate: ${skills}\n`);
		}
		return allConformant ? 0 : 1;
	}

	// Human-readable default
	for (const result of results) {
		const status = result.conformant ? "PASS" : "FAIL";
		process.stdout.write(
			`${status} ${result.specId} (${mode}, ${result.durationMs.toString()}ms)\n`,
		);

		if (!result.conformant) {
			for (const nc of result.nonConformances) {
				const loc = nc.file ? (nc.line ? `${nc.file}:${nc.line.toString()}` : nc.file) : "";
				const prefix = loc ? `${loc} — ` : "";
				process.stdout.write(`  - ${prefix}${nc.message}\n`);
			}
			process.stdout.write(
				`  Remediate: /conformance-testing-${result.specId.toLowerCase()}\n`,
			);
		}
	}

	const conformantCount = results.filter((r) => r.conformant).length;
	process.stdout.write(
		`\n${conformantCount.toString()}/${results.length.toString()} specifications conformant\n`,
	);

	return allConformant ? 0 : 1;
}
