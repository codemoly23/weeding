/**
 * LiveSupport Chat Widget Embed Script
 *
 * Embed this script on any website to show the chat widget.
 *
 * Usage:
 * <script src="https://yourdomain.com/chat-widget.js" data-site-id="YOUR_SITE_ID"></script>
 *
 * Configuration attributes:
 * - data-site-id: Your site identifier (required)
 * - data-position: Widget position - "bottom-right" or "bottom-left" (default: "bottom-right")
 * - data-color: Primary color in hex (default: "#2563eb")
 * - data-title: Chat title (default: "Live Support")
 * - data-welcome: Welcome message
 */

(function () {
  "use strict";

  // Prevent double initialization
  if (window.LiveSupportWidget) {
    console.warn("[LiveSupport] Widget already initialized");
    return;
  }

  // Get script element and configuration
  var script = document.currentScript;
  var config = {
    siteId: script?.getAttribute("data-site-id") || "",
    serverUrl: script?.src ? new URL(script.src).origin : "",
    position: script?.getAttribute("data-position") || "bottom-right",
    primaryColor: script?.getAttribute("data-color") || "#2563eb",
    title: script?.getAttribute("data-title") || "Live Support",
    welcomeMessage:
      script?.getAttribute("data-welcome") || "Hi! How can we help you?",
  };

  // Widget state
  var state = {
    isOpen: false,
    isConnected: false,
    isWaiting: false,
    isActive: false,
    isEnded: false,
    messages: [],
    sessionId: null,
    agentName: null,
    typingUser: null,
    visitorId:
      "visitor_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substr(2, 9),
  };

  // Socket reference
  var socket = null;
  var typingTimeout = null;

  // Chat events
  var CHAT_EVENTS = {
    REQUEST: "chat:request",
    ACCEPT: "chat:accept",
    MESSAGE: "chat:message",
    TYPING: "chat:typing",
    END: "chat:end",
  };

  /**
   * Create and inject CSS styles
   */
  function injectStyles() {
    var css = `
      #livesupport-widget {
        position: fixed;
        bottom: 24px;
        ${config.position === "bottom-right" ? "right: 24px;" : "left: 24px;"}
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      #livesupport-widget * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      #livesupport-toggle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        background: ${config.primaryColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s ease;
      }

      #livesupport-toggle:hover {
        transform: scale(1.05);
      }

      #livesupport-window {
        position: absolute;
        bottom: 72px;
        ${config.position === "bottom-right" ? "right: 0;" : "left: 0;"}
        width: 360px;
        max-width: calc(100vw - 48px);
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        display: none;
        flex-direction: column;
        max-height: 500px;
      }

      #livesupport-window.open {
        display: flex;
      }

      #livesupport-header {
        background: ${config.primaryColor};
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #livesupport-header h3 {
        font-size: 16px;
        font-weight: 600;
      }

      #livesupport-header p {
        font-size: 12px;
        opacity: 0.9;
        margin-top: 2px;
      }

      #livesupport-close {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
      }

      #livesupport-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      #livesupport-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f7f8fa;
        min-height: 280px;
      }

      .livesupport-empty {
        text-align: center;
        color: #6b7280;
        padding: 32px 16px;
        font-size: 14px;
      }

      .livesupport-waiting {
        text-align: center;
        color: #6b7280;
        padding: 32px 16px;
      }

      .livesupport-waiting-dot {
        display: inline-block;
        width: 32px;
        height: 32px;
        background: #e5e7eb;
        border-radius: 50%;
        animation: livesupport-pulse 1.5s infinite;
        margin-bottom: 8px;
      }

      @keyframes livesupport-pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }

      .livesupport-message {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 16px;
        margin-bottom: 8px;
        font-size: 14px;
        line-height: 1.4;
      }

      .livesupport-message.visitor {
        margin-left: auto;
        background: ${config.primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }

      .livesupport-message.agent {
        margin-right: auto;
        background: white;
        color: #1f2937;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        border-bottom-left-radius: 4px;
      }

      .livesupport-message-sender {
        font-size: 11px;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .livesupport-typing {
        color: #6b7280;
        font-size: 13px;
        padding: 8px 14px;
        background: white;
        border-radius: 16px;
        display: inline-block;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      }

      .livesupport-ended {
        text-align: center;
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        font-size: 14px;
      }

      .livesupport-ended button {
        margin-top: 8px;
        background: none;
        border: none;
        color: ${config.primaryColor};
        cursor: pointer;
        font-size: 14px;
      }

      .livesupport-ended button:hover {
        text-decoration: underline;
      }

      #livesupport-input-form {
        display: flex;
        padding: 12px;
        background: white;
        border-top: 1px solid #e5e7eb;
        gap: 8px;
      }

      #livesupport-input {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid #e5e7eb;
        border-radius: 24px;
        font-size: 14px;
        outline: none;
      }

      #livesupport-input:focus {
        border-color: ${config.primaryColor};
        box-shadow: 0 0 0 2px ${config.primaryColor}20;
      }

      #livesupport-send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: ${config.primaryColor};
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #livesupport-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      #livesupport-status {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
      }

      #livesupport-status.connected {
        background: #22c55e;
      }

      #livesupport-status.disconnected {
        background: #ef4444;
      }
    `;

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Create widget HTML
   */
  function createWidget() {
    var widget = document.createElement("div");
    widget.id = "livesupport-widget";

    widget.innerHTML = `
      <div id="livesupport-window">
        <div id="livesupport-header">
          <div>
            <h3>${escapeHtml(config.title)}</h3>
            <p id="livesupport-subtitle">We typically reply within minutes</p>
          </div>
          <button id="livesupport-close" aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div id="livesupport-messages"></div>
        <form id="livesupport-input-form">
          <input
            type="text"
            id="livesupport-input"
            placeholder="Type your message..."
            autocomplete="off"
          />
          <button type="submit" id="livesupport-send" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </form>
      </div>
      <button id="livesupport-toggle" aria-label="Open chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
        </svg>
      </button>
      <div id="livesupport-status" class="disconnected"></div>
    `;

    document.body.appendChild(widget);

    // Bind events
    document
      .getElementById("livesupport-toggle")
      .addEventListener("click", toggleWidget);
    document
      .getElementById("livesupport-close")
      .addEventListener("click", closeWidget);
    document
      .getElementById("livesupport-input-form")
      .addEventListener("submit", handleSubmit);
    document
      .getElementById("livesupport-input")
      .addEventListener("input", handleTyping);
  }

  /**
   * Toggle widget open/close
   */
  function toggleWidget() {
    state.isOpen = !state.isOpen;
    var window = document.getElementById("livesupport-window");
    var toggle = document.getElementById("livesupport-toggle");

    if (state.isOpen) {
      window.classList.add("open");
      toggle.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>';
    } else {
      window.classList.remove("open");
      toggle.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>';
    }
  }

  /**
   * Close widget
   */
  function closeWidget() {
    state.isOpen = false;
    document.getElementById("livesupport-window").classList.remove("open");
    document.getElementById("livesupport-toggle").innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>';
  }

  /**
   * Handle form submit
   */
  function handleSubmit(e) {
    e.preventDefault();
    var input = document.getElementById("livesupport-input");
    var content = input.value.trim();

    if (!content) return;

    if (!state.isActive && !state.isWaiting) {
      startChat();
    }

    if (state.isActive) {
      sendMessage(content);
      input.value = "";
    }
  }

  /**
   * Handle typing
   */
  function handleTyping() {
    if (state.isActive && socket) {
      socket.emit(CHAT_EVENTS.TYPING, { sessionId: state.sessionId });
    }
  }

  /**
   * Start chat session
   */
  function startChat() {
    if (!socket) {
      connectSocket();
      return;
    }

    state.isWaiting = true;
    updateMessages();

    socket.emit(CHAT_EVENTS.REQUEST, {
      visitorId: state.visitorId,
      visitorName: "Website Visitor",
    });
  }

  /**
   * Send message
   */
  function sendMessage(content) {
    if (!socket || !state.sessionId) return;

    socket.emit(CHAT_EVENTS.MESSAGE, {
      sessionId: state.sessionId,
      content: content,
    });

    // Add optimistic message
    state.messages.push({
      id: "temp_" + Date.now(),
      content: content,
      senderType: "VISITOR",
      senderName: "You",
      createdAt: new Date(),
    });

    updateMessages();
  }

  /**
   * Connect to socket server
   */
  function connectSocket() {
    // Load Socket.io client
    var script = document.createElement("script");
    script.src = config.serverUrl + "/socket.io/socket.io.js";
    script.onload = function () {
      socket = io(config.serverUrl, {
        path: "/api/socket",
        transports: ["websocket", "polling"],
      });

      socket.on("connect", function () {
        state.isConnected = true;
        updateStatus();

        // Start chat after connection
        if (state.isWaiting) {
          socket.emit(CHAT_EVENTS.REQUEST, {
            visitorId: state.visitorId,
            visitorName: "Website Visitor",
          });
        }
      });

      socket.on("disconnect", function () {
        state.isConnected = false;
        updateStatus();
      });

      // Chat request response
      socket.on(CHAT_EVENTS.REQUEST, function (data) {
        if (data.success && data.session) {
          state.sessionId = data.session.id;
          state.isWaiting = true;
          updateMessages();
        } else {
          state.isWaiting = false;
          updateMessages();
        }
      });

      // Agent accepted
      socket.on(CHAT_EVENTS.ACCEPT, function (data) {
        state.isWaiting = false;
        state.isActive = true;
        state.agentName = data.agent.name;
        updateSubtitle();
        updateMessages();
      });

      // New message
      socket.on(CHAT_EVENTS.MESSAGE, function (message) {
        // Replace temp message or add new
        var tempIndex = state.messages.findIndex(function (m) {
          return m.id.indexOf("temp_") === 0 && m.content === message.content;
        });

        if (tempIndex > -1) {
          state.messages[tempIndex] = message;
        } else {
          state.messages.push(message);
        }

        updateMessages();
      });

      // Typing indicator
      socket.on(CHAT_EVENTS.TYPING, function (data) {
        state.typingUser = data.userName;
        updateMessages();

        if (typingTimeout) clearTimeout(typingTimeout);
        typingTimeout = setTimeout(function () {
          state.typingUser = null;
          updateMessages();
        }, 3000);
      });

      // Chat ended
      socket.on(CHAT_EVENTS.END, function () {
        state.isActive = false;
        state.isEnded = true;
        updateMessages();
      });
    };

    document.head.appendChild(script);
  }

  /**
   * Update messages display
   */
  function updateMessages() {
    var container = document.getElementById("livesupport-messages");
    var html = "";

    if (state.messages.length === 0 && !state.isWaiting && !state.isActive) {
      html =
        '<div class="livesupport-empty"><p>' +
        escapeHtml(config.welcomeMessage) +
        '</p><p style="margin-top:8px;font-size:12px;">Type a message to start</p></div>';
    } else if (state.isWaiting && state.messages.length === 0) {
      html =
        '<div class="livesupport-waiting"><div class="livesupport-waiting-dot"></div><p>Finding an available agent...</p></div>';
    } else {
      state.messages.forEach(function (msg) {
        var isVisitor = msg.senderType === "VISITOR";
        html += '<div class="livesupport-message ' + (isVisitor ? "visitor" : "agent") + '">';
        if (!isVisitor) {
          html +=
            '<div class="livesupport-message-sender">' +
            escapeHtml(msg.senderName) +
            "</div>";
        }
        html += "<p>" + escapeHtml(msg.content) + "</p></div>";
      });

      if (state.typingUser) {
        html +=
          '<div class="livesupport-typing">' +
          escapeHtml(state.typingUser) +
          " is typing...</div>";
      }
    }

    if (state.isEnded) {
      html +=
        '<div class="livesupport-ended"><p>Chat ended</p><button onclick="window.LiveSupportWidget.restart()">Start a new conversation</button></div>';
    }

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Update connection status
   */
  function updateStatus() {
    var status = document.getElementById("livesupport-status");
    status.className = state.isConnected ? "connected" : "disconnected";
  }

  /**
   * Update subtitle
   */
  function updateSubtitle() {
    var subtitle = document.getElementById("livesupport-subtitle");
    if (state.isActive && state.agentName) {
      subtitle.textContent = "Chatting with " + state.agentName;
    } else if (state.isWaiting) {
      subtitle.textContent = "Connecting...";
    } else {
      subtitle.textContent = "We typically reply within minutes";
    }
  }

  /**
   * Restart chat
   */
  function restart() {
    state.isWaiting = false;
    state.isActive = false;
    state.isEnded = false;
    state.messages = [];
    state.sessionId = null;
    state.agentName = null;
    updateMessages();
    updateSubtitle();
    startChat();
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Initialize widget
   */
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        injectStyles();
        createWidget();
        updateMessages();
      });
    } else {
      injectStyles();
      createWidget();
      updateMessages();
    }
  }

  // Expose public API
  window.LiveSupportWidget = {
    open: function () {
      state.isOpen = true;
      document.getElementById("livesupport-window").classList.add("open");
    },
    close: closeWidget,
    toggle: toggleWidget,
    restart: restart,
    getState: function () {
      return state;
    },
  };

  // Initialize
  init();
})();
