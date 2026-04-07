"use client"

import type { ReactNode, RefObject } from "react"

import { ChartPngButton } from "@/components/admin/charts/ChartPngButton"
import { cn } from "@/lib/utils"

type ChartHoverDownloadAreaProps = {
  targetRef: RefObject<HTMLElement | null>
  filename: string
  children: ReactNode
  className?: string
}

export function ChartHoverDownloadArea({ targetRef, filename, children, className }: ChartHoverDownloadAreaProps) {
  return (
    <div className={cn("group relative", className)}>
      <div className="h-full w-full">{children}</div>

      <div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] opacity-0 transition-all duration-300 ease-out group-hover:opacity-100"
        data-png-ignore="true"
      >
        <div className="pointer-events-auto flex max-w-[18rem] flex-col items-center gap-3 rounded-3xl border border-white/10 bg-background/80 px-5 py-4 text-center shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Descargar gráfica</p>
            <p className="text-xs leading-5 text-muted-foreground">Se exporta el periodo seleccionado para esta tarjeta.</p>
          </div>
          <ChartPngButton targetRef={targetRef} filename={filename} />
        </div>
      </div>
    </div>
  )
}
