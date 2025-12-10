import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg = "bg-primary/10 text-primary",
}: StatCardProps) {
  const isPositive = change && change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              iconBg
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
