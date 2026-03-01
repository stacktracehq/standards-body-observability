import type { NonConformanceType as NonConformance } from "@standards-body/core-specifications/core";
import { isSystemLevelService, probeEndpoint } from "./check-helpers.ts";
import { LOKI_OTLP_ENDPOINT, LOKI_READY_ENDPOINT } from "./constants.ts";

export async function checkLokiFast(repoRoot: string): Promise<NonConformance[]> {
	void repoRoot;
	const findings: NonConformance[] = [];

	const reachable = await probeEndpoint(LOKI_READY_ENDPOINT);
	if (!reachable) {
		findings.push({
			message: `Loki is not reachable at ${LOKI_READY_ENDPOINT}. Loki must be running as a user-level service.`,
		});
	}

	return findings;
}

export async function checkLokiThorough(_repoRoot: string): Promise<NonConformance[]> {
	const findings = await checkLokiFast(_repoRoot);

	if (findings.length > 0) {
		return findings;
	}

	const otlpReachable = await probeEndpoint(LOKI_OTLP_ENDPOINT, 2000, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			resourceLogs: [
				{
					resource: {
						attributes: [
							{ key: "service.name", value: { stringValue: "conformance-probe" } },
						],
					},
					scopeLogs: [
						{
							scope: {},
							logRecords: [
								{
									timeUnixNano: String(Date.now() * 1_000_000),
									body: { stringValue: "conformance-probe" },
									severityText: "INFO",
								},
							],
						},
					],
				},
			],
		}),
	});
	if (!otlpReachable) {
		findings.push({
			message: `Loki OTLP ingestion endpoint is not reachable at ${LOKI_OTLP_ENDPOINT}. OTLP ingestion must be enabled.`,
		});
	}

	if (await isSystemLevelService("loki")) {
		findings.push({
			message:
				"Loki is running as a system-level (root) systemd service. It must run as a user-level service (systemctl --user) to avoid requiring sudo.",
		});
	}

	return findings;
}
