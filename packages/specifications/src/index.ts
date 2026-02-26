/**
 * @standards-body/observability-specifications
 *
 * Observability specification registry.
 * No specifications defined yet.
 */

// Re-export core types for convenience
export type {
	ConformanceResult,
	Specification,
	SpecificationModule,
	CategoryType as Category,
	DirectiveType as Directive,
	StatusType as Status,
} from "@standards-body/core-specifications/core";

// Registry (metadata only)
export {
	getActiveSpecifications,
	getAllSpecifications,
	getDraftSpecifications,
	getSpecification,
	getSpecificationsByCategory,
	getSpecificationsByDirective,
	getSpecificationsByStatus,
	SPECIFICATIONS,
} from "./registry.ts";
