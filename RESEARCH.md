# standards-body-observability: Research Handoff

## Context

This document captures research and design decisions from a February 2026 session investigating centralized logging for the Standards Body ecosystem. The goal is to establish a new standards body (`standards-body-observability`) responsible for telemetry infrastructure and ingestion standards across all Standards Body products.

### Problem Statement

The Standards Body ecosystem consists of multiple products (standards-body-claude-code, standards-body-git, standards-body-nix, standards-body-typescript-cli, and growing). Each product runs TypeScript CLIs and Claude Code hooks — short-lived, ad-hoc Bun processes that currently have no centralized logging. Multiple concurrent Claude Code sessions on a single machine produce siloed diagnostic output with no cross-session visibility.

### Why Not Syslog?

LogTape's `@logtape/syslog` sink was evaluated first. It sends RFC 5424 messages via UDP/TCP to port 514. This was rejected because:

- **systemd-journald does not listen on UDP 514** — it only captures from `/dev/log` (Unix domain socket) and service stdout/stderr
- **On default Ubuntu and macOS, nothing listens on port 514** — UDP packets are silently dropped
- Even with rsyslog enabled on 514, it writes to text files, not back into the journal
- Setting up rsyslog as a bridge to journald (via `omjournal`) is non-trivial infrastructure for limited benefit

### Why Not Direct journald?

Writing directly to the systemd journal was evaluated next:

