"use client"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PeriodOption<T extends string> = {
  value: T
  label: string
  disabled?: boolean
}

type MonthOption = {
  month: string
  label: string
}

type PeriodPickerProps<T extends string> = {
  label?: string
  range: T
  rangeOptions: Array<PeriodOption<T>>
  selectedMonth: string | null
  availableMonths: MonthOption[]
  useRange: boolean
  onToggleRange: (value: boolean) => void
  onRangeChange: (value: T) => void
  onMonthChange: (value: string | null) => void
  isFetching?: boolean
  className?: string
}

export function PeriodPicker<T extends string>({
  label = "Periodo",
  range,
  rangeOptions,
  selectedMonth,
  availableMonths,
  useRange,
  onToggleRange,
  onRangeChange,
  onMonthChange,
  isFetching,
  className,
}: PeriodPickerProps<T>) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-3xl border border-border/70 bg-background/60 p-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{label}</div>
        <label className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <input
            type="checkbox"
            checked={useRange}
            onChange={(event) => onToggleRange(event.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
          />
          Usar rango de días
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {rangeOptions.map((option) => {
          const active = range === option.value
          return (
            <Button
              key={option.value}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              disabled={option.disabled || (!useRange && option.value !== "month")}
              className={cn(
                "rounded-full px-4",
                active && "shadow-[0_0_0_1px_rgba(10,110,110,0.28),0_10px_30px_-14px_rgba(10,110,110,0.45)]",
                isFetching && active && "opacity-80",
              )}
              onClick={() => onRangeChange(option.value)}
            >
              <span
                className={cn(
                  "mr-2 inline-flex h-2.5 w-2.5 rounded-full border border-current/40",
                  active ? "bg-current" : "bg-transparent",
                )}
              />
              {option.label}
            </Button>
          )
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          Mes
          <div className="relative flex-1 min-w-0">
            <select
              value={selectedMonth ?? ""}
              onChange={(event) => onMonthChange(event.target.value || null)}
              disabled={useRange || availableMonths.length === 0}
              className="w-full appearance-none rounded-2xl border border-border/70 bg-background px-4 py-3 pr-10 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">{availableMonths.length ? "Selecciona mes" : "Sin meses disponibles"}</option>
              {availableMonths.map((month) => (
                <option key={month.month} value={month.month}>
                  {month.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </label>

        <div className="text-xs text-muted-foreground">
          {!useRange && selectedMonth ? `Vista mensual: ${selectedMonth}` : "Vista de periodo con gráficos y exportación"}
        </div>
      </div>
    </div>
  )
}
