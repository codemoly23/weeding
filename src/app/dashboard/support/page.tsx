"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageCircle, ArrowLeft, Send, Plus, Loader2,
  CheckCircle, Clock, AlertCircle, ChevronRight, Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

interface Message {
  id: string;
  content: string;
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  senderName: string;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  messages: Message[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OPEN:                 { label: "Open",             color: "bg-blue-100 text-blue-700",   icon: MessageCircle },
  IN_PROGRESS:          { label: "In Progress",      color: "bg-yellow-100 text-yellow-700", icon: Clock },
  WAITING_FOR_CUSTOMER: { label: "Awaiting You",     color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  WAITING_FOR_AGENT:    { label: "Awaiting Agent",   color: "bg-purple-100 text-purple-700", icon: Clock },
  RESOLVED:             { label: "Resolved",         color: "bg-green-100 text-green-700",  icon: CheckCircle },
  CLOSED:               { label: "Closed",           color: "bg-gray-100 text-gray-600",    icon: CheckCircle },
};

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

// ─── New Ticket Form ──────────────────────────────────────────────────────────
function NewTicketForm({ onCreated }: { onCreated: (id: string) => void }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category: category || undefined, priority, message }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to submit ticket"); return; }
      toast.success(`Ticket ${data.ticketNumber} submitted!`);
      onCreated(data.ticketId);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plus className="h-4 w-4" /> New Support Ticket
        </CardTitle>
        <CardDescription>Describe your issue and we&apos;ll get back to you shortly</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
              minLength={5}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing & Payments</SelectItem>
                  <SelectItem value="account">Account & Login</SelectItem>
                  <SelectItem value="planning">Event Planning</SelectItem>
                  <SelectItem value="vendor">Vendor Issues</SelectItem>
                  <SelectItem value="technical">Technical Problem</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={5}
              required
              minLength={10}
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {saving ? "Submitting..." : "Submit Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Ticket Detail / Chat ─────────────────────────────────────────────────────
function TicketDetailView({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => r.json())
      .then((d) => { if (d.ticket) setTicket(d.ticket); })
      .finally(() => setLoading(false));
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to send"); return; }
      setTicket((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, data.message],
      } : prev);
      setReply("");
    } catch {
      toast.error("Network error.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (!ticket) return (
    <div className="text-center py-12 text-muted-foreground">Ticket not found.</div>
  );

  const statusConf = statusConfig[ticket.status] ?? statusConfig.OPEN;
  const StatusIcon = statusConf.icon;
  const isClosed = ticket.status === "CLOSED" || ticket.status === "RESOLVED";

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </button>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{ticket.ticketNumber}</p>
              <CardTitle className="text-base">{ticket.subject}</CardTitle>
            </div>
            <Badge className={`${statusConf.color} border-0 flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" /> {statusConf.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {ticket.messages.map((msg) => {
              const isCustomer = msg.senderType === "CUSTOMER";
              return (
                <div key={msg.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isCustomer
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}>
                    {!isCustomer && (
                      <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isCustomer ? "text-primary-foreground/70 text-right" : "text-muted-foreground"}`}>
                      {timeAgo(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          {isClosed ? (
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground text-center">
              This ticket is {ticket.status.toLowerCase()}. Open a new ticket if you need further help.
            </div>
          ) : (
            <form onSubmit={sendReply} className="flex gap-2">
              <Input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" disabled={sending || !reply.trim()} size="icon">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const [view, setView] = useState<"list" | "new" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (view === "list") {
      setLoading(true);
      fetch("/api/tickets")
        .then((r) => r.json())
        .then((d) => setTickets(d.tickets || []))
        .finally(() => setLoading(false));
    }
  }, [view]);

  function openTicket(id: string) {
    setSelectedId(id);
    setView("detail");
  }

  function onTicketCreated(id: string) {
    setSelectedId(id);
    setView("detail");
  }

  if (view === "new") {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <NewTicketForm onCreated={onTicketCreated} />
      </div>
    );
  }

  if (view === "detail" && selectedId) {
    return (
      <div className="max-w-2xl mx-auto">
        <TicketDetailView ticketId={selectedId} onBack={() => setView("list")} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get help from our team or track your tickets
          </p>
        </div>
        <Button onClick={() => setView("new")}>
          <Plus className="h-4 w-4 mr-2" /> New Ticket
        </Button>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" /> My Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No tickets yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Submit a ticket if you need help</p>
              <Button size="sm" className="mt-4" onClick={() => setView("new")}>
                <Plus className="h-4 w-4 mr-1" /> Open a Ticket
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {tickets.map((t) => {
                const conf = statusConfig[t.status] ?? statusConfig.OPEN;
                const StatusIcon = conf.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => openTicket(t.id)}
                    className="w-full text-left py-3.5 flex items-center gap-4 hover:bg-muted/40 transition-colors rounded-lg px-2 -mx-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.ticketNumber} · {t._count.messages} message{t._count.messages !== 1 ? "s" : ""} · {timeAgo(t.updatedAt)}
                      </p>
                    </div>
                    <Badge className={`${conf.color} border-0 shrink-0 flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" /> {conf.label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Center link */}
      <Link
        href="/dashboard/help"
        className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Help Center</p>
            <p className="text-xs text-muted-foreground">Browse FAQs and guides</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
