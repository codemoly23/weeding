"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface OrderItem {
  name: string;
  description: string;
  priceUSD: string;
  quantity: string;
}

const emptyItem = (): OrderItem => ({ name: "", description: "", priceUSD: "", quantity: "1" });

export default function NewOrderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCountry, setCustomerCountry] = useState("");

  // Order meta
  const [status, setStatus] = useState("PENDING");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [currency, setCurrency] = useState("USD");
  const [note, setNote] = useState("");

  // Items
  const [items, setItems] = useState<OrderItem[]>([emptyItem()]);

  const updateItem = (index: number, field: keyof OrderItem, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.priceUSD) || 0;
    const qty = parseInt(item.quantity) || 1;
    return sum + price * qty;
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate items
    for (const item of items) {
      if (!item.name.trim()) {
        toast.error("All items must have a name");
        return;
      }
      if (!item.priceUSD || parseFloat(item.priceUSD) < 0) {
        toast.error("All items must have a valid price");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          customerCountry: customerCountry || undefined,
          status,
          paymentStatus,
          currency,
          note: note || undefined,
          items: items.map((item) => ({
            name: item.name,
            description: item.description || undefined,
            priceUSD: parseFloat(item.priceUSD) || 0,
            quantity: parseInt(item.quantity) || 1,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create order");
        return;
      }

      toast.success(`Order ${data.orderNumber} created successfully`);
      router.push(`/admin/orders/${data.orderId}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Order</h1>
          <p className="text-sm text-muted-foreground">Create a manual order for a customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Information</CardTitle>
            <CardDescription>Enter the customer&apos;s contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerEmail">Email <span className="text-destructive">*</span></Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="jane@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+46 70 000 0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerCountry">Country</Label>
              <Input
                id="customerCountry"
                value={customerCountry}
                onChange={(e) => setCustomerCountry(e.target.value)}
                placeholder="SE"
                maxLength={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Order Items</CardTitle>
              <CardDescription>Add the services or products being ordered</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Item Name <span className="text-destructive">*</span></Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      placeholder="e.g. Premium Wedding Package"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price (USD) <span className="text-destructive">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.priceUSD}
                      onChange={(e) => updateItem(index, "priceUSD", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Separator />
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">${subtotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Order Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="WAITING_FOR_INFO">Waiting for Info</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SEK">SEK</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Internal Note */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Internal Note</CardTitle>
            <CardDescription>Optional note visible only to admins</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any relevant notes about this order..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/orders">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-hover)] text-[var(--admin-primary-fg)] border-0"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
