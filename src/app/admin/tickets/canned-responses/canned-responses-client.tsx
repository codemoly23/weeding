"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  FolderOpen,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";

interface CannedResponsesClientProps {
  pluginName?: string;
  tier?: string | null;
  features: string[];
}

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  shortcut: string | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockResponses: CannedResponse[] = [
  {
    id: "1",
    title: "Greeting - Welcome",
    content: "Hello! Thank you for reaching out to our support team. How can I help you today?",
    category: "greetings",
    shortcut: "/hello",
    usageCount: 245,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    title: "Request More Info",
    content: "Thank you for contacting us. To better assist you, could you please provide more details about the issue you're experiencing?\n\n- What were you trying to do?\n- When did this issue start?\n- Are there any error messages?",
    category: "general",
    shortcut: "/moreinfo",
    usageCount: 189,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "3",
    title: "Ticket Resolved",
    content: "I'm glad I could help resolve your issue! If you have any other questions in the future, don't hesitate to reach out. Have a great day!",
    category: "closing",
    shortcut: "/resolved",
    usageCount: 312,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-12T00:00:00Z",
  },
  {
    id: "4",
    title: "Password Reset Instructions",
    content: "To reset your password:\n\n1. Go to the login page\n2. Click \"Forgot Password\"\n3. Enter your email address\n4. Check your inbox for the reset link\n5. Follow the link to create a new password\n\nThe reset link expires in 24 hours. Let me know if you need further assistance!",
    category: "technical",
    shortcut: "/password",
    usageCount: 156,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-08T00:00:00Z",
  },
  {
    id: "5",
    title: "Refund Policy",
    content: "Thank you for your inquiry about our refund policy.\n\nWe offer a 30-day money-back guarantee on all purchases. To request a refund:\n\n1. Log into your account\n2. Go to Order History\n3. Select the order and click \"Request Refund\"\n\nRefunds are typically processed within 5-7 business days.\n\nIs there anything else I can help you with?",
    category: "billing",
    shortcut: "/refund",
    usageCount: 98,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-09T00:00:00Z",
  },
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "greetings", label: "Greetings" },
  { value: "general", label: "General" },
  { value: "technical", label: "Technical" },
  { value: "billing", label: "Billing" },
  { value: "closing", label: "Closing" },
];

const categoryColors: Record<string, string> = {
  greetings: "bg-green-100 text-green-700",
  general: "bg-blue-100 text-blue-700",
  technical: "bg-purple-100 text-purple-700",
  billing: "bg-amber-100 text-amber-700",
  closing: "bg-gray-100 text-gray-700",
};

export function CannedResponsesClient({
  pluginName,
  tier,
  features,
}: CannedResponsesClientProps) {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<CannedResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    shortcut: "",
  });

  const fetchResponses = useCallback(async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setResponses(mockResponses);
    } catch (error) {
      toast.error("Failed to load responses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  const handleCreate = () => {
    setSelectedResponse(null);
    setFormData({ title: "", content: "", category: "general", shortcut: "" });
    setEditDialogOpen(true);
  };

  const handleEdit = (response: CannedResponse) => {
    setSelectedResponse(response);
    setFormData({
      title: response.title,
      content: response.content,
      category: response.category,
      shortcut: response.shortcut || "",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (response: CannedResponse) => {
    setSelectedResponse(response);
    setDeleteDialogOpen(true);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (selectedResponse) {
        setResponses((prev) =>
          prev.map((r) =>
            r.id === selectedResponse.id
              ? { ...r, ...formData, updatedAt: new Date().toISOString() }
              : r
          )
        );
        toast.success("Response updated");
      } else {
        const newResponse: CannedResponse = {
          id: String(Date.now()),
          ...formData,
          shortcut: formData.shortcut || null,
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setResponses((prev) => [newResponse, ...prev]);
        toast.success("Response created");
      }

      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save response");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedResponse) return;

    try {
      setResponses((prev) => prev.filter((r) => r.id !== selectedResponse.id));
      toast.success("Response deleted");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete response");
    }
  };

  const filteredResponses = responses.filter((response) => {
    if (categoryFilter !== "all" && response.category !== categoryFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        response.title.toLowerCase().includes(query) ||
        response.content.toLowerCase().includes(query) ||
        response.shortcut?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Canned Responses
            {tier && <Badge variant="outline" className="ml-2">{tier}</Badge>}
          </h1>
          <p className="text-muted-foreground">
            Pre-written response templates for quick replies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchResponses}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Response
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search responses..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <FolderOpen className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Responses List */}
      <div className="grid gap-4">
        {filteredResponses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No responses found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first canned response to get started"}
              </p>
              {!searchQuery && categoryFilter === "all" && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Response
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredResponses.map((response) => (
            <Card key={response.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{response.title}</h3>
                      <Badge className={categoryColors[response.category]}>
                        {response.category}
                      </Badge>
                      {response.shortcut && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {response.shortcut}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                      {response.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Used {response.usageCount} times
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(response.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(response)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(response.content)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(response)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedResponse ? "Edit Response" : "Create Response"}
            </DialogTitle>
            <DialogDescription>
              {selectedResponse
                ? "Update this canned response"
                : "Create a new pre-written response template"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Greeting - Welcome"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c.value !== "all").map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortcut">Shortcut</Label>
                <Input
                  id="shortcut"
                  value={formData.shortcut}
                  onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                  placeholder="/shortcut"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter your response text..."
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use placeholders like {"{{customerName}}"} for dynamic content
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {selectedResponse ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Response?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedResponse?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
