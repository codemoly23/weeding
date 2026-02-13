import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "./invoice-template";
import type { InvoicePDFData } from "./invoice-template";
import React from "react";

export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(InvoiceDocument, { data }) as any;
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}

export type { InvoicePDFData };
