/**
 * Socket.io Server for Live Support
 *
 * This module initializes and manages the Socket.io server for real-time
 * chat functionality between visitors and support agents.
 *
 * Features:
 * - Real-time chat messaging
 * - Typing indicators
 * - Agent presence
 * - Chat queue management
 */

import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import prisma from "@/lib/db";

// Socket event constants
export const CHAT_EVENTS = {
  REQUEST: "chat:request",
  ACCEPT: "chat:accept",
  MESSAGE: "chat:message",
  TYPING: "chat:typing",
  END: "chat:end",
  QUEUE_UPDATE: "chat:queue_update",
};

export const AUTH_EVENTS = {
  AUTHENTICATE: "auth:authenticate",
  AUTHENTICATED: "auth:authenticated",
  AUTH_ERROR: "auth:error",
};

export const PRESENCE_EVENTS = {
  STATUS_UPDATE: "presence:status_update",
  OFFLINE: "presence:offline",
  ONLINE: "presence:online",
};

export const ROOM_PREFIXES = {
  USER: "user:",
  AGENT: "agent:",
  CHAT: "chat:",
  TICKET: "ticket:",
};

interface SocketUser {
  id: string;
  name: string;
  email?: string;
  role: "customer" | "agent" | "admin";
  isAgent: boolean;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

interface ChatSession {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  agentId?: string;
  agentName?: string;
  status: "WAITING" | "ACTIVE" | "ENDED";
  createdAt: Date;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "VISITOR" | "AGENT" | "AI";
  createdAt: Date;
}

// In-memory stores (for development)
// In production, use Redis for scalability
const chatSessions = new Map<string, ChatSession>();
const connectedAgents = new Map<string, { socketId: string; name: string; status: string }>();

/**
 * Initialize the Socket.io server
 */
export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NODE_ENV === "development" ? "*" : process.env.NEXT_PUBLIC_SITE_URL,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Register event handlers
    registerAuthHandlers(io, authSocket);
    registerChatHandlers(io, authSocket);
    registerPresenceHandlers(io, authSocket);

    // Handle disconnect
    socket.on("disconnect", () => {
      handleDisconnect(io, authSocket);
    });
  });

  console.log("[Socket] Server initialized with path: /api/socket");
  return io;
}

/**
 * Authentication handlers
 */
function registerAuthHandlers(io: SocketIOServer, socket: AuthenticatedSocket) {
  socket.on(AUTH_EVENTS.AUTHENTICATE, async (data: { token: string }) => {
    try {
      // Verify JWT token and get user
      const user = await verifySocketToken(data.token);

      if (!user) {
        socket.emit(AUTH_EVENTS.AUTH_ERROR, { message: "Invalid token" });
        return;
      }

      socket.user = user;

      // Join user's personal room
      socket.join(`${ROOM_PREFIXES.USER}${user.id}`);

      // Join agent room if applicable
      if (user.isAgent) {
        socket.join(`${ROOM_PREFIXES.AGENT}all`);
        connectedAgents.set(user.id, {
          socketId: socket.id,
          name: user.name,
          status: "online",
        });

        // Notify other agents
        io.to(`${ROOM_PREFIXES.AGENT}all`).emit(PRESENCE_EVENTS.ONLINE, {
          userId: user.id,
          userName: user.name,
        });
      }

      socket.emit(AUTH_EVENTS.AUTHENTICATED, { user });
      console.log(`[Socket] User authenticated: ${user.name} (${user.role})`);
    } catch (error) {
      socket.emit(AUTH_EVENTS.AUTH_ERROR, { message: "Authentication failed" });
    }
  });
}

/**
 * Chat handlers
 */
