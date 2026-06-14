# New Relic Observability Guide

Research & integration guide for sobatbisnis API.

---

## Table of Contents

- [What is New Relic](#what-is-new-relic)
- [Integration Options](#integration-options)
- [Option A: OpenTelemetry → New Relic (Recommended)](#option-a-opentelemetry--new-relic-recommended)
- [Option B: Native New Relic Agent](#option-b-native-new-relic-agent)
- [Environment Variables](#environment-variables)
- [Key Features](#key-features)
- [Pricing](#pricing)
- [Comparison with Alternatives](#comparison-with-alternatives)
- [Gotchas & Considerations](#gotchas--considerations)

---

## What is New Relic

New Relic is a fully-hosted SaaS **Intelligent Observability Platform** covering the three pillars of observability: **metrics, traces, and logs**. It offers 50+ capabilities and 780+ integrations.

### Core Modules

| Module | Description |
|--------|-------------|
| **APM** | Transaction tracing, response times, throughput, error rates |
| **Distributed Tracing** | End-to-end request tracking across services |
| **Log Management** | Log forwarding, querying, correlation with traces |
| **Infrastructure** | Host, container, Kubernetes, cloud monitoring |
| **Error Tracking** | Unified error triage (Errors Inbox) |
| **Dashboards** | Customizable, NRQL-powered widgets |
| **Alerts** | Dynamic thresholds, anomaly detection, PagerDuty/Slack integration |
| **Code Profiling** | Production flame graphs for CPU/memory |
| **Browser/Mobile** | Real User Monitoring (RUM) |
| **Synthetic Monitoring** | Simulated user journeys for uptime checks |
| **AI Monitoring** | Token usage, performance, cost for LLM apps |

---

## Integration Options

> **CRITICAL**: Do NOT run both the native New Relic agent and OpenTelemetry SDK in the same process. They use the same low-level runtime hooks and will cause unpredictable behavior.

### Project Context

This project already has a well-structured OpenTelemetry setup in [src/telemetry.ts](src/telemetry.ts):
- OTLP/HTTP trace exporter
- OTLP/HTTP log exporter (with BatchLogRecordProcessor)
- Winston instrumentation with trace context
- Controlled via `OTEL_ENABLED` env var

**Two options:**

| Approach | Description | When to Use |
|----------|-------------|-------------|
| **A: OTel → New Relic** | Point existing OTel exporters to New Relic's OTLP endpoint | ✅ **Recommended** — minimal changes, no vendor lock-in |
| **B: Native Agent** | Replace OTel with New Relic's proprietary `newrelic` agent | If you want deeper auto-instrumentation or NR-specific features |

---

## Option A: OpenTelemetry → New Relic (Recommended)

This approach reuses your existing OTel setup and simply redirects the exporters to New Relic's OTLP endpoint. Zero code changes to your instrumentation.

### 1. Create New Relic Account

1. Go to [newrelic.com/signup](https://newrelic.com/signup) — free tier, no credit card
2. Complete onboarding, select **APM** as the first capability
3. Skip the agent installation steps (we use OTel instead)
4. Copy your **Ingest License Key** from: Account Settings → API Keys → Ingest License Keys

### 2. Update Environment Variables

Add to your `.env`:

```bash
# New Relic
NEW_RELIC_LICENSE_KEY="your-license-key-here"

# OTLP Endpoint (US region)
OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp.nr-data.net"
OTEL_EXPORTER_OTLP_HEADERS="api-key=${NEW_RELIC_LICENSE_KEY}"

# If EU region, use:
# OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp.eu01.nr-data.net"
```

### 3. Update telemetry.ts

The existing telemetry setup needs the headers to include the New Relic API key. Update the trace and log exporters:

```typescript
// src/telemetry.ts

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

// New Relic OTLP endpoint
const NR_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://otlp.nr-data.net';
const NR_HEADERS = {
  'api-key': process.env.NEW_RELIC_LICENSE_KEY || '',
};

const traceExporter = new OTLPTraceExporter({
  url: `${NR_ENDPOINT}/v1/traces`,
  headers: NR_HEADERS,
});

const logExporter = new OTLPLogExporter({
  url: `${NR_ENDPOINT}/v1/logs`,
  headers: NR_HEADERS,
});
```

### 4. Service Naming

Ensure your service is named properly for New Relic:

```typescript
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'sobatbisnis-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
  }),
  traceExporter,
  logExporter,
  // ... rest of config
});
```

### 5. Verify

1. Deploy with `NEW_RELIC_LICENSE_KEY` set
2. Generate some traffic
3. Go to New Relic → APM → (your service)
4. You should see traces, logs, and error data flowing in

### OTLP Endpoints

| Region | Endpoint |
|--------|----------|
| **US** | `https://otlp.nr-data.net` |
| **EU** | `https://otlp.eu01.nr-data.net` |

Ports: 4318 (HTTP) / 4317 (gRPC)

---

## Option B: Native New Relic Agent

Use this if you want deeper auto-instrumentation or NR-specific features like Code-Level Metrics, Infinite Tracing, or Errors Inbox without OTel.

### ⚠️ Warning

If you choose Option B, you **must remove or disable** the existing OTel setup (`src/telemetry.ts`) to avoid conflicts.

### 1. Install

```bash
bun add newrelic
```

### 2. Create Config File

```bash
cp node_modules/newrelic/newrelic.js ./
```

Edit `newrelic.js`:

```javascript
'use strict';
exports.config = {
  app_name: ['sobatbisnis-api'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  logging: {
    level: 'info',
  },

  distributed_tracing: {
    enabled: true,
  },

  application_logging: {
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
    local_decorating: {
      enabled: false, // we use structured JSON logging
    },
  },

  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
    expected_classes: ['ValidationError', 'NotFoundError'],
    max_event_samples_stored: 100,
  },

  transaction_tracer: {
    enabled: true,
    explain_threshold: 500,
    record_sql: 'obfuscated',
  },

  custom_insights_events: {
    enabled: true,
    max_samples_stored: 3000,
  },

  code_level_metrics: {
    enabled: true,
  },
};
```

### 3. Load Agent First

Since this project uses Bun, you need to load the agent before the app starts. Update `package.json`:

```json
{
  "scripts": {
    "start": "node -r newrelic ./dist/index.js",
    "dev": "node -r newrelic --watch ./src/index.ts"
  }
}
```

**Note:** The `-r newrelic` flag requires Node.js. For Bun, you'd need to use Node.js in production or use the `--import` flag with ESM loader.

#### Bun Alternative

Bun has limited New Relic agent support. If you must use Bun:

```bash
# Option 1: Use Node.js for production with New Relic
NODE_OPTIONS="-r newrelic" bun run dist/index.js

# Option 2: Use --import flag (ESM)
NODE_OPTIONS="--import newrelic/esm-loader.mjs" bun run dist/index.js
```

**Recommendation:** For production with New Relic, consider running with Node.js instead of Bun, as the NR agent has deeper integration with Node's runtime.

### 4. Custom Instrumentation Examples

```typescript
import newrelic from 'newrelic';

// Track custom business events
newrelic.recordCustomEvent('EnrollmentCompleted', {
  student_id: studentId,
  program_id: programId,
  amount: totalAmount,
});

// Custom metrics
newrelic.recordMetric('Custom/Enrollment/Count', 1);

// Manual error reporting (bypasses ignore config)
try {
  await processPayment(invoice);
} catch (err) {
  newrelic.noticeError(err as Error, {
    invoice_id: invoiceId,
    student_id: studentId,
  });
  throw err;
}

// Background job tracking
newrelic.startBackgroundTransaction('NightlyReport', 'cron', async () => {
  await generateNightlyReport();
});
```

### 5. Disable in Development

```bash
# .env
NEW_RELIC_ENABLED=false
```

---

## Environment Variables

### For OTel → New Relic (Option A)

```bash
# Required
NEW_RELIC_LICENSE_KEY="your-key"

# OTLP endpoint
OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp.nr-data.net"
OTEL_EXPORTER_OTLP_HEADERS="api-key=${NEW_RELIC_LICENSE_KEY}"

# Keep existing OTEL_ENABLED toggle
OTEL_ENABLED=true
```

### For Native Agent (Option B)

```bash
# Required
NEW_RELIC_APP_NAME="sobatbisnis-api"
NEW_RELIC_LICENSE_KEY="your-key"

# Toggle
NEW_RELIC_ENABLED="true"  # set to false in dev

# Performance
NEW_RELIC_LOG_LEVEL="warn"
NEW_RELIC_DISTRIBUTED_TRACING_ENABLED="true"

# Cost control
NEW_RELIC_APPLICATION_LOGGING_FORWARDING_MAX_SAMPLES_STORED=5000
NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED=1000

# Security
NEW_RELIC_SECURITY_ENABLED="false"
```

### Config Precedence

Server-side settings > Environment variables > `newrelic.js` file > Agent defaults

---

## Key Features

### Distributed Tracing

- Enabled by default (agent v8.3.0+)
- W3C Trace Context headers
- Cross-service, cross-account tracing
- Trace waterfall visualization
- **Infinite Tracing**: configurable trace observer with sampling

### Logs in Context

- Automatically correlates log entries with traces and errors
- Log forwarding with configurable sampling
- Local log decorating adds trace context to log output

### Error Tracking (Errors Inbox)

- Unified error triage across the full stack
- Groups and prioritizes errors automatically
- Links errors to distributed traces for root cause analysis

### Custom Events & NRQL

```sql
-- Query custom events
SELECT count(*) FROM EnrollmentCompleted
WHERE region = 'us-east-1'
SINCE 1 hour ago

-- Error analysis
SELECT count(*), average(duration)
FROM Transaction
WHERE appName = 'sobatbisnis-api'
FACET name
SINCE 7 days ago
```

### Dashboards

- Drag-and-drop customization
- NRQL-powered widgets
- Pre-built templates
- Service maps and dependency visualization

### Alerts

- Dynamic thresholds (reduce noise)
- Anomaly detection
- SLA/SLO-based alerting
- Integrations: PagerDuty, Slack, email, webhook

### Code-Level Metrics

- File path, function name, line number, column for each span
- "Slow code" identification in production

---

## Pricing

### Tiers

| Tier | Full Platform Users | Best For |
|------|-------------------|----------|
| **Free** | 1 user | Evaluation, small projects |
| **Standard** | Up to 5 users | Small teams |
| **Pro** | Unlimited users | Growing teams |
| **Enterprise** | Unlimited users | Large orgs, compliance |

### Data Costs

| Tier | Original Data | Data Plus |
|------|---------------|-----------|
| **Free** | 100 GB/month free | N/A |
| **Standard** | $0.40/GB | $0.60/GB |
| **Pro** | $0.40/GB | $0.60/GB |

### Free Tier Includes

- 100 GB/month data ingest
- 1 full platform user, unlimited basic users
- 500 synthetic checks/month
- 8 days data retention
- 50+ capabilities
- No credit card required

### Cost Considerations

- No per-host charges — unlimited hosts/agents/containers
- No data egress fees
- Consumption-based: high throughput = higher data volume = higher cost
- Monitor data ingest proactively

---

## Comparison with Alternatives

| Aspect | New Relic | Datadog | Grafana (LGTM) |
|--------|-----------|---------|----------------|
| **Model** | Hosted SaaS | Hosted SaaS | Self-hosted (free) or Cloud |
| **Pricing** | Per-GB + per-user | Per-host + per-feature | Self-hosted: free |
| **Free Tier** | 100 GB/month, 1 user | 14-day trial | Unlimited (self-hosted) |
| **OTel Support** | First-class (OTLP) | First-class | Native (Tempo/Mimir) |
| **Agent Overhead** | 10-30% | Similar | Minimal (Prometheus) |
| **Query Language** | NRQL | DQL | LogQL, PromQL, TraceQL |
| **Integrations** | 780+ | 700+ | Unlimited (open-source) |
| **Vendor Lock-in** | Moderate | High | Low (open-source) |
| **Setup Complexity** | Low | Low | Medium-High |

### When to Choose New Relic

- Single platform that "just works" with minimal setup
- Generous free tier for evaluation
- Team wants APM + logs + infra without managing infrastructure
- Good for small-to-mid teams

---

## Gotchas & Considerations

### Critical

1. **Don't run NR agent + OTel together** — they hook into the same runtime mechanisms
2. **Agent loading order matters** — must be loaded before any other `require()`
3. **Bun compatibility** — NR agent has limited Bun support; use Node.js in production for full features
4. **Metric explosion** — use route patterns (`/users/:id`) not actual URLs (`/users/12345`) for transaction names

### Performance

5. **10-30% overhead** — benchmark in staging before production
6. **Harvest cycles** — periodic data transmission can cause memory spikes
7. **High-cardinality attributes** increase data volume and cost

### Cost

8. **Consumption-based pricing** — monitor data ingest proactively
9. **Data Plus** adds cost for extended retention and compliance

### Security

10. **License key** — never commit to git, use env vars or secret managers
11. **Security Agent (IAST)** — disabled by default, be intentional about enabling in production

### Transaction Naming

12. Hono auto-instrumentation may produce noisy names for dynamic routes
13. Use `newrelic.setTransactionName()` for custom naming when needed

---

## Quick Start Checklist

- [ ] Create New Relic account at [newrelic.com/signup](https://newrelic.com/signup)
- [ ] Get Ingest License Key from Account Settings → API Keys
- [ ] Choose integration approach (OTel recommended)
- [ ] Add env vars to `.env` and secret manager
- [ ] Update `src/telemetry.ts` with New Relic OTLP endpoint (if using OTel)
- [ ] Set `OTEL_ENABLED=true` in production
- [ ] Deploy and generate traffic
- [ ] Verify data in New Relic APM dashboard
- [ ] Set up alerts for critical errors and latency
- [ ] Create custom dashboards for key metrics
