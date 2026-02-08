'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LicenseData {
  id: string;
  licenseKey: string;
  status: string;
  tier: string;
  customerEmail: string;
  customerName: string | null;
  domainLockMode: string;
  maxDomains: number;
  expiresAt: string | null;
  supportExpiresAt: string | null;
  features: string[];
  notes: string | null;
  orderId: string | null;
  orderSource: string | null;
  purchasedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    tiers: {
      tier: string;
      name: string;
      price: number;
      maxDomains: number;
      features: string[];
      supportMonths: number;
    }[];
  };
  activations: { id: string; domain: string; isActive: boolean }[];
}

const statusOptions = ['ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED', 'REFUNDED'] as const;
const tierOptions = ['STANDARD', 'PROFESSIONAL', 'ENTERPRISE', 'DEVELOPER'] as const;

const tierLabels: Record<string, string> = {
  STANDARD: 'Standard',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
  DEVELOPER: 'Developer',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-yellow-100 text-yellow-800',
  REVOKED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

// All possible features for LiveSupport Pro
const ALL_FEATURES = [
  'chat',
  'tickets',
  'email-support',
  'ai-responses',
  'analytics',
  'white-label',
  'priority-support',
  'source-code',
  'resale-rights',
];

export default function EditLicensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [license, setLicense] = useState<LicenseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    status: '',
    tier: '',
    customerEmail: '',
    customerName: '',
    domainLockMode: '',
    maxDomains: 1,
    expiresAt: '',
    supportExpiresAt: '',
    features: [] as string[],
    notes: '',
    orderId: '',
    orderSource: '',
  });

  const fetchLicense = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/licenses/${id}`);
      if (!response.ok) throw new Error('License not found');
      const data = await response.json();
      setLicense(data);

      // Populate form
      setFormData({
        status: data.status,
        tier: data.tier,
        customerEmail: data.customerEmail,
        customerName: data.customerName || '',
        domainLockMode: data.domainLockMode,
        maxDomains: data.maxDomains,
        expiresAt: data.expiresAt ? data.expiresAt.split('T')[0] : '',
        supportExpiresAt: data.supportExpiresAt ? data.supportExpiresAt.split('T')[0] : '',
        features: data.features || [],
        notes: data.notes || '',
        orderId: data.orderId || '',
        orderSource: data.orderSource || '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLicense();
  }, [fetchLicense]);

  // When tier changes, auto-update features and maxDomains from product tier config
  const handleTierChange = (newTier: string) => {
    setFormData((prev) => {
      const tierConfig = license?.product.tiers.find((t) => t.tier === newTier);
      return {
        ...prev,
        tier: newTier,
        features: tierConfig?.features || prev.features,
        maxDomains: tierConfig?.maxDomains || prev.maxDomains,
      };
    });
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  // Compute changes for preview
  const getChanges = () => {
    if (!license) return [];
    const changes: { field: string; from: string; to: string }[] = [];

    if (formData.status !== license.status) {
      changes.push({ field: 'Status', from: license.status, to: formData.status });
    }
    if (formData.tier !== license.tier) {
      changes.push({ field: 'Tier', from: tierLabels[license.tier], to: tierLabels[formData.tier] });
    }
    if (formData.customerEmail !== license.customerEmail) {
      changes.push({ field: 'Email', from: license.customerEmail, to: formData.customerEmail });
    }
    if (formData.customerName !== (license.customerName || '')) {
      changes.push({ field: 'Name', from: license.customerName || 'N/A', to: formData.customerName || 'N/A' });
    }
    if (formData.domainLockMode !== license.domainLockMode) {
      changes.push({ field: 'Domain Lock', from: license.domainLockMode, to: formData.domainLockMode });
    }
    if (formData.maxDomains !== license.maxDomains) {
      changes.push({ field: 'Max Domains', from: String(license.maxDomains), to: String(formData.maxDomains) });
    }
    const origExpiry = license.expiresAt ? license.expiresAt.split('T')[0] : '';
    if (formData.expiresAt !== origExpiry) {
      changes.push({ field: 'Expires', from: origExpiry || 'Never', to: formData.expiresAt || 'Never' });
    }
    const origSupport = license.supportExpiresAt ? license.supportExpiresAt.split('T')[0] : '';
    if (formData.supportExpiresAt !== origSupport) {
      changes.push({ field: 'Support Expires', from: origSupport || 'N/A', to: formData.supportExpiresAt || 'N/A' });
    }
    const origFeatures = (license.features || []).sort().join(', ');
    const newFeatures = formData.features.sort().join(', ');
    if (origFeatures !== newFeatures) {
      changes.push({ field: 'Features', from: origFeatures, to: newFeatures });
    }
    if (formData.notes !== (license.notes || '')) {
      changes.push({ field: 'Notes', from: 'changed', to: 'updated' });
    }

    return changes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {};

      // Only send changed fields
      if (formData.status !== license?.status) payload.status = formData.status;
      if (formData.tier !== license?.tier) payload.tier = formData.tier;
      if (formData.customerEmail !== license?.customerEmail) payload.customerEmail = formData.customerEmail;
      if (formData.customerName !== (license?.customerName || '')) payload.customerName = formData.customerName || null;
      if (formData.domainLockMode !== license?.domainLockMode) payload.domainLockMode = formData.domainLockMode;
      if (formData.maxDomains !== license?.maxDomains) payload.maxDomains = formData.maxDomains;

      // Date fields
      const origExpiry = license?.expiresAt ? license.expiresAt.split('T')[0] : '';
      if (formData.expiresAt !== origExpiry) {
        payload.expiresAt = formData.expiresAt
          ? new Date(formData.expiresAt + 'T23:59:59.999Z').toISOString()
          : null;
      }
      const origSupport = license?.supportExpiresAt ? license.supportExpiresAt.split('T')[0] : '';
      if (formData.supportExpiresAt !== origSupport) {
        payload.supportExpiresAt = formData.supportExpiresAt
          ? new Date(formData.supportExpiresAt + 'T23:59:59.999Z').toISOString()
          : null;
      }

      // Features - always send if changed
      const origFeatures = (license?.features || []).sort().join(',');
      const newFeatures = formData.features.sort().join(',');
      if (origFeatures !== newFeatures) {
        payload.features = formData.features;
      }

      if (formData.notes !== (license?.notes || '')) payload.notes = formData.notes || null;
      if (formData.orderId !== (license?.orderId || '')) payload.orderId = formData.orderId || null;
      if (formData.orderSource !== (license?.orderSource || '')) payload.orderSource = formData.orderSource || null;

      // Nothing changed
      if (Object.keys(payload).length === 0) {
        router.push(`/admin/licenses/${id}`);
        return;
      }

      const response = await fetch(`/api/licenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update license');
      }

      router.push(`/admin/licenses/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changes = getChanges();
  const activeActivations = license?.activations.filter((a) => a.isActive).length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !license) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
        <Link href="/admin/licenses">
          <Button variant="outline">Back to Licenses</Button>
        </Link>
      </div>
    );
  }

  if (!license) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/licenses/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Edit License</h2>
          <p className="text-muted-foreground font-mono text-sm">
            {license.licenseKey}
          </p>
        </div>
        <Badge className={statusColors[license.status]}>{license.status}</Badge>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* License Info (read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>License Info</CardTitle>
              <CardDescription>Read-only fields that cannot be changed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">License Key</p>
                  <p className="font-mono text-sm font-medium">{license.licenseKey}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{license.product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(license.purchasedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Tier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>License Tier</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {license.product.tiers.map((tier) => (
                    <div
                      key={tier.tier}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        formData.tier === tier.tier
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleTierChange(tier.tier)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tier.name}</span>
                        <span className="text-lg font-bold">${tier.price}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tier.maxDomains === 999 ? 'Unlimited' : tier.maxDomains} domains
                        {' \u2022 '}
                        {tier.supportMonths === 999 ? 'Lifetime' : `${tier.supportMonths}mo`} support
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>Features</Label>
                <p className="text-xs text-muted-foreground">
                  Auto-populated from tier. Toggle to override.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_FEATURES.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                        formData.features.includes(feature)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Domain Lock Mode</Label>
                  <Select
                    value={formData.domainLockMode}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, domainLockMode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOCKED">Locked</SelectItem>
                      <SelectItem value="UNLOCKED">Unlocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDomains">Max Domains</Label>
                  <Input
                    id="maxDomains"
                    type="number"
                    min={1}
                    max={999}
                    value={formData.maxDomains}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxDomains: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
              </div>
              {activeActivations > 0 && formData.maxDomains < activeActivations && (
                <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Currently {activeActivations} domain{activeActivations > 1 ? 's' : ''} active.
                    Reducing below this won&apos;t auto-deactivate existing domains.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customerName: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={formData.orderId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, orderId: e.target.value }))
                    }
                    placeholder="envato-12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order Source</Label>
                  <Select
                    value={formData.orderSource || 'none'}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, orderSource: value === 'none' ? '' : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="ENVATO">CodeCanyon</SelectItem>
                      <SelectItem value="GUMROAD">Gumroad</SelectItem>
                      <SelectItem value="STRIPE">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">License Expiration</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for lifetime license
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportExpiresAt">Support Expiration</Label>
                  <Input
                    id="supportExpiresAt"
                    type="date"
                    value={formData.supportExpiresAt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, supportExpiresAt: e.target.value }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Internal notes about this license..."
              />
            </CardContent>
          </Card>

          {/* Changes Preview */}
          {changes.length > 0 && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-base">Changes Preview</CardTitle>
                <CardDescription>{changes.length} field{changes.length > 1 ? 's' : ''} modified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {changes.map((change) => (
                    <div key={change.field} className="flex items-center gap-2">
                      <span className="font-medium min-w-[120px]">{change.field}:</span>
                      <span className="text-red-600 line-through">{change.from}</span>
                      <span className="text-muted-foreground">&rarr;</span>
                      <span className="text-green-600">{change.to}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/admin/licenses/${id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving || changes.length === 0}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
