// Plugin Loader Service
// Handles dynamic loading of plugin pages and components

import prisma from "@/lib/db";
import path from "path";
import fs from "fs/promises";

// Plugin directory where installed plugins are stored
const PLUGINS_DIR = path.join(process.cwd(), "plugins");

export interface PluginRoute {
  path: string;
  component: string;
  pluginSlug: string;
  pluginPath: string;
}

export interface PluginPageResult {
  found: boolean;
  pluginSlug?: string;
  componentPath?: string;
  error?: string;
}

/**
 * Plugin Loader Service
 * Manages dynamic loading of plugin pages based on URL path
 */
export const pluginLoader = {
  /**
   * Find a plugin that handles the given admin path
   * @param urlPath - The URL path (e.g., "/admin/tickets/chat")
   * @returns Plugin info if found, null otherwise
   */
  async findPluginForPath(urlPath: string): Promise<PluginPageResult> {
    try {
      // Normalize path
      const normalizedPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;

      // Find active plugin with a menu item matching this path
      const menuItem = await prisma.pluginMenuItem.findFirst({
        where: {
          path: normalizedPath,
          plugin: {
            status: "ACTIVE",
          },
        },
        include: {
          plugin: true,
        },
      });

      if (!menuItem) {
        // Try to find a plugin that handles this path prefix
        // e.g., /admin/tickets/123 should match plugin with /admin/tickets
        const plugins = await prisma.plugin.findMany({
          where: {
            status: "ACTIVE",
          },
          include: {
            menuItems: true,
          },
        });

        for (const plugin of plugins) {
          for (const item of plugin.menuItems) {
            // Check if the URL starts with this menu item's path
            if (normalizedPath.startsWith(item.path) && normalizedPath !== item.path) {
              // This is a sub-route of a plugin page (e.g., /admin/tickets/123)
              return {
                found: true,
                pluginSlug: plugin.slug,
                componentPath: this.getComponentPath(plugin.slug, normalizedPath),
              };
            }
          }
        }

        return { found: false, error: "No plugin found for this path" };
      }

      return {
        found: true,
        pluginSlug: menuItem.plugin.slug,
        componentPath: this.getComponentPath(menuItem.plugin.slug, normalizedPath),
      };
    } catch (error) {
      console.error("Error finding plugin for path:", error);
      return { found: false, error: "Database error" };
    }
  },

  /**
   * Get the component file path for a given plugin and URL path
   * @param pluginSlug - The plugin slug
   * @param urlPath - The URL path
   * @returns The file path to the component
   */
  getComponentPath(pluginSlug: string, urlPath: string): string {
    // Convert URL path to file path
    // /admin/tickets → pages/tickets/index
    // /admin/tickets/chat → pages/tickets/chat
    // /admin/tickets/123 → pages/tickets/[id]

    const adminPrefix = "/admin/";
    let relativePath = urlPath.startsWith(adminPrefix)
      ? urlPath.substring(adminPrefix.length)
      : urlPath;

    // Remove leading/trailing slashes
    relativePath = relativePath.replace(/^\/+|\/+$/g, "");

    // Split into segments
    const segments = relativePath.split("/");

    // Build the component path
    // For dynamic segments (UUIDs, numbers), use [id]
    const componentSegments = segments.map((segment) => {
      // Check if segment looks like a dynamic ID (UUID or number)
      if (/^[a-f0-9-]{36}$/.test(segment) || /^\d+$/.test(segment)) {
        return "[id]";
      }
      return segment;
    });

    return path.join(
      PLUGINS_DIR,
      pluginSlug,
      "dist",
      "pages",
      ...componentSegments
    );
  },

  /**
   * Check if a plugin page component exists
   * @param componentPath - The path to the component
   * @returns true if exists, false otherwise
   */
  async componentExists(componentPath: string): Promise<boolean> {
    const extensions = [".js", ".mjs", "/index.js", "/index.mjs"];

    for (const ext of extensions) {
      try {
        await fs.access(componentPath + ext);
        return true;
      } catch {
        // File doesn't exist, try next extension
      }
    }

    return false;
  },

  /**
   * Get the actual file path with extension
   * @param componentPath - The base component path
   * @returns The full path with extension, or null if not found
   */
  async getActualPath(componentPath: string): Promise<string | null> {
    const extensions = [".js", ".mjs", "/index.js", "/index.mjs"];

    for (const ext of extensions) {
      const fullPath = componentPath + ext;
      try {
        await fs.access(fullPath);
        return fullPath;
      } catch {
        // File doesn't exist, try next extension
      }
    }

    return null;
  },

  /**
   * Get all registered routes for active plugins
   * @returns Array of plugin routes
   */
  async getActivePluginRoutes(): Promise<PluginRoute[]> {
    try {
      const plugins = await prisma.plugin.findMany({
        where: {
          status: "ACTIVE",
        },
        include: {
          menuItems: true,
        },
      });

      const routes: PluginRoute[] = [];

      for (const plugin of plugins) {
        for (const menuItem of plugin.menuItems) {
          routes.push({
            path: menuItem.path,
            component: this.getComponentPath(plugin.slug, menuItem.path),
            pluginSlug: plugin.slug,
            pluginPath: path.join(PLUGINS_DIR, plugin.slug),
          });
        }
      }

      return routes;
    } catch (error) {
      console.error("Error getting active plugin routes:", error);
      return [];
    }
  },

  /**
   * Check if plugins directory exists
   * @returns true if exists, false otherwise
   */
  async pluginsDirExists(): Promise<boolean> {
    try {
      await fs.access(PLUGINS_DIR);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Ensure plugins directory exists
   */
  async ensurePluginsDir(): Promise<void> {
    try {
      await fs.mkdir(PLUGINS_DIR, { recursive: true });
    } catch {
      // Directory already exists or other error
    }
  },

  /**
   * Get plugin manifest
   * @param pluginSlug - The plugin slug
   * @returns Plugin manifest or null
   */
  async getPluginManifest(pluginSlug: string): Promise<Record<string, unknown> | null> {
    const manifestPath = path.join(PLUGINS_DIR, pluginSlug, "plugin.json");

    try {
      const content = await fs.readFile(manifestPath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  },

  /**
   * Delete plugin files
   * @param pluginSlug - The plugin slug
   */
  async deletePluginFiles(pluginSlug: string): Promise<void> {
    const pluginPath = path.join(PLUGINS_DIR, pluginSlug);

    try {
      await fs.rm(pluginPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`Error deleting plugin files for ${pluginSlug}:`, error);
      throw error;
    }
  },
};
