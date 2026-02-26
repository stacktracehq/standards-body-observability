/**
 * Registry of all Observability specifications
 *
 * Provides lookup functions matching the pattern from @standards-body/core-specifications.
 */

import type { Specification } from "@standards-body/core-specifications/core";

/**
 * All registered Observability specifications
 */
export const SPECIFICATIONS: Specification[] = [];

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
