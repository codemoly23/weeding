"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SendEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientEmail: string;
  recipientName: string;
}

export function SendEmailModal({
  open,
  onOpenChange,
  recipientEmail,
  recipientName,
}: SendEmailModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/customers/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          name: recipientName,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send email");
        return;
      }

      toast.success(`Email sent to ${recipientEmail}`);
      setSubject("");
      setMessage("");
      onOpenChange(false);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleOpenChange(value: boolean) {
    if (!sending) {
      if (!value) {
        setSubject("");
        setMessage("");
      }
      onOpenChange(value);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Send Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input value={`${recipientName} <${recipientEmail}>`} disabled />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              placeholder="Enter subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email-message">Message</Label>
            <Textarea
              id="email-message"
              placeholder="Write your message..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-hover)] text-[var(--admin-primary-fg)] border-0"
          >
            {sending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <><Mail className="mr-2 h-4 w-4" /> Send Email</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
