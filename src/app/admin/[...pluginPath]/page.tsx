// Dynamic Plugin Page Loader
// Catches all unmatched admin routes and loads plugin pages if available

import { notFound } from "next/navigation";
import { pluginLoader } from "@/lib/plugin-loader";
import prisma from "@/lib/db";
import { CheckCircle, Info } from "lucide-react";
import Link from "next/link";

// Fallback plugin page component
// Shown when plugin is active
function PluginPageFallback({
  plugin,
  menuItem,
  pagePath,
  allMenuItems,
}: {
  plugin: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    version: string;
    icon: string | null;
  };
  menuItem: {
    label: string;
    path: string;
    icon: string | null;
  } | null;
  pagePath: string;
  allMenuItems: { label: string; path: string; icon: string | null }[];
}) {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-2xl">
                {plugin.icon && !/^[a-zA-Z]+$/.test(plugin.icon) ? plugin.icon : "💬"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {menuItem?.label || plugin.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {plugin.name} v{plugin.version}
              </p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="rounded-xl border bg-card p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1">Plugin Active</h2>
              <p className="text-muted-foreground">
                The <strong>{plugin.name}</strong> plugin is installed and activated.
                This page is ready for use.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {allMenuItems.length > 0 && (
          <div className="rounded-xl border bg-card p-6 mb-6 shadow-sm">
            <h3 className="font-semibold mb-4">{plugin.name} Pages</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {allMenuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted ${
                    item.path === pagePath ? "bg-primary/5 border-primary/20" : ""
                  }`}
                >
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-sm">📄</span>
                  </div>
                  <span className={item.path === pagePath ? "font-medium" : ""}>
                    {item.label}
                  </span>
                  {item.path === pagePath && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="rounded-xl border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 p-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Page Information
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                This page is provided by the <strong>{plugin.name}</strong> plugin.
                Full functionality will be available once the plugin components are loaded.
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                <p>Path: {pagePath}</p>
                <p>Plugin: {plugin.slug}</p>
                <p>Version: {plugin.version}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {plugin.description && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">{plugin.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component
export default async function PluginPage({
  params,
}: {
  params: Promise<{ pluginPath: string[] }>;
}) {
  const { pluginPath } = await params;
  const fullPath = "/admin/" + pluginPath.join("/");

  // Check if this path is handled by an active plugin
  const result = await pluginLoader.findPluginForPath(fullPath);

  if (!result.found || !result.pluginSlug) {
    // No plugin handles this path - show 404
    notFound();
  }

  // Get plugin details from database
  const plugin = await prisma.plugin.findUnique({
    where: { slug: result.pluginSlug },
    include: {
      menuItems: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!plugin || plugin.status !== "ACTIVE") {
    notFound();
  }

  // Find the matching menu item for this path
  const menuItem = plugin.menuItems.find(
    (item) => item.path === fullPath || fullPath.startsWith(item.path + "/")
  );

  // Render fallback page with navigation
  return (
    <PluginPageFallback
      plugin={{
        id: plugin.id,
        slug: plugin.slug,
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        icon: plugin.icon,
      }}
      menuItem={menuItem ?? null}
      pagePath={fullPath}
      allMenuItems={plugin.menuItems.map((item) => ({
        label: item.label,
        path: item.path,
        icon: item.icon,
      }))}
    />
  );
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ pluginPath: string[] }>;
}) {
  const { pluginPath } = await params;
  const fullPath = "/admin/" + pluginPath.join("/");

  const result = await pluginLoader.findPluginForPath(fullPath);

  if (!result.found || !result.pluginSlug) {
    return {
      title: "Not Found",
    };
  }

  const plugin = await prisma.plugin.findUnique({
    where: { slug: result.pluginSlug },
    include: {
      menuItems: true,
    },
  });

  if (!plugin) {
    return {
      title: "Not Found",
    };
  }

  const menuItem = plugin.menuItems.find(
    (item) => item.path === fullPath || fullPath.startsWith(item.path + "/")
  );

  return {
    title: menuItem?.label || plugin.name,
    description: plugin.description,
  };
}
