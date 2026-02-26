import type { NonConformanceType as NonConformance } from "@standards-body/core-specifications/core";
import { probeEndpoint } from "./check-helpers.ts";
import { LOKI_OTLP_ENDPOINT, LOKI_READY_ENDPOINT } from "./constants.ts";

export async function checkLokiFast(repoRoot: string): Promise<NonConformance[]> {
	void repoRoot;
	const findings: NonConformance[] = [];

	const reachable = await probeEndpoint(LOKI_READY_ENDPOINT);
	if (!reachable) {
		findings.push({
			message: `Loki is not reachable at ${LOKI_READY_ENDPOINT}. Loki must be running as a host service.`,
		});
	}

	return findings;
}

export async function checkLokiThorough(_repoRoot: string): Promise<NonConformance[]> {
	const findings = await checkLokiFast(_repoRoot);

	if (findings.length > 0) {
		return findings;
	}

	const otlpReachable = await probeEndpoint(LOKI_OTLP_ENDPOINT);
	if (!otlpReachable) {
		findings.push({
			message: `Loki OTLP ingestion endpoint is not reachable at ${LOKI_OTLP_ENDPOINT}. OTLP ingestion must be enabled.`,
		});
	}

	return findings;
}
