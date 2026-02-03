"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  Circle,
  User,
  Clock,
  CheckCheck,
} from "lucide-react";

// Types
interface ChatSession {
  id: string;
  visitorName: string;
  visitorEmail: string;
  status: "ACTIVE" | "WAITING" | "ENDED";
  startedAt: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  content: string;
  sender: "VISITOR" | "AGENT" | "SYSTEM";
  senderName: string;
  timestamp: string;
  read: boolean;
}

// Mock data
const mockSessions: ChatSession[] = [
  {
    id: "1",
    visitorName: "John Doe",
    visitorEmail: "john@example.com",
    status: "ACTIVE",
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    lastMessageAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    unreadCount: 2,
    messages: [
      { id: "1", content: "Hi, I need help with my LLC formation", sender: "VISITOR", senderName: "John Doe", timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), read: true },
      { id: "2", content: "Hello John! I'd be happy to help. What specific questions do you have?", sender: "AGENT", senderName: "Support", timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), read: true },
      { id: "3", content: "I'm not sure which state to form my LLC in", sender: "VISITOR", senderName: "John Doe", timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), read: true },
      { id: "4", content: "That depends on several factors. Where do you plan to operate your business?", sender: "AGENT", senderName: "Support", timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), read: true },
      { id: "5", content: "Mainly online, selling to customers across the US", sender: "VISITOR", senderName: "John Doe", timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), read: false },
    ],
  },
  {
    id: "2",
    visitorName: "Sarah Smith",
    visitorEmail: "sarah@example.com",
    status: "WAITING",
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 1,
    messages: [
      { id: "1", content: "Hello, can someone help me?", sender: "VISITOR", senderName: "Sarah Smith", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), read: false },
    ],
  },
  {
    id: "3",
    visitorName: "Mike Johnson",
    visitorEmail: "mike@example.com",
    status: "ENDED",
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    messages: [],
  },
];

export default function LiveChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(mockSessions);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(mockSessions[0]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.messages]);

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!message.trim() || !selectedSession) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "AGENT",
      senderName: "Support",
      timestamp: new Date().toISOString(),
      read: false,
    };

    setSelectedSession({
      ...selectedSession,
      messages: [...selectedSession.messages, newMessage],
    });
    setMessage("");
  };

  // Filter sessions
  const filteredSessions = sessions.filter(
    (session) =>
      session.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.visitorEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-500";
      case "WAITING":
        return "text-yellow-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 rounded-lg border bg-card overflow-hidden">
      {/* Sessions List */}
      <div className="w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-3">Live Chats</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border bg-background pl-9 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedSession?.id === session.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <Circle
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-current ${getStatusColor(session.status)}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{session.visitorName}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(session.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{session.visitorEmail}</p>
                  {session.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground mt-1">
                      {session.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="p-4 border-t bg-muted/30">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">
                {sessions.filter((s) => s.status === "ACTIVE").length}
              </p>
              <p className="text-[10px] text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-600">
                {sessions.filter((s) => s.status === "WAITING").length}
              </p>
              <p className="text-[10px] text-muted-foreground">Waiting</p>
            </div>
            <div>
              <p className="text-lg font-bold text-muted-foreground">
                {sessions.filter((s) => s.status === "ENDED").length}
              </p>
              <p className="text-[10px] text-muted-foreground">Ended</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      {selectedSession ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedSession.visitorName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Circle className={`h-2 w-2 fill-current ${getStatusColor(selectedSession.status)}`} />
                  {selectedSession.status === "ACTIVE" ? "Online" : selectedSession.status === "WAITING" ? "Waiting" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md p-2 hover:bg-accent">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="rounded-md p-2 hover:bg-accent">
                <Video className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="rounded-md p-2 hover:bg-accent">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "AGENT" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.sender === "AGENT"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : msg.sender === "SYSTEM"
                      ? "bg-muted text-center w-full max-w-full rounded-lg"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.sender === "AGENT" ? "justify-end" : ""}`}>
                    <span className={`text-[10px] ${msg.sender === "AGENT" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.sender === "AGENT" && (
                      <CheckCheck className={`h-3 w-3 ${msg.read ? "text-blue-400" : "text-primary-foreground/70"}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-end gap-2">
              <button className="rounded-md p-2 hover:bg-accent">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="rounded-md p-2 hover:bg-accent">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full rounded-lg border bg-background px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
