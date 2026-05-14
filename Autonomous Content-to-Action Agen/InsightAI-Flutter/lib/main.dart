import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;

void main() => runApp(const InsightAIApp());

// ─────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────
const Color kBg      = Color(0xFF0a0a0f);
const Color kBg2     = Color(0xFF0f0f1a);
const Color kBg3     = Color(0xFF13131f);
const Color kSurface = Color(0xFF16162a);
const Color kBorder  = Color(0xFF2a2a4a);
const Color kBorder2 = Color(0xFF3a3a5c);
const Color kAccent  = Color(0xFF6c63ff);
const Color kAccent2 = Color(0xFF8b5cf6);
const Color kAccent3 = Color(0xFFa78bfa);
const Color kCyan    = Color(0xFF22d3ee);
const Color kGreen   = Color(0xFF10b981);
const Color kYellow  = Color(0xFFf59e0b);
const Color kRed     = Color(0xFFef4444);
const Color kText    = Color(0xFFe2e8f0);
const Color kText2   = Color(0xFF94a3b8);
const Color kText3   = Color(0xFF64748b);

// ─────────────────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────────────────
class LogEntry {
  final String ts, agent, agentClass, message, msgClass;
  LogEntry(this.ts, this.agent, this.agentClass, this.message, this.msgClass);
}

class Metric { final String m, b, a; const Metric(this.m, this.b, this.a); }
class CrmRow  { final String name, before, after, val; const CrmRow(this.name, this.before, this.after, this.val); }

class AnalysisResult {
  final String insight, impact, action, emailSubject, emailBody;
  final String company, dormant, dormantVal;
  final List<Metric> metrics;
  final List<CrmRow> crm;
  const AnalysisResult({
    required this.insight, required this.impact, required this.action,
    required this.emailSubject, required this.emailBody,
    required this.company, required this.dormant, required this.dormantVal,
    required this.metrics, required this.crm,
  });
}

// ─────────────────────────────────────────────────────────
// MOCK ANALYSIS ENGINE
// ─────────────────────────────────────────────────────────
class MockEngine {
  static String _p(String text, List<RegExp> pats, String fb) {
    for (final p in pats) {
      final m = p.firstMatch(text);
      if (m != null) return m.groupCount > 0 ? (m.group(1) ?? fb) : (m.group(0) ?? fb);
    }
    return fb;
  }

