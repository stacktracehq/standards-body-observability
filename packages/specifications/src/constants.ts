export const OBS_NAMESPACE = "OBS";
export const OBS_DISPLAY_NAME = "Observability";

export const OTEL_COLLECTOR_HTTP_PORT = 4318;
export const OTEL_COLLECTOR_LOGS_ENDPOINT = `http://localhost:${String(OTEL_COLLECTOR_HTTP_PORT)}/v1/logs`;
export const OTEL_COLLECTOR_CONFIG_LINUX = "~/.config/otelcol/config.yaml";

export const LOKI_PORT = 3100;
export const LOKI_READY_ENDPOINT = `http://localhost:${String(LOKI_PORT)}/ready`;
export const LOKI_OTLP_ENDPOINT = `http://localhost:${String(LOKI_PORT)}/otlp/v1/logs`;
