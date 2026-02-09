# AI Voice Calling + Omnichannel (WhatsApp/Messenger/Instagram) Integration Plan

> Research Date: February 2026
> For: LLCPad LiveSupport Pro Plugin

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Part A: AI Voice Calling Integration](#part-a-ai-voice-calling-integration)
3. [Part B: WhatsApp/Messenger/Instagram AI Auto-Reply](#part-b-whatsappmessengerinstagram-ai-auto-reply)
4. [Part C: Unified Architecture](#part-c-unified-architecture)
5. [Implementation Phases](#implementation-phases)
6. [Cost Analysis](#cost-analysis)
7. [Database Schema Changes](#database-schema-changes)
8. [API & Socket Events](#api--socket-events)

---

## Executive Summary

### Goal

LLCPad er existing live chat system ke extend kore:

1. **AI Voice Calling** - Customer chat widget theke voice call korbe, AI answer dibe, dorkar hole human agent e handoff hobe
2. **Omnichannel AI** - WhatsApp, Messenger, Instagram e customer msg dile AI auto-reply dibe, agent-o respond korte parbe

### Key Decisions

| Decision            | Choice                                                 | Why                                         |
| ------------------- | ------------------------------------------------------ | ------------------------------------------- |
| Voice transport     | **WebRTC (browser-to-browser)** via existing Socket.io | Zero cost, already have Socket.io           |
| AI Voice pipeline   | **Deepgram STT + GPT-4.1-mini + Cartesia TTS**         | Best price/performance (~$0.025/min)        |
| Voice framework     | **Pipecat (open-source)** or **LiveKit Agents**        | Self-hosted, no vendor lock-in              |
| WhatsApp API        | **Meta Cloud API (direct)**                            | Free for inbound replies, no BSP markup     |
| Messenger/Instagram | **Meta Official APIs (direct)**                        | Completely free                             |
| Knowledge Base      | **pgvector on existing PostgreSQL**                    | No extra infrastructure                     |
| AI Model            | **Claude Haiku / GPT-4o-mini**                         | Cheapest, fast enough                       |
| Omnichannel inbox   | **Built into existing admin dashboard**                | Seamless with existing SupportTicket system |

### Monthly Cost Estimate (500 conversations/month)

| Component                  | Cost                        |
| -------------------------- | --------------------------- |
| WhatsApp (inbound replies) | $0 (free within 24h window) |
| Messenger + Instagram      | $0 (free)                   |
| AI model (text chat)       | ~$0.50/month                |
| AI voice (500 min)         | ~$13/month                  |
| Infrastructure             | $0 (existing VPS)           |
| **Total**                  | **~$14/month**              |

---

## Part A: AI Voice Calling Integration

### A.1 How It Works (High-Level)

```
Customer clicks "Voice Call" in chat widget
    |
    v
Browser requests microphone (getUserMedia)
    |
    v
WebRTC connection established via Socket.io signaling
    |
    v
┌─── Agent Available? ──────────────────────────────┐
│                                                     │
│  YES → Ring agent dashboard                        │
│         Agent accepts → Browser-to-browser call     │
│                                                     │
│  NO  → Route to AI Voice Agent                     │
│         Deepgram STT → GPT-4.1-mini → Cartesia TTS │
│         AI handles conversation                     │
│         If needed → Handoff to human agent          │
└─────────────────────────────────────────────────────┘
    |
    v
Call ends → Transcript saved to SupportTicket
```

### A.2 Technology Stack

#### WebRTC (Browser Voice - Zero Cost)

Customer ar agent er browser e direct audio stream. Existing Socket.io server (port 3001) signaling er jonno use hobe.

**Required components:**

- **STUN server**: Free public servers (e.g., `stun:stun.l.google.com:19302`)
- **TURN server**: `coturn` self-hosted on same VPS (for ~15-20% connections blocked by firewalls)
- **Signaling**: Existing Socket.io server - new events add korle hobe

**New Socket.io events for voice:**

```typescript
// Call initiation
"call:start"; // Customer → Server (request voice call)
"call:incoming"; // Server → Agent (ring agent dashboard)
"call:accept"; // Agent → Server (accept the call)
"call:reject"; // Agent → Server (reject/busy)
"call:end"; // Either → Server (end call)

// WebRTC signaling
"call:offer"; // SDP offer exchange
"call:answer"; // SDP answer exchange
"call:ice"; // ICE candidate exchange

// AI voice
"call:ai_start"; // Server → Customer (AI agent taking the call)
"call:ai_handoff"; // AI → Server (transferring to human)
"call:transcript"; // Real-time transcript updates
```

#### AI Voice Pipeline (Cascading: STT → LLM → TTS)

```
Customer Audio (WebRTC) ──→ Deepgram Nova-3 (STT)
                                    │
                               Text transcript
                                    │
                                    v
                            GPT-4.1-mini (LLM)
                            + Knowledge Base context
                            + Conversation history
                            + System prompt
                                    │
                              Response text
                                    │
                                    v
                            Cartesia Sonic (TTS)
                                    │
                              Audio stream
                                    │
                                    v
                            Customer Audio (WebRTC)
```

**Per-minute cost breakdown:**

| Component | Provider             | Cost/min        |
| --------- | -------------------- | --------------- |
| STT       | Deepgram Nova-3      | $0.0065         |
| LLM       | GPT-4.1-mini         | $0.002          |
| TTS       | Cartesia Sonic       | $0.015          |
| WebRTC    | Self-hosted (coturn) | ~$0.001         |
| **Total** |                      | **~$0.025/min** |

#### Framework Options

**Option 1: Pipecat (Recommended for simplicity)**

- Open-source Python framework by Daily.co (5,000+ GitHub stars)
- Pipeline architecture: chain STT → LLM → TTS like Unix pipes
- 40+ AI service plugins
- Can use Socket.io or LiveKit as transport
- GitHub: `github.com/pipecat-ai/pipecat`

**Option 2: LiveKit Agents**

- Open-source, tightly integrated with LiveKit WebRTC server
- Semantic turn detection (knows when user finished speaking)
- Used by OpenAI for their voice products
- GitHub: `github.com/livekit/agents`

**Option 3: Quick start with Retell AI (if speed > cost)**

- Managed platform, $0.07/min all-inclusive
- Set up in 1 week instead of 3-5 weeks
- Less customization but works immediately

### A.3 Voice Call Flows

#### Flow 1: Agent Available → Direct Browser Call

```
1. Customer clicks 📞 in chat widget
2. Browser: getUserMedia({ audio: true })
3. Widget emits "call:start" via Socket.io
4. Server checks agent availability
5. Server emits "call:incoming" to available agents
6. Agent sees incoming call notification with customer info
7. Agent clicks "Accept"
8. WebRTC signaling (offer/answer/ICE) via Socket.io
9. Audio streams directly between customer and agent browsers
10. Either party ends call → "call:end"
11. Call duration + any notes saved to SupportTicket
```

#### Flow 2: No Agent → AI Voice Agent

```
1. Customer clicks 📞 in chat widget
2. Browser: getUserMedia({ audio: true })
3. Widget emits "call:start" via Socket.io
4. Server checks: no agents available
5. Server emits "call:ai_start" to customer
6. Customer widget shows: "AI Assistant is connecting..."
7. WebRTC connection to AI pipeline (server-side)
8. Customer speaks → Deepgram STT → text
9. Text → GPT-4.1-mini (with knowledge base + system prompt)
10. Response → Cartesia TTS → audio back to customer
11. Real-time transcript shown in widget (optional)
12. Full transcript saved as SupportMessages
```

#### Flow 3: AI → Human Handoff (Mid-Call)

```
1. During AI call, handoff triggers:
   - Customer says "talk to a person" / "real agent"
   - AI confidence drops below 50% twice
   - AI detects frustration (tone/keywords)
   - Complex topic AI can't handle

2. AI says: "Let me connect you with a team member."
3. Server emits "call:incoming" to available agents
4. Agent sees: full transcript + AI summary + customer info
5. Agent accepts → WebRTC stream re-routes to agent
6. Seamless handoff - customer stays on same call
7. Agent continues conversation with full context
```

### A.4 Voice UI Components

#### Chat Widget (Customer Side)

```
Voice Call Button (in chat widget header):
┌─────────────────────────────────────┐
│ 💼 LLCPad Support    📞  ─  ✕      │
│ ⚫ We're online                      │
├─────────────────────────────────────┤
│                                     │
│  [Chat messages...]                 │
│                                     │
├─────────────────────────────────────┤
│ [😊] Type your message... [🎤] [➤] │
└─────────────────────────────────────┘

Active Call State:
┌─────────────────────────────────────┐
│ 📞 Voice Call              00:03:42  │
│ Connected with AI Assistant         │
├─────────────────────────────────────┤
│                                     │
│         [Animated waveform]         │
│                                     │
│    🔇 Mute    🔊 Speaker    📞 End  │
│                                     │
│  ── Live Transcript ──              │
│  You: "What's the cost of LLC..."   │
│  AI: "LLC formation starts at..."   │
│                                     │
└─────────────────────────────────────┘
```

#### Admin Dashboard (Agent Side)

```
Incoming Call Notification:
┌─────────────────────────────────────┐
│ 📞 Incoming Voice Call              │
│                                     │
│ Customer: Visitor #42               │
│ (or John Doe if lead collected)     │
│                                     │
│ Context: "Asked about LLC pricing"  │
│                                     │
│ [Accept 📞]        [Decline ✕]     │
└─────────────────────────────────────┘

Active Call (Agent View):
┌─────────────────────────────────────┐
│ 📞 Call with John Doe    00:05:12   │
├─────────────────────────┬───────────┤
│                         │ Customer  │
│  Live Transcript        │ Info      │
│                         │           │
│  John: "I need help..." │ john@e.com│
│  You: "Sure, I can..."  │ +1-555... │
│  John: "How long..."    │           │
│                         │ Order:    │
│                         │ #LLC-123  │
│                         │           │
├─────────────────────────┤           │
│ 🔇 Mute  📞 End  📝 Note│           │
└─────────────────────────┴───────────┘
```

### A.5 Self-Hosted Infrastructure

```
Your Hetzner/Contabo VPS
├── Next.js App (existing)
├── Socket.io Server (existing, port 3001) ← Add call signaling events
├── coturn (TURN relay, port 3478) ← New, lightweight
├── Pipecat Python process ← New, for AI voice pipeline
│   ├── Deepgram STT (API call, $0.0065/min)
│   ├── GPT-4.1-mini (API call, $0.002/min)
│   └── Cartesia TTS (API call, $0.015/min)
└── PostgreSQL (existing) ← Add call records, transcripts
```

### A.6 Alternative: OpenAI Realtime API (Speech-to-Speech)

For ultra-low latency (~200ms vs ~600ms):

```
Customer Audio → WebSocket → OpenAI Realtime API → Audio Response
                                (GPT-4o processes audio directly)
```

**Pros:** Simplest architecture, most natural sounding, lowest latency
**Cons:** $0.15-0.20/min (6-8x more expensive), OpenAI lock-in

**Verdict:** Start with cascading pipeline ($0.025/min). Upgrade to Realtime API later if latency is an issue.

---

## Part B: WhatsApp/Messenger/Instagram AI Auto-Reply

### B.1 Channel Overview

| Channel       | API                     | Cost                        | 24h Window       | Setup Time                        |
| ------------- | ----------------------- | --------------------------- | ---------------- | --------------------------------- |
| **WhatsApp**  | Meta Cloud API          | Free for replies within 24h | Yes              | 1-6 weeks (business verification) |
| **Messenger** | Messenger Platform      | Completely free             | No strict limit  | 1-2 days                          |
| **Instagram** | Instagram Messaging API | Completely free             | 24h reply window | 1-2 days                          |

### B.2 WhatsApp Business API

#### How It Works

```
Customer sends WhatsApp message to your business number
    │
    v
Meta Cloud API sends webhook POST to your server
    │ POST /api/webhooks/whatsapp
    v
Your server:
    1. Extracts message text + sender phone number
    2. Loads conversation history from DB
    3. Queries knowledge base (pgvector RAG)
    4. Calls AI model (Claude Haiku / GPT-4o-mini)
    5. Sends reply via WhatsApp Cloud API
    │
    v
Customer receives AI reply in WhatsApp
```

#### Setup Requirements

1. **Meta Business Account** (business.facebook.com)
2. **Facebook Developer App** (developers.facebook.com) → Add "WhatsApp" product
3. **Business Verification** → Submit trade license/business certificate (1-6 weeks)
4. **Dedicated Phone Number** → Not active on any WhatsApp app, can receive SMS/voice for OTP
5. **Webhook Endpoint** → HTTPS endpoint: `/api/webhooks/whatsapp`

#### Pricing (July 2025 onwards - Per-Message Pricing)

| Message Type                     | Description                           | Cost              |
| -------------------------------- | ------------------------------------- | ----------------- |
| **Service (replies within 24h)** | AI auto-replies to customer messages  | **FREE**          |
| **Utility**                      | Order confirmations, shipping updates | $0.004-$0.046/msg |
| **Marketing**                    | Promotions, offers                    | $0.011-$0.137/msg |
| **Authentication**               | OTP codes                             | $0.004-$0.046/msg |

**Key insight:** AI auto-reply to inbound customer messages = **$0 cost** (service messages within 24h window are free).

#### Country-Specific Rates (LLCPad target markets)

| Country    | Marketing/msg | Utility/msg |
| ---------- | ------------- | ----------- |
| Bangladesh | ~$0.025       | ~$0.008     |
| India      | ~$0.011       | ~$0.004     |
| Pakistan   | ~$0.025       | ~$0.008     |
| UAE        | ~$0.036       | ~$0.015     |
| USA        | ~$0.025       | ~$0.008     |

#### 24-Hour Window Rules

```
Customer messages you → 24-hour window opens
    │
    ├── Within 24 hours: Send unlimited free-form replies (FREE)
    │   (This is where AI auto-reply operates)
    │
    ├── After 24 hours: Can ONLY send pre-approved template messages (PAID)
    │
    └── Each new customer message resets the 24-hour window
```

#### WhatsApp Webhook Handler (Next.js)

```typescript
// /api/webhooks/whatsapp/route.ts

// GET - Webhook verification
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// POST - Incoming messages
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Extract message data
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (!message) return Response.json({ status: "ok" }); // Status update, not a message

  const from = message.from; // Customer phone number
  const text = message.text?.body; // Message text
  const timestamp = message.timestamp;

  // Find or create SupportTicket
  const ticket = await findOrCreateTicket({
    source: "WHATSAPP",
    guestPhone: from,
    channelId: from, // WhatsApp uses phone as ID
  });

  // Save incoming message
  await saveMessage(ticket.id, text, "CUSTOMER", from);

  // Generate AI response
  const aiResponse = await generateAIResponse(text, ticket.id);

  // Send reply via WhatsApp Cloud API
  await sendWhatsAppMessage(from, aiResponse);

  // Save AI response
  await saveMessage(ticket.id, aiResponse, "SYSTEM", "AI Assistant");

  return Response.json({ status: "ok" });
}
```

### B.3 Facebook Messenger

#### How It Works

Same webhook pattern as WhatsApp, but:

- Uses **Page-Scoped User ID (PSID)** instead of phone numbers
- **Completely free** - no per-message fees at all
- No strict 24-hour window (but best to reply quickly)
- Supports rich messages: buttons, cards, carousels, quick replies

#### Setup

1. Facebook Developer App → Add "Messenger" product
2. Connect a Facebook Page (this is the bot's identity)
3. Configure webhook URL: `/api/webhooks/messenger`
4. Subscribe to events: `messages`, `messaging_postbacks`
5. Generate Page Access Token

#### Webhook Handler

```typescript
// /api/webhooks/messenger/route.ts

export async function POST(req: NextRequest) {
  const body = await req.json();

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      const senderId = event.sender.id; // PSID
      const messageText = event.message?.text;

      if (!messageText) continue;

      // Find or create SupportTicket
      const ticket = await findOrCreateTicket({
        source: "MESSENGER",
        channelId: senderId,
      });

      // Save + AI reply + Send (same pattern as WhatsApp)
      await processAndReply(ticket, messageText, senderId, "messenger");
    }
  }

  return Response.json({ status: "ok" });
}
```

#### Send Reply via Messenger

```typescript
async function sendMessengerMessage(recipientId: string, text: string) {
  await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MESSENGER_PAGE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });
}
```

#### Handover Protocol (Bot → Human)

```typescript
// Transfer conversation from bot to human agent
async function handoffToHuman(senderId: string) {
  await fetch(`https://graph.facebook.com/v21.0/me/pass_thread_control`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MESSENGER_PAGE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: senderId },
      target_app_id: HUMAN_AGENT_APP_ID,
      metadata: "Handoff: customer requested human agent",
    }),
  });
}
```

### B.4 Instagram DM

#### How It Works

Same Meta platform, same webhook pattern. Instagram DM API is part of the Instagram Graph API.

**Key constraints:**

- **200 DMs/hour rate limit** (reduced from 5,000 in October 2024)
- Must be **Instagram Professional account** (Business or Creator)
- Must be connected to a Facebook Page
- 24-hour reply window
- Cannot initiate DMs to users who haven't messaged first

#### Setup

1. Same Meta Developer App → Add Instagram product
2. Connect Instagram Professional account to Facebook Page
3. Webhook URL: `/api/webhooks/instagram` (same pattern)
4. **Free** - no per-message fees

### B.5 AI Response Generation (Shared Across All Channels)

#### Knowledge Base with pgvector (No Extra Infrastructure)

Since LLCPad already uses PostgreSQL, enable `pgvector` extension:

```sql
-- Enable vector extension
CREATE EXTENSION vector;

-- Knowledge base chunks table
CREATE TABLE knowledge_chunks (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  content     TEXT NOT NULL,
  source_doc  TEXT,              -- "LLC Formation FAQ", "Pricing", etc.
  category    TEXT,              -- "services", "pricing", "process", "legal"
  embedding   VECTOR(1536),     -- OpenAI text-embedding-3-small dimensions
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Fast similarity search index
CREATE INDEX ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

#### RAG Query Pipeline

```typescript
async function generateAIResponse(
  customerMessage: string,
  ticketId: string,
  channel: "whatsapp" | "messenger" | "instagram" | "livechat",
): Promise<string> {
  // 1. Load conversation history (last 10 messages)
  const history = await db.supportMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // 2. Embed customer query
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: customerMessage,
  });

  // 3. Search knowledge base
  const relevantChunks = await db.$queryRaw`
    SELECT content, source_doc, category,
           1 - (embedding <=> ${queryEmbedding.data[0].embedding}::vector) as similarity
    FROM knowledge_chunks
    WHERE 1 - (embedding <=> ${queryEmbedding.data[0].embedding}::vector) > 0.7
    ORDER BY similarity DESC
    LIMIT 5
  `;

  // 4. Build prompt
  const systemPrompt = `You are a helpful customer support agent for LLCPad,
a US LLC formation service for international entrepreneurs.

RULES:
- Answer ONLY based on the provided knowledge base context
- If the answer is NOT in the context, say: "I'd like to connect you with our team for this. Would you like to speak with an agent?"
- Be concise, friendly, and professional
- Do NOT make up pricing, timelines, or legal advice
- Include a legal disclaimer when discussing LLC formation

Channel: ${channel} (adjust message length accordingly - shorter for WhatsApp/Instagram)`;

  const context = relevantChunks.map((c) => c.content).join("\n---\n");

  // 5. Call AI model
  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      ...history.reverse().map((m) => ({
        role:
          m.senderType === "CUSTOMER"
            ? ("user" as const)
            : ("assistant" as const),
        content: m.content,
      })),
      {
        role: "user",
        content: `Knowledge base context:\n${context}\n\nCustomer: ${customerMessage}`,
      },
    ],
  });

  return response.content[0].text;
}
```

#### When to Handoff to Human

| Trigger          | Detection                                                    | Action                                              |
| ---------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| Explicit request | Keywords: "human", "agent", "real person", "talk to someone" | Immediate handoff                                   |
| Low confidence   | No relevant KB chunks (similarity < 0.7) twice in a row      | Offer handoff                                       |
| Frustration      | ALL CAPS, excessive punctuation, anger keywords              | Proactive: "Would you like to speak with an agent?" |
| Sensitive topics | Refunds, billing disputes, legal questions, complaints       | Always route to human                               |
| Failure loop     | AI can't resolve after 3 exchanges on same topic             | Handoff with summary                                |

### B.6 Direct Meta Cloud API vs BSP vs Chatwoot

| Approach                            | Monthly Cost (500 convos) | Setup     | Channels      | Recommendation      |
| ----------------------------------- | ------------------------- | --------- | ------------- | ------------------- |
| **Direct Cloud API** (build custom) | ~$3-14                    | 3-4 weeks | All Meta      | Best for LLCPad CMS |
| **Twilio BSP**                      | ~$50-64                   | 1-2 weeks | Multi         | Overkill for this   |
| **Chatwoot (self-hosted)**          | ~$1-18                    | 2-3 days  | All           | Good alternative    |
| **respond.io**                      | ~$79-92                   | Hours     | All           | Too expensive       |
| **WATI**                            | ~$64-154                  | Hours     | WhatsApp only | Limited             |

**Recommendation:** Direct Cloud API integration into existing LLCPad admin dashboard. The SupportTicket/SupportMessage models already support multi-source - just add WHATSAPP, MESSENGER, INSTAGRAM sources.

---

## Part C: Unified Architecture

### C.1 Everything Connected

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER CHANNELS                              │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Website  │  │ WhatsApp │  │Messenger │  │Instagram │  │ Phone  ││
│  │Live Chat │  │          │  │          │  │   DM     │  │ (PSTN) ││
│  │+ Voice   │  │          │  │          │  │          │  │ Future ││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘│
│       │              │              │              │             │     │
└───────│──────────────│──────────────│──────────────│─────────────│─────┘
        │              │              │              │             │
        │ Socket.io    │ Webhook      │ Webhook      │ Webhook     │ SIP
        │              │              │              │             │
┌───────v──────────────v──────────────v──────────────v─────────────v─────┐
│                         YOUR VPS (Hetzner/Contabo)                      │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js Application                              │  │
│  │                                                                     │  │
│  │  API Routes:                                                        │  │
│  │  /api/webhooks/whatsapp   → WhatsApp handler                       │  │
│  │  /api/webhooks/messenger  → Messenger handler                      │  │
│  │  /api/webhooks/instagram  → Instagram handler                      │  │
│  │  /api/chat/config         → Widget config                          │  │
│  │  /api/admin/tickets/*     → Admin CRUD                             │  │
│  │                                                                     │  │
│  │  Admin Dashboard:                                                   │  │
│  │  /admin/tickets           → Unified inbox (all channels)           │  │
│  │  /admin/tickets/chat      → Live chat + voice                      │  │
│  │  /admin/tickets/settings  → Channel settings                       │  │
│  │  /admin/knowledge-base    → AI knowledge base management           │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Socket.io Server │  │  AI Voice Agent  │  │   AI Text Agent     │  │
│  │  (port 3001)      │  │  (Pipecat/Python)│  │   (shared logic)    │  │
│  │                    │  │                  │  │                      │  │
│  │  - Live chat msgs  │  │  - Deepgram STT  │  │  - pgvector RAG     │  │
│  │  - Voice signaling │  │  - GPT-4.1-mini  │  │  - Claude Haiku     │  │
│  │  - Agent presence  │  │  - Cartesia TTS  │  │  - Handoff logic    │  │
│  │  - Call state      │  │  - WebRTC audio   │  │  - Context mgmt     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐                             │
│  │  coturn (TURN)   │  │  PostgreSQL      │                             │
│  │  (port 3478)     │  │  + pgvector      │                             │
│  │                    │  │                  │                             │
│  │  WebRTC relay     │  │  - SupportTicket │                             │
│  │  for firewalled   │  │  - SupportMessage│                             │
│  │  connections      │  │  - CallRecord    │                             │
│  │                    │  │  - KnowledgeChunk│                             │
│  └──────────────────┘  └──────────────────┘                             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### C.2 Message Flow (Unified)

All channels follow the same pattern:

```
1. Message arrives (via Socket.io, webhook, or SIP)
2. Normalize message format:
   {
     source: 'WHATSAPP' | 'MESSENGER' | 'INSTAGRAM' | 'LIVE_CHAT',
     channelId: string,      // phone number, PSID, IGSID, session ID
     customerName?: string,
     customerEmail?: string,
     customerPhone?: string,
     content: string,
     contentType: 'text' | 'image' | 'audio' | 'document',
     timestamp: Date,
   }
3. Find or create SupportTicket (by channelId + source)
4. Save as SupportMessage (senderType: CUSTOMER)
5. Check if assigned to human agent → route to agent
6. Otherwise → AI pipeline:
   a. Load conversation history
   b. RAG query (pgvector)
   c. Call LLM (Claude Haiku / GPT-4o-mini)
   d. Check confidence → handoff if low
   e. Format response for channel
7. Send reply via channel-specific API
8. Save as SupportMessage (senderType: SYSTEM, senderName: 'AI Assistant')
9. Notify admin dashboard via Socket.io (real-time update)
```

### C.3 Admin Dashboard - Unified Inbox

The existing `/admin/tickets` page er ticket list e channel indicator add hobe:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Support Tickets                    [+ New Ticket] [Settings]         │
├──────────────────────────────────────────────────────────────────────┤
│  [All] [💬 Live Chat] [📱 WhatsApp] [💙 Messenger] [📷 Instagram]   │
│                                                                       │
│  🔍 Search tickets...                          [Filter ▼] [Sort ▼]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📱 TKT-005  "Need help with LLC"    +880-1712...   2m ago          │
│              WhatsApp · AI Handling · High                             │
│                                                                       │
│  💬 TKT-004  "Voice call transcript"  John Doe      15m ago          │
│              Live Chat + Voice · Resolved                              │
│                                                                       │
│  💙 TKT-003  "Pricing question"       Jane (PSID)   1h ago          │
│              Messenger · AI Handling · Medium                          │
│                                                                       │
│  📷 TKT-002  "Instagram inquiry"      @user123      3h ago          │
│              Instagram · Waiting Agent · Low                           │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

When agent replies from the dashboard, reply is automatically routed back through the correct channel API.

---

## Implementation Phases

### Phase 1: Browser-to-Browser Voice Call (2-3 weeks)

**Scope:** Customer can voice call agent from chat widget. No AI, just WebRTC.

- [ ] Install coturn on VPS
- [ ] Add voice call signaling events to Socket.io server
- [ ] Add call button to chat widget UI
- [ ] Add incoming call UI to admin dashboard
- [ ] Implement WebRTC peer connection (offer/answer/ICE)
- [ ] Audio stream between customer and agent browsers
- [ ] Call timer, mute, end controls
- [ ] Save call records to database (CallRecord model)
- [ ] Mobile responsive call UI

### Phase 2: AI Voice Agent (3-4 weeks)

**Scope:** When no agent available, AI answers voice calls.

- [ ] Set up Pipecat (Python) or LiveKit Agents on VPS
- [ ] Integrate Deepgram STT (streaming)
- [ ] Integrate GPT-4.1-mini for response generation
- [ ] Integrate Cartesia TTS for voice output
- [ ] Connect WebRTC audio stream to AI pipeline
- [ ] Real-time transcript display in widget
- [ ] AI-to-human handoff flow
- [ ] System prompt + knowledge base context for voice AI
- [ ] Save full transcripts as SupportMessages

### Phase 3: Knowledge Base + pgvector RAG (2 weeks)

**Scope:** AI knowledge base that powers both text and voice AI.

- [ ] Enable pgvector extension on PostgreSQL
- [ ] Create knowledge_chunks table with vector index
- [ ] Build document ingestion pipeline (chunk + embed)
- [ ] Admin UI: Knowledge Base management page
  - Add/edit/delete documents
  - Upload PDF/TXT/MD files
  - View usage stats (how often each doc is used)
- [ ] RAG query function (shared by text + voice AI)
- [ ] Confidence scoring logic

### Phase 4: WhatsApp Integration (2-3 weeks)

**Scope:** Customers message on WhatsApp, AI auto-replies.

- [ ] Register Meta Business Account + verify business
- [ ] Set up WhatsApp Cloud API in Facebook Developer portal
- [ ] Build webhook handler: `/api/webhooks/whatsapp`
- [ ] Message normalization + SupportTicket creation
- [ ] AI auto-reply using shared RAG pipeline
- [ ] Human handoff trigger (AI → agent in dashboard)
- [ ] Agent reply from dashboard → WhatsApp Cloud API
- [ ] Template message management (for outbound)
- [ ] Add WhatsApp channel filter to admin ticket list
- [ ] Admin settings: WhatsApp configuration page

### Phase 5: Messenger + Instagram Integration (1-2 weeks)

**Scope:** Same as WhatsApp but for Messenger and Instagram DM.

- [ ] Set up Messenger Platform in Facebook Developer portal
- [ ] Build webhook handler: `/api/webhooks/messenger`
- [ ] Set up Instagram Messaging API
- [ ] Build webhook handler: `/api/webhooks/instagram`
- [ ] Reuse same AI pipeline + handoff logic
- [ ] Channel-specific response formatting
- [ ] Add channel filters to admin ticket list
- [ ] Admin settings: Messenger/Instagram configuration

### Phase 6: Unified Inbox Polish (1-2 weeks)

**Scope:** Admin dashboard handles all channels seamlessly.

- [ ] Channel indicators (icons) in ticket list
- [ ] Channel-specific quick reply templates
- [ ] Cross-channel customer linking (same email/phone = same customer)
- [ ] Real-time updates for all channels in dashboard
- [ ] Notification preferences per channel
- [ ] Analytics per channel (response times, AI resolution rate)

### Phase 7: Advanced AI Features (2-3 weeks)

**Scope:** Smarter AI with lead collection and proactive features.

- [ ] AI conversational lead collection (name/email extraction from chat)
- [ ] Sentiment analysis for escalation
- [ ] Conversation summarization for agents
- [ ] AI-suggested replies for agents (across all channels)
- [ ] Auto-tagging tickets by topic
- [ ] CSAT survey after AI resolution

---

## Cost Analysis

### Monthly Costs at Different Scales

#### Small (500 conversations/month)

| Component                    | Cost          |
| ---------------------------- | ------------- |
| WhatsApp inbound replies     | $0            |
| Messenger + Instagram        | $0            |
| AI text model (Claude Haiku) | ~$0.50        |
| AI voice (100 min)           | ~$2.50        |
| Embeddings (pgvector)        | ~$0.01        |
| Infrastructure               | $0            |
| **Total**                    | **~$3/month** |

#### Medium (2,000 conversations/month)

| Component                                 | Cost           |
| ----------------------------------------- | -------------- |
| WhatsApp inbound replies                  | $0             |
| WhatsApp outbound templates (200 utility) | ~$4            |
| Messenger + Instagram                     | $0             |
| AI text model                             | ~$2            |
| AI voice (500 min)                        | ~$13           |
| Embeddings                                | ~$0.05         |
| **Total**                                 | **~$19/month** |

#### Large (10,000 conversations/month)

| Component                           | Cost           |
| ----------------------------------- | -------------- |
| WhatsApp inbound replies            | $0             |
| WhatsApp outbound templates (1,000) | ~$20           |
| Messenger + Instagram               | $0             |
| AI text model                       | ~$10           |
| AI voice (2,000 min)                | ~$50           |
| Embeddings                          | ~$0.20         |
| **Total**                           | **~$80/month** |

### Comparison with Competitors

| Solution                | 500 convos/mo           | 2,000 convos/mo |
| ----------------------- | ----------------------- | --------------- |
| **LLCPad (self-built)** | **$3**                  | **$19**         |
| Intercom Fin AI         | $99+ ($0.99/resolution) | $495+           |
| respond.io              | $79                     | $159            |
| WATI + AI               | $64-154                 | $150+           |
| Zendesk AI              | $55/agent               | $115/agent      |

---

## Database Schema Changes

### New Models

```prisma
// Add to existing schema.prisma

model CallRecord {
  id              String          @id @default(cuid())
  ticketId        String
  ticket          SupportTicket   @relation(fields: [ticketId], references: [id])

  // Call details
  callType        CallType        // BROWSER_TO_BROWSER, BROWSER_TO_AI, AI_HANDOFF
  status          CallStatus      // RINGING, ACTIVE, ENDED, MISSED, FAILED
  duration        Int?            // Duration in seconds
  recordingUrl    String?         // If call recording enabled

  // Participants
  callerId        String?         // Customer session ID or phone
  receiverId      String?         // Agent user ID or "AI"

  // AI specific
  aiHandled       Boolean         @default(false)
  aiHandoffAt     DateTime?       // When AI transferred to human
  transcriptText  String?         @db.Text  // Full transcript

  // Timestamps
  startedAt       DateTime        @default(now())
  answeredAt      DateTime?
  endedAt         DateTime?

  @@index([ticketId])
  @@index([startedAt])
}

model KnowledgeChunk {
  id          String    @id @default(cuid())
  content     String    @db.Text
  sourceDoc   String                // "LLC Formation FAQ"
  category    String?               // "services", "pricing", "process"
  // Note: embedding stored via raw SQL (pgvector VECTOR type)
  // Prisma doesn't natively support vector types yet

  isActive    Boolean   @default(true)
  useCount    Int       @default(0)
  helpfulCount Int      @default(0)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([category])
  @@index([isActive])
}

model AIConversation {
  id          String          @id @default(cuid())
  ticketId    String
  ticket      SupportTicket   @relation(fields: [ticketId], references: [id])

  query       String          @db.Text
  response    String          @db.Text
  confidence  Float           // 0-1
  sources     String[]        // KnowledgeChunk IDs used
  channel     String          // whatsapp, messenger, instagram, livechat, voice

  wasHelpful  Boolean?
  escalated   Boolean         @default(false)

  createdAt   DateTime        @default(now())

  @@index([ticketId])
  @@index([channel])
}

// New enums
enum CallType {
  BROWSER_TO_BROWSER
  BROWSER_TO_AI
  AI_HANDOFF
}

enum CallStatus {
  RINGING
  ACTIVE
  ENDED
  MISSED
  FAILED
}
```

### Modify Existing Models

```prisma
// Update TicketSource enum
enum TicketSource {
  LIVE_CHAT
  EMAIL
  MANUAL
  API
  WHATSAPP       // NEW
  MESSENGER      // NEW
  INSTAGRAM      // NEW
  VOICE_CALL     // NEW
}

// Add to SupportTicket
model SupportTicket {
  // ... existing fields ...

  // NEW: Channel-specific identifier
  channelId       String?         // Phone number (WA), PSID (Messenger), IGSID (IG)

  // NEW: Relations
  callRecords     CallRecord[]
  aiConversations AIConversation[]

  @@index([channelId, source])  // NEW index
}
```

---

## API & Socket Events

### New API Routes

```
# WhatsApp
GET  /api/webhooks/whatsapp          → Webhook verification
POST /api/webhooks/whatsapp          → Incoming messages

# Messenger
GET  /api/webhooks/messenger         → Webhook verification
POST /api/webhooks/messenger         → Incoming messages

# Instagram
GET  /api/webhooks/instagram         → Webhook verification
POST /api/webhooks/instagram         → Incoming messages

# Knowledge Base (Admin)
GET    /api/admin/knowledge-base              → List documents
POST   /api/admin/knowledge-base              → Add document
PUT    /api/admin/knowledge-base/:id          → Update document
DELETE /api/admin/knowledge-base/:id          → Delete document
POST   /api/admin/knowledge-base/upload       → Upload file (PDF/TXT/MD)

# AI Settings (Admin)
GET  /api/admin/ai-settings          → Get AI config
PUT  /api/admin/ai-settings          → Update AI config

# Channel Settings (Admin)
GET  /api/admin/channel-settings     → Get all channel configs
PUT  /api/admin/channel-settings/:channel  → Update channel config

# Call Records (Admin)
GET  /api/admin/calls                → List call records
GET  /api/admin/calls/:id            → Call detail + transcript
```

### New Socket.io Events

```typescript
// Voice Call Events
"call:start"; // Customer → Server: initiate call
"call:incoming"; // Server → Agent: ring notification
"call:accept"; // Agent → Server: accept call
"call:reject"; // Agent → Server: reject call
"call:end"; // Either → Server: end call
"call:offer"; // WebRTC SDP offer
"call:answer"; // WebRTC SDP answer
"call:ice"; // WebRTC ICE candidate
"call:ai_start"; // Server → Customer: AI is answering
"call:ai_handoff"; // Server → Agent: AI transferring call
"call:transcript"; // Server → Dashboard: real-time transcript update
"call:mute"; // Either → Server: mute/unmute
"call:status"; // Server → Both: call state change

// Omnichannel Events (admin dashboard real-time updates)
"channel:new_message"; // Server → Dashboard: new message on any channel
"channel:ticket_created"; // Server → Dashboard: new ticket from any channel
"channel:ai_handoff"; // Server → Dashboard: AI requesting human handoff
```

---

## Provider Quick Reference

### AI Voice Stack

| Component     | Recommended                   | Alternative                | Budget                        |
| ------------- | ----------------------------- | -------------------------- | ----------------------------- |
| **STT**       | Deepgram Nova-3 ($0.0065/min) | AssemblyAI ($0.01/min)     | Whisper self-hosted (free)    |
| **LLM**       | GPT-4.1-mini ($0.002/min)     | Claude Haiku ($0.001/min)  | Groq Llama 3 ($0.001/min)     |
| **TTS**       | Cartesia Sonic ($0.015/min)   | ElevenLabs ($0.025/min)    | OpenAI TTS ($0.008/min)       |
| **WebRTC**    | coturn self-hosted (free)     | LiveKit Cloud ($0.004/min) | --                            |
| **Framework** | Pipecat (free, open-source)   | LiveKit Agents (free)      | Retell AI ($0.07/min managed) |

### Messaging Channels

| Channel       | API                     | Cost                        | Key Limit         |
| ------------- | ----------------------- | --------------------------- | ----------------- |
| **WhatsApp**  | Meta Cloud API (direct) | Free for replies within 24h | 80 msgs/sec       |
| **Messenger** | Messenger Platform API  | Completely free             | 200 calls/hr/page |
| **Instagram** | Instagram Messaging API | Completely free             | 200 DMs/hour      |

### AI Text Model

| Model            | Cost per 500 convos | Speed     | Quality |
| ---------------- | ------------------- | --------- | ------- |
| Claude 3.5 Haiku | ~$0.10-$0.50        | Very fast | Good    |
| GPT-4o-mini      | ~$0.15-$0.50        | Fast      | Good    |
| GPT-4.1-mini     | ~$0.10-$0.40        | Fast      | Better  |
| Claude Sonnet    | ~$2-$5              | Medium    | Best    |

---

## Files to Create/Modify

| File                                                 | Action     | Description                                               |
| ---------------------------------------------------- | ---------- | --------------------------------------------------------- |
| `src/app/api/webhooks/whatsapp/route.ts`             | **CREATE** | WhatsApp webhook handler                                  |
| `src/app/api/webhooks/messenger/route.ts`            | **CREATE** | Messenger webhook handler                                 |
| `src/app/api/webhooks/instagram/route.ts`            | **CREATE** | Instagram webhook handler                                 |
| `src/app/api/admin/knowledge-base/route.ts`          | **CREATE** | Knowledge base CRUD                                       |
| `src/app/api/admin/ai-settings/route.ts`             | **CREATE** | AI configuration                                          |
| `src/app/admin/knowledge-base/page.tsx`              | **CREATE** | KB management UI                                          |
| `src/lib/ai/rag.ts`                                  | **CREATE** | RAG query pipeline                                        |
| `src/lib/ai/ai-response.ts`                          | **CREATE** | Shared AI response generation                             |
| `src/lib/channels/whatsapp.ts`                       | **CREATE** | WhatsApp send/receive logic                               |
| `src/lib/channels/messenger.ts`                      | **CREATE** | Messenger send/receive logic                              |
| `src/lib/channels/instagram.ts`                      | **CREATE** | Instagram send/receive logic                              |
| `src/lib/voice/webrtc-signaling.ts`                  | **CREATE** | WebRTC signaling handlers                                 |
| `src/components/plugins/livesupport-chat-widget.tsx` | **MODIFY** | Add voice call button + call UI                           |
| `src/app/admin/tickets/chat/live-chat-client.tsx`    | **MODIFY** | Add incoming call + voice UI                              |
| `src/app/admin/tickets/page.tsx`                     | **MODIFY** | Add channel filters + icons                               |
| `src/app/admin/tickets/settings/settings-client.tsx` | **MODIFY** | Add channel + AI settings                                 |
| `src/lib/support/socket/server.ts`                   | **MODIFY** | Add voice call + channel events                           |
| `prisma/schema.prisma`                               | **MODIFY** | Add CallRecord, KnowledgeChunk, AIConversation, new enums |
| `chat-server.ts`                                     | **MODIFY** | Add voice signaling to standalone server                  |

---

## Research Sources

### Voice Calling

- LiveKit (open-source WebRTC SFU): github.com/livekit/livekit
- Pipecat (voice AI framework): github.com/pipecat-ai/pipecat
- Deepgram Nova-3 STT: deepgram.com
- Cartesia Sonic TTS: cartesia.ai
- OpenAI Realtime API: platform.openai.com/docs/guides/realtime
- Vapi.ai: vapi.ai
- Retell AI: retellai.com
- coturn TURN server: github.com/coturn/coturn
- jambonz (self-hosted CPaaS): jambonz.org

### Messaging Channels

- WhatsApp Cloud API: developers.facebook.com/docs/whatsapp/cloud-api
- WhatsApp pricing (July 2025 PMP): business.whatsapp.com/products/platform-pricing
- Messenger Platform: developers.facebook.com/docs/messenger-platform
- Instagram Messaging API: developers.facebook.com/docs/instagram-messaging
- Chatwoot (open-source omnichannel): chatwoot.com / github.com/chatwoot/chatwoot
- pgvector: github.com/pgvector/pgvector
