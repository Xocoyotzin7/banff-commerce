import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KPICardProps = {
  label: string
  value: string | number
  trend: number | null
  trendLabel: string
}

export function KPICard({ label, value, trend, trendLabel }: KPICardProps) {
  const isPositive = trend !== null && trend > 0
  const isNegative = trend !== null && trend < 0
  const displayValue =
    typeof value === "number"
      ? label.toLowerCase().includes("sales") || label.toLowerCase().includes("ticket")
        ? `$${value.toLocaleString("es-MX")}`
        : value.toLocaleString("es-MX")
      : value

  return (
    <Card className="gap-0 border-border/70 bg-card/90 shadow-sm">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </div>
        <div className="text-2xl font-semibold tracking-tight tabular-nums">
          {displayValue}
        </div>
        <div
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            isPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            isNegative && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            !isPositive && !isNegative && "bg-muted text-muted-foreground",
          )}
        >
          {trend === null ? <Minus className="h-3.5 w-3.5" /> : isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          <span>{trend === null ? "Sin comparación" : `${trend > 0 ? "+" : ""}${trend}%`}</span>
        </div>
        <p className="text-xs text-muted-foreground">{trendLabel}</p>
      </CardContent>
    </Card>
  )
}
