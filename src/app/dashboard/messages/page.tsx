"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquare, ChevronLeft, Send, Store } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface ConversationSummary {
  id: string;
  status: string;
  lastMessageAt: string;
  totalMessages: number;
  lastMessage: { content: string; senderRole: "VENDOR" | "GUEST"; createdAt: string } | null;
  vendor: {
    businessName: string;
    category: string | null;
    city: string | null;
    country: string | null;
    photo: string | null;
  };
}

interface Message {
  id: string;
  senderRole: "VENDOR" | "GUEST";
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  guestName: string;
  guestEmail: string;
  status: string;
  messages: Message[];
  vendor: {
    businessName: string;
    category: string | null;
    city: string | null;
    country: string | null;
  };
  inquiry: {
    eventType: string;
    eventDate: string | null;
    budget: string | null;
    message: string;
  } | null;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 7 * 86_400_000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function CustomerMessagesPage() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<ConversationDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadList = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadThread = useCallback(async (id: string) => {
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setThread(data.conversation);
      }
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) return;
    loadThread(selectedId);
    pollRef.current = setInterval(() => loadThread(selectedId), 20000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedId, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  async function sendMessage() {
    if (!selectedId || !messageText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText.trim() }),
      });
      if (res.ok) {
        setMessageText("");
        await loadThread(selectedId);
        loadList();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">{t("dash.messages")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("dash.messagesSubtitle")}</p>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Conversation list */}
        <div className={`flex flex-col bg-card rounded-xl border border-border ${selectedId ? "hidden lg:flex lg:w-80" : "w-full lg:w-80"}`}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("dash.messagesAllConversations")}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loadingList ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground/70 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">{t("dash.messagesEmpty")}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{t("dash.messagesEmptyDesc")}</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedId === conv.id;
                const isFromVendor = conv.lastMessage?.senderRole === "VENDOR";
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors ${
                      isSelected ? "bg-primary/5 border-l-2 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {conv.vendor.businessName}
                          </span>
                          <span className="text-xs text-muted-foreground/70 shrink-0">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        {conv.vendor.category && (
                          <p className="text-xs text-muted-foreground/70">{conv.vendor.category}</p>
                        )}
                        {conv.lastMessage && (
                          <p className={`text-xs mt-0.5 truncate ${isFromVendor ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {isFromVendor ? "" : `${t("dash.messagesYou")}: `}
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread panel */}
        {selectedId ? (
          <div className="flex-1 flex flex-col bg-card rounded-xl border border-border min-w-0">
            {loadingThread && !thread ? (
              <div className="flex items-center justify-center flex-1">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : thread ? (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="lg:hidden p-1 rounded text-muted-foreground/70 hover:text-foreground/80"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{thread.vendor.businessName}</p>
                    {thread.vendor.category && (
                      <p className="text-xs text-muted-foreground">
                        {thread.vendor.category}
                        {thread.vendor.city ? ` · ${thread.vendor.city}` : ""}
                        {thread.vendor.country ? `, ${thread.vendor.country}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Inquiry context */}
                {thread.inquiry && (
                  <div className="mx-4 mt-3 mb-1 bg-primary/5 border border-primary/10 rounded-lg px-4 py-2.5">
                    <p className="text-xs font-medium text-primary">
                      {t("dash.messagesInquiry")}: <strong>{thread.inquiry.eventType}</strong>
                      {thread.inquiry.eventDate && ` · ${new Date(thread.inquiry.eventDate).toLocaleDateString()}`}
                      {thread.inquiry.budget && ` · ${thread.inquiry.budget}`}
                    </p>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {thread.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderRole === "GUEST" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.senderRole === "GUEST"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.senderRole === "GUEST" ? "text-primary-foreground/60" : "text-muted-foreground/70"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Compose */}
                {thread.status !== "SPAM" ? (
                  <div className="border-t border-border px-4 py-3">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        rows={2}
                        placeholder={t("dash.messagesComposePlaceholder")}
                        className="flex-1 resize-none border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 bg-background"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !messageText.trim()}
                        className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground/70">
                    {t("dash.messagesConversationClosed")}
                  </div>
                )}
              </>
            ) : null}
          </div>
        ) : (
          <div className="flex-1 hidden lg:flex items-center justify-center bg-card rounded-xl border border-border border-dashed">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/70 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t("dash.messagesSelectConversation")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