- **`/dev/log` Unix socket**: Requires a native Unix DGRAM addon (Node.js/Bun don't support Unix DGRAM natively). No structured data — just plain text BSD syslog format
- **`/run/systemd/journal/socket` (native journal protocol)**: Full structured data support, but same native addon requirement. Existing npm packages (`systemd-journald`, `sd-journald`, `unix-dgram`) are all unmaintained (4-11 years stale) with questionable Bun compatibility
- **`logger` command (shell out)**: Zero dependencies, works everywhere, but no structured data and ~2-5ms overhead per call
- **`systemd-cat` wrapper**: Can't wrap hooks because hooks use stdout for the JSON protocol back to Claude Code

### Why OpenTelemetry

The OTEL Collector topology was selected because it:

1. **Requires zero native dependencies** — `@logtape/otel` sends OTLP HTTP/JSON to localhost:4318, pure TypeScript
2. **Provides full structured data** — attributes, resources, severity levels preserved end-to-end
3. **Supports multi-sink fan-out** — one collector can export to file, debug (journalctl), Loki, and future backends simultaneously
4. **Is the industry standard** — portable across environments (local dev, containers, cloud)
5. **Cross-platform** — works on both Ubuntu (systemd services) and macOS (launchd / Homebrew services)
6. **Separates concerns** — application code uses LogTape API, transport is OTEL, backend is invisible

## Architecture

### Host Environment

**Important**: The target machines are **not** NixOS. The environment is:

- **Primary workstation**: Ubuntu (systemd-based)
- **Secondary workstation**: macOS (Mac Mini, launchd-based)
- **Nix usage**: Nix flakes / devShells for reproducibility and package management, but not NixOS
- **Service management**: systemd on Ubuntu, launchd (or Homebrew services) on macOS
- **Containerization**: Services (OTEL Collector, Loki) should run directly on the host as system services, NOT in containers — avoids accidentally stopping them during dev workloads

Nix flakes should be used to **define and configure** the services reproducibly, but the actual service management is host-OS-native.

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

### Component Responsibilities

| Component | Role | Port | Deployment |
|-----------|------|------|------------|
| LogTape | Application logging API | — | `@logtape/logtape` (npm) |
| @logtape/otel | OTLP sink for LogTape | — | `@logtape/otel` (npm) |
| OTEL Collector | Telemetry hub (receives, processes, exports) | 4317 (gRPC), 4318 (HTTP) | systemd service (Ubuntu) / launchd (macOS) |
| Loki | Log aggregation + query backend | 3100 (default) | systemd service (Ubuntu) / launchd (macOS) |
| Grafana | Visualization (may be separate standards body) | 3000 (default) | TBD |
| Prometheus | Metrics backend (future) | 9090 (default) | TBD |
| Tempo | Distributed tracing backend (future) | 3200 (default) | TBD |

### Key Technical Details

**OTEL Collector:**
- Ubuntu: DEB package installs a systemd service, config at `/etc/otelcol/config.yaml`
- macOS: Available via Homebrew or direct binary download
- ~50 MiB RAM idle, should always enable `memory_limiter` processor
- OTLP receiver listens on 4317 (gRPC) and 4318 (HTTP) by default
- Nix flakes can manage the config file and binary reproducibly on both platforms

**@logtape/otel:**
- Sends via OTLP HTTP/JSON (default), also supports HTTP/protobuf and gRPC
- Protocol configurable via `OTEL_EXPORTER_OTLP_PROTOCOL` env var
- Falls back to no-op if no endpoint configured (safe for environments without collector)
- Works with Bun runtime

**Loki:**
- v3+ supports native OTLP ingestion — use standard `otlphttp` exporter, no dedicated Loki exporter needed (the old `lokiexporter` was deprecated and removed in 2024)
- Maps OTEL resource attributes and log attributes to Loki labels and structured metadata automatically
- Queryable via LogQL

**Local observability (without Grafana):**
- On Ubuntu: the OTEL Collector's debug exporter writes to stderr, which systemd captures. Visible via `journalctl -u otelcol` — human-readable text, not structured journal fields
- On macOS: debug exporter output goes to launchd's log capture (viewable via `log show` or Console.app)
- On both platforms: the file exporter writes structured OTLP JSON to disk, queryable with `jq`
- For structured querying across platforms, use Loki/LogQL (the primary query path)
- The debug exporter has sampling settings (`sampling_initial`, `sampling_thereafter`) that may throttle output

## Proposed Specifications

### Phase 1: Infrastructure (OTEL Collector + Loki)

**OBS-SPEC-001: OTEL Collector Service**
- MUST run as a host system service (systemd on Linux, launchd on macOS)
- MUST listen on standard OTLP ports (4317 gRPC, 4318 HTTP)
- MUST include `memory_limiter` processor
- MUST export to at least one backend (Loki for logs)
- MUST NOT run in a container (avoid accidental stoppage during dev workloads)
- Configuration SHOULD be managed via Nix flakes for reproducibility

**OBS-SPEC-002: Loki Log Backend**
- MUST run as a host system service (systemd on Linux, launchd on macOS)
- MUST accept OTLP ingestion on standard endpoint
- MUST NOT run in a container
- Retention policy TBD (suggest 30 days for local dev)

### Phase 2: Application Instrumentation

**OBS-SPEC-003: TypeScript LogTape + OTEL Sink**
- All TypeScript projects MUST use LogTape as their logging API
- All TypeScript projects MUST configure `@logtape/otel` sink
- Sink MUST target `http://localhost:4318` (standard OTLP HTTP endpoint)
- Sink MUST gracefully degrade (no-op) when collector is unavailable
- `serviceName` MUST match the project/package name
- This applies to CLIs, hooks, and any other TypeScript workloads

**OBS-SPEC-004: Hook Logging Convention**
- Hooks MUST log start/end events with timing
- Hooks MUST include session-identifying attributes (Claude PID, session context)
- Hook logging MUST NOT interfere with the stdout JSON protocol
- LogTape categories MUST follow convention: `["standards-body", "<plugin-name>", "hooks", "<hook-name>"]`

### Phase 3: Extended Observability (Future)

**OBS-SPEC-005: Prometheus Metrics** (future)
- Standard metrics endpoint convention for TypeScript CLIs
- Conformance check duration, specification counts, etc.

**OBS-SPEC-006: Tempo Tracing** (future)
- Distributed tracing for multi-process workflows (e.g., hook -> CLI -> spec check)

**OBS-SPEC-007: Grafana Dashboards** (future, possibly separate standards body)
- Standard dashboards for ecosystem health
- May warrant `standards-body-grafana` if scope grows

## Starter OTEL Collector Config

```yaml
# /etc/otelcol/config.yaml (starter)
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

## Key Dependencies

| Package | Purpose | Install |
|---------|---------|---------|
| `@logtape/logtape` | Logging API | `pnpm add @logtape/logtape` |
| `@logtape/otel` | OTLP sink | `pnpm add @logtape/otel` |

No native dependencies required. Pure TypeScript/JavaScript.

## Open Questions

1. **Grafana**: Separate `standards-body-grafana` or part of observability? Grafana serves visualization beyond just observability.
2. **Retention policies**: How long to keep logs in Loki on local dev vs production?
3. **Log levels**: What's the minimum severity that should be sent to the collector? (Suggest: `info` for production, `debug` for dev)
4. **Authentication**: OTEL Collector endpoints are unauthenticated on localhost. Acceptable for local dev, but needs thought for shared/remote collectors.
5. **Existing `_trace` metadata**: The hook-runtime already produces trace-like metadata. Should this be mapped to OTEL trace attributes, or is it superseded by proper OTEL instrumentation?