  static AnalysisResult analyze(String text) {
    final revenue    = _p(text, [RegExp(r'PKR\s*([\d.]+)\s*[Mm]', caseSensitive: false)], '47.3');
    final decline    = _p(text, [RegExp(r'(\d+)%\s*decline', caseSensitive: false)], '12');
    final dormant    = _p(text, [RegExp(r'(\d+)\s*dormant', caseSensitive: false)], '67');
    final dormantVal = _p(text, [RegExp(r'PKR\s*([\d.]+)\s*[Mm].*?reactivat', caseSensitive: false)], '31');
    final sqlRate    = _p(text, [RegExp(r'([\d.]+)%\s*conv', caseSensitive: false)], '8.3');
    final upsellBef  = _p(text, [RegExp(r'(\d+)%.*?→.*?upsell', caseSensitive: false)], '34');
    final upsellAft  = _p(text, [RegExp(r'upsell.*?(\d+)%', caseSensitive: false)], '19');
    final dealCycle  = _p(text, [RegExp(r'\d+\s*days?\s*→\s*(\d+)\s*days?')], '67');
    final quota      = _p(text, [RegExp(r'(\d+)%\s*average.*?quota', caseSensitive: false)], '61');
    final company    = _p(text, [RegExp(r'Company[:\s]+([^\n,]+)', caseSensitive: false)], 'NovaTech Solutions');

    final revNum    = double.tryParse(revenue) ?? 47.3;
    final projRev   = (revNum * 1.21).toStringAsFixed(1);
    final sqlProj   = ((double.tryParse(sqlRate) ?? 8.3) * 1.7).toStringAsFixed(1);
    final upsellP   = ((int.tryParse(upsellAft) ?? 19) + 10).clamp(0, 35);
    final quotaP    = ((int.tryParse(quota) ?? 61) + 17).clamp(0, 85);
    final dealP     = ((int.tryParse(dealCycle) ?? 67) - 18).clamp(30, 99);
    final compClean = company.replaceAll(RegExp(r'\(Pvt\).*$', caseSensitive: false), '').trim();
    final hasCyber  = text.toLowerCase().contains('cybersecur');

    return AnalysisResult(
      company: compClean, dormant: dormant, dormantVal: dormantVal,
      insight: '$compClean is experiencing a PKR ${revNum}M quarterly revenue with a $decline% QoQ decline driven by ${hasCyber ? "Cloud ERP churn and competitor pricing pressure" : "product segment weakness"}. The deal cycle has expanded to $dealCycle days, and $dormant dormant accounts worth ~PKR ${dormantVal}M sit completely unengaged — a critical missed opportunity.',
      impact: 'The collapse in upsell rate from $upsellBef% to $upsellAft% combined with an MQL→SQL conversion of just $sqlRate% signals a broken mid-funnel. Reactivating $dormant dormant accounts alone could recover PKR ${dormantVal}M+ in 90 days, more than reversing Q1 losses at current trajectory.',
      action: 'Priority 1: Launch a personalized re-engagement campaign for all $dormant dormant accounts emphasizing ${hasCyber ? "SECP compliance and cybersecurity upsell" : "product value and loyalty incentives"}. Priority 2: Deploy a procurement liaison to cut deal cycle from $dealCycle to ~$dealP days. Target: quota attainment from $quota% → $quotaP% within 60 days.',
      emailSubject: '[Priority] Re-engagement Offer for $compClean Clients — Q2 2025',
      emailBody: 'Dear Valued Partner,\n\nWe hope this message finds you well. As a former client of $compClean, we\'re reaching out with a time-sensitive opportunity designed for your organization.\n\nOur team has identified significant ROI potential — particularly around ${hasCyber ? "new SECP cybersecurity compliance requirements" : "cloud-based operational efficiency"}.\n\nAs a returning partner, you receive:\n  • 20% loyalty discount on all Q2 packages\n  • Dedicated senior account manager on Day 1\n  • Free technical audit (worth PKR 180,000)\n  • Live within 2 weeks — priority onboarding\n\nBook a 30-minute call this week — only 12 slots remain.\n\nWarm regards,\nSales Operations Team\n$compClean',
      metrics: [
        Metric('Quarterly Revenue', 'PKR ${revNum}M', 'PKR $projRev (+${((double.parse(projRev) - revNum) / revNum * 100).round()}%)'),
        Metric('Upsell Rate', '$upsellAft%', '$upsellP%'),
        Metric('MQL → SQL Rate', '$sqlRate%', '$sqlProj%'),
        Metric('Avg Deal Cycle', '$dealCycle days', '$dealP days'),
        Metric('Quota Attainment', '$quota%', '$quotaP%'),
        Metric('Dormant Accounts', '$dormant unengaged', '${((int.tryParse(dormant) ?? 67) * 0.4).round()} reactivated'),
      ],
      crm: const [
        CrmRow('Pak Textile Co · Lahore',    'Cold',  'Re-engaged', 'PKR 1.4M'),
        CrmRow('Sunrise Foods · Karachi',    'Cold',  'Re-engaged', 'PKR 890K'),
        CrmRow('Ali Brothers Trading',       'Cold',  'Warm',       'PKR 1.1M'),
        CrmRow('Galaxy Pharma · Islamabad',  'Churn', 'Re-engaged', 'PKR 2.2M'),
        CrmRow('Metro Builders Ltd',         'Cold',  'Warm',       'PKR 760K'),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────
// AI API SERVICE  (Gemini + Groq)
// ─────────────────────────────────────────────────────────
const List<CrmRow> kCrmSample = [
  CrmRow('Pak Textile Co · Lahore',    'Cold',  'Re-engaged', 'PKR 1.4M'),
  CrmRow('Sunrise Foods · Karachi',    'Cold',  'Re-engaged', 'PKR 890K'),
  CrmRow('Ali Brothers Trading',       'Cold',  'Warm',       'PKR 1.1M'),
  CrmRow('Galaxy Pharma · Islamabad',  'Churn', 'Re-engaged', 'PKR 2.2M'),
  CrmRow('Metro Builders Ltd',         'Cold',  'Warm',       'PKR 760K'),
];

const String _kPrompt = '''You are a business intelligence AI. Analyze this sales report and return ONLY valid JSON — no markdown.

Return exactly this structure:
{
  "insight": "2-3 sentence key finding with specific numbers",
  "impact":  "2-3 sentence business impact with numbers",
  "action":  "2-3 sentence prioritized recommendations",
  "emailSubject": "compelling re-engagement subject line",
  "emailBody": "150-200 word professional re-engagement email with clear CTA",
  "dormant": "67", "dormantVal": "31", "company": "Company Name",
  "metrics": [
    {"m": "Quarterly Revenue",  "b": "PKR 47.3M", "a": "PKR 57.2M (+21%)"},
    {"m": "Upsell Rate",        "b": "19%",        "a": "29%"},
    {"m": "MQL → SQL Rate",     "b": "8.3%",       "a": "14.1%"},
    {"m": "Avg Deal Cycle",     "b": "67 days",    "a": "49 days"},
    {"m": "Quota Attainment",   "b": "61%",        "a": "78%"},
    {"m": "Dormant Accounts",   "b": "67 unengaged","a": "27 reactivated"}
  ]
}

REPORT:\n''';

class AIService {
  static AnalysisResult _parse(String raw) {
    var text = raw.replaceAll(RegExp(r'^```json\s*', caseSensitive: false), '');
    text = text.replaceAll(RegExp(r'^```'), '').replaceAll(RegExp(r'```\s*$'), '').trim();
    final j = jsonDecode(text) as Map<String, dynamic>;
    final m = (j['metrics'] as List? ?? []);
    return AnalysisResult(
      insight: j['insight'] ?? '', impact: j['impact'] ?? '', action: j['action'] ?? '',
      emailSubject: j['emailSubject'] ?? '', emailBody: j['emailBody'] ?? '',
      company: j['company'] ?? 'Company',
      dormant: j['dormant']?.toString() ?? '67',
      dormantVal: j['dormantVal']?.toString() ?? '31',
      metrics: m.map((x) => Metric(x['m']??'', x['b']??'', x['a']??'')).toList(),
      crm: kCrmSample,
    );
  }

  static Future<AnalysisResult> analyzeGemini(String report, String apiKey) async {
    final url = Uri.parse('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey');
    final res = await http.post(url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'contents': [{'parts': [{'text': '$_kPrompt$report'}]}],
        'generationConfig': {'temperature': 0.3, 'maxOutputTokens': 1200},
      }),
    );
    if (res.statusCode != 200) throw Exception('Gemini error ${res.statusCode}');
    final data = jsonDecode(res.body);
    return _parse(data['candidates'][0]['content']['parts'][0]['text'] as String);
  }

  static Future<AnalysisResult> analyzeGroq(String report, String apiKey) async {
    final url = Uri.parse('https://api.groq.com/openai/v1/chat/completions');
    final res = await http.post(url,
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $apiKey'},
      body: jsonEncode({
        'model': 'llama-3.3-70b-versatile',
        'messages': [{'role': 'user', 'content': '$_kPrompt$report'}],
        'temperature': 0.3,
        'max_tokens': 1200,
        'response_format': {'type': 'json_object'},
      }),
    );
    if (res.statusCode != 200) throw Exception('Groq error ${res.statusCode}');
    final data = jsonDecode(res.body);
    return _parse(data['choices'][0]['message']['content'] as String);
  }
}

// ─────────────────────────────────────────────────────────
// SAMPLE REPORT
// ─────────────────────────────────────────────────────────
const String kSample = '''QUARTERLY SALES PERFORMANCE REPORT
Company: NovaTech Solutions (Pvt) Ltd, Karachi
Period: Q1 2025 (January – March)

EXECUTIVE SUMMARY
NovaTech Solutions recorded total revenues of PKR 47.3 million for Q1 2025,
representing a 12% decline vs Q4 2024 (PKR 53.7M). Second consecutive quarter
of declining revenue.

PRODUCT PERFORMANCE
Cloud ERP Suite:       PKR 18.2M  — DOWN 18% QoQ (SME churn)
Cybersecurity Module:  PKR 14.7M  — UP 9% QoQ (SECP compliance)
HR & Payroll SaaS:     PKR  8.4M  — DOWN 5% QoQ

KEY CONCERNS
1. Lost 3 enterprise ERP accounts worth PKR 5.2M total
2. Average deal cycle: 42 days → 67 days (+59.5%)
3. Upsell rate dropped: 34% → 19%
4. MQL→SQL conversion: only 8.3% of 1,240 MQLs

OPPORTUNITIES
- Cybersecurity growing 40% YoY (SECP compliance)
- 67 dormant accounts worth ~PKR 31M if reactivated
- 14 clients requested WhatsApp API integration

SALES TEAM METRICS
Active reps: 14  |  Quota attainment: 61% average
Top performer: Raza Khan — 142% (Karachi)''';

// ─────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────
class InsightAIApp extends StatelessWidget {
  const InsightAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'InsightAI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: kBg,
        colorScheme: const ColorScheme.dark(surface: kSurface, primary: kAccent),
      ),
      home: const HomeScreen(),
    );
  }
}

