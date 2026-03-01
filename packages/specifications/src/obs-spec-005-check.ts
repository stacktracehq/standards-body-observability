import type { NonConformanceType as NonConformance } from "@standards-body/core-specifications/core";
import { isSystemLevelService, probeEndpoint } from "./check-helpers.ts";
import { GRAFANA_DATASOURCES_ENDPOINT, GRAFANA_HEALTH_ENDPOINT } from "./constants.ts";

export async function checkGrafanaFast(repoRoot: string): Promise<NonConformance[]> {
	void repoRoot;
	const findings: NonConformance[] = [];

	const reachable = await probeEndpoint(GRAFANA_HEALTH_ENDPOINT);
	if (!reachable) {
		findings.push({
			message: `Grafana is not reachable at ${GRAFANA_HEALTH_ENDPOINT}. Grafana must be running as a user-level service.`,
		});
	}

	return findings;
}

export async function checkGrafanaThorough(_repoRoot: string): Promise<NonConformance[]> {
	const findings = await checkGrafanaFast(_repoRoot);

	if (findings.length > 0) {
		return findings;
	}

	try {
		const response = await fetch(GRAFANA_DATASOURCES_ENDPOINT, {
			signal: AbortSignal.timeout(2000),
		});
		if (response.ok) {
			const datasources = (await response.json()) as { type: string }[];
			const hasLoki = datasources.some((ds) => ds.type === "loki");
			if (!hasLoki) {
				findings.push({
					message:
						"Grafana does not have a Loki data source configured. Loki must be provisioned as a data source.",
				});
			}
		} else {
			findings.push({
				message: `Grafana datasources API returned status ${String(response.status)}. Unable to verify Loki data source.`,
			});
		}
	} catch {
		findings.push({
			message: `Failed to query Grafana datasources API at ${GRAFANA_DATASOURCES_ENDPOINT}.`,
		});
	}

	const grafanaUnitNames = ["grafana", "grafana-server"];
	for (const unit of grafanaUnitNames) {
		if (await isSystemLevelService(unit)) {
			findings.push({
				message: `Grafana is running as a system-level (root) systemd service (${unit}.service). It must run as a user-level service (systemctl --user) to avoid requiring sudo.`,
			});
			break;
		}
	}

	return findings;
}
