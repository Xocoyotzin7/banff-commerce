"use client"

import type { CSSProperties } from "react"
import { ArrowUpRight, LogIn, UserRound } from "lucide-react"

import { Button } from "../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

type LoginDropdownProps = {
  onClient: () => void
  onAdmin: () => void
}

export function LoginDropdown({ onClient, onAdmin }: LoginDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-full border-black/10 bg-white/86 px-3 text-xs font-semibold text-foreground shadow-[0_10px_26px_rgba(15,23,42,0.1)] backdrop-blur-2xl hover:bg-white dark:border-white/10 dark:bg-[rgba(8,10,18,0.9)] dark:text-white dark:shadow-[0_12px_34px_rgba(0,0,0,0.38)] dark:hover:bg-[rgba(12,16,24,0.95)]"
        >
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="dropdown-menu-open min-w-44 rounded-2xl border-black/10 bg-white/92 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[rgba(8,10,18,0.94)] dark:text-white dark:shadow-[0_24px_90px_rgba(0,0,0,0.54)]"
      >
        <DropdownMenuItem
          className="language-menu-item cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors focus:bg-[color:var(--accent)]/10 focus:text-foreground dark:text-white/88 dark:focus:bg-white/10 dark:focus:text-white"
          onSelect={(event) => {
            event.preventDefault()
            onClient()
          }}
          style={{ "--language-menu-delay": "0ms" } as CSSProperties}
        >
          <UserRound className="h-4 w-4" />
          Cliente
          <span className="ml-auto text-sm leading-none" aria-hidden="true">
            →
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="language-menu-item cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors focus:bg-[color:var(--accent)]/10 focus:text-foreground dark:text-white/88 dark:focus:bg-white/10 dark:focus:text-white"
          onSelect={(event) => {
            event.preventDefault()
            onAdmin()
          }}
          style={{ "--language-menu-delay": "70ms" } as CSSProperties}
        >
          <ArrowUpRight className="h-4 w-4" />
          Admin
          <span className="ml-auto text-sm leading-none" aria-hidden="true">
            →
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
