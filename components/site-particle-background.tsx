import { DotBackground } from "@banff/agency-core/components/shared/DotBackground"
import type { ThemeMode } from "@/lib/theme"

type SiteParticleBackgroundProps = {
  theme: ThemeMode
}

export function SiteParticleBackground({ theme }: SiteParticleBackgroundProps) {
  const isDark = theme === "dark"

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <DotBackground
        className="opacity-100 mix-blend-soft-light"
        quantity={320}
        speed={0.168}
        accentRatio={0.24}
        baseColor={isDark ? "240, 237, 228" : "83, 72, 63"}
        accentColor={isDark ? "10, 110, 110" : "232, 93, 38"}
        opacity={isDark ? 0.72 : 0.92}
      />
    </div>
  )
}
