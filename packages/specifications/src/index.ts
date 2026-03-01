/**
 * @standards-body/observability-specifications
 *
 * Observability specification registry.
 */

// Re-export core types for convenience
export type {
	CategoryType as Category,
	ConformanceResult,
	DirectiveType as Directive,
	Specification,
	SpecificationModule,
	StatusType as Status,
} from "@standards-body/core-specifications/core";
// Shared helpers
export { isSystemLevelService, makeResult, probeEndpoint } from "./check-helpers.ts";
// Constants
export {
	LOKI_OTLP_ENDPOINT,
	LOKI_PORT,
	LOKI_READY_ENDPOINT,
	OBS_DISPLAY_NAME,
	OBS_NAMESPACE,
	OTEL_COLLECTOR_CONFIG_LINUX,
	OTEL_COLLECTOR_HTTP_PORT,
	OTEL_COLLECTOR_LOGS_ENDPOINT,
} from "./constants.ts";

// Specification definitions
export { OBS_SPEC_001 } from "./obs-spec-001-otel-collector.ts";
export { OBS_SPEC_002 } from "./obs-spec-002-loki-backend.ts";
export { OBS_SPEC_003 } from "./obs-spec-003-logtape-otel.ts";
export { OBS_SPEC_004 } from "./obs-spec-004-hook-logging.ts";

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
