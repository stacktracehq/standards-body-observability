import type { SpecificationModule } from "@standards-body/core-specifications/core";
import { makeResult } from "./check-helpers.ts";
import { checkHookLoggingFast, checkHookLoggingThorough } from "./obs-spec-004-check.ts";
import { OBS_SPEC_004 } from "./obs-spec-004-hook-logging.ts";

async function checkFast(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkHookLoggingFast(repoRoot);
	return makeResult(OBS_SPEC_004.id, nonConformances, start);
}

async function checkThorough(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkHookLoggingThorough(repoRoot);
	return makeResult(OBS_SPEC_004.id, nonConformances, start);
}

export const OBS_SPEC_004_MODULE: SpecificationModule = {
	spec: OBS_SPEC_004,
	checkFast,
	checkThorough,
};
