import type { SpecificationModule } from "@standards-body/core-specifications/core";
import { makeResult } from "./check-helpers.ts";
import { checkGrafanaFast, checkGrafanaThorough } from "./obs-spec-005-check.ts";
import { OBS_SPEC_005 } from "./obs-spec-005-grafana.ts";

async function checkFast(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkGrafanaFast(repoRoot);
	return makeResult(OBS_SPEC_005.id, nonConformances, start);
}

async function checkThorough(repoRoot: string) {
	const start = performance.now();
	const nonConformances = await checkGrafanaThorough(repoRoot);
	return makeResult(OBS_SPEC_005.id, nonConformances, start);
}

export const OBS_SPEC_005_MODULE: SpecificationModule = {
	spec: OBS_SPEC_005,
	checkFast,
	checkThorough,
};
