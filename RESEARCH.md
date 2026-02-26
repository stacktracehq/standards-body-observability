# Observability Standards Body — Architecture & Roadmap

This document defines the architecture and specification roadmap for `standards-body-observability`. It serves as the primary reference for specification authoring sessions.

## Problem Statement

The Standards Body ecosystem runs TypeScript CLIs and Claude Code hooks as short-lived Bun processes. Multiple concurrent Claude Code sessions on a single machine produce siloed diagnostic output with no centralized logging or cross-session visibility. This standards body codifies the observability infrastructure and instrumentation conventions to solve this.

## Architecture Decision: OpenTelemetry

### Alternatives Evaluated

**Syslog (`@logtape/syslog`)** — Rejected. Sends RFC 5424 via UDP to port 514, but neither systemd-journald (listens on `/dev/log` Unix socket, not UDP) nor default macOS listen on 514. UDP packets are silently dropped.

**Direct journald** — Rejected. The native journal socket (`/run/systemd/journal/socket`) supports structured data but requires Unix DGRAM addons that Node.js/Bun don't support natively. All existing npm packages (`systemd-journald`, `sd-journald`, `unix-dgram`) are unmaintained (4-11 years stale). The `systemd-cat` wrapper can't be used because hooks need stdout for the JSON protocol back to Claude Code.

### Why OTEL

The OTEL Collector topology requires **zero native dependencies** — `@logtape/otel` sends OTLP HTTP/JSON to localhost:4318, pure TypeScript. It provides full structured data, multi-sink fan-out (file, debug, Loki, future backends), is cross-platform (Ubuntu systemd + macOS launchd), and is the industry standard.

## Target Architecture

### Host Environment

Target machines are **not NixOS**. Primary: Ubuntu (systemd). Secondary: macOS (launchd). Nix flakes provide reproducible configuration, but service management is host-OS-native. Services (OTEL Collector, Loki) run directly on the host, **not in containers**, to avoid accidental stoppage during dev workloads.

### Data Flow

```
TypeScript CLI / Hook (Bun)
  -> LogTape (application logging API)
    -> @logtape/otel sink (OTLP HTTP/JSON)
      -> localhost:4318
        -> OTEL Collector (host system service, ~50 MiB RAM)
            |-> Loki (log aggregation + query via LogQL)
            |-> file exporter (/var/log/otel/logs.json, structured OTLP JSON)
            |-> debug exporter (stderr -> journalctl -u otelcol on Ubuntu)
            |-> [future] Tempo (traces), Prometheus (metrics)
```

### Components

| Component | Role | Port | Deployment |
|-----------|------|------|------------|
| LogTape | Application logging API | — | `@logtape/logtape` (npm) |
| @logtape/otel | OTLP sink for LogTape | — | `@logtape/otel` (npm) |
| OTEL Collector | Telemetry hub | 4317 (gRPC), 4318 (HTTP) | systemd / launchd service |
| Loki | Log aggregation + query | 3100 | systemd / launchd service |
| Grafana | Visualization (TBD scope) | 3000 | TBD |
| Prometheus | Metrics (future) | 9090 | TBD |
| Tempo | Tracing (future) | 3200 | TBD |

### Implementation Notes

**OTEL Collector**: DEB package on Ubuntu (config at `/etc/otelcol/config.yaml`), Homebrew on macOS. Always enable `memory_limiter` processor. Nix flakes manage config reproducibly.

**Loki**: v3+ supports native OTLP ingestion via standard `otlphttp` exporter (the old `lokiexporter` was deprecated/removed in 2024). Maps OTEL attributes to Loki labels automatically.

**@logtape/otel**: Protocol configurable via `OTEL_EXPORTER_OTLP_PROTOCOL` env var. Falls back to no-op when collector is unavailable (safe default).

**Local querying without Grafana**: Debug exporter → `journalctl -u otelcol` (Ubuntu) or `log show` (macOS). File exporter → `jq`. Loki/LogQL for structured cross-platform querying.

