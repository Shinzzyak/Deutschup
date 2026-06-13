# AI-001: Provider Rotation Architecture

**Status:** REVISED
**Date:** 2026-06-11
**Author:** Exilio 🧠
**Reason:** Budget constraints - Gemini-only now, phased rollout

---

## Executive Summary

Multi-provider AI routing system with automatic failover, health monitoring, and cost tracking. Architecture revised to support phased provider onboarding (Gemini only → +Mimo → +DeepSeek).

---

## A. Updated Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASED PROVIDER ONBOARDING                               │
│                                                                             │
│  Phase 1: Gemini Only ──────────────────────────────────────────────────   │
│  Phase 2: Gemini + Mimo ───────────────────────────────────────────────   │
│  Phase 3: Gemini + Mimo + DeepSeek ────────────────────────────────────   │
│  Phase 4: Full Auto-Routing ───────────────────────────────────────────   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER REQUEST FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

User Request
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI ROUTER SERVICE                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Provider Selection Engine                        │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │   Manual     │ │   Health    │ │   Latency   │ │   Circuit   │  │   │
│  │  │   Override   │ │   Checker   │ │   Tracker   │ │   Breaker   │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                       │
│                    ▼               ▼               ▼                       │
│            ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│            │  Primary    │ │ Secondary   │ │  Emergency  │                │
│            │  (Phase 1)  │ │ (Phase 2)   │ │ (Phase 3)   │                │
│            │  Gemini     │ │  Mimo       │ │ DeepSeek    │                │
│            │  ⭐ ACTIVE  │ │  🔒 PENDING │ │ 🔒 PENDING  │                │
│            └─────────────┘ └─────────────┘ └─────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────┐
        │  LIVE RESPONSE    │           │  SHADOW TESTING   │
        │  (to user)        │           │  (background)     │
        └───────────────────┘           └───────────────────┘
                    │                               │
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────┐
        │  Log to ai_requests│          │  Compare metrics  │
        └───────────────────┘           │  Store results    │
                                        └───────────────────┘
```

---

## B. Database Schema

### Table: `ai_providers`

```sql
CREATE TABLE IF NOT EXISTS ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    api_endpoint TEXT NOT NULL,
    api_key_env TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_shadow_enabled BOOLEAN DEFAULT false,

    -- Rate Limits
    requests_per_minute INTEGER DEFAULT 60,
    requests_per_day INTEGER DEFAULT 1000,
    tokens_per_minute INTEGER DEFAULT 100000,

    -- Cost (per 1M tokens)
    input_cost_per_million NUMERIC(10,4) DEFAULT 0,
    output_cost_per_million NUMERIC(10,4) DEFAULT 0,

    -- Timeouts
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 2,

    -- Circuit Breaker
    circuit_breaker_threshold INTEGER DEFAULT 5,
    circuit_breaker_timeout INTEGER DEFAULT 60,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `ai_requests`

```sql
CREATE TABLE IF NOT EXISTS ai_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT,

    -- Provider Info
    provider_id UUID REFERENCES ai_providers(id),
    provider_name TEXT NOT NULL,
    model_name TEXT,

    -- Request
    request_type TEXT NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,

    -- Response
    response_status TEXT NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,

    -- Fallback Tracking
    is_fallback BOOLEAN DEFAULT false,
    fallback_from_provider TEXT,
    fallback_reason TEXT,

    -- Cost
    estimated_cost NUMERIC(10,6),
    actual_cost NUMERIC(10,6),
    cost_reconciled BOOLEAN DEFAULT false,

    -- Shadow Testing
    is_shadow BOOLEAN DEFAULT false,
    shadow_provider TEXT,
    shadow_latency_ms INTEGER,
    shadow_status TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_ai_requests_user (user_id),
    INDEX idx_ai_requests_provider (provider_id),
    INDEX idx_ai_requests_created (created_at),
    INDEX idx_ai_requests_status (response_status)
);
```

### Table: `ai_routing_decisions` (NEW)

```sql
CREATE TABLE IF NOT EXISTS ai_routing_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES ai_requests(id) ON DELETE CASCADE,

    selected_provider TEXT NOT NULL,
    provider_priority INTEGER,
    routing_reason TEXT NOT NULL,

    -- Scores
    health_score NUMERIC(5,2),
    latency_score NUMERIC(5,2),
    cost_score NUMERIC(5,2),
    final_score NUMERIC(5,2),

    -- Fallback
    fallback_count INTEGER DEFAULT 0,
    fallback_chain TEXT[],

    -- Decision
    final_decision TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    INDEX idx_routing_request (request_id),
    INDEX idx_routing_provider (selected_provider),
    INDEX idx_routing_time (created_at)
);
```

