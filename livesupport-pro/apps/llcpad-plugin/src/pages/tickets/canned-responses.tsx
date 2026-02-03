"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  MessageCircle,
  FolderOpen,
  MoreHorizontal,
  Check,
} from "lucide-react";

// Types
interface CannedResponse {
  id: string;
  title: string;
  content: string;
  shortcut: string;
  category: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockResponses: CannedResponse[] = [
  {
    id: "1",
    title: "Greeting - General",
    content: "Hello! Thank you for contacting our support team. How can I assist you today?",
    shortcut: "/greet",
    category: "Greetings",
    usageCount: 245,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "LLC Processing Time",
    content: "LLC formation typically takes 3-5 business days for standard processing. We also offer expedited options if you need faster turnaround. Would you like more information about our processing times?",
    shortcut: "/llctime",
    category: "LLC Formation",
    usageCount: 189,
    createdAt: "2024-01-02",
    updatedAt: "2024-01-14",
  },
  {
    id: "3",
    title: "EIN Application Status",
    content: "I'd be happy to help you check your EIN application status. Could you please provide your order number or the email address used during registration?",
    shortcut: "/ein",
    category: "EIN",
    usageCount: 156,
    createdAt: "2024-01-03",
    updatedAt: "2024-01-13",
  },
  {
    id: "4",
    title: "Payment Issue",
    content: "I understand you're experiencing a payment issue. Let me look into this for you. Could you please confirm the last 4 digits of the card used and the date of the transaction?",
    shortcut: "/payment",
    category: "Billing",
    usageCount: 134,
    createdAt: "2024-01-04",
    updatedAt: "2024-01-12",
  },
  {
    id: "5",
    title: "Closing - Resolved",
    content: "I'm glad I could help resolve your issue today! If you have any more questions in the future, please don't hesitate to reach out. Have a great day!",
    shortcut: "/bye",
    category: "Closings",
    usageCount: 298,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-11",
  },
];

const categories = ["All", "Greetings", "LLC Formation", "EIN", "Billing", "Closings"];

export default function CannedResponsesPage() {
  const [responses, setResponses] = useState<CannedResponse[]>(mockResponses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter responses
  const filteredResponses = responses.filter((response) => {
    const matchesSearch =
      response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.shortcut.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || response.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Copy to clipboard
  const handleCopy = (response: CannedResponse) => {
    navigator.clipboard.writeText(response.content);
    setCopiedId(response.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete response
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this response?")) {
      setResponses(responses.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Canned Responses</h1>
          <p className="text-muted-foreground">
            Create and manage quick response templates
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Response
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search responses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border bg-background pl-9 pr-4 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{responses.length}</p>
              <p className="text-sm text-muted-foreground">Total Responses</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
              <Copy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {responses.reduce((acc, r) => acc + r.usageCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Uses</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
              <FolderOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length - 1}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Responses Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResponses.map((response) => (
          <div
            key={response.id}
            className="rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium">{response.title}</h3>
                <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {response.shortcut}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(response)}
                  className="rounded-md p-1.5 hover:bg-accent"
                  title="Copy to clipboard"
                >
                  {copiedId === response.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  className="rounded-md p-1.5 hover:bg-accent"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(response.id)}
                  className="rounded-md p-1.5 hover:bg-accent"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {response.content}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="bg-muted px-2 py-0.5 rounded">{response.category}</span>
              <span>Used {response.usageCount} times</span>
            </div>
          </div>
        ))}
      </div>

      {filteredResponses.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No canned responses found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-primary hover:underline"
          >
            Create your first response
          </button>
        </div>
      )}

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-lg mx-4">
            <h2 className="text-lg font-semibold mb-4">Add New Response</h2>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  placeholder="Response title"
                  className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Shortcut</label>
                <input
                  type="text"
                  placeholder="/shortcut"
                  className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm">
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea
                  rows={4}
                  placeholder="Response content..."
                  className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                >
                  Save Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
