"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  Loader2,
  User,
  Clock,
  CheckCircle,
  Circle,
  Paperclip,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { toast } from "sonner";

interface ChatSession {
  id: string;
  visitor: {
    id: string;
    name: string;
    email: string | null;
    isOnline: boolean;
  };
  status: "ACTIVE" | "WAITING" | "ENDED";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  startedAt: string;
}

interface ChatMessage {
  id: string;
  content: string;
  senderType: "VISITOR" | "AGENT" | "SYSTEM";
  senderName: string;
  createdAt: string;
}

interface LiveChatDashboardClientProps {
  pluginName?: string;
  tier?: string | null;
  features: string[];
  hasChatFeature: boolean;
}

// Mock data for demo
const mockSessions: ChatSession[] = [
  {
    id: "1",
    visitor: { id: "v1", name: "John Smith", email: "john@example.com", isOnline: true },
    status: "ACTIVE",
    lastMessage: "Hi, I need help with my order",
    lastMessageAt: new Date(Date.now() - 60000).toISOString(),
    unreadCount: 2,
    startedAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "2",
    visitor: { id: "v2", name: "Emily Davis", email: "emily@example.com", isOnline: true },
    status: "WAITING",
    lastMessage: "Anyone there?",
    lastMessageAt: new Date(Date.now() - 180000).toISOString(),
    unreadCount: 1,
    startedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "3",
    visitor: { id: "v3", name: "Guest User", email: null, isOnline: false },
    status: "ENDED",
    lastMessage: "Thanks for the help!",
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
    startedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const mockMessages: ChatMessage[] = [
  {
    id: "m1",
    content: "Hi, I need help with my order",
    senderType: "VISITOR",
    senderName: "John Smith",
    createdAt: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: "m2",
    content: "Hello John! I'd be happy to help. What seems to be the issue with your order?",
    senderType: "AGENT",
    senderName: "Support Agent",
    createdAt: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: "m3",
    content: "I placed an order yesterday but haven't received a confirmation email",
    senderType: "VISITOR",
    senderName: "John Smith",
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "m4",
    content: "Can you check if my order went through?",
    senderType: "VISITOR",
    senderName: "John Smith",
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
];

export function LiveChatDashboardClient({
  pluginName,
  tier,
  features,
  hasChatFeature,
}: LiveChatDashboardClientProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(mockSessions);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "WAITING" | "ENDED">("all");

  // Socket connection status (mock)
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (selectedSession) {
      setMessages(mockMessages);
    }
  }, [selectedSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedSession) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      content: message.trim(),
      senderType: "AGENT",
      senderName: "Support Agent",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // In real implementation, this would emit via Socket.io
    toast.success("Message sent");
  };

  const handleEndChat = async () => {
    if (!selectedSession) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSession.id ? { ...s, status: "ENDED" as const } : s
      )
    );
    setSelectedSession(null);
    toast.success("Chat ended");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredSessions = sessions.filter((session) => {
    if (statusFilter !== "all" && session.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        session.visitor.name.toLowerCase().includes(query) ||
        session.visitor.email?.toLowerCase().includes(query) ||
        session.lastMessage.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const activeSessions = sessions.filter((s) => s.status === "ACTIVE").length;
  const waitingSessions = sessions.filter((s) => s.status === "WAITING").length;

  // Feature not available warning
  if (!hasChatFeature) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Live Chat
            </h1>
            <p className="text-muted-foreground">Real-time customer support</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Feature Not Available</AlertTitle>
          <AlertDescription>
            Live Chat is not included in your current license tier ({tier || "Free"}).
            Please upgrade to a higher tier to access this feature.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Upgrade your LiveSupport Pro license to access real-time chat features,
              including live chat widget, chat queue management, and visitor insights.
            </p>
            <Button asChild>
              <Link href="/admin/settings/plugins">Manage License</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Live Chat
            {tier && <Badge variant="outline" className="ml-2">{tier}</Badge>}
          </h1>
          <p className="text-muted-foreground">
            {activeSessions} active, {waitingSessions} waiting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
            <Circle className={`h-2 w-2 ${isConnected ? "fill-green-500" : "fill-red-500"}`} />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Sessions List */}
        <Card className="col-span-4 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Chats
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("WAITING")}>
                    Waiting
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("ENDED")}>
                    Ended
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="px-4 pb-4 space-y-2">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No chats found</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSession?.id === session.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(session.visitor.name)}</AvatarFallback>
                        </Avatar>
                        {session.visitor.isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{session.visitor.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(session.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {session.lastMessage}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={
                              session.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : session.status === "WAITING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {session.status.toLowerCase()}
                          </Badge>
                          {session.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 justify-center">
                              {session.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-8 flex flex-col">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(selectedSession.visitor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedSession.visitor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedSession.visitor.email || "No email provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" disabled>
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" disabled>
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tickets/new?visitor=${selectedSession.visitor.id}`}>
                            Create Ticket
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={handleEndChat}
                        >
                          End Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderType === "AGENT" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.senderType === "AGENT"
                            ? "bg-primary text-primary-foreground"
                            : msg.senderType === "SYSTEM"
                            ? "bg-muted text-muted-foreground text-center w-full max-w-full text-sm"
                            : "bg-muted"
                        }`}
                      >
                        {msg.senderType !== "SYSTEM" && (
                          <p className="text-xs opacity-70 mb-1">{msg.senderName}</p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              {selectedSession.status !== "ENDED" && (
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" disabled>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Textarea
                      placeholder="Type a message..."
                      className="min-h-[44px] max-h-[120px] resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {selectedSession.status === "ENDED" && (
                <div className="p-4 border-t bg-muted/50 text-center text-sm text-muted-foreground">
                  This chat has ended
                </div>
              )}
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-full">
              <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Chat Selected</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Select a conversation from the list to start chatting with visitors
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
