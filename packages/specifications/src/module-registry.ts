/**
 * Registry of Observability specification modules (conformance checks)
 *
 * Separated from the main registry to avoid pulling node:fs/node:child_process
 * into contexts that only need spec metadata.
 */

import type { SpecificationModule } from "@standards-body/core-specifications/core";
import { createRegistry } from "@standards-body/core-specifications/core";
import { OBS_DISPLAY_NAME, OBS_NAMESPACE } from "./constants.ts";
import { OBS_SPEC_001_MODULE } from "./obs-spec-001-module.ts";
import { OBS_SPEC_002_MODULE } from "./obs-spec-002-module.ts";
import { OBS_SPEC_003_MODULE } from "./obs-spec-003-module.ts";
import { OBS_SPEC_004_MODULE } from "./obs-spec-004-module.ts";
import { OBS_SPEC_005_MODULE } from "./obs-spec-005-module.ts";
import { getActiveSpecifications, SPECIFICATIONS } from "./registry.ts";

/**
 * All registered Observability specification modules (executable checks)
 */
export const SPECIFICATION_MODULES: SpecificationModule[] = [
	OBS_SPEC_001_MODULE,
	OBS_SPEC_002_MODULE,
	OBS_SPEC_003_MODULE,
	OBS_SPEC_004_MODULE,
	OBS_SPEC_005_MODULE,
];

/**
 * The Observability specification registry (specs + modules bundled).
 */
export const OBS_REGISTRY = createRegistry(
	OBS_NAMESPACE,
	OBS_DISPLAY_NAME,
	SPECIFICATIONS,
	SPECIFICATION_MODULES,
);

export function getAllSpecificationModules(): SpecificationModule[] {
	return SPECIFICATION_MODULES;
}

export function getSpecificationModule(id: string): SpecificationModule | undefined {
	return SPECIFICATION_MODULES.find((m) => m.spec.id === id);
}

export function getActiveSpecificationModules(): SpecificationModule[] {
	const activeIds = new Set(getActiveSpecifications().map((s) => s.id));
	return SPECIFICATION_MODULES.filter((m) => activeIds.has(m.spec.id));
}
