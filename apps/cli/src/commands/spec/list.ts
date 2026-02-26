import type { Specification } from "@standards-body/__NAME__-specifications";
import {
	type Directive,
	getAllSpecifications,
	getSpecificationsByCategory,
	getSpecificationsByDirective,
	getSpecificationsByStatus,
	type Status,
} from "@standards-body/__NAME__-specifications";
import { constant, message, object, option, optional, string } from "../../stdlib.ts";

/**
 * Parser for `spec list` command options.
 */
export const specListParser = object({
	type: constant("spec-list" as const),
	status: optional(
		option("--status", string(), {
			description: message`Filter by status (draft, active, deprecated, superseded)`,
		}),
	),
	directive: optional(
		option("--directive", string(), {
			description: message`Filter by directive (MUST, SHOULD, MUST_NOT, SHOULD_NOT, MAY)`,
		}),
	),
	category: optional(
		option("--category", string(), {
			description: message`Filter by category (foundation, cli-entry, stdlib, etc.)`,
		}),
	),
});

/**
 * Execute the spec list command.
 */
export function specList(args: {
	status: string | undefined;
	directive: string | undefined;
	category: string | undefined;
}): number {
	let specs: Specification[];

	if (args.status) {
		specs = getSpecificationsByStatus(args.status as Status);
	} else if (args.directive) {
		specs = getSpecificationsByDirective(args.directive as Directive);
	} else if (args.category) {
		specs = getSpecificationsByCategory(args.category);
	} else {
		specs = getAllSpecifications();
	}

	// Apply additional filters if multiple specified
	if (args.status && args.directive) {
		specs = specs.filter((s) => s.directive === args.directive);
	}
	if (args.status && args.category) {
		specs = specs.filter((s) => s.category === args.category);
	}
	if (args.directive && args.category && !args.status) {
		specs = specs.filter((s) => s.category === args.category);
	}

	// Sort by ID
	specs.sort((a, b) => a.id.localeCompare(b.id));

	// Display results
	if (specs.length === 0) {
		process.stdout.write("No specifications found matching filters\n");
		return 0;
	}

	// Header
	const filters: string[] = [];
	if (args.status) filters.push(`status=${args.status}`);
	if (args.directive) filters.push(`directive=${args.directive}`);
	if (args.category) filters.push(`category=${args.category}`);

	const header = filters.length > 0 ? `Specifications (${filters.join(", ")})` : "Specifications";

	process.stdout.write(`\n${header}\n`);
	process.stdout.write("=".repeat(header.length) + "\n\n");

	// Table header
	process.stdout.write(
		`${"ID".padEnd(10)} ${"Directive".padEnd(12)} ${"Status".padEnd(10)} ${"Title".padEnd(40)} ${"Category".padEnd(15)}\n`,
	);
	process.stdout.write("-".repeat(92) + "\n");

	// Rows
	for (const spec of specs) {
		const title = spec.title.slice(0, 40).padEnd(40);

		process.stdout.write(
			`${spec.id.padEnd(10)} ${spec.directive.padEnd(12)} ${spec.status.padEnd(10)} ${title} ${spec.category.padEnd(15)}\n`,
		);
	}

	process.stdout.write(`\nTotal: ${String(specs.length)}\n`);
	process.stdout.write(
		`\nUse 'run spec info <ID>' to see details for a specific specification\n`,
	);

	return 0;
}
