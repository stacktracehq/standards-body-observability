import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import type { NonConformanceType as NonConformance } from "@standards-body/core-specifications/core";
import { isSystemLevelService, probeEndpoint } from "./check-helpers.ts";
import { OTEL_COLLECTOR_LOGS_ENDPOINT } from "./constants.ts";

function getOtelConfigPath(): string {
	if (os.platform() === "darwin") {
		return path.join(os.homedir(), "Library", "otelcol", "config.yaml");
	}
	return path.join(os.homedir(), ".config", "otelcol", "config.yaml");
}

export async function checkOtelCollectorFast(repoRoot: string): Promise<NonConformance[]> {
	void repoRoot;
	const findings: NonConformance[] = [];

	const reachable = await probeEndpoint(OTEL_COLLECTOR_LOGS_ENDPOINT, 2000, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ resourceLogs: [] }),
	});
	if (!reachable) {
		findings.push({
			message: `OTEL Collector is not reachable at ${OTEL_COLLECTOR_LOGS_ENDPOINT}. The collector must be running as a user-level service.`,
		});
	}

	return findings;
}

export async function checkOtelCollectorThorough(_repoRoot: string): Promise<NonConformance[]> {
	const findings = await checkOtelCollectorFast(_repoRoot);

	if (findings.length > 0) {
		return findings;
	}

	const configPath = getOtelConfigPath();
	let configContent: string;
	try {
		configContent = await fs.readFile(configPath, "utf-8");
	} catch {
		findings.push({
			file: configPath,
			message: `OTEL Collector config file not found at ${configPath}.`,
		});
		return findings;
	}

	if (!configContent.includes("memory_limiter:")) {
		findings.push({
			file: configPath,
			message: "OTEL Collector config does not include a memory_limiter processor.",
		});
	}

	if (!configContent.includes("exporters:")) {
		findings.push({
			file: configPath,
			message: "OTEL Collector config does not define any exporters.",
		});
	}

	const otelUnitNames = ["otelcol", "otelcol-contrib", "opentelemetry-collector"];
	for (const unit of otelUnitNames) {
		if (await isSystemLevelService(unit)) {
			findings.push({
				message: `OTEL Collector is running as a system-level (root) systemd service (${unit}.service). It must run as a user-level service (systemctl --user) to avoid requiring sudo.`,
			});
			break;
		}
	}

	return findings;
}
