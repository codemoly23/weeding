"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Loader2,
  Receipt,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { getCurrencySymbol } from "@/lib/currencies";
import { format } from "date-fns";
import { useLanguage } from "@/lib/i18n/language-context";

interface Invoice {
  id: string;
  invoiceNumber: string;
  serviceName: string | null;
  subtotal: string;
  discount: string;
  total: string;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  order: {
    orderNumber: string;
    paymentStatus: string;
  } | null;
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
  PAID: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
  FAILED: "bg-[var(--color-error-bg)] text-[var(--color-error-text)]",
  REFUNDED: "bg-muted text-muted-foreground",
  PARTIALLY_REFUNDED: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
};

export default function CustomerInvoicesPage() {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, configRes] = await Promise.all([
          fetch("/api/dashboard/invoices"),
          fetch("/api/business-config"),
        ]);

        if (invoicesRes.ok) {
          const data = await invoicesRes.json();
          setInvoices(data.invoices || []);
        }

        if (configRes.ok) {
          const config = await configRes.json();
          if (config.currency) setCurrencySymbol(getCurrencySymbol(config.currency));
        }
      } catch {
        toast.error(t("dashboard.invoices.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6" />
          {t("dashboard.invoices.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.invoices.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.invoices.history")}</CardTitle>
          <CardDescription>
            {t("dashboard.invoices.count", { count: String(invoices.length) })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">{t("dashboard.invoices.empty")}</p>
              <p className="text-sm">{t("dashboard.invoices.emptyDesc")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboard.invoices.invoiceNumber")}</TableHead>
                  <TableHead>{t("admin.orders.service")}</TableHead>
                  <TableHead className="text-right">{t("admin.orders.amount")}</TableHead>
                  <TableHead className="text-right">{t("admin.payment.PAID")}</TableHead>
                  <TableHead className="text-right">{t("dashboard.invoices.due")}</TableHead>
                  <TableHead>{t("admin.orders.status")}</TableHead>
                  <TableHead>{t("admin.orders.date")}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const total = parseFloat(invoice.total);
                  const paymentStatus = invoice.order?.paymentStatus || "PENDING";
                  const paid = paymentStatus === "PAID" ? total : 0;
                  const due = total - paid;

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {invoice.serviceName || "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {currencySymbol}{total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-[var(--color-success-text)]">
                        {currencySymbol}{paid.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {due > 0 ? (
                          <span className="text-[var(--color-error-text)]">{currencySymbol}{due.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">{currencySymbol}0.00</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={paymentStatusColors[paymentStatus] || "bg-muted text-muted-foreground"}
                          variant="secondary"
                        >
                          {t(`admin.payment.${paymentStatus}`) || paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, "_blank")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
