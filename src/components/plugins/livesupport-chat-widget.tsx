"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "VISITOR" | "AGENT" | "AI";
  createdAt: Date;
}

interface LiveSupportChatWidgetProps {
  config?: {
    position?: "bottom-right" | "bottom-left";
    primaryColor?: string;
    welcomeMessage?: string;
    enabled?: boolean;
  };
}

// Socket events
const CHAT_EVENTS = {
  REQUEST: "chat:request",
  ACCEPT: "chat:accept",
  MESSAGE: "chat:message",
  TYPING: "chat:typing",
  END: "chat:end",
};

/**
 * LiveSupport Chat Widget
 *
 * A self-contained chat widget that connects to the socket server
 * and provides real-time chat functionality for visitors.
 */
export function LiveSupportChatWidget({ config }: LiveSupportChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visitorId] = useState(() => `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const position = config?.position || "bottom-right";
  const primaryColor = config?.primaryColor || "#2563eb";
  const welcomeMessage = config?.welcomeMessage || "Hi! How can we help you today?";
  const enabled = config?.enabled !== false;

  // Socket URL from environment or same origin
  const socketUrl = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "";

  // Connect to socket
  useEffect(() => {
    if (!enabled || !socketUrl) return;

    const socket = io(socketUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", () => {
      setError("Failed to connect to chat server");
    });

    // Chat request response
    socket.on(CHAT_EVENTS.REQUEST, (data: { success: boolean; session?: { id: string }; error?: string }) => {
      if (data.success && data.session) {
        setSessionId(data.session.id);
        setIsWaiting(true);
      } else {
        setError(data.error || "Failed to start chat");
        setIsWaiting(false);
      }
    });

    // Agent accepted chat
    socket.on(CHAT_EVENTS.ACCEPT, (data: { session: { id: string }; agent: { name: string } }) => {
      setIsWaiting(false);
      setIsActive(true);
      setAgentName(data.agent.name);
    });

    // New message
    socket.on(CHAT_EVENTS.MESSAGE, (message: ChatMessage) => {
      setMessages((prev) => {
        const tempIndex = prev.findIndex((m) => m.id.startsWith("temp_") && m.content === message.content);
        if (tempIndex !== -1) {
          const newMessages = [...prev];
          newMessages[tempIndex] = message;
          return newMessages;
        }
        return [...prev, message];
      });
    });

    // Typing indicator
    socket.on(CHAT_EVENTS.TYPING, (data: { userName: string }) => {
      setTypingUser(data.userName);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    });

    // Chat ended
    socket.on(CHAT_EVENTS.END, () => {
      setIsActive(false);
      setIsEnded(true);
    });

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [enabled, socketUrl]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start chat
  const startChat = useCallback(() => {
    if (!socketRef.current) return;
    setError(null);
    setIsWaiting(true);
    socketRef.current.emit(CHAT_EVENTS.REQUEST, {
      visitorId,
      visitorName: "Visitor",
    });
  }, [visitorId]);

  // Send message
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !sessionId || !isActive) return;

    socketRef.current.emit(CHAT_EVENTS.MESSAGE, { sessionId, content });

    const newMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      content,
      senderId: visitorId,
      senderName: "You",
      senderType: "VISITOR",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, [sessionId, isActive, visitorId]);

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!socketRef.current || !sessionId || !isActive) return;
    socketRef.current.emit(CHAT_EVENTS.TYPING, { sessionId });
  }, [sessionId, isActive]);

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!isActive && !isWaiting) {
      startChat();
    }

    if (isActive) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (isActive) sendTyping();
  };

  // Reset chat
  const resetChat = () => {
    setIsEnded(false);
    setIsActive(false);
    setIsWaiting(false);
    setMessages([]);
    setSessionId(null);
    setAgentName(null);
    startChat();
  };

  if (!enabled) return null;

  const positionClasses = position === "bottom-right" ? "right-4 sm:right-6" : "left-4 sm:left-6";

  return (
    <div className={`fixed bottom-4 sm:bottom-6 z-50 ${positionClasses}`}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: "500px" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 text-white flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div>
              <h3 className="font-semibold">Live Support</h3>
              <p className="text-xs opacity-90">
                {isActive && agentName
                  ? `Chatting with ${agentName}`
                  : isWaiting
                  ? "Connecting..."
                  : "We typically reply within minutes"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: "280px" }}>
            {messages.length === 0 && !isWaiting && !isActive && (
              <div className="text-center text-gray-500 text-sm py-8">
                <p>{welcomeMessage}</p>
                <p className="mt-2 text-xs">Type a message to start</p>
              </div>
            )}

            {isWaiting && (
              <div className="text-center text-gray-500 text-sm py-8">
                <div className="animate-pulse flex justify-center mb-2">
                  <div className="h-8 w-8 bg-gray-300 rounded-full" />
                </div>
                <p>Finding an available agent...</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  message.senderType === "VISITOR"
                    ? "ml-auto text-white rounded-br-sm"
                    : "mr-auto bg-white text-gray-800 shadow-sm rounded-bl-sm"
                }`}
                style={message.senderType === "VISITOR" ? { backgroundColor: primaryColor } : {}}
              >
                {message.senderType !== "VISITOR" && (
                  <p className="text-xs font-medium text-gray-500 mb-1">{message.senderName}</p>
                )}
                <p>{message.content}</p>
              </div>
            ))}

            {typingUser && (
              <div className="mr-auto bg-white text-gray-500 rounded-2xl px-4 py-2 text-sm shadow-sm rounded-bl-sm">
                <span className="animate-pulse">{typingUser} is typing...</span>
              </div>
            )}

            {isEnded && (
              <div className="text-center text-gray-500 text-sm py-4 border-t">
                <p>Chat ended</p>
                <button onClick={resetChat} className="mt-2 hover:underline" style={{ color: primaryColor }}>
                  Start a new conversation
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your message..."
                disabled={isEnded}
                className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 disabled:bg-gray-100"
                style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isEnded}
                className="p-2 rounded-full text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1 px-2">{error}</p>}
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg text-white flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Connection Status */}
      <div
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      />
    </div>
  );
}
