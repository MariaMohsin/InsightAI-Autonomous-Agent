# InsightAI — Autonomous Content-to-Action Agent

> **Hackathon Submission** | Google ADK · Gemini 2.0 Flash · Flutter Web · Multi-Agent Pipeline

InsightAI transforms raw business reports into executable actions through a 6-step autonomous pipeline powered by three specialized AI agents coordinated by a Google ADK-style orchestrator.

---

## Demo Video

[![InsightAI Demo](https://img.youtube.com/vi/WMsndfCzB2Y/maxresdefault.jpg)](https://www.youtube.com/watch?v=WMsndfCzB2Y)

> Watch the full demo: https://www.youtube.com/watch?v=WMsndfCzB2Y

---

## Live Demo

| Platform | URL |
|----------|-----|
| Flutter Web App | `http://localhost:9090` (run locally) |
| Standalone HTML | Open `InsightAI.html` in any browser |
| Mobile (LAN) | `http://<your-ip>:8080/InsightAI.html` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ADK Orchestrator                      │
│         spawn_agent() · route_to_agent()                 │
│      synthesize_insights() · generate_action()           │
└────────────┬────────────────┬────────────────┬──────────┘
             │                │                │
     ┌───────▼──────┐ ┌───────▼──────┐ ┌──────▼────────┐
     │   Agent-1    │ │   Agent-2    │ │   Agent-3     │
     │  Ingestor    │ │  Analyzer    │ │  Action Gen   │
     │              │ │              │ │               │
     │ • Parse text │ │ • Sentiment  │ │ • Email draft │
     │ • Extract KPIs│ │ • Risk score │ │ • CRM update  │
     │ • Chunk data │ │ • Trend detect│ │ • Webhook fire│
     └──────────────┘ └──────────────┘ └───────────────┘
```

### Pipeline Steps

| Step | Name | Agent | Output |
|------|------|-------|--------|
| 1 | **Ingest** | Agent-1 | Parsed report, extracted KPIs |
| 2 | **Analyze** | Agent-2 | Sentiment, risk, opportunity scores |
| 3 | **Insights** | ADK Synthesizer | Structured JSON insight bundle |
| 4 | **Action Plan** | Agent-3 | Prioritized action list |
| 5 | **Simulate** | Agent-3 + Mock APIs | Email / CRM / Webhook dry-run |
| 6 | **Outcome** | All Agents | Before/After delta visualization |

---

## Google ADK Integration

The orchestration layer simulates the **Google Agent Development Kit (ADK)** pattern throughout the pipeline. Every agent spawn, tool call, and synthesis step emits structured `[ADK]` trace logs in the console:

```
[ADK] spawn_agent("ingestor-agent-v1", task="parse_report")
[ADK] tool_call: extract_kpis(text_chunk_0)
[ADK] route_to_agent("analyzer-agent-v1", payload=kpi_bundle)
[ADK] tool_call: sentiment_analysis(report_text)
[ADK] synthesize_insights(agents=["ingestor","analyzer"])
[ADK] generate_action(insight_bundle, target="email_campaign")
[ADK] simulate_execution(action_plan, dry_run=true)
[ADK] outcome_report(before=baseline, after=projected)
```

This pattern mirrors the ADK `AgentRunner` → `AgentTool` → `synthesize()` flow, demonstrating how a production ADK deployment would orchestrate these agents.

---

## Features

### Core Pipeline
- **Content Ingestion** — paste any business report, financial summary, or sales data
- **AI Analysis** — Gemini 2.0 Flash or Groq Llama-3.3-70B extracts structured insights
- **Offline Fallback** — regex-based Mock Engine works with zero API key (extracts real numbers from text)
- **Action Generation** — AI produces prioritized, context-aware action plans
- **3 Simulation Types:**
  - **Email Campaign** — generates 67 personalized emails with subject lines and body previews
  - **CRM Pipeline** — updates 5 Salesforce-style records with deal scores and next steps
  - **Webhook/API** — fires a Zapier-style POST with full payload preview
- **Before/After Outcomes** — visual delta cards showing projected improvement in revenue, leads, conversion, and customer satisfaction

### Agent Trace Log
Full table showing every agent call with timestamp, agent ID, tool used, and result — judges can verify the multi-agent workflow at a glance.

### Dual API Support
- **Gemini 2.0 Flash** — Google's latest multimodal model via `generativelanguage.googleapis.com`
- **Groq · Llama-3.3-70B** — ultra-fast inference via `api.groq.com/openai/v1`
- Switch providers from the UI dropdown; API key field updates hint text automatically

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile / Web UI | Flutter 3.41.9 (Web + Chrome) |
| Standalone Web | Vanilla HTML/CSS/JS (single file) |
| AI Provider A | Google Gemini 2.0 Flash API |
| AI Provider B | Groq · Llama-3.3-70B Versatile |
| Offline Engine | Dart/JS RegExp mock analyzer |
| Agent Framework | Google ADK (simulated orchestration) |
| Fonts | Syne + DM Mono (Google Fonts) |
| HTTP Client | Dart `http` package · Browser `fetch` |

---

## Setup & Run

### Option 1 — Standalone HTML (fastest)
```bash
# Just open the file — no server needed
start InsightAI.html
```

### Option 2 — Flutter Web
```bash
# Prerequisites: Flutter 3.x installed
cd InsightAI-Flutter
flutter pub get
flutter run -d chrome --web-port 9090
```

### Option 3 — Mobile via LAN
```bash
# Start Python server in the project root
python -m http.server 8080
# Open on phone: http://<your-pc-ip>:8080/InsightAI.html
```

---

## API Configuration

### Gemini (Google AI Studio)
1. Get key at [aistudio.google.com](https://aistudio.google.com)
2. Select **Gemini** from the provider dropdown
3. Paste key into the API Key field (or use the pre-filled demo key)
4. Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

### Groq
1. Get key at [console.groq.com](https://console.groq.com)
2. Select **Groq** from the provider dropdown
3. Paste key into the API Key field
4. Endpoint: `https://api.groq.com/openai/v1/chat/completions`
5. Model: `llama-3.3-70b-versatile` with `response_format: {type: "json_object"}`

### No API Key (Offline Mode)
Leave the API key field empty. The **Mock Engine** activates automatically — it uses RegExp to extract real numeric values from your pasted report and generates data-driven (not generic) analysis. All pipeline steps, simulations, and outcomes still work fully.

---

## Sample Data

The app ships with a Pakistani business sample report pre-loaded:

> *"Q3 2024 Sales Report — TechVentures Pakistan Pvt. Ltd. Total revenue: PKR 47.3M (↑18% YoY). New leads: 234. Conversion rate: 12.4%. Top product: CloudSync Pro (PKR 18.7M revenue). Customer satisfaction: 87%. Pipeline value: PKR 89M. At-risk accounts: 3 (value PKR 4.2M)."*

This lets judges run the full pipeline immediately without preparing their own data.

---

## Project Structure

```
Autonomous Content-to-Action Agen/
├── InsightAI.html                  # Standalone single-file web app
├── README.md                       # This file
└── InsightAI-Flutter/
    ├── lib/
    │   └── main.dart               # Complete Flutter app (~950 lines)
    ├── web/
    │   ├── index.html              # Flutter Web entry (PWA-ready)
    │   └── manifest.json           # PWA manifest
    └── pubspec.yaml                # Dependencies: http, google_fonts
```

---

## Agents Deep Dive

### Agent-1 · Ingestor
- Receives raw text input
- Chunks content for parallel processing
- Extracts KPIs: revenue, leads, conversion rate, satisfaction score, pipeline value
- ADK tool calls: `extract_kpis()`, `chunk_document()`, `validate_schema()`

### Agent-2 · Analyzer
- Receives KPI bundle from Agent-1
- Computes sentiment score (0–100), risk score, opportunity index
- Identifies top 3 risks and top 3 opportunities
- ADK tool calls: `sentiment_analysis()`, `risk_assessment()`, `trend_detection()`

### Agent-3 · Action Generator
- Receives synthesized insight bundle from ADK orchestrator
- Generates prioritized action plan (immediate / short-term / strategic)
- Executes simulation against target system (Email / CRM / Webhook)
- ADK tool calls: `generate_action()`, `simulate_execution()`, `outcome_report()`

---

## Evaluation Criteria Coverage

| Criterion | Weight | Implementation |
|-----------|--------|----------------|
| Multi-agent pipeline | Core | 3 agents + ADK orchestrator, full trace log |
| Google ADK integration | 25% | ADK spawn/route/synthesize pattern, console logs |
| Action simulation | Critical | Email, CRM, Webhook with live output |
| Before/After outcomes | Required | 4-metric delta visualization |
| Mobile app | Required | Flutter Web running in Chrome, PWA-ready |
| Real AI provider | Required | Gemini 2.0 Flash + Groq Llama-3.3-70B |
| Offline fallback | Bonus | Mock Engine with real number extraction |

---

## Assumptions & Limitations

1. **ADK is simulated** — Google ADK orchestration is implemented as a pattern (spawn/route/synthesize log calls) rather than using the actual `google-adk` Python package, since the hackathon targets a web/Flutter stack without a Python backend.

2. **No backend server** — all AI calls are made directly from the browser/Flutter app via CORS-enabled public APIs (Gemini and Groq both support browser-side calls).

3. **Simulations are dry-run** — Email, CRM, and Webhook executions are realistic mocks; no actual emails are sent and no real Salesforce/Zapier accounts are touched.

4. **Flutter Web only** — native Android APK requires Android Studio and an Android SDK, which were not part of the submission environment. The Flutter Web build is fully functional on Chrome and mobile browsers.

---

## Team

| Name | Role |
|------|------|
| [**Maria Mohsin**](https://github.com/MariaMohsin) | Full-stack development, AI pipeline design, Flutter implementation |
| **Aiman** | Project collaboration & testing |

---

*Built for the Autonomous Content-to-Action Agent Hackathon · 2024*
