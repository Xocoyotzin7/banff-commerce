import Link from "next/link"
import { Github, Mail, Send, Phone } from "lucide-react"

import { getSiteCopy, type Locale } from "@/lib/site-content"
import { MinimalWhatsappIcon } from "@/components/icons/minimal-whatsapp-icon"

type SiteFooterProps = {
  locale: Locale
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const copy = getSiteCopy(locale)
  const hasMultipleTelegrams = copy.contact.telegrams.length > 1
  const hasMultipleEmails = copy.contact.emails.length > 1
  const normalizeExternalHref = (href: string) => (href.startsWith("http") ? href : `https://${href}`)
  const digitsOnlyPhone = copy.contact.phone.replace(/[^+\d]/g, "")
  const whatsappHref = `https://wa.me/${copy.contact.whatsapp.replace(/[^+\d]/g, "").replace(/^\+/, "")}`
  const contactItems = [
    {
      href: `mailto:${copy.contact.emails[0]}`,
      label: `Email${hasMultipleEmails ? " (main)" : ""}`,
      icon: Mail,
      external: false,
    },
    {
      href: `tel:${digitsOnlyPhone}`,
      label: "Call",
      icon: Phone,
      external: false,
    },
    {
      href: whatsappHref,
      label: "WhatsApp",
      icon: MinimalWhatsappIcon,
      external: true,
    },
    {
      href: normalizeExternalHref(copy.contact.telegrams[0]),
      label: `Telegram${hasMultipleTelegrams ? " (main)" : ""}`,
      icon: Send,
      external: true,
    },
    ...(hasMultipleEmails
      ? [
          {
            href: `mailto:${copy.contact.emails[1]}`,
            label: "Email",
            icon: Mail,
            external: false,
          },
        ]
      : []),
    ...(hasMultipleTelegrams
      ? [
          {
            href: normalizeExternalHref(copy.contact.telegrams[1]),
            label: "Telegram",
            icon: Send,
            external: true,
          },
        ]
      : []),
    {
      href: "https://github.com/driano7",
      label: "GitHub",
      icon: Github,
      external: true,
    },
  ]

  return (
    <footer className="relative mt-8 border-t border-black/10 bg-white/75 backdrop-blur-xl dark:bg-black/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
          {contactItems.map((item) => {
            const Icon = item.icon
            const chip = (
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-foreground transition-colors hover:border-[color:var(--accent)]/30 hover:text-[color:var(--accent)] dark:border-white/10 dark:bg-white/5 dark:text-white/90">
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </span>
            )

            return item.external ? (
              <Link key={item.href} href={item.href} target="_blank" rel="noreferrer">
                {chip}
              </Link>
            ) : (
              <a key={item.href} href={item.href}>
                {chip}
              </a>
            )
          })}
        </div>

        <div className="flex justify-center">
          <a
            href="https://riano.netlify.app"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-[color:var(--accent)]"
          >
            {copy.footer.credit}
          </a>
        </div>

        <div className="flex flex-col gap-2 border-t border-black/5 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-foreground">{copy.brand.name}</p>
          <p>© 2026 {copy.footer.rights}</p>
        </div>
      </div>
    </footer>
  )
}
