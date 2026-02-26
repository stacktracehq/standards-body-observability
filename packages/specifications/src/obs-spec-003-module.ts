import type { SpecificationModule } from "@standards-body/core-specifications/core";
import { makeResult } from "./check-helpers.ts";
import { checkLogtapeOtelFast, checkLogtapeOtelThorough } from "./obs-spec-003-check.ts";
import { OBS_SPEC_003 } from "./obs-spec-003-logtape-otel.ts";

async function checkFast(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkLogtapeOtelFast(repoRoot);
	return makeResult(OBS_SPEC_003.id, nonConformances, start);
}

async function checkThorough(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkLogtapeOtelThorough(repoRoot);
	return makeResult(OBS_SPEC_003.id, nonConformances, start);
}

export const OBS_SPEC_003_MODULE: SpecificationModule = {
	spec: OBS_SPEC_003,
	checkFast,
	checkThorough,
};
