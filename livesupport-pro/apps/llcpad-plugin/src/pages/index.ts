// Plugin Pages Index
// Exports all page components for the livesupport-pro plugin

export { default as TicketsPage } from "./tickets/index";
export { default as LiveChatPage } from "./tickets/chat";
export { default as AnalyticsPage } from "./tickets/analytics";
export { default as CannedResponsesPage } from "./tickets/canned-responses";
export { default as SettingsPage } from "./tickets/settings";

// Page route mapping
export const pageRoutes = {
  "/admin/tickets": "TicketsPage",
  "/admin/tickets/chat": "LiveChatPage",
  "/admin/tickets/analytics": "AnalyticsPage",
  "/admin/tickets/canned-responses": "CannedResponsesPage",
  "/admin/tickets/settings": "SettingsPage",
};
