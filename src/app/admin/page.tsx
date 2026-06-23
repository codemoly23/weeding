import Link from "next/link";
import {
  DollarSign,
  Package,
  Users,
  MessageSquare,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Bell,
  ShoppingCart,
  UserPlus,
  AlertCircle,
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
import { StatCard } from "@/components/admin/stat-card";
import { T } from "@/components/i18n/text";
import { getBusinessConfig } from "@/lib/business-settings";
import { getCurrencySymbol } from "@/lib/currencies";
import prisma from "@/lib/db";

const statusColors: Record<string, string> = {
  PENDING:           "admin-status-neutral",
  PROCESSING:        "admin-status-info",
  IN_PROGRESS:       "admin-status-warning",
  WAITING_FOR_INFO:  "admin-status-warning",
  COMPLETED:         "admin-status-success",
  CANCELLED:         "admin-status-error",
  REFUNDED:          "admin-status-error",
  OPEN:              "admin-status-info",
  WAITING_FOR_CUSTOMER: "admin-status-warning",
  WAITING_FOR_AGENT: "admin-status-warning",
  RESOLVED:          "admin-status-success",
  CLOSED:            "admin-status-neutral",
};

const priorityColors: Record<string, string> = {
  LOW:    "admin-status-neutral",
  MEDIUM: "admin-status-info",
  HIGH:   "admin-status-error",
  URGENT: "admin-status-error",
};

const notificationIcons: Record<string, React.ElementType> = {
  NEW_ORDER:        ShoppingCart,
  NEW_VENDOR:       UserPlus,
  NEW_TICKET:       MessageSquare,
  PAYMENT_RECEIVED: CheckCircle,
  PAYMENT_FAILED:   AlertCircle,
  NEW_CUSTOMER:     Users,
  NEW_LEAD:         Bell,
};

const notificationColors: Record<string, string> = {
  NEW_ORDER:        "text-blue-500",
  NEW_VENDOR:       "text-purple-500",
  NEW_TICKET:       "text-orange-500",
  PAYMENT_RECEIVED: "text-green-500",
  PAYMENT_FAILED:   "text-red-500",
  NEW_CUSTOMER:     "text-indigo-500",
  NEW_LEAD:         "text-yellow-500",
};

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function AdminDashboardPage() {
  const businessConfig = await getBusinessConfig();
  const currencySymbol = getCurrencySymbol(businessConfig.currency);

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Parallel DB queries
  const [
    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth,
    ordersLastMonth,
    customersThisMonth,
    customersLastMonth,
    openTickets,
    openTicketsLastMonth,
    pendingOrdersCount,
    recentOrders,
    recentTickets,
    recentNotifications,
  ] = await Promise.all([
    // Revenue this month (paid orders) — use createdAt since paidAt may be null
    prisma.order.aggregate({
      _sum: { totalUSD: true },
      where: { paymentStatus: "PAID", createdAt: { gte: startOfThisMonth } },
    }),
    // Revenue last month
    prisma.order.aggregate({
      _sum: { totalUSD: true },
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
    }),
    // Orders this month
    prisma.order.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    // Orders last month
    prisma.order.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
    }),
    // New customers this month
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: startOfThisMonth } },
    }),
    // New customers last month
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
    }),
    // Open tickets now
    prisma.supportTicket.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_FOR_AGENT"] } },
    }),
    // Open tickets last month snapshot (created last month, not yet resolved)
    prisma.supportTicket.count({
      where: {
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
        status: { in: ["OPEN", "IN_PROGRESS", "WAITING_FOR_AGENT"] },
      },
    }),
    // Pending orders count for quick action
    prisma.order.count({ where: { status: "PENDING" } }),
    // Recent 5 orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalUSD: true,
        status: true,
        createdAt: true,
        items: { select: { name: true }, take: 1 },
      },
    }),
    // Recent 5 tickets
    prisma.supportTicket.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
        guestName: true,
        customer: { select: { name: true } },
      },
    }),
    // Recent 5 admin notifications
    prisma.adminNotification.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, type: true, title: true, message: true, link: true, isRead: true, createdAt: true },
    }),
  ]);

  const thisRevenue = Number(revenueThisMonth._sum.totalUSD ?? 0);
  const lastRevenue = Number(revenueLastMonth._sum.totalUSD ?? 0);

  const stats = {
    revenue:   { value: thisRevenue, change: pctChange(thisRevenue, lastRevenue) },
    orders:    { value: ordersThisMonth, change: pctChange(ordersThisMonth, ordersLastMonth) },
    customers: { value: customersThisMonth, change: pctChange(customersThisMonth, customersLastMonth) },
    tickets:   { value: openTickets, change: pctChange(openTickets, openTicketsLastMonth) },
  };

  function timeAgo(date: Date) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return <T k="common.time.secondsAgo" vars={{ count: String(diff) }} />;
    if (diff < 3600) return <T k="common.time.minutesAgo" vars={{ count: String(Math.floor(diff / 60)) }} />;
    if (diff < 86400) return <T k="common.time.hoursAgo" vars={{ count: String(Math.floor(diff / 3600)) }} />;
    return <T k="common.time.daysAgo" vars={{ count: String(Math.floor(diff / 86400)) }} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold"><T k="common.dashboard" /></h1>
          <p className="text-muted-foreground">
            <T k="admin.dashboard.welcome" />
          </p>
        </div>
        <Button asChild className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-hover)] text-[var(--admin-primary-fg)] border-0">
          <Link href="/admin/orders/new">
            <Package className="mr-2 h-4 w-4" />
            <T k="admin.dashboard.newOrder" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={<T k="admin.dashboard.revenueThisMonth" />}
          value={`${currencySymbol}${thisRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change={stats.revenue.change}
          changeLabel={<T k="admin.dashboard.vsLastMonth" />}
          icon={<DollarSign className="h-6 w-6" />}
          iconBg="bg-[var(--ast-success-bg)] text-[var(--ast-success-icon)]"
        />
        <StatCard
          title={<T k="admin.dashboard.ordersThisMonth" />}
          value={stats.orders.value}
          change={stats.orders.change}
          changeLabel={<T k="admin.dashboard.vsLastMonth" />}
          icon={<Package className="h-6 w-6" />}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatCard
          title={<T k="admin.dashboard.newCustomers" />}
          value={stats.customers.value}
          change={stats.customers.change}
          changeLabel={<T k="admin.dashboard.vsLastMonth" />}
          icon={<Users className="h-6 w-6" />}
          iconBg="bg-[var(--ast-hold-bg)] text-[var(--admin-primary)]"
        />
        <StatCard
          title={<T k="admin.dashboard.openTickets" />}
          value={stats.tickets.value}
          change={stats.tickets.change}
          changeLabel={<T k="admin.dashboard.vsLastMonth" />}
          icon={<MessageSquare className="h-6 w-6" />}
          iconBg="bg-[var(--ast-warning-bg)] text-[var(--ast-warning-icon)]"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle><T k="overview.quickActions" /></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 bg-gradient-to-br from-card to-[var(--ast-info-bg)] border-[var(--ast-info-border)] hover:border-[var(--ast-info-border)] hover:shadow-sm transition-all"
              asChild
            >
              <Link href="/admin/orders?status=PENDING">
                <Clock className="h-5 w-5" />
                <span><T k="admin.dashboard.pendingOrders" /></span>
                <Badge className="admin-status-info border-0">{pendingOrdersCount}</Badge>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 bg-gradient-to-br from-card to-[var(--ast-info-bg)] border-[var(--ast-info-border)] hover:border-[var(--ast-info-border)] hover:shadow-sm transition-all"
              asChild
            >
              <Link href="/admin/tickets?status=OPEN">
                <MessageSquare className="h-5 w-5" />
                <span><T k="admin.dashboard.openTickets" /></span>
                <Badge className="admin-status-info border-0">{openTickets}</Badge>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle><T k="admin.dashboard.recentOrders" /></CardTitle>
              <CardDescription><T k="admin.dashboard.latestOrders" /></CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                <T k="common.viewAll" /> <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6"><T k="admin.dashboard.noOrders" /></p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{order.orderNumber}</span>
                        <Badge variant="secondary" className={statusColors[order.status] ?? "admin-status-neutral"}>
                          <T k={`admin.status.${order.status}`} fallback={order.status.replace(/_/g, " ")} />
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName}
                        {order.items[0] && ` — ${order.items[0].name}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-sm">{currencySymbol}{Number(order.totalUSD).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(order.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle><T k="admin.dashboard.recentTickets" /></CardTitle>
              <CardDescription><T k="admin.dashboard.latestTickets" /></CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/tickets">
                <T k="common.viewAll" /> <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6"><T k="admin.dashboard.noTickets" /></p>
            ) : (
              <div className="space-y-4">
                {recentTickets.map((ticket) => {
                  const customerName = ticket.customer?.name ?? ticket.guestName ?? "Guest";
                  return (
                    <Link
                      key={ticket.id}
                      href={`/admin/tickets/${ticket.id}`}
                      className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.ticketNumber} — {customerName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="secondary" className={statusColors[ticket.status] ?? "admin-status-neutral"}>
                          <T k={`admin.status.${ticket.status}`} fallback={ticket.status.replace(/_/g, " ")} />
                        </Badge>
                        <Badge variant="secondary" className={priorityColors[ticket.priority] ?? "admin-status-neutral"}>
                          <T k={`admin.priority.${ticket.priority}`} fallback={ticket.priority} />
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity from AdminNotification */}
      <Card>
        <CardHeader>
          <CardTitle><T k="admin.dashboard.recentActivity" /></CardTitle>
          <CardDescription><T k="admin.dashboard.latestSystemEvents" /></CardDescription>
        </CardHeader>
        <CardContent>
          {recentNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6"><T k="admin.dashboard.noRecentActivity" /></p>
          ) : (
            <div className="space-y-4">
              {recentNotifications.map((n) => {
                const Icon = notificationIcons[n.type] ?? Bell;
                const iconColor = notificationColors[n.type] ?? "text-muted-foreground";
                return (
                  <div key={n.id} className="flex items-start gap-4">
                    <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? "font-medium" : ""}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="text-xs text-primary hover:underline shrink-0"
                      >
                        <T k="admin.dashboard.view" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
