"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Download, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  getLocalNotes,
  addLocalNote,
  updateLocalNote,
  deleteLocalNote,
  LocalNote,
} from "@/lib/planner-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const isLocal = (id: string) => id.startsWith("local-");

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function NotesPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const local = isLocal(id);

  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      if (local) {
        const n = getLocalNotes(id);
        setNotes(n);
        if (n.length > 0 && !activeId) setActiveId(n[0].id);
      } else {
        const data = await apiFetch(`/api/planner/projects/${id}/notes`);
        const n = data.notes ?? [];
        setNotes(n);
        if (n.length > 0 && !activeId) setActiveId(n[0].id);
      }
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [id, local]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const activeNote = notes.find(n => n.id === activeId) ?? null;

  async function createNote() {
    const data = { title: t("notes.untitled"), content: "" };
    if (local) {
      const note = addLocalNote(id, data);
      setNotes(prev => [note, ...prev]);
      setActiveId(note.id);
    } else {
      const res = await apiFetch(`/api/planner/projects/${id}/notes`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      setNotes(prev => [res.note, ...prev]);
      setActiveId(res.note.id);
    }
  }

  async function updateField(noteId: string, field: "title" | "content", value: string) {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, [field]: value } : n));
    setSaveState("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        if (local) { updateLocalNote(id, noteId, { [field]: value }); }
        else {
          await apiFetch(`/api/planner/projects/${id}/notes/${noteId}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }),
          });
        }
        setSaveState("saved");
        savedTimerRef.current = setTimeout(() => setSaveState("idle"), 2000);
      } catch { setSaveState("idle"); }
    }, 500);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    try {
      if (local) { deleteLocalNote(id, deleteTargetId); }
      else { await apiFetch(`/api/planner/projects/${id}/notes/${deleteTargetId}`, { method: "DELETE" }); }
      const remaining = notes.filter(n => n.id !== deleteTargetId);
      setNotes(remaining);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    } catch {
      alert(t("notes.deleteError"));
    } finally {
      setDeleteTargetId(null);
    }
  }

  async function downloadPDF() {
    if (!activeNote) return;
    const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");

    const styles = StyleSheet.create({
      page: { padding: 48, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
      title: { fontSize: 20, fontWeight: "bold", color: "#1e1b4b", marginBottom: 6 },
      meta: { fontSize: 9, color: "#9ca3af", marginBottom: 24 },
      body: { fontSize: 11, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" },
    });

    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>{activeNote.title || "Untitled"}</Text>
          <Text style={styles.meta}>
            {new Date(activeNote.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </Text>
          <View>
            {(activeNote.content || "").split("\n").map((line, i) => (
              <Text key={i} style={styles.body}>{line || " "}</Text>
            ))}
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title || "note"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("notes.justNow");
    if (mins < 60) return `${mins}${t("notes.mAgo")}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}${t("notes.hAgo")}`;
    return new Date(iso).toLocaleDateString();
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-56 flex-shrink-0 flex-col border-r border-border bg-muted/30">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground/80">{t("notes.heading")}</span>
          <button onClick={createNote} className="rounded-lg p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          ) : notes.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">{t("notes.noNotes")}</p>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveId(note.id)}
                className={`group w-full px-4 py-2.5 text-left transition-colors ${
                  activeId === note.id ? "bg-card border-r-2 border-primary" : "hover:bg-card"
                }`}
              >
                <p className="truncate text-sm font-medium text-foreground/80">{note.title || t("notes.untitled")}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{timeAgo(note.updatedAt)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!activeNote ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">{t("notes.noNotes")}</p>
              <button onClick={createNote}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> {t("notes.addNote")}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Note header */}
            <div className="flex items-center gap-2 border-b border-border px-6 py-3">
              <input
                value={activeNote.title}
                onChange={e => updateField(activeNote.id, "title", e.target.value)}
                placeholder={t("notes.titlePlaceholder")}
                className="flex-1 bg-transparent text-lg font-semibold text-foreground placeholder-muted-foreground/50 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                {saveState === "saving" && (
                  <span className="text-xs text-muted-foreground">Saving...</span>
                )}
                {saveState === "saved" && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                )}
                <button
                  onClick={downloadPDF}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Download as PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteTargetId(activeNote.id)} className="rounded-lg p-1.5 text-muted-foreground hover:text-[var(--color-error-text)] hover:bg-[var(--color-error-bg)] transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Editor area */}
            <textarea
              value={activeNote.content}
              onChange={e => updateField(activeNote.id, "content", e.target.value)}
              placeholder={t("notes.placeholder")}
              className="flex-1 resize-none bg-background px-6 py-4 text-sm text-foreground/80 placeholder-muted-foreground/50 focus:outline-none leading-relaxed"
            />
          </>
        )}
      </div>
      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTargetId} onOpenChange={open => { if (!open) setDeleteTargetId(null); }}>
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("notes.deleteConfirm")}</DialogTitle>
            <DialogDescription>{t("notes.deleteConfirmDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteTargetId(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              {t("notes.cancel")}
            </button>
            <button
              onClick={confirmDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              {t("notes.delete")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
