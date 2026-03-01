import { execFile } from "node:child_process";
import * as os from "node:os";
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

/**
 * Returns true if the given unit is active as a system-level (root) systemd service.
 * Only meaningful on Linux; returns false on other platforms.
 */
export async function isSystemLevelService(unitName: string): Promise<boolean> {
	if (os.platform() !== "linux") return false;
	return new Promise((resolve) => {
		execFile("systemctl", ["--system", "is-active", unitName], (error, stdout) => {
			resolve(!error && stdout.trim() === "active");
		});
	});
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
