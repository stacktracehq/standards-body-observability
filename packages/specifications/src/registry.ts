/**
 * Registry of all Observability specifications
 *
 * Provides lookup functions matching the pattern from @standards-body/core-specifications.
 */

import type { Specification } from "@standards-body/core-specifications/core";
import { OBS_SPEC_001 } from "./obs-spec-001-otel-collector.ts";
import { OBS_SPEC_002 } from "./obs-spec-002-loki-backend.ts";
import { OBS_SPEC_003 } from "./obs-spec-003-logtape-otel.ts";
import { OBS_SPEC_004 } from "./obs-spec-004-hook-logging.ts";
import { OBS_SPEC_005 } from "./obs-spec-005-grafana.ts";

/**
 * All registered Observability specifications
 */
export const SPECIFICATIONS: Specification[] = [
	OBS_SPEC_001,
	OBS_SPEC_002,
	OBS_SPEC_003,
	OBS_SPEC_004,
	OBS_SPEC_005,
];

export function getAllSpecifications(): Specification[] {
	return SPECIFICATIONS;
}

export function getSpecification(id: string): Specification | undefined {
	return SPECIFICATIONS.find((s) => s.id === id);
}

export function getSpecificationsByStatus(status: string): Specification[] {
	return SPECIFICATIONS.filter((s) => s.status === status);
}

export function getSpecificationsByDirective(directive: string): Specification[] {
	return SPECIFICATIONS.filter((s) => s.directive === directive);
}

export function getSpecificationsByCategory(category: string): Specification[] {
	return SPECIFICATIONS.filter((s) => s.category === category);
}

export function getActiveSpecifications(): Specification[] {
	return getSpecificationsByStatus("active");
}

export function getDraftSpecifications(): Specification[] {
	return getSpecificationsByStatus("draft");
}