### Table: `ai_cost_reconciliation` (NEW)

```sql
CREATE TABLE IF NOT EXISTS ai_cost_reconciliation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL,
    reconciliation_date DATE NOT NULL,

    estimated_total_cost NUMERIC(10,4),
    estimated_request_count INTEGER,

    actual_total_cost NUMERIC(10,4),
    actual_request_count INTEGER,

    cost_variance NUMERIC(10,4),
    cost_variance_pct NUMERIC(5,2),

    reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMPTZ,
    notes TEXT,

    UNIQUE(provider_name, reconciliation_date)
);
```

---

## C. API Specification

### Provider Selection Algorithm

```
1. Check manual override (if set, use forced provider)
2. Get all active providers ordered by priority
3. Filter by circuit breaker status (exclude circuit_open)
4. Filter by rate limits (exclude rate_exceeded)
5. Filter by shadow status (exclude shadow-only from live traffic)
6. Sort by: success_rate DESC, avg_latency ASC, cost ASC
7. Select top provider
8. On failure → retry with next provider
9. On all fail → return error to user
10. Log routing decision to ai_routing_decisions
```

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/ai-health` | GET | Provider health status |
| `/api/admin/ai-metrics` | GET | Provider metrics |
| `/api/admin/ai-latency` | GET | Latency data |
| `/api/admin/ai-costs` | GET | Cost tracking |
| `/api/admin/ai-provider` | POST | Manual provider control |
| `/api/admin/ai-provider/force` | POST | Force specific provider |
| `/api/admin/ai-provider/maintenance` | POST | Maintenance mode |
| `/api/admin/ai-routing` | GET | Routing decision audit |
| `/api/admin/ai-reconciliation` | GET | Cost reconciliation |

---

## D. Admin Dashboard Specification

### Dashboard Sections

| Section | Description |
|---------|-------------|
| Provider Status Cards | Health, latency, success rate, cost per provider with manual controls |
| Shadow Testing Comparison | Side-by-side metrics for live vs shadow provider |
| Cost Reconciliation | Estimated vs actual costs with variance |
| Routing Audit Trail | Recent routing decisions with scores |
| Latency Chart | p50/p95 latency over time |
| Volume Chart | Request volume by provider |

### Manual Controls

| Control | Description |
|---------|-------------|
| Enable/Disable | Toggle provider without deployment |
| Set Priority | Change provider priority order |
| Force Primary | Force specific provider as primary |
| Maintenance Mode | Temporarily disable for API key rotation |
| Shadow Testing | Enable/disable background comparison |

---

## E. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Gemini down | **Critical** | Low | Single provider = no fallback. Add Mimo ASAP. |
| Rate limit hit | Medium | Medium | Rate tracking, daily caps |
| API key compromise | **Critical** | Low | Environment variables, rotation |
| Cost overrun | Medium | Medium | Budget caps, alerts, reconciliation |
| Latency degradation | Medium | Medium | Auto-fallback, latency monitoring |
| Shadow testing skew | Low | Medium | Run shadow for 7+ days, manual review |
| Reconciliation variance | Low | Low | Monthly reconciliation, variance alerts |

---

## F. Implementation Phases

### Phase 1: Gemini-Only (Week 1-2)

**Priority:** ⭐ IMMEDIATE
**Provider:** Gemini 3.1 Flash Lite

**Tasks:**
- [ ] Create `ai_providers` table with Gemini
- [ ] Create `ai_requests` table
- [ ] Create `ai_routing_decisions` table
- [ ] Implement basic routing service (single provider)
- [ ] Add request logging
- [ ] Add health check endpoint
- [ ] Basic admin dashboard

**Deliverable:** Gemini-only routing with request logging

---

### Phase 2: Shadow Testing (Week 3-4)

**Priority:** HIGH
**Provider:** Gemini (live) + Mimo (shadow)

**Tasks:**
- [ ] Add `is_shadow_enabled` to `ai_providers`
- [ ] Implement shadow testing mode
- [ ] Add `ai_cost_reconciliation` table
- [ ] Shadow testing dashboard
- [ ] Cost reconciliation endpoint
- [ ] Compare latency, success rate, cost

**Deliverable:** Shadow testing framework

---

### Phase 3: Multi-Provider (Week 5-6)

**Priority:** MEDIUM
**Provider:** Gemini + Mimo + DeepSeek

**Tasks:**
- [ ] Enable Mimo as secondary
- [ ] Enable DeepSeek as emergency
- [ ] Implement automatic failover
- [ ] Circuit breaker logic
- [ ] Full routing audit trail
- [ ] Provider health monitoring

**Deliverable:** Full multi-provider routing

---

### Phase 4: Auto-Routing (Week 7-8)

**Priority:** LOW
**Features:** Full automation

**Tasks:**
- [ ] Auto-failover on provider failure
- [ ] Auto-recovery when provider recovers
- [ ] Cost optimization engine
- [ ] Latency-based routing
- [ ] Full dashboard with all metrics

**Deliverable:** Fully automated routing system

---

## H. Implementation Phases (Final)

### Phase 1: Foundation (Week 1-2)

**Priority:** ⭐ IMMEDIATE
**Provider:** Gemini 3.1 Flash Lite

**Tasks:**
- [ ] Create `ai_providers` table
- [ ] Create `ai_provider_config` table
- [ ] Create `ai_requests` table with sampling
- [ ] Create `ai_routing_decisions` table
- [ ] Implement provider abstraction layer
- [ ] Implement basic routing service (single provider)
- [ ] Add request logging with sampling
- [ ] Add health check endpoint
- [ ] Basic admin dashboard
- [ ] Provider configuration persistence

**Deliverable:** Gemini-only routing with config persistence and sampling

---

### Phase 2: Observability (Week 3-4)

**Priority:** HIGH
**Focus:** Monitoring foundation

**Tasks:**
- [ ] Implement metrics aggregation (hourly/daily)
- [ ] Add latency tracking (p50, p95, p99)
- [ ] Add cost tracking (estimated + actual)
- [ ] Add routing audit trail
- [ ] Provider health monitoring
- [ ] Provider dashboard with metrics
- [ ] Cost analytics dashboard
- [ ] Routing decision history

**Deliverable:** Full observability stack

---

### Phase 3: Shadow Testing (Week 5-6)

**Priority:** MEDIUM
**Focus:** Secondary provider evaluation

**Tasks:**
- [ ] Implement shadow testing mode
- [ ] Add secondary provider support
- [ ] Response comparison metrics
- [ ] Quality benchmarking framework
- [ ] Shadow testing dashboard
- [ ] Cost reconciliation
- [ ] Provider capability detection

**Deliverable:** Shadow testing framework

---

### Phase 4: Multi-Provider (Week 7-8)

**Priority:** MEDIUM
**Focus:** Controlled failover

**Tasks:**
- [ ] Enable Mimo as secondary
- [ ] Enable DeepSeek as emergency
- [ ] Implement automatic failover
- [ ] Circuit breaker logic
- [ ] Capability-aware routing
- [ ] Full routing audit trail
- [ ] Provider health monitoring

**Deliverable:** Multi-provider with failover

---

### Phase 5: Automatic Routing (Week 9-10)

**Priority:** LOW
**Focus:** Full automation

**Tasks:**
- [ ] Health-based routing
- [ ] Latency-based routing
- [ ] Cost-aware routing
- [ ] Full circuit breaker automation
- [ ] Auto-recovery when provider recovers
- [ ] Cost optimization engine
- [ ] Full dashboard with all metrics

**Deliverable:** Fully automated routing system

---

## I. Production AI Operations Guidelines

### 1. Monitoring Checklist

| Metric | Frequency | Alert Threshold |
|--------|-----------|------------------|
| Provider health | Every 5 min | Status ≠ healthy |
| Latency p95 | Every hour | > 5000ms |
| Error rate | Every hour | > 5% |
| Cost variance | Daily | > 20% |
| Circuit breaker | Real-time | Open state |

### 2. Cost Management

| Action | Threshold |
|--------|-----------|
| Daily budget cap | $50 |
| Monthly budget cap | $500 |
| Cost alert | 80% of budget |
| Cost variance alert | > 20% |

### 3. Provider Management

| Action | Frequency |
|--------|-----------|
| Health check | Every 5 min |
| Metrics aggregation | Hourly |
| Cost reconciliation | Daily |
| Shadow testing evaluation | Weekly |
| Provider capability review | Monthly |

### 4. Incident Response

| Severity | Response Time | Action |
|----------|---------------|--------|
| Critical | 5 min | Provider down, auto-failover |
| High | 15 min | Latency spike, investigate |
| Medium | 1 hour | Cost variance, review |
| Low | 24 hours | Optimization opportunities |

---

## J. Future Work

1. **AI Response Quality Scoring** — automated quality comparison
2. **Token Usage Optimization** — prompt compression, caching
3. **Multi-Model Routing** — different models for different task types
4. **Cost Optimization Engine** — auto-select cheapest provider for task
5. **Provider SLA Tracking** — compare against provider guarantees
6. **A/B Testing Framework** — test routing strategies
7. **Predictive Scaling** — anticipate demand spikes

---

*Document generated by Exilio 🧠 — 2026-06-11*
*Do not begin implementation until Phase 1 is approved.*
