import type {
	ConformanceResult,
	NonConformanceType as NonConformance,
} from "@standards-body/core-specifications/core";

export async function probeEndpoint(
	url: string,
	timeoutMs = 2000,
	init?: RequestInit,
): Promise<boolean> {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), ...init });
		return response.ok;
	} catch {
		return false;
	}
}

export function makeResult(
	specId: string,
	nonConformances: NonConformance[],
	startTime: number,
): ConformanceResult {
	return {
		specId,
		conformant: nonConformances.length === 0,
		nonConformances,
		durationMs: Math.round(performance.now() - startTime),
	};
}
