"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  MoveHorizontal,
  Copy,
  Power,
  Loader2,
  ExternalLink,
  LinkIcon,
  Bold,
  Italic,
  Paintbrush,
  Link as LinkLucide,
  Image as ImageLucide,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";

interface TickerItem {
  id: string;
  content: string;
  // Legacy
  boldText?: string;
  text?: string;
  link?: string;
  openInNewTab?: boolean;
  noFollow?: boolean;
}

interface Ticker {
  id: string;
  name: string;
  isActive: boolean;
  items: TickerItem[];
  speed: number;
  separator: string;
  createdAt: string;
  updatedAt: string;
}

function generateItemId() {
  return `ti_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/** Convert legacy boldText+text to HTML content */
function migrateItemContent(item: TickerItem): string {
  if (item.content) return item.content;
  // Legacy format
  const bold = item.boldText ? `<strong>${item.boldText}</strong>` : "";
  const sep = bold && item.text ? " · " : "";
  return `${bold}${sep}${item.text || ""}`;
}

const defaultTickerItem: () => TickerItem = () => ({
  id: generateItemId(),
  content: "",
  link: "",
  openInNewTab: false,
  noFollow: false,
});

// ---- Compact TipTap Editor for a single ticker item ----

const TICKER_COLORS = [
  "#000000", "#374151", "#6b7280", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff",
];

function TickerItemEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageOpen, setImageOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      TextStyle,
      Color,
      TiptapImage.configure({ inline: true }),
      Placeholder.configure({
        placeholder: "e.g. India · 320+ clients",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-input">
      {/* Compact Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 px-1.5 py-1">
        {/* Bold */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
          className={cn(
            "h-7 w-7 p-0",
            editor.isActive("bold") && "bg-accent text-accent-foreground"
          )}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>

        {/* Italic */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
          className={cn(
            "h-7 w-7 p-0",
            editor.isActive("italic") && "bg-accent text-accent-foreground"
          )}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>

        <div className="mx-0.5 h-4 w-px bg-border" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Text Color"
              className="h-7 w-7 p-0"
            >
              <Paintbrush className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-6 gap-1">
              {TICKER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                  }}
                  title={color}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-6 w-full text-xs"
              onClick={() => editor.chain().focus().unsetColor().run()}
            >
              Reset color
            </Button>
          </PopoverContent>
        </Popover>

        <div className="mx-0.5 h-4 w-px bg-border" />

        {/* Link */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Add Link"
              className={cn(
                "h-7 w-7 p-0",
                editor.isActive("link") && "bg-accent text-accent-foreground"
              )}
            >
              <LinkLucide className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-2">
              <Label className="text-xs">URL</Label>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (linkUrl) {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: linkUrl })
                        .run();
                    } else {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .unsetLink()
                        .run();
                    }
                    setLinkUrl("");
                    setLinkOpen(false);
                  }
                }}
                className="h-8"
              />
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    if (linkUrl) {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: linkUrl })
                        .run();
                    }
                    setLinkUrl("");
                    setLinkOpen(false);
                  }}
                >
                  {editor.isActive("link") ? "Update" : "Add"}
                </Button>
                {editor.isActive("link") && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setLinkOpen(false);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover open={imageOpen} onOpenChange={setImageOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Add Image"
              className="h-7 w-7 p-0"
            >
              <ImageLucide className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="space-y-2">
              <Label className="text-xs">Image URL</Label>
              <Input
                placeholder="https://example.com/icon.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (imageUrl) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (editor.chain().focus() as any)
                        .setImage({ src: imageUrl })
                        .run();
                    }
                    setImageUrl("");
                    setImageOpen(false);
                  }
                }}
                className="h-8"
              />
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={!imageUrl}
                onClick={() => {
                  if (imageUrl) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (editor.chain().focus() as any)
                      .setImage({ src: imageUrl })
                      .run();
                  }
                  setImageUrl("");
                  setImageOpen(false);
                }}
              >
                Add Image
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Area */}
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-sm max-w-none px-3 py-2",
          "prose-p:my-0 prose-strong:font-bold",
          "[&_.tiptap]:outline-none [&_.tiptap]:min-h-9",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:float-left",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_.tiptap_img]:inline [&_.tiptap_img]:h-4 [&_.tiptap_img]:w-auto [&_.tiptap_img]:align-middle"
        )}
      />
    </div>
  );
}

// ---- Main Page ----

export default function TickerPage() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedTickers, setExpandedTickers] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Ticker | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<{ tickerId: string; itemId: string } | null>(null);

  const fetchTickers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tickers");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // Migrate legacy items on load
      const migrated = data.map((t: Ticker) => ({
        ...t,
        items: t.items.map((item: TickerItem) => ({
          ...item,
          content: migrateItemContent(item),
        })),
      }));
      setTickers(migrated);
    } catch {
      toast.error("Failed to load tickers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickers();
  }, [fetchTickers]);

  function toggleExpanded(id: string) {
    setExpandedTickers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function createTicker() {
    try {
      const name = `Ticker ${tickers.length + 1}`;
      const res = await fetch("/api/admin/tickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          items: [defaultTickerItem()],
          speed: 28,
          separator: "·",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }

      const ticker = await res.json();
      setTickers((prev) => [ticker, ...prev]);
      setExpandedTickers((prev) => new Set(prev).add(ticker.id));
      toast.success("Ticker created");
    } catch (error: any) {
      toast.error(error.message || "Failed to create ticker");
    }
  }

  async function saveTicker(ticker: Ticker) {
    setSaving(ticker.id);
    try {
      const res = await fetch(`/api/admin/tickers/${ticker.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ticker.name,
          isActive: ticker.isActive,
          items: ticker.items,
          speed: ticker.speed,
          separator: ticker.separator,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast.success("Ticker saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save ticker");
    } finally {
      setSaving(null);
    }
  }

  async function deleteTicker() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/tickers/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");

      setTickers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success("Ticker deleted");
    } catch {
      toast.error("Failed to delete ticker");
    } finally {
      setDeleteTarget(null);
    }
  }

  function updateTicker(id: string, updates: Partial<Ticker>) {
    setTickers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }

  function updateItemContent(tickerId: string, itemId: string, html: string) {
    setTickers((prev) =>
      prev.map((t) =>
        t.id === tickerId
          ? {
              ...t,
              items: t.items.map((item) =>
                item.id === itemId ? { ...item, content: html } : item
              ),
            }
          : t
      )
    );
  }

  function updateItem(tickerId: string, itemId: string, updates: Partial<TickerItem>) {
    setTickers((prev) =>
      prev.map((t) =>
        t.id === tickerId
          ? {
              ...t,
              items: t.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : t
      )
    );
  }

  function addItem(tickerId: string) {
    setTickers((prev) =>
      prev.map((t) =>
        t.id === tickerId
          ? { ...t, items: [...t.items, defaultTickerItem()] }
          : t
      )
    );
  }

  function removeItem(tickerId: string, itemId: string) {
    setTickers((prev) =>
      prev.map((t) =>
        t.id === tickerId
          ? { ...t, items: t.items.filter((item) => item.id !== itemId) }
          : t
      )
    );
    setDeleteItemTarget(null);
  }

  function duplicateItem(tickerId: string, itemId: string) {
    setTickers((prev) =>
      prev.map((t) => {
        if (t.id !== tickerId) return t;
        const idx = t.items.findIndex((item) => item.id === itemId);
        if (idx === -1) return t;
        const copy = { ...t.items[idx], id: generateItemId() };
        const newItems = [...t.items];
        newItems.splice(idx + 1, 0, copy);
        return { ...t, items: newItems };
      })
    );
  }

  function moveItem(tickerId: string, itemId: string, direction: "up" | "down") {
    setTickers((prev) =>
      prev.map((t) => {
        if (t.id !== tickerId) return t;
        const idx = t.items.findIndex((item) => item.id === itemId);
        if (idx === -1) return t;
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= t.items.length) return t;
        const newItems = [...t.items];
        [newItems[idx], newItems[newIdx]] = [newItems[newIdx], newItems[idx]];
        return { ...t, items: newItems };
      })
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickers</h1>
          <p className="text-muted-foreground">
            Create and manage ticker marquee content for your pages
          </p>
        </div>
        <Button onClick={createTicker}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ticker
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tickers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MoveHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No tickers yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first ticker to display scrolling content on your pages
            </p>
            <Button onClick={createTicker}>
              <Plus className="mr-2 h-4 w-4" />
              Add Ticker
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickers.map((ticker) => {
            const isExpanded = expandedTickers.has(ticker.id);
            const isSaving = saving === ticker.id;

            return (
              <Card key={ticker.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(ticker.id)}>
                  {/* Ticker Header */}
                  <div className="flex items-center gap-3 p-4 border-b">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    <MoveHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />

                    <Input
                      value={ticker.name}
                      onChange={(e) => updateTicker(ticker.id, { name: e.target.value })}
                      className="max-w-60 h-9 font-medium"
                      placeholder="Ticker name"
                    />

                    <Badge variant="outline" className="shrink-0">
                      {ticker.items.length} items
                    </Badge>

                    <div className="ml-auto flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={ticker.isActive}
                          onCheckedChange={(checked) =>
                            updateTicker(ticker.id, { isActive: checked })
                          }
                        />
                        <Power className={`h-3.5 w-3.5 ${ticker.isActive ? "text-green-500" : "text-muted-foreground"}`} />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(ticker)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Ticker Items */}
                  <CollapsibleContent>
                    <CardContent className="p-4 space-y-4">
                      {/* Items List */}
                      <div className="space-y-3">
                        {ticker.items.map((item, idx) => (
                          <div
                            key={item.id}
                            className="rounded-lg border bg-muted/30 p-4 space-y-3"
                          >
                            {/* Item Header */}
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                              <span className="text-xs font-medium text-muted-foreground w-6">
                                #{idx + 1}
                              </span>
                              <div className="ml-auto flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => moveItem(ticker.id, item.id, "up")}
                                  disabled={idx === 0}
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => moveItem(ticker.id, item.id, "down")}
                                  disabled={idx === ticker.items.length - 1}
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => duplicateItem(ticker.id, item.id)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    ticker.items.length <= 1
                                      ? toast.error("A ticker must have at least one item")
                                      : setDeleteItemTarget({ tickerId: ticker.id, itemId: item.id })
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* TipTap Content Editor */}
                            <TickerItemEditor
                              content={item.content}
                              onChange={(html) =>
                                updateItemContent(ticker.id, item.id, html)
                              }
                            />

                            {/* Link Fields */}
                            <div className="space-y-1.5">
                              <Label className="text-xs flex items-center gap-1.5">
                                <LinkIcon className="h-3 w-3" />
                                Link
                              </Label>
                              <Input
                                value={item.link || ""}
                                onChange={(e) =>
                                  updateItem(ticker.id, item.id, { link: e.target.value })
                                }
                                placeholder="https://"
                                className="h-9"
                              />
                            </div>

                            <div className="flex items-center gap-6">
                              <label className="flex items-center gap-2 text-xs cursor-pointer">
                                <Checkbox
                                  checked={item.openInNewTab || false}
                                  onCheckedChange={(checked) =>
                                    updateItem(ticker.id, item.id, {
                                      openInNewTab: checked === true,
                                    })
                                  }
                                />
                                <span className="flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  Open in new tab
                                </span>
                              </label>
                              <label className="flex items-center gap-2 text-xs cursor-pointer">
                                <Checkbox
                                  checked={item.noFollow || false}
                                  onCheckedChange={(checked) =>
                                    updateItem(ticker.id, item.id, {
                                      noFollow: checked === true,
                                    })
                                  }
                                />
                                <span>Add &quot;nofollow&quot; to link</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Item & Save */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addItem(ticker.id)}
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Add Item
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveTicker(ticker)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Ticker Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticker?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.name}&quot; and all its items.
              Any widgets referencing this ticker will fall back to default content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTicker}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item Confirmation */}
      <AlertDialog open={!!deleteItemTarget} onOpenChange={() => setDeleteItemTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be removed from the ticker. Remember to save the ticker to apply changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteItemTarget) {
                  removeItem(deleteItemTarget.tickerId, deleteItemTarget.itemId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
