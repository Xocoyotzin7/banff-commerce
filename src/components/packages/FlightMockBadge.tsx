import { Badge } from "../../../components/ui/badge"

type FlightMockBadgeProps = {
  classType: string
  stops: number
}

export function FlightMockBadge({ classType, stops }: FlightMockBadgeProps) {
  return (
    <Badge className="rounded-full border border-border bg-surface/60 text-text">
      {classType} · {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`}
    </Badge>
  )
}
