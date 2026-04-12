/**
 * Seed script for LiveSupport Pro plugin
 *
 * This seeds the plugin as INSTALLED (not ACTIVE).
 * Users must activate it with a license key via the admin UI.
 *
 * Run with: npx tsx prisma/seed-livesupport-plugin.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// LiveSupport Pro plugin manifest
const liveSupportProPlugin = {
  slug: "livesupport-pro",
  name: "LiveSupport Pro",
  description:
    "Professional customer support system with live chat, ticketing, and AI assistance. Includes real-time messaging, ticket management, canned responses, and more.",
  version: "1.0.0",
  author: "Ceremoney",
  authorUrl: "https://ceremoney.com",
  icon: "MessageSquare",
  status: "INSTALLED" as const, // Pre-installed but NOT active - requires license
  requiresLicense: true,
  hasAdminPages: true,
  hasPublicPages: true,
  hasWidgets: true,
  hasApiRoutes: true,
  adminMenuLabel: "Support",
  adminMenuIcon: "MessageSquare",
  adminMenuPosition: 5,
  manifest: {
    slug: "livesupport-pro",
    name: "LiveSupport Pro",
    version: "1.0.0",
    description:
      "Professional customer support system with live chat, ticketing, and AI assistance.",
    author: {
      name: "Ceremoney",
      email: "support@ceremoney.com",
      url: "https://ceremoney.com",
    },
    license: {
      type: "commercial",
      requiresActivation: true,
      licenseServerUrl: "https://license.ceremoney.com",
    },
    compatibility: {
      minCmsVersion: "1.0.0",
      maxCmsVersion: "2.x",
    },
    features: {
      adminPages: true,
      publicPages: true,
      widgets: true,
      apiRoutes: true,
      socketServer: true,
    },
    adminMenu: {
      label: "Support",
      icon: "MessageSquare",
      position: 5,
      items: [
        { label: "All Tickets", path: "/admin/tickets", icon: "Inbox" },
        { label: "Live Chat", path: "/admin/tickets/chat", icon: "MessageCircle" },
        { label: "Analytics", path: "/admin/tickets/analytics", icon: "BarChart3" },
        {
          label: "Canned Responses",
          path: "/admin/tickets/canned-responses",
          icon: "FileText",
        },
        { label: "Settings", path: "/admin/tickets/settings", icon: "Settings" },
      ],
    },
    widgets: [
      {
        name: "ChatWidget",
        position: "body-end",
        config: {
          enabled: true,
          position: "bottom-right",
          primaryColor: "#2563eb",
        },
      },
    ],
    tiers: {
      STANDARD: {
        features: ["chat", "tickets", "email", "canned-responses"],
        maxAgents: 3,
      },
      PROFESSIONAL: {
        features: [
          "chat",
          "tickets",
          "email",
          "canned-responses",
          "ai",
          "analytics",
          "knowledge-base",
        ],
        maxAgents: 10,
      },
      ENTERPRISE: {
        features: [
          "chat",
          "tickets",
          "email",
          "canned-responses",
          "ai",
          "analytics",
          "knowledge-base",
          "white-label",
          "priority-support",
        ],
        maxAgents: -1, // unlimited
      },
    },
  },
  menuItems: [
    { label: "All Tickets", path: "/admin/tickets", icon: "Inbox", sortOrder: 0 },
    {
      label: "Live Chat",
      path: "/admin/tickets/chat",
      icon: "MessageCircle",
      sortOrder: 1,
    },
    {
      label: "Analytics",
      path: "/admin/tickets/analytics",
      icon: "BarChart3",
      sortOrder: 2,
    },
    {
      label: "Canned Responses",
      path: "/admin/tickets/canned-responses",
      icon: "FileText",
      sortOrder: 3,
    },
    {
      label: "Settings",
      path: "/admin/tickets/settings",
      icon: "Settings",
      sortOrder: 4,
    },
  ],
  settings: [
    { key: "chat.enabled", value: "true", type: "boolean" },
    { key: "chat.requireEmail", value: "true", type: "boolean" },
    { key: "chat.welcomeMessage", value: "Hi! How can we help you today?", type: "string" },
    { key: "chat.offlineMessage", value: "We are currently offline. Please leave a message and we will get back to you.", type: "string" },
    { key: "chat.position", value: "bottom-right", type: "string" },
    { key: "chat.primaryColor", value: "#2563eb", type: "string" },
    { key: "notifications.sound", value: "true", type: "boolean" },
    { key: "notifications.desktop", value: "true", type: "boolean" },
    { key: "notifications.email", value: "true", type: "boolean" },
    { key: "ai.enabled", value: "false", type: "boolean" },
    { key: "ai.autoSuggest", value: "false", type: "boolean" },
    { key: "ai.provider", value: "openai", type: "string" },
  ],
};

async function seedLiveSupportPlugin() {
  console.log("🔌 Seeding LiveSupport Pro plugin...\n");

  try {
    // Check if plugin already exists
    const existing = await prisma.plugin.findUnique({
      where: { slug: liveSupportProPlugin.slug },
    });

    if (existing) {
      console.log("⚠️  Plugin already exists. Updating...");

      // Update plugin
      await prisma.plugin.update({
        where: { slug: liveSupportProPlugin.slug },
        data: {
          name: liveSupportProPlugin.name,
          description: liveSupportProPlugin.description,
          version: liveSupportProPlugin.version,
          author: liveSupportProPlugin.author,
          authorUrl: liveSupportProPlugin.authorUrl,
          icon: liveSupportProPlugin.icon,
          manifest: liveSupportProPlugin.manifest,
          adminMenuLabel: liveSupportProPlugin.adminMenuLabel,
          adminMenuIcon: liveSupportProPlugin.adminMenuIcon,
          adminMenuPosition: liveSupportProPlugin.adminMenuPosition,
          hasAdminPages: liveSupportProPlugin.hasAdminPages,
          hasPublicPages: liveSupportProPlugin.hasPublicPages,
          hasWidgets: liveSupportProPlugin.hasWidgets,
          hasApiRoutes: liveSupportProPlugin.hasApiRoutes,
          requiresLicense: liveSupportProPlugin.requiresLicense,
        },
      });

      // Delete existing menu items and settings
      await prisma.pluginMenuItem.deleteMany({
        where: { pluginId: existing.id },
      });
      await prisma.pluginSetting.deleteMany({
        where: { pluginId: existing.id },
      });

      // Re-create menu items
      await prisma.pluginMenuItem.createMany({
        data: liveSupportProPlugin.menuItems.map((item) => ({
          pluginId: existing.id,
          ...item,
        })),
      });

      // Re-create settings
      await prisma.pluginSetting.createMany({
        data: liveSupportProPlugin.settings.map((setting) => ({
          pluginId: existing.id,
          ...setting,
        })),
      });

      console.log("✅ Plugin updated successfully!\n");
    } else {
      // Create new plugin
      const plugin = await prisma.plugin.create({
        data: {
          slug: liveSupportProPlugin.slug,
          name: liveSupportProPlugin.name,
          description: liveSupportProPlugin.description,
          version: liveSupportProPlugin.version,
          author: liveSupportProPlugin.author,
          authorUrl: liveSupportProPlugin.authorUrl,
          icon: liveSupportProPlugin.icon,
          status: liveSupportProPlugin.status,
          manifest: liveSupportProPlugin.manifest,
          adminMenuLabel: liveSupportProPlugin.adminMenuLabel,
          adminMenuIcon: liveSupportProPlugin.adminMenuIcon,
          adminMenuPosition: liveSupportProPlugin.adminMenuPosition,
          hasAdminPages: liveSupportProPlugin.hasAdminPages,
          hasPublicPages: liveSupportProPlugin.hasPublicPages,
          hasWidgets: liveSupportProPlugin.hasWidgets,
          hasApiRoutes: liveSupportProPlugin.hasApiRoutes,
          requiresLicense: liveSupportProPlugin.requiresLicense,
          menuItems: {
            create: liveSupportProPlugin.menuItems,
          },
          settings: {
            create: liveSupportProPlugin.settings,
          },
        },
        include: {
          menuItems: true,
          settings: true,
        },
      });

      console.log("✅ Plugin created successfully!\n");
      console.log(`   ID: ${plugin.id}`);
      console.log(`   Slug: ${plugin.slug}`);
      console.log(`   Status: ${plugin.status}`);
      console.log(`   Menu Items: ${plugin.menuItems.length}`);
      console.log(`   Settings: ${plugin.settings.length}`);
    }

    console.log("\n📋 Plugin Details:");
    console.log("   Name: LiveSupport Pro");
    console.log("   Status: INSTALLED (requires license activation)");
    console.log("   License Required: Yes");
    console.log("\n🔐 To activate:");
    console.log("   1. Go to /admin/settings/plugins");
    console.log("   2. Click 'Activate' on LiveSupport Pro");
    console.log("   3. Enter your license key");
    console.log("   4. Plugin will be activated!\n");
  } catch (error) {
    console.error("❌ Error seeding plugin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run if called directly
seedLiveSupportPlugin()
  .then(() => {
    console.log("🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
