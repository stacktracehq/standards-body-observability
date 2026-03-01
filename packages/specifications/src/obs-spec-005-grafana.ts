import { Specification } from "@standards-body/core-specifications/core";
import { OBS_NAMESPACE } from "./constants.ts";

export const OBS_SPEC_005 = Specification.parse({
	id: "OBS-SPEC-005",
	namespace: OBS_NAMESPACE,
	title: "Grafana Dashboard Service",
	directive: "MUST",
	status: "active",
	scope: "every-project",
	category: "infrastructure",
	summary:
		"Grafana MUST run as a user-level systemd service (Linux) or launchd agent (macOS) on port 3000 with Loki provisioned as the default data source.",
	rationale:
		"Grafana provides a web UI for querying and visualising logs stored in Loki. Running it as a user-level service keeps it consistent with the rest of the observability stack (OTEL Collector, Loki) and avoids requiring elevated privileges. Pre-provisioning the Loki data source ensures the dashboard is immediately useful without manual configuration. System-level (root) services are non-conformant.",
	examples: [
		{
			title: "Provisioned Loki data source",
			code: `apiVersion: 1
datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://localhost:3100
    isDefault: true
    editable: true`,
			language: "yaml",
		},
	],
	logicalConformanceTestingProcedure: {
		fast: "HTTP probe http://localhost:3000/api/health — returns 200 if Grafana is healthy.",
		thorough:
			"Fast check plus: query http://localhost:3000/api/datasources to verify a Loki data source is configured, and confirm the service is NOT running as a system-level systemd unit.",
	},
	remediation: {
		steps: [
			"Download Grafana OSS tarball and extract to ~/.local/share/grafana/.",
			"Symlink grafana-server to ~/.local/bin/.",
			"Create config at ~/.config/grafana/custom.ini with anonymous access enabled.",
			"Provision Loki data source via ~/.config/grafana/provisioning/datasources/loki.yaml.",
			"Create a user-level systemd unit (~/.config/systemd/user/grafana.service) or launchd agent.",
			"If running as a system-level service, migrate to a user-level service and remove the system unit.",
			"Enable loginctl enable-linger to persist the service across logouts (Linux).",
			"Start via: systemctl --user enable --now grafana",
			"Verify with: curl -s http://localhost:3000/api/health",
		],
	},
	version: "1.0.0",
	created: "2026-03-01",
	updated: "2026-03-01",
});
