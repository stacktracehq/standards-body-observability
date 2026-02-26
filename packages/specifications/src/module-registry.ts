/**
 * Registry of Observability specification modules (conformance checks)
 *
 * Separated from the main registry to avoid pulling node:fs/node:child_process
 * into contexts that only need spec metadata.
 */

import type { SpecificationModule } from "@standards-body/core-specifications/core";
import { createRegistry } from "@standards-body/core-specifications/core";
import { getActiveSpecifications, SPECIFICATIONS } from "./registry.ts";

const OBS_NAMESPACE = "OBS";
const OBS_DISPLAY_NAME = "Observability";

/**
 * All registered Observability specification modules (executable checks)
 */
export const SPECIFICATION_MODULES: SpecificationModule[] = [];

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