// ─────────────────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────────────────
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  // Controllers
  final TextEditingController _reportCtrl = TextEditingController();
  final TextEditingController _keyCtrl    = TextEditingController(text: 'AIzaSyD6hgUIoWl0A_oUdinsBbt9LhDRTZoztk4');
  String _provider = 'gemini'; // 'gemini' or 'groq'
  final ScrollController _scrollCtrl  = ScrollController();
  final ScrollController _consoleCtrl = ScrollController();

  // State
  int  _step     = 1;
  bool _running  = false;
  bool _results  = false;
  int  _simTabIdx = 0; // 0=email, 1=crm, 2=webhook
  bool _execEmail   = false;
  bool _execCRM     = false;
  bool _execWebhook = false;
  AnalysisResult? _r;

  final List<LogEntry> _logs = [];
  double _prog = 0.0;

  late final AnimationController _dotCtrl = AnimationController(
    vsync: this, duration: const Duration(seconds: 2),
  )..repeat(reverse: true);

  final Random _rand = Random();

  @override
  void dispose() {
    _reportCtrl.dispose(); _keyCtrl.dispose();
    _scrollCtrl.dispose(); _consoleCtrl.dispose();
    _dotCtrl.dispose();
    super.dispose();
  }

  // ── Helpers ──
  String get _ts {
    final d = DateTime.now();
    return '${d.hour.toString().padLeft(2,'0')}:${d.minute.toString().padLeft(2,'0')}:${d.second.toString().padLeft(2,'0')}';
  }

  void _log(String agent, String aClass, String msg, String mClass) {
    setState(() => _logs.add(LogEntry(_ts, agent, aClass, msg, mClass)));
    Future.delayed(const Duration(milliseconds: 60), () {
      if (_consoleCtrl.hasClients) {
        _consoleCtrl.animateTo(_consoleCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
      }
    });
  }

  void _setStep(int n) => setState(() {
    _step = n;
    _prog = (n - 1) / 5;
  });

  Future<void> _delay(int ms) => Future.delayed(Duration(milliseconds: ms));

  // ── Pipeline ──
  Future<void> _run() async {
    final report = _reportCtrl.text.trim();
    if (report.isEmpty) {
      _log('SYS','sys','No report content. Tap "Load Sample" or paste a report.','error');
      return;
    }
    setState(() { _running = true; _results = false; _logs.clear(); _execEmail = false; _execCRM = false; _execWebhook = false; });
    final apiKey = _keyCtrl.text.trim();
    final useGemini = apiKey.isNotEmpty;

    // Step 1: Ingest
    _setStep(1);
    _log('ADK','adk','ADK Orchestrator: session ${DateTime.now().millisecondsSinceEpoch.toRadixString(16).toUpperCase()} — pipeline start','info');
    await _delay(260);
    _log('ADK','adk','Workplan: 6-step Content-to-Action · ${useGemini?"Gemini 2.0 Flash":"Mock Engine"}','');
    await _delay(280);
    _log('ADK','adk','Tool: spawn_agent(role="ingestion")','');
    await _delay(300);
    _log('Agent-1','a1','Ingestion agent online — parsing document','info');
    await _delay(350);
    _log('Agent-1','a1','${report.length} chars · ${report.split('\n').length} lines · ${report.split(RegExp(r'\s+')).length} tokens','');
    await _delay(380);
    _log('Agent-1','a1','Tokenizing: Summary · Regional · Products · KPIs · Opportunities','');
    await _delay(300);
    _log('Agent-1','a1','Ingestion complete → payload forwarded to ADK router','success');
    await _delay(260);

    // Step 2: Analyze
    _setStep(2);
    _log('ADK','adk','Tool: route_to_agent(role="analyst", payload=structured_fields)','');
    await _delay(300);
    _log('Agent-2','a2','Analyst handoff — beginning KPI extraction','info');
    await _delay(360);
    _log('Agent-2','a2','Running pattern matching over numeric fields...','');
    await _delay(380);
    final dm = RegExp(r'(\d+)%\s*decline', caseSensitive: false).firstMatch(report);
    if (dm != null) _log('Agent-2','a2','Revenue decline: ${dm.group(1)}% QoQ — CRITICAL flag raised','warn');
    await _delay(280);
    final dom = RegExp(r'(\d+)\s*dormant', caseSensitive: false).firstMatch(report);
    if (dom != null) _log('Agent-2','a2','Dormant cluster: ${dom.group(1)} accounts — high reactivation value','warn');
    await _delay(300);
    _log('Agent-2','a2','Deal cycle anomaly: +59.5% increase → procurement bottleneck','warn');
    await _delay(360);
    _log('Agent-2','a2','Cross-referencing upsell rate · MQL/SQL funnel · quota attainment...','');
    await _delay(300);
    _log('Agent-2','a2','KPI extraction complete — insight payload generated','success');
    await _delay(260);

    // Step 3: Insights
    _setStep(3);
    _log('ADK','adk','Tool: synthesize_insights(signals=kpi_anomalies, llm="${useGemini?"gemini-2.0-flash":"mock-engine"}")','');
    await _delay(340);
    _log('Agent-2','a2','Pattern: churn + deal cycle + conversion drop = mid-funnel break','');
    await _delay(360);
    _log('Agent-2','a2','Opportunity scoring: cybersecurity > dormant reactivation > ERP upsell','');
    await _delay(300);

    AnalysisResult result;
    if (useGemini) {
      final isGroq = _provider == 'groq';
      _log('ADK','adk','Calling ${isGroq?"Groq (Llama-3.3-70B)":"Gemini 2.0 Flash"} API...','info');
      await _delay(300);
      try {
        result = isGroq
            ? await AIService.analyzeGroq(report, apiKey)
            : await AIService.analyzeGemini(report, apiKey);
        _log('ADK','adk','${isGroq?"Groq":"Gemini"} response received — JSON validated','success');
      } catch (e) {
        _log('ADK','adk','API error: $e — falling back to Mock Engine','warn');
        result = MockEngine.analyze(report);
      }
    } else {
      _log('Agent-2','a2','Mock Engine: synthesizing from extracted KPI signals...','');
      await _delay(600);
      result = MockEngine.analyze(report);
      _log('Agent-2','a2','Mock analysis complete — 3 insights · 4 opportunities','success');
    }
    setState(() => _r = result);
    await _delay(260);

    // Step 4: Action
    _setStep(4);
    _log('ADK','adk','Tool: spawn_agent(role="planner", input=insight_payload)','');
    await _delay(300);
    _log('Agent-3','a3','Action Planner activated — generating recommendations','info');
    await _delay(380);
    _log('Agent-3','a3','Primary: ${result.dormant}-account re-engagement (PKR ${result.dormantVal}M opportunity)','');
    await _delay(360);
    _log('Agent-3','a3','Composing personalized outreach email...','');
    await _delay(440);
    _log('Agent-3','a3','Preparing CRM update payload for Salesforce...','');
    await _delay(300);
    _log('Agent-3','a3','Staging webhook for Zapier automation workflow...','');
    await _delay(340);
    _log('Agent-3','a3','Action plan complete: Email + CRM + Webhook ready','success');
    await _delay(260);

    // Step 5: Simulate
    _setStep(5);
    _log('ADK','adk','Tool: simulate_execution(action_plan, env="staging")','');
    await _delay(280);
    _log('SYS','sys','Simulation layer engaged — rendering output','info');
    setState(() => _results = true);
    await _delay(260);
    _log('SYS','sys','All agents completed successfully','success');

    // Step 6: Outcome
    _setStep(6);
    setState(() => _prog = 1.0);
    await _delay(200);
    _log('SYS','sys','Before/After outcome projection populated (90-day forecast)','info');
    _log('ADK','adk','ADK session complete · 5 tool calls · 3 agents · pipeline done','success');

    setState(() => _running = false);
    await _delay(400);
    if (_scrollCtrl.hasClients) {
      _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent,
        duration: const Duration(milliseconds: 800), curve: Curves.easeInOut);
    }
  }

  void _reset() {
    setState(() {
      _step = 1; _prog = 0; _running = false; _results = false;
      _execEmail = false; _execCRM = false; _execWebhook = false;
      _r = null; _logs.clear();
    });
    _log('SYS','sys','Runtime reset. Ready for new analysis.','');
  }

  Future<void> _executeEmail() async {
    if (_r == null || _execEmail) return;
    _log('ADK','adk','Tool: execute_action(type="email_campaign", recipients=${_r!.dormant})','');
    await _delay(500);
    _log('Agent-3','a3','SMTP relay: dispatching ${_r!.dormant} personalized emails...','a3');
    await _delay(700);
    _log('Agent-3','a3','${_r!.dormant} emails sent via TLS relay','success');
    _log('ADK','adk','Tool: log_action(status=sent)','success');
    setState(() => _execEmail = true);
  }

  Future<void> _executeCRM() async {
    if (_r == null || _execCRM) return;
    _log('ADK','adk','Tool: update_crm_pipeline(system="salesforce", records=${_r!.dormant})','');
    await _delay(600);
    _log('Agent-3','a3','CRM API: updating ${_r!.dormant} contacts → Re-engaged stage','a3');
    await _delay(800);
    _log('Agent-3','a3','${_r!.dormant} CRM records updated · Salesforce webhook triggered','success');
    setState(() => _execCRM = true);
  }

  Future<void> _executeWebhook() async {
    if (_r == null || _execWebhook) return;
    _log('ADK','adk','Tool: trigger_webhook(endpoint=zapier, payload=action_plan)','');
    await _delay(500);
    _log('Agent-3','a3','POST https://hooks.zapier.com/... → 200 OK · 3 Zaps triggered','success');
    _log('ADK','adk','Tool: log_webhook(status=200)','success');
    setState(() => _execWebhook = true);
  }

  // ─────────────────────────────────────────────────────
  // BUILD
  // ─────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        child: SingleChildScrollView(
          controller: _scrollCtrl,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 20),
              _buildPipeline(),
              const SizedBox(height: 4),
              _buildProgressBar(),
              const SizedBox(height: 20),
              _buildApiKeyRow(),
              const SizedBox(height: 16),
              _buildInputSection(),
              const SizedBox(height: 14),
              _buildActionButtons(),
              const SizedBox(height: 20),
              _buildConsole(),
              if (_results && _r != null) ...[
                const SizedBox(height: 28),
                _divider(),
                const SizedBox(height: 20),
                _buildCards(),
                const SizedBox(height: 20),
                _buildTraceTable(),
                const SizedBox(height: 20),
                _buildSimTabs(),
                const SizedBox(height: 20),
                _buildBeforeAfter(),
                const SizedBox(height: 40),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // ── Header ──
  Widget _buildHeader() => Row(children: [
    Container(
      width: 44, height: 44,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [kAccent, kCyan], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: kAccent.withOpacity(0.4), blurRadius: 20)],
      ),
      child: const Center(child: Text('⚡', style: TextStyle(fontSize: 22))),
    ),
    const SizedBox(width: 12),
    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      RichText(text: TextSpan(style: GoogleFonts.syne(fontSize: 20, fontWeight: FontWeight.w800, color: kText),
        children: const [TextSpan(text: 'Insight'), TextSpan(text: 'AI', style: TextStyle(color: kAccent3))])),
      Text('Autonomous Content-to-Action Agent', style: GoogleFonts.dmMono(fontSize: 9.5, color: kText3)),
    ])),
    _liveBadge(),
  ]);

  Widget _liveBadge() => AnimatedBuilder(
    animation: _dotCtrl,
    builder: (_, __) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: kGreen.withOpacity(0.1),
        border: Border.all(color: kGreen.withOpacity(0.35)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 7, height: 7, decoration: BoxDecoration(
          color: kGreen, shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: kGreen.withOpacity(0.4 + 0.4 * _dotCtrl.value), blurRadius: 8)],
        )),
        const SizedBox(width: 6),
        Text('ADK Active', style: GoogleFonts.dmMono(fontSize: 10, color: kGreen)),
      ]),
    ),
  );

  // ── Pipeline ──
  Widget _buildPipeline() {
    const labels = ['Ingest', 'Analyze', 'Insights', 'Action', 'Simulate', 'Outcome'];
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(14)),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(children: List.generate(6, (i) {
          final n = i + 1;
          final active = n == _step, done = n < _step;
          return Row(children: [
            Column(children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 400),
                width: 32, height: 32,
                decoration: BoxDecoration(
                  color: done ? kGreen : active ? kAccent : kBg3,
                  shape: BoxShape.circle,
                  border: Border.all(color: done ? kGreen : active ? kAccent : kBorder, width: 2),
                  boxShadow: active ? [BoxShadow(color: kAccent.withOpacity(0.5), blurRadius: 16)] : null,
                ),
                child: Center(child: Text(done ? '✓' : n.toString().padLeft(2,'0'),
                  style: GoogleFonts.dmMono(fontSize: 10, fontWeight: FontWeight.w600,
                    color: (active || done) ? Colors.white : kText3))),
              ),
              const SizedBox(height: 5),
              Text(labels[i].toUpperCase(),
                style: GoogleFonts.syne(fontSize: 8, fontWeight: FontWeight.w700, letterSpacing: 0.8,
                  color: done ? kGreen : active ? kAccent3 : kText3)),
            ]),
            if (i < 5) Container(
              width: 32, height: 2,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: done ? [kAccent, kAccent] : active ? [kAccent, kBorder] : [kBorder, kBorder]),
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ]);
        })),
      ),
    );
  }

  Widget _buildProgressBar() => LayoutBuilder(builder: (ctx, cons) => Stack(children: [
    Container(height: 3, decoration: BoxDecoration(color: kBorder, borderRadius: BorderRadius.circular(2))),
    AnimatedContainer(
      duration: const Duration(milliseconds: 700), curve: Curves.easeInOut,
      height: 3, width: cons.maxWidth * _prog,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [kAccent, kCyan]),
        borderRadius: BorderRadius.circular(2),
      ),
    ),
  ]));

  // ── API Key ──
  Widget _buildApiKeyRow() => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(10)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        const Text('🔑', style: TextStyle(fontSize: 14)),
        const SizedBox(width: 6),
        Text('API Key', style: GoogleFonts.dmMono(fontSize: 11, color: kText3)),
        const SizedBox(width: 10),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(color: kBg, border: Border.all(color: kBorder2), borderRadius: BorderRadius.circular(6)),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _provider,
              dropdownColor: kSurface,
              isDense: true,
              style: GoogleFonts.dmMono(fontSize: 11, color: kText),
              items: const [
                DropdownMenuItem(value: 'gemini', child: Text('Gemini (Google)')),
                DropdownMenuItem(value: 'groq',   child: Text('Groq (Llama 3)')),
              ],
              onChanged: (v) => setState(() {
                _provider = v!;
                _keyCtrl.text = '';
              }),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
          decoration: BoxDecoration(
            color: (_provider=='groq' ? kYellow : kGreen).withOpacity(0.12),
            border: Border.all(color: (_provider=='groq' ? kYellow : kGreen).withOpacity(0.3)),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            _provider=='groq' ? 'free at console.groq.com' : 'free at aistudio.google.com',
            style: GoogleFonts.dmMono(fontSize: 9, color: _provider=='groq' ? kYellow : kGreen),
          ),
        ),
      ]),
      const SizedBox(height: 8),
      TextField(
        controller: _keyCtrl,
        obscureText: true,
        style: GoogleFonts.dmMono(fontSize: 13, color: kText),
        decoration: InputDecoration(
          hintText: 'AIza... — leave blank to use Mock Engine (no key needed)',
          hintStyle: GoogleFonts.dmMono(fontSize: 11.5, color: kText3),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: kBorder)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: kBorder)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: kAccent)),
          filled: true, fillColor: kBg3,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          isDense: true,
        ),
      ),
    ]),
  );

  // ── Input ──
  Widget _buildInputSection() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Row(children: [
      _sectionTitle('Sales Report Input'),
      const Spacer(),
      _ghostBtn('Clear', () => _reportCtrl.clear()),
      const SizedBox(width: 8),
      _ghostBtn('⬇ Sample', () => _reportCtrl.text = kSample),
    ]),
    const SizedBox(height: 10),
    Container(
      decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(14)),
      child: Column(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
          decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(top: Radius.circular(13)), border: Border(bottom: BorderSide(color: kBorder))),
          child: Row(children: [
            Text('report.txt', style: GoogleFonts.dmMono(fontSize: 11, color: kText3)),
            const Spacer(),
            Text('plain text · UTF-8', style: GoogleFonts.dmMono(fontSize: 10, color: kText3)),
          ]),
        ),
        TextField(
          controller: _reportCtrl,
          maxLines: 8,
          style: GoogleFonts.dmMono(fontSize: 12.5, color: kText, height: 1.75),
          decoration: InputDecoration(
            hintText: 'Paste your sales report here, or tap "⬇ Sample" for Pakistani business data...',
            hintStyle: GoogleFonts.dmMono(fontSize: 11.5, color: kText3),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.all(13),
          ),
        ),
      ]),
    ),
  ]);

  // ── Action Buttons ──
  Widget _buildActionButtons() => Row(children: [
    Expanded(child: GestureDetector(
      onTap: _running ? null : _run,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: _running
            ? [kAccent.withOpacity(0.5), kAccent2.withOpacity(0.5)]
            : [kAccent, kAccent2]),
          borderRadius: BorderRadius.circular(12),
          boxShadow: _running ? [] : [BoxShadow(color: kAccent.withOpacity(0.4), blurRadius: 20, offset: const Offset(0,4))],
        ),
        child: Center(child: _running
          ? Row(mainAxisSize: MainAxisSize.min, children: [
              const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
              const SizedBox(width: 10),
              Text('Agents Running...', style: GoogleFonts.syne(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
            ])
          : Text('▶  Run Agentic Analysis', style: GoogleFonts.syne(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
        ),
      ),
    )),
    const SizedBox(width: 10),
    GestureDetector(
      onTap: _reset,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder2), borderRadius: BorderRadius.circular(12)),
        child: Text('↺ Reset', style: GoogleFonts.syne(fontSize: 14, fontWeight: FontWeight.w600, color: kText2)),
      ),
    ),
  ]);

  // ── Console ──
  Widget _buildConsole() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    _sectionTitle('Agent Console — ADK Orchestrated'),
    const SizedBox(height: 10),
    Container(
      decoration: BoxDecoration(color: kBg2, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(14)),
      child: Column(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
          decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(top: Radius.circular(13)), border: Border(bottom: BorderSide(color: kBorder))),
          child: Row(children: [
            _dot(const Color(0xFFef4444)), const SizedBox(width: 5),
            _dot(const Color(0xFFf59e0b)), const SizedBox(width: 5),
            _dot(const Color(0xFF10b981)), const SizedBox(width: 10),
            Text('google-adk · 3 agents · gemini-2.0-flash', style: GoogleFonts.dmMono(fontSize: 10, color: kText3)),
          ]),
        ),
        SizedBox(
          height: 240,
          child: _logs.isEmpty
            ? Center(child: Text('Waiting for input...', style: GoogleFonts.dmMono(fontSize: 12, color: kText3)))
            : ListView.builder(
                controller: _consoleCtrl,
                padding: const EdgeInsets.all(11),
                itemCount: _logs.length,
                itemBuilder: (_, i) => _logLine(_logs[i]),
              ),
        ),
      ]),
    ),
  ]);

  Widget _dot(Color c) => Container(width: 10, height: 10, decoration: BoxDecoration(color: c, shape: BoxShape.circle));

  Widget _logLine(LogEntry e) {
    final agentColor = switch (e.agentClass) {
      'a1'  => kCyan, 'a2' => kAccent3, 'a3' => kYellow,
      'adk' => kGreen, _ => kText3,
    };
    final msgColor = switch (e.msgClass) {
      'success' => kGreen, 'warn' => kYellow, 'error' => kRed, 'info' => kCyan, _ => kText2,
    };
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(width: 55, child: Text(e.ts, style: GoogleFonts.dmMono(fontSize: 10.5, color: kText3))),
        SizedBox(width: 75, child: Text('[${e.agent}]', style: GoogleFonts.dmMono(fontSize: 10.5, color: agentColor, fontWeight: FontWeight.w500))),
        Expanded(child: Text(e.message, style: GoogleFonts.dmMono(fontSize: 10.5, color: msgColor), softWrap: true)),
      ]),
    );
  }

  // ── Result Cards ──
  Widget _buildCards() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    _sectionTitle('Agent Findings'),
    const SizedBox(height: 12),
    _resultCard('🔍', 'Insight', _r!.insight, kAccent, kAccent3),
    const SizedBox(height: 10),
    _resultCard('📊', 'Impact', _r!.impact, kYellow, kYellow),
    const SizedBox(height: 10),
    _resultCard('⚡', 'Action', _r!.action, kGreen, kGreen),
  ]);

  Widget _resultCard(String icon, String badge, String content, Color top, Color bc) => Container(
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(14)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(height: 2, decoration: BoxDecoration(gradient: LinearGradient(colors: [top, top.withOpacity(0.2)]), borderRadius: BorderRadius.circular(1))),
      const SizedBox(height: 12),
      Text(icon, style: const TextStyle(fontSize: 26)),
      const SizedBox(height: 8),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
        decoration: BoxDecoration(color: bc.withOpacity(0.15), border: Border.all(color: bc.withOpacity(0.3)), borderRadius: BorderRadius.circular(5)),
        child: Text('◆ ${badge.toUpperCase()}',
          style: GoogleFonts.syne(fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1.5, color: bc)),
      ),
      const SizedBox(height: 9),
      Text(content, style: GoogleFonts.syne(fontSize: 13, color: kText2, height: 1.7)),
    ]),
  );

  // ── Trace Table ──
  Widget _buildTraceTable() {
    final rows = [
      ['Agent-1',    'parse_document()',      '${_rand.nextInt(150)+140}ms'],
      ['Agent-2',    'extract_kpis()',         '${_rand.nextInt(200)+290}ms'],
      ['Gemini LLM', 'synthesize_insights()', '${_rand.nextInt(250)+380}ms'],
      ['Agent-3',    'generate_action()',      '${_rand.nextInt(160)+200}ms'],
      ['ADK Sim',    'simulate_execution()',   '${_rand.nextInt(80)+80}ms'],
    ];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _sectionTitle('ADK Execution Trace'),
      const SizedBox(height: 10),
      Container(
        decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(14)),
        child: Column(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 11),
            decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(top: Radius.circular(13)), border: Border(bottom: BorderSide(color: kBorder))),
            child: Row(children: [
              Text('📋 ADK Session Trace', style: GoogleFonts.syne(fontSize: 12, fontWeight: FontWeight.w600, color: kText2)),
              const SizedBox(width: 8),
              Text(DateTime.now().toIso8601String().substring(0,19)+' PKT', style: GoogleFonts.dmMono(fontSize: 10, color: kAccent3)),
            ]),
          ),
          ...rows.map((r) => Container(
            decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: kBorder))),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(r[0], style: GoogleFonts.dmMono(fontSize: 11.5, color: kAccent3, fontWeight: FontWeight.w600)),
                Text(r[1], style: GoogleFonts.dmMono(fontSize: 10.5, color: kCyan)),
              ])),
              Text(r[2], style: GoogleFonts.dmMono(fontSize: 10.5, color: kText3)),
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(color: kGreen.withOpacity(0.15), border: Border.all(color: kGreen.withOpacity(0.3)), borderRadius: BorderRadius.circular(4)),
                child: Text('✓ OK', style: GoogleFonts.dmMono(fontSize: 10, color: kGreen)),
              ),
            ]),
          )),
        ]),
      ),
    ]);
  }

  // ── Simulation Tabs ──
  Widget _buildSimTabs() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    _sectionTitle('Action Simulation'),
    const SizedBox(height: 10),
    // Tab bar
    Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: kBg3, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(10)),
      child: Row(children: [
        _simTab('📧 Email', 0),
        _simTab('🗂 CRM', 1),
        _simTab('🔗 Webhook', 2),
      ]),
    ),
    const SizedBox(height: 12),
    // Tab content
    if (_simTabIdx == 0) _buildEmailTab(),
    if (_simTabIdx == 1) _buildCrmTab(),
    if (_simTabIdx == 2) _buildWebhookTab(),
  ]);

  Widget _simTab(String label, int idx) => Expanded(child: GestureDetector(
    onTap: () => setState(() => _simTabIdx = idx),
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.symmetric(vertical: 9),
      decoration: BoxDecoration(
        color: _simTabIdx == idx ? kSurface : Colors.transparent,
        border: _simTabIdx == idx ? Border.all(color: kBorder2) : null,
        borderRadius: BorderRadius.circular(7),
      ),
      child: Center(child: Text(label,
        style: GoogleFonts.syne(fontSize: 12, fontWeight: FontWeight.w600,
          color: _simTabIdx == idx ? kText : kText3))),
    ),
  ));

  Widget _buildEmailTab() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    _simCard(
      title: 'Generated Outreach Email · Agent-3',
      subtitle: _r!.emailSubject,
      body: _r!.emailBody,
      footer: 'TO: ${_r!.dormant} dormant accounts',
      btnLabel: _execEmail ? '✓ Campaign Sent' : '⚡ Execute Email Campaign',
      btnDone: _execEmail,
      onExec: _executeEmail,
    ),
    if (_execEmail) _execResultGrid([
      ['Email Status', '✓ Sent (${_r!.dormant} recipients)'],
      ['Recipients',   '${_r!.dormant} dormant accounts'],
      ['Est. Open Rate','~${_rand.nextInt(14)+28}%'],
      ['Campaign ID',  'CMP-${_rand.nextInt(89999)+10000}'],
      ['Timestamp',    DateTime.now().toIso8601String().substring(0,19)],
      ['Agent',        'Agent-3 · ADK'],
    ]),
  ]);

  Widget _buildCrmTab() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Container(
      decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(14)),
      child: Column(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
          decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(top: Radius.circular(13)), border: Border(bottom: BorderSide(color: kBorder))),
          child: Row(children: [
            Text('🗂 Salesforce CRM — Pipeline Update', style: GoogleFonts.syne(fontSize: 12, fontWeight: FontWeight.w600, color: kText2)),
          ]),
        ),
        ..._r!.crm.map((row) => Container(
          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: kBorder))),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(row.name, style: GoogleFonts.dmMono(fontSize: 11.5, color: kText2)),
              const SizedBox(height: 4),
              Row(children: [
                _stageBadge(row.before, false),
                const Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Text('→', style: TextStyle(color: kAccent3))),
                _stageBadge(row.after, _execCRM),
              ]),
            ])),
            Text(row.val, style: GoogleFonts.dmMono(fontSize: 11.5, color: kAccent3)),
          ]),
        )),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(bottom: Radius.circular(13)), border: Border(top: BorderSide(color: kBorder))),
          child: Row(children: [
            Text('${_r!.dormant} records staged', style: GoogleFonts.dmMono(fontSize: 11, color: kText3)),
            const Spacer(),
            _execButton(_execCRM ? '✓ CRM Updated' : '🗂 Push CRM Update', _execCRM, _executeCRM),
          ]),
        ),
      ]),
    ),
    if (_execCRM) _execResultGrid([
      ['Records Updated', '✓ ${_r!.dormant} updated'],
      ['Workflow Trigger','✓ 3 flows triggered'],
      ['CRM Ticket',      'SF-${_rand.nextInt(899999)+100000}'],
      ['Sync Status',     '✓ Synced to HubSpot'],
      ['Timestamp',       DateTime.now().toIso8601String().substring(0,19)],
      ['ADK Tool',        'update_crm_pipeline()'],
    ]),
  ]);

  Widget _buildWebhookTab() {
    final payload = '{\n  "event": "agentic_action_trigger",\n  "source": "InsightAI · ADK",\n  "payload": {\n    "action": "dormant_reactivation",\n    "company": "${_r!.company}",\n    "accounts": ${_r!.dormant},\n    "value": "PKR ${_r!.dormantVal}M",\n    "priority": "HIGH"\n  }\n}';
    final response = '{\n  "status": "accepted",\n  "workflow_id": "WF-${_rand.nextInt(89999)+10000}",\n  "triggered_zaps": [\n    "CRM-Sync",\n    "Slack-Alert",\n    "Sheet-Log"\n  ],\n  "execution_ms": ${_rand.nextInt(200)+180}\n}';
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(14)),
        child: Column(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(top: Radius.circular(13)), border: Border(bottom: BorderSide(color: kBorder))),
            child: Text('🔗 Webhook / API Trigger', style: GoogleFonts.syne(fontSize: 12, fontWeight: FontWeight.w600, color: kText2)),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('POST REQUEST', style: GoogleFonts.dmMono(fontSize: 9, letterSpacing: 1.2, color: kText3)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: kBg3, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(8)),
                child: Text(payload, style: GoogleFonts.dmMono(fontSize: 11, color: kCyan, height: 1.7)),
              ),
              const SizedBox(height: 12),
              Text('MOCK RESPONSE', style: GoogleFonts.dmMono(fontSize: 9, letterSpacing: 1.2, color: kText3)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: kBg3, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(8)),
                child: Text(response, style: GoogleFonts.dmMono(fontSize: 11, color: kGreen, height: 1.7)),
              ),
            ]),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(bottom: Radius.circular(13)), border: Border(top: BorderSide(color: kBorder))),
            child: Row(children: [
              Expanded(child: Text('POST hooks.zapier.com/catch/...', style: GoogleFonts.dmMono(fontSize: 10, color: kText3), overflow: TextOverflow.ellipsis)),
              const SizedBox(width: 10),
              _execButton(_execWebhook ? '✓ Webhook Fired' : '🔗 Fire Webhook', _execWebhook, _executeWebhook),
            ]),
          ),
        ]),
      ),
      if (_execWebhook) _execResultGrid([
        ['HTTP Status', '200 OK'],
        ['Latency',     '${_rand.nextInt(200)+180}ms'],
        ['Zaps Fired',  '3 (CRM, Slack, Sheet)'],
        ['Request ID',  'REQ-${_rand.nextInt(899999)+100000}'],
        ['Timestamp',   DateTime.now().toIso8601String().substring(0,19)],
        ['ADK Tool',    'trigger_webhook()'],
      ]),
    ]);
  }

  Widget _stageBadge(String label, bool isDone) {
    final isGood = isDone || label == 'Re-engaged' || label == 'Warm';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isGood ? kGreen.withOpacity(0.15) : kText3.withOpacity(0.15),
        border: Border.all(color: isGood ? kGreen.withOpacity(0.3) : kText3.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(label, style: GoogleFonts.dmMono(fontSize: 10, color: isGood ? kGreen : kText3)),
    );
  }

  Widget _simCard({
    required String title, required String subtitle, required String body,
    required String footer, required String btnLabel, required bool btnDone,
    required VoidCallback onExec,
  }) => Container(
    decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(14)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        padding: const EdgeInsets.all(14),
        decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(top: Radius.circular(13)), border: Border(bottom: BorderSide(color: kBorder))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: GoogleFonts.dmMono(fontSize: 9, letterSpacing: 1, color: kText3)),
          const SizedBox(height: 4),
          Text(subtitle, style: GoogleFonts.syne(fontSize: 14, fontWeight: FontWeight.w700, color: kText)),
        ]),
      ),
      Padding(
        padding: const EdgeInsets.all(14),
        child: Text(body, style: GoogleFonts.dmMono(fontSize: 12.5, color: kText2, height: 1.85)),
      ),
      Container(
        padding: const EdgeInsets.all(12),
        decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(bottom: Radius.circular(13)), border: Border(top: BorderSide(color: kBorder))),
        child: Row(children: [
          Expanded(child: Text(footer, style: GoogleFonts.dmMono(fontSize: 10.5, color: kText3), overflow: TextOverflow.ellipsis)),
          const SizedBox(width: 10),
          _execButton(btnLabel, btnDone, onExec),
        ]),
      ),
    ]),
  );

  Widget _execButton(String label, bool done, VoidCallback onTap) => GestureDetector(
    onTap: done ? null : onTap,
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: done
          ? [const Color(0xFF059669), const Color(0xFF047857)]
          : [kGreen, const Color(0xFF059669)]),
        borderRadius: BorderRadius.circular(9),
        boxShadow: done ? [] : [BoxShadow(color: kGreen.withOpacity(0.35), blurRadius: 14, offset: const Offset(0,3))],
      ),
      child: Text(label, style: GoogleFonts.syne(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
    ),
  );

  Widget _execResultGrid(List<List<String>> items) => Container(
    margin: const EdgeInsets.only(top: 10),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: kGreen.withOpacity(0.07),
      border: Border.all(color: kGreen.withOpacity(0.25)),
      borderRadius: BorderRadius.circular(12),
    ),
    child: GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12, crossAxisSpacing: 12,
      childAspectRatio: 3,
      children: items.map((item) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(item[0].toUpperCase(), style: GoogleFonts.dmMono(fontSize: 8.5, letterSpacing: 1, color: kText3)),
        const SizedBox(height: 3),
        Text(item[1], style: GoogleFonts.dmMono(fontSize: 11.5, color: kGreen, fontWeight: FontWeight.w500),
          overflow: TextOverflow.ellipsis),
      ])).toList(),
    ),
  );

  // ── Before / After ──
  Widget _buildBeforeAfter() => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    _sectionTitle('Outcome Projection'),
    const SizedBox(height: 10),
    Container(
      decoration: BoxDecoration(color: kSurface, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(14)),
      child: Column(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
          decoration: const BoxDecoration(color: kBg3, borderRadius: BorderRadius.vertical(top: Radius.circular(13)), border: Border(bottom: BorderSide(color: kBorder))),
          child: Row(children: [
            const Text('📈', style: TextStyle(fontSize: 16)),
            const SizedBox(width: 8),
            Text('Before vs After — 90-day Projection', style: GoogleFonts.syne(fontSize: 12, fontWeight: FontWeight.w600, color: kText2)),
          ]),
        ),
        Padding(
          padding: const EdgeInsets.all(14),
          child: Column(children: _r!.metrics.map((m) => Container(
            margin: const EdgeInsets.only(bottom: 9),
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(color: kBg3, border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(9)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(m.m, style: GoogleFonts.syne(fontSize: 11.5, color: kText2)),
              const SizedBox(height: 6),
              Row(children: [
                Expanded(child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                  decoration: BoxDecoration(color: kRed.withOpacity(0.1), border: Border.all(color: kRed.withOpacity(0.2)), borderRadius: BorderRadius.circular(6)),
                  child: Text(m.b, style: GoogleFonts.dmMono(fontSize: 11.5, color: kRed, fontWeight: FontWeight.w600)),
                )),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8),
                  child: Text('→', style: TextStyle(color: kAccent3, fontSize: 16)),
                ),
                Expanded(child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                  decoration: BoxDecoration(color: kGreen.withOpacity(0.1), border: Border.all(color: kGreen.withOpacity(0.2)), borderRadius: BorderRadius.circular(6)),
                  child: Text(m.a, style: GoogleFonts.dmMono(fontSize: 11.5, color: kGreen, fontWeight: FontWeight.w600)),
                )),
              ]),
            ]),
          )).toList()),
        ),
      ]),
    ),
  ]);

  // ── Shared Widgets ──
  Widget _divider() => Container(height: 1, color: kBorder);

  Widget _sectionTitle(String t) => Row(children: [
    Container(width: 3, height: 13, decoration: BoxDecoration(color: kAccent, borderRadius: BorderRadius.circular(2))),
    const SizedBox(width: 8),
    Text(t.toUpperCase(), style: GoogleFonts.syne(fontSize: 9.5, fontWeight: FontWeight.w700, letterSpacing: 1.8, color: kText3)),
  ]);

  Widget _ghostBtn(String label, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(border: Border.all(color: kBorder), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: GoogleFonts.syne(fontSize: 11.5, color: kText3)),
    ),
  );
}
