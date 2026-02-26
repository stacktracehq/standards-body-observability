import type { SpecificationModule } from "@standards-body/core-specifications/core";
import { makeResult } from "./check-helpers.ts";
import { checkOtelCollectorFast, checkOtelCollectorThorough } from "./obs-spec-001-check.ts";
import { OBS_SPEC_001 } from "./obs-spec-001-otel-collector.ts";

async function checkFast(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkOtelCollectorFast(repoRoot);
	return makeResult(OBS_SPEC_001.id, nonConformances, start);
}

async function checkThorough(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkOtelCollectorThorough(repoRoot);
	return makeResult(OBS_SPEC_001.id, nonConformances, start);
}

export const OBS_SPEC_001_MODULE: SpecificationModule = {
	spec: OBS_SPEC_001,
	checkFast,
	checkThorough,
};
