// Re-export Prisma types for convenience
export type {
  User,
  UserRole,
  Service,
  Package,
  Order,
  OrderStatus,
  PaymentStatus,
  OrderItem,
  Document,
  DocumentType,
  DocumentStatus,
  Invoice,
  InvoiceStatus,
  Ticket,
  TicketStatus,
  TicketPriority,
  BlogPost,
  PostStatus,
  BlogCategory,
  Testimonial,
  FAQ,
  StateFee,
  Coupon,
  CouponType,
} from "@prisma/client";

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Search
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, string | string[]>;
}

// Auth
export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
}

// Service with packages
export interface ServiceWithPackages {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  icon?: string | null;
  image?: string | null;
  packages: {
    id: string;
    name: string;
    priceUSD: number;
    priceBDT?: number | null;
    features: string[];
    isPopular: boolean;
  }[];
}

// Order with items
export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalUSD: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  llcName?: string | null;
  llcState?: string | null;
  items: {
    id: string;
    name: string;
    quantity: number;
    priceUSD: number;
  }[];
  createdAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  pendingOrders: number;
  newCustomers: number;
  openTickets: number;
}

// State info for pricing
export interface StateInfo {
  code: string;
  name: string;
  llcFee: number;
  annualFee?: number;
  processingTime?: string;
  isPopular: boolean;
}
