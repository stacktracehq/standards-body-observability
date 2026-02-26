import { configure } from "@logtape/logtape";
import { getOpenTelemetrySink } from "@logtape/otel";

export async function setupLogging(): Promise<void> {
	await configure({
		sinks: {
			otel: getOpenTelemetrySink(),
		},
		loggers: [
			{
				category: ["standards-body", "observability"],
				sinks: ["otel"],
				lowestLevel: "info",
			},
		],
	});
}
