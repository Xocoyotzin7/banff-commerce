"use client"

import { ImageDown } from "lucide-react"
import { useState, type RefObject } from "react"

import { Button } from "@/components/ui/button"
import { downloadElementAsPng } from "@/lib/admin/chart-export"
import { cn } from "@/lib/utils"

type ChartPngButtonProps = {
  targetRef: RefObject<HTMLElement | null>
  filename: string
  className?: string
}

export function ChartPngButton({ targetRef, filename, className }: ChartPngButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    const element = targetRef.current
    if (!element || isExporting) {
      return
    }

    setIsExporting(true)
    try {
      await downloadElementAsPng(element, filename)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("rounded-full px-3", className)}
      onClick={() => void handleExport()}
      disabled={isExporting}
      data-png-ignore="true"
      aria-label={`Descargar ${filename} en PNG`}
    >
      <ImageDown className="mr-2 h-4 w-4" />
      {isExporting ? "PNG..." : "PNG"}
    </Button>
  )
}