## Specification Roadmap

### Phase 1: Infrastructure

**OBS-SPEC-001: OTEL Collector Service**
- MUST run as a host system service (systemd on Linux, launchd on macOS)
- MUST listen on standard OTLP ports (4317 gRPC, 4318 HTTP)
- MUST include `memory_limiter` processor
- MUST export to at least one backend (Loki for logs)
- MUST NOT run in a container
- Configuration SHOULD be managed via Nix flakes

**OBS-SPEC-002: Loki Log Backend**
- MUST run as a host system service
- MUST accept OTLP ingestion on standard endpoint
- MUST NOT run in a container
- Retention policy TBD (suggest 30 days for local dev)

### Phase 2: Application Instrumentation

**OBS-SPEC-003: TypeScript LogTape + OTEL Sink**
- All TypeScript projects MUST use LogTape as their logging API
- MUST configure `@logtape/otel` sink targeting `http://localhost:4318`
- MUST gracefully degrade (no-op) when collector is unavailable
- `serviceName` MUST match the project/package name
- Applies to CLIs, hooks, and all TypeScript workloads

**OBS-SPEC-004: Hook Logging Convention**
- Hooks MUST log start/end events with timing
- MUST include session-identifying attributes (Claude PID, session context)
- MUST NOT interfere with the stdout JSON protocol
- LogTape categories: `["standards-body", "<plugin-name>", "hooks", "<hook-name>"]`

### Phase 3: Extended (Future)

- **OBS-SPEC-005**: Prometheus Metrics — standard metrics endpoint for TypeScript CLIs
- **OBS-SPEC-006**: Tempo Tracing — distributed tracing for multi-process workflows
- **OBS-SPEC-007**: Grafana Dashboards — may warrant separate `standards-body-grafana`

## Next Steps

### 1. Install OTEL Collector as host service
- Ubuntu: DEB package, systemd service
- macOS: Homebrew or direct binary, launchd plist
- Apply starter config below
- Verify: `curl -X POST http://localhost:4318/v1/logs` returns 200

### 2. Install Loki as host service
- Same approach (DEB/Homebrew, systemd/launchd)
- Verify OTLP ingestion works end-to-end

### 3. Author OBS-SPEC-001 and OBS-SPEC-002
- Write specification TypeScript files in `packages/specifications/src/`
- Implement conformance check modules (verify services are running, ports listening)
- Create corresponding conformance testing skills

### 4. First instrumentation target: standards-body-claude-code hooks
- Add `@logtape/logtape` and `@logtape/otel` to hook-runtime
- Configure LogTape with OTEL sink in `packages/hook-runtime/src/harness.ts`
- Add logging at key points (hook start, validation, handler execution, completion)
- Verify logs appear in Loki

### 5. Install observability plugin into ecosystem repos
- Session-start hooks verify OTEL Collector reachability on localhost:4318

## Starter OTEL Collector Config

```yaml
# /etc/otelcol/config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  memory_limiter:
    check_interval: 5s
    limit_mib: 256
  batch:
    timeout: 5s

exporters:
  debug:
    verbosity: normal
  otlphttp/loki:
    endpoint: http://localhost:3100/otlp
  file:
    path: /var/log/otel/logs.json
    rotation:
      max_megabytes: 100
      max_days: 7

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [debug, otlphttp/loki, file]
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@logtape/logtape` | Logging API (npm, pure TS) |
| `@logtape/otel` | OTLP sink (npm, pure TS) |

No native dependencies required.

## Open Questions

1. **Grafana scope**: Separate `standards-body-grafana` or part of this body?
2. **Retention**: How long to keep logs in Loki locally? (Suggest 30 days)
3. **Log levels**: Minimum severity for collector? (`info` prod, `debug` dev)
4. **Authentication**: Localhost OTEL endpoints are unauthenticated — acceptable for local dev?
5. **`_trace` metadata**: The hook-runtime already produces trace-like metadata. Map to OTEL trace attributes, or supersede with proper OTEL instrumentation?
