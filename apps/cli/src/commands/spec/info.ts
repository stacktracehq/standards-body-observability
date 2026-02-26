import { getSpecification } from "@standards-body/__NAME__-specifications";
import { argument, constant, message, object, string } from "../../stdlib.ts";

/**
 * Parser for `spec info` command options.
 */
export const specInfoParser = object({
	type: constant("spec-info" as const),
	specId: argument(string({ metavar: "SPEC-ID" }), {
		description: message`Specification ID`,
	}),
});

/**
 * Execute the spec info command.
 */
export function specInfo(args: { specId: string }): number {
	const id = args.specId.toUpperCase();
	const spec = getSpecification(id);

	if (!spec) {
		process.stderr.write(`Specification not found: ${id}\n`);
		process.stderr.write(`\nUse 'run spec list' to see available specifications\n`);
		return 1;
	}

	// Display specification details
	process.stdout.write(`\n${"=".repeat(80)}\n`);
	process.stdout.write(`${spec.id}: ${spec.title}\n`);
	process.stdout.write(`${"=".repeat(80)}\n\n`);

	// Metadata
	process.stdout.write(`Directive: ${spec.directive}\n`);
	process.stdout.write(`Status:    ${spec.status}\n`);
	process.stdout.write(`Category:  ${spec.category}\n`);
	process.stdout.write(`Version:   ${spec.version}\n`);
	process.stdout.write(`Created:   ${spec.created}\n`);
	process.stdout.write(`Updated:   ${spec.updated}\n`);

	// Summary
	process.stdout.write(`\nSummary\n${"─".repeat(80)}\n${spec.summary}\n`);

	// Rationale
	process.stdout.write(`\nRationale\n${"─".repeat(80)}\n${spec.rationale}\n`);

	// Conformance testing
	process.stdout.write(`\nConformance Testing\n${"─".repeat(80)}\n`);
	process.stdout.write(`Fast:     ${spec.logicalConformanceTestingProcedure.fast}\n\n`);
	process.stdout.write(`Thorough: ${spec.logicalConformanceTestingProcedure.thorough}\n`);

	// Remediation
	process.stdout.write(`\nRemediation\n${"─".repeat(80)}\n`);
	process.stdout.write(`\nSteps:\n`);
	for (let i = 0; i < spec.remediation.steps.length; i++) {
		const step = spec.remediation.steps[i];
		process.stdout.write(`  ${String(i + 1)}. ${step ?? ""}\n`);
	}

	// Examples
	if (spec.examples.length > 0) {
		process.stdout.write(`\nExamples\n${"─".repeat(80)}\n`);
		for (const example of spec.examples) {
			process.stdout.write(`\n${example.title}`);
			if (example.language) {
				process.stdout.write(` (${example.language})`);
			}
			process.stdout.write(`:\n\n${example.code}\n`);
		}
	}

	// Footer hints
	process.stdout.write(`\n${"=".repeat(80)}\n`);
	if (spec.status === "draft") {
		process.stdout.write(
			`\nThis is a draft specification. It cannot be checked until promoted to active.\n`,
		);
	} else if (spec.status === "active") {
		process.stdout.write(`\nUse 'run spec check ${id}' to check conformance\n`);
	}

	return 0;
}
