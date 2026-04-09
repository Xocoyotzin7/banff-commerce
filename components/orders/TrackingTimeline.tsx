"use client"

import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type TimelineStepState = "completed" | "current" | "future"

export type TimelineStep = {
  label: string
  timestamp?: string | null
  details?: string | null
  state: TimelineStepState
}

type TrackingTimelineProps = {
  steps: TimelineStep[]
  country: "MX" | "CA"
}

function getAccent(country: "MX" | "CA") {
  return country === "MX" ? "var(--primary)" : "var(--color-blue)"
}

function getTone(country: "MX" | "CA") {
  return country === "MX" ? "text-[color:var(--primary)]" : "text-[color:var(--color-blue)]"
}

export function TrackingTimeline({ steps, country }: TrackingTimelineProps) {
  const accent = getAccent(country)
  const tone = getTone(country)

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const completed = step.state === "completed"
        const current = step.state === "current"
        const future = step.state === "future"

        return (
          <li key={`${step.label}-${index}`} className="relative pl-10">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-4 top-0 h-full w-px",
                  steps[index - 1].state === "future" ? "bg-border" : "",
                )}
                style={{
                  backgroundColor: steps[index - 1].state === "future" ? undefined : accent,
                  opacity: steps[index - 1].state === "completed" || steps[index - 1].state === "current" ? 0.75 : 0.3,
                }}
              />
            ) : null}

            <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center">
              <span
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200",
                  completed ? "border-transparent text-white shadow-sm" : "",
                  current ? "border-transparent bg-transparent" : "",
                  future ? "border-border bg-background" : "",
                )}
                style={
                  completed
                    ? { backgroundColor: accent }
                    : current
                      ? { borderColor: accent, boxShadow: `0 0 0 4px color-mix(in srgb, ${accent} 18%, transparent)` }
                      : undefined
                }
              >
                {completed ? (
                  <Check className="h-4 w-4" />
                ) : current ? (
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full animate-pulse"
                    style={{ backgroundColor: accent, boxShadow: `0 0 0 8px color-mix(in srgb, ${accent} 24%, transparent)` }}
                  />
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
            </span>

            <div className="space-y-1">
              <p className={cn("font-medium", current || completed ? tone : "text-foreground")}>{step.label}</p>
              {step.timestamp ? <p className="text-sm text-muted-foreground">{step.timestamp}</p> : null}
              {step.details ? <p className="text-sm text-muted-foreground">{step.details}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
