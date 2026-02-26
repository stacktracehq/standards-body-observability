import type { SpecificationModule } from "@standards-body/core-specifications/core";
import { makeResult } from "./check-helpers.ts";
import { checkLokiFast, checkLokiThorough } from "./obs-spec-002-check.ts";
import { OBS_SPEC_002 } from "./obs-spec-002-loki-backend.ts";

async function checkFast(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkLokiFast(repoRoot);
	return makeResult(OBS_SPEC_002.id, nonConformances, start);
}

async function checkThorough(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkLokiThorough(repoRoot);
	return makeResult(OBS_SPEC_002.id, nonConformances, start);
}

export const OBS_SPEC_002_MODULE: SpecificationModule = {
	spec: OBS_SPEC_002,
	checkFast,
	checkThorough,
};