function registerChatHandlers(io: SocketIOServer, socket: AuthenticatedSocket) {
  // Visitor requests chat
  socket.on(
    CHAT_EVENTS.REQUEST,
    async (data: { visitorId: string; visitorName?: string; visitorEmail?: string }) => {
      const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const session: ChatSession = {
        id: sessionId,
        visitorId: data.visitorId,
        visitorName: data.visitorName || "Visitor",
        visitorEmail: data.visitorEmail,
        status: "WAITING",
        createdAt: new Date(),
        messages: [],
      };

      chatSessions.set(sessionId, session);

      // Join chat room
      socket.join(`${ROOM_PREFIXES.CHAT}${sessionId}`);

      // Notify visitor
      socket.emit(CHAT_EVENTS.REQUEST, { success: true, session });

      // Notify all agents
      io.to(`${ROOM_PREFIXES.AGENT}all`).emit(CHAT_EVENTS.QUEUE_UPDATE, {
        type: "new",
        session: {
          id: session.id,
          visitorName: session.visitorName,
          visitorEmail: session.visitorEmail,
          createdAt: session.createdAt,
        },
      });

      console.log(`[Socket] New chat request: ${sessionId} from ${session.visitorName}`);
    }
  );

  // Agent accepts chat
  socket.on(CHAT_EVENTS.ACCEPT, async (data: { sessionId: string }) => {
    if (!socket.user?.isAgent) {
      socket.emit("error", { message: "Only agents can accept chats" });
      return;
    }

    const session = chatSessions.get(data.sessionId);
    if (!session) {
      socket.emit("error", { message: "Session not found" });
      return;
    }

    if (session.status !== "WAITING") {
      socket.emit("error", { message: "Session already accepted" });
      return;
    }

    session.agentId = socket.user.id;
    session.agentName = socket.user.name;
    session.status = "ACTIVE";

    // Join chat room
    socket.join(`${ROOM_PREFIXES.CHAT}${data.sessionId}`);

    // Notify chat room
    io.to(`${ROOM_PREFIXES.CHAT}${data.sessionId}`).emit(CHAT_EVENTS.ACCEPT, {
      session: {
        id: session.id,
        status: session.status,
      },
      agent: {
        id: socket.user.id,
        name: socket.user.name,
      },
    });

    // Update queue for all agents
    io.to(`${ROOM_PREFIXES.AGENT}all`).emit(CHAT_EVENTS.QUEUE_UPDATE, {
      type: "accepted",
      sessionId: data.sessionId,
      agentId: socket.user.id,
      agentName: socket.user.name,
    });

    console.log(`[Socket] Chat accepted: ${data.sessionId} by ${socket.user.name}`);
  });

  // Chat message
  socket.on(CHAT_EVENTS.MESSAGE, async (data: { sessionId: string; content: string }) => {
    const session = chatSessions.get(data.sessionId);

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      content: data.content,
      senderId: socket.user?.id || socket.id,
      senderName: socket.user?.name || "Visitor",
      senderType: socket.user?.isAgent ? "AGENT" : "VISITOR",
      createdAt: new Date(),
    };

    // Store message in session
    if (session) {
      session.messages.push(message);
    }

    // Broadcast to chat room
    io.to(`${ROOM_PREFIXES.CHAT}${data.sessionId}`).emit(CHAT_EVENTS.MESSAGE, message);

    // Optionally persist to database
    // await persistChatMessage(data.sessionId, message);
  });

  // Typing indicator
  socket.on(CHAT_EVENTS.TYPING, (data: { sessionId: string }) => {
    socket.to(`${ROOM_PREFIXES.CHAT}${data.sessionId}`).emit(CHAT_EVENTS.TYPING, {
      sessionId: data.sessionId,
      userId: socket.user?.id || socket.id,
      userName: socket.user?.name || "Visitor",
    });
  });

  // End chat
  socket.on(CHAT_EVENTS.END, async (data: { sessionId: string }) => {
    const session = chatSessions.get(data.sessionId);

    if (session) {
      session.status = "ENDED";

      // Optionally persist to database before removing
      // await persistChatSession(session);

      chatSessions.delete(data.sessionId);
    }

    io.to(`${ROOM_PREFIXES.CHAT}${data.sessionId}`).emit(CHAT_EVENTS.END, {
      sessionId: data.sessionId,
    });

    // Update queue for all agents
    io.to(`${ROOM_PREFIXES.AGENT}all`).emit(CHAT_EVENTS.QUEUE_UPDATE, {
      type: "ended",
      sessionId: data.sessionId,
    });

    console.log(`[Socket] Chat ended: ${data.sessionId}`);
  });

  // Agent joins (for real-time queue updates)
  socket.on("agent:join", () => {
    socket.join(`${ROOM_PREFIXES.AGENT}all`);

    // Send current queue
    const waitingChats = Array.from(chatSessions.values())
      .filter((s) => s.status === "WAITING")
      .map((s) => ({
        id: s.id,
        visitorName: s.visitorName,
        createdAt: s.createdAt,
      }));

    socket.emit(CHAT_EVENTS.QUEUE_UPDATE, {
      type: "sync",
      sessions: waitingChats,
    });
  });
}

/**
 * Presence handlers
 */
function registerPresenceHandlers(io: SocketIOServer, socket: AuthenticatedSocket) {
  socket.on(PRESENCE_EVENTS.STATUS_UPDATE, async (data: { status: "online" | "away" | "offline" }) => {
    if (!socket.user) return;

    const agent = connectedAgents.get(socket.user.id);
    if (agent) {
      agent.status = data.status;
    }

    // Broadcast to all agents
    if (socket.user.isAgent) {
      io.to(`${ROOM_PREFIXES.AGENT}all`).emit(PRESENCE_EVENTS.STATUS_UPDATE, {
        userId: socket.user.id,
        userName: socket.user.name,
        status: data.status,
      });
    }
  });
}

/**
 * Handle disconnect
 */
function handleDisconnect(io: SocketIOServer, socket: AuthenticatedSocket) {
  console.log(`[Socket] Client disconnected: ${socket.id}`);

  if (socket.user) {
    // Remove from connected agents
    connectedAgents.delete(socket.user.id);

    // Notify other agents
    if (socket.user.isAgent) {
      io.to(`${ROOM_PREFIXES.AGENT}all`).emit(PRESENCE_EVENTS.OFFLINE, {
        userId: socket.user.id,
        userName: socket.user.name,
      });
    }
  }
}

/**
 * Verify socket authentication token
 */
async function verifySocketToken(token: string): Promise<SocketUser | null> {
  try {
    // For development, accept a simple user ID token
    if (process.env.NODE_ENV === "development" && token.startsWith("dev_")) {
      const userId = token.replace("dev_", "");
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
      });

      if (user) {
        return {
          id: user.id,
          name: user.name || "Unknown",
          email: user.email || undefined,
          role: user.role as "customer" | "agent" | "admin",
          isAgent: user.role === "ADMIN" || user.role === "SUPPORT_AGENT",
        };
      }
    }

    // TODO: Implement proper JWT verification for production
    // const { verifyToken } = await import("@/lib/auth");
    // const decoded = await verifyToken(token);
    // return decoded.user;

    return null;
  } catch (error) {
    console.error("[Socket] Token verification failed:", error);
    return null;
  }
}

/**
 * Get waiting chat sessions
 */
export function getWaitingChats(): ChatSession[] {
  return Array.from(chatSessions.values()).filter((s) => s.status === "WAITING");
}

/**
 * Get active chat sessions
 */
export function getActiveChats(): ChatSession[] {
  return Array.from(chatSessions.values()).filter((s) => s.status === "ACTIVE");
}

/**
 * Get connected agents count
 */
export function getOnlineAgentsCount(): number {
  return Array.from(connectedAgents.values()).filter((a) => a.status === "online").length;
}
