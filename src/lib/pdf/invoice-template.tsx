import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a2e",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a2e",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  businessName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  businessDetail: {
    fontSize: 9,
    color: "#666",
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#666",
    marginBottom: 3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#fff",
  },

  // Info section
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#999",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 10,
    marginBottom: 2,
  },
  infoTextBold: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },

  // Items table
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  tableHeaderText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableRowAlt: {
    backgroundColor: "#f8f9fa",
  },
  colNum: { width: "8%" },
  colName: { width: "42%" },
  colQty: { width: "12%", textAlign: "center" as const },
  colPrice: { width: "19%", textAlign: "right" as const },
  colTotal: { width: "19%", textAlign: "right" as const },
  cellText: {
    fontSize: 10,
  },
  cellDesc: {
    fontSize: 8,
    color: "#888",
    marginTop: 2,
  },

  // Totals
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 30,
  },
  totalsBox: {
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsDivider: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginVertical: 4,
  },
  totalsLabel: {
    fontSize: 10,
    color: "#666",
  },
  totalsValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 2,
    borderTopColor: "#1a1a2e",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
  },

  // Notes
  notesSection: {
    marginBottom: 30,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#999",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#666",
  },

  // Footer
  footer: {
    position: "absolute" as const,
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center" as const,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerText: {
    fontSize: 8,
    color: "#999",
    marginBottom: 2,
  },
});

const statusColors: Record<string, string> = {
  DRAFT: "#6b7280",
  SENT: "#3b82f6",
  PAID: "#22c55e",
  OVERDUE: "#ef4444",
  CANCELLED: "#9ca3af",
};

export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoicePDFData {
  invoiceNumber: string;
  status: string;
  createdAt: string;
  dueDate?: string | null;
  paidAt?: string | null;

  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerCountry?: string | null;

  // Business
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;

  // Items & totals
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  currencySymbol: string;

  // Optional
  orderNumber?: string | null;
  notes?: string | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount: number, symbol: string): string {
  return `${symbol}${amount.toFixed(2)}`;
}

export function InvoiceDocument({ data }: { data: InvoicePDFData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.businessName}>{data.businessName}</Text>
            {data.businessAddress && (
              <Text style={styles.businessDetail}>{data.businessAddress}</Text>
            )}
            {data.businessEmail && (
              <Text style={styles.businessDetail}>{data.businessEmail}</Text>
            )}
            {data.businessPhone && (
              <Text style={styles.businessDetail}>{data.businessPhone}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[data.status] || "#6b7280" },
              ]}
            >
              <Text style={styles.statusText}>{data.status}</Text>
            </View>
          </View>
        </View>

        {/* Bill To / Invoice Details */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Bill To</Text>
            <Text style={styles.infoTextBold}>{data.customerName}</Text>
            <Text style={styles.infoText}>{data.customerEmail}</Text>
            {data.customerPhone && (
              <Text style={styles.infoText}>{data.customerPhone}</Text>
            )}
            {data.customerCountry && (
              <Text style={styles.infoText}>{data.customerCountry}</Text>
            )}
          </View>
          <View style={[styles.infoBlock, { alignItems: "flex-end" as const }]}>
            <Text style={styles.infoLabel}>Invoice Details</Text>
            <Text style={styles.infoText}>
              Date: {formatDate(data.createdAt)}
            </Text>
            {data.dueDate && (
              <Text style={styles.infoText}>
                Due: {formatDate(data.dueDate)}
              </Text>
            )}
            {data.orderNumber && (
              <Text style={styles.infoText}>Order: {data.orderNumber}</Text>
            )}
            {data.paidAt && (
              <Text style={styles.infoText}>
                Paid: {formatDate(data.paidAt)}
              </Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colNum]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.colName]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>
              Amount
            </Text>
          </View>
          {data.items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={[styles.cellText, styles.colNum]}>{index + 1}</Text>
              <View style={styles.colName}>
                <Text style={styles.cellText}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.cellDesc}>{item.description}</Text>
                )}
              </View>
              <Text style={[styles.cellText, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.cellText, styles.colPrice]}>
                {formatCurrency(item.price, data.currencySymbol)}
              </Text>
              <Text style={[styles.cellText, styles.colTotal]}>
                {formatCurrency(item.total, data.currencySymbol)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(data.subtotal, data.currencySymbol)}
              </Text>
            </View>
            {data.discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text style={styles.totalsValue}>
                  -{formatCurrency(data.discount, data.currencySymbol)}
                </Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(data.total, data.currencySymbol)}{" "}
                {data.currency}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Thank you for your business!
          </Text>
          {data.businessEmail && (
            <Text style={styles.footerText}>
              Questions? Contact us at {data.businessEmail}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
