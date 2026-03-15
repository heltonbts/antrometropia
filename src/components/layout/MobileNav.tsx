"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard",     label: "Início",    icon: "▣" },
  { href: "/pacientes",     label: "Pacientes", icon: "👥" },
  { href: "/avaliacao/nova",label: "Avaliar",   icon: "＋" },
  { href: "/conta",         label: "Conta",     icon: "⚙" },
]

export function MobileNav() {
  const path = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout")
    router.push("/login")
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[rgba(15,23,42,0.08)] flex safe-area-bottom">
      {items.map((item) => {
        const active = path === item.href || (path.startsWith(item.href + "/") && item.href !== "/dashboard")
          || (item.href === "/dashboard" && path === "/dashboard")
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors",
              active ? "text-[color:var(--accent)]" : "text-slate-400"
            )}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
      <button
        onClick={handleLogout}
        className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-slate-400"
      >
        <span className="text-xl leading-none">🚪</span>
        <span className="text-[10px] font-medium">Sair</span>
      </button>
    </nav>
  )
}
