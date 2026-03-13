"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▣" },
  { href: "/pacientes", label: "Pacientes", icon: "👥" },
  { href: "/avaliacao/nova", label: "Nova Avaliação", icon: "📋" },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-72 min-h-screen border-r border-[rgba(23,32,51,0.08)] bg-[rgba(255,251,243,0.74)] backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(23,32,51,0.08)]">
        <div className="glass-panel rounded-[28px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[linear-gradient(135deg,#1f8a70,#264653)] flex items-center justify-center shadow-[0_12px_30px_rgba(31,138,112,0.22)]">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <div>
              <span className="font-mono-ui text-[11px] uppercase tracking-[0.28em] text-slate-500">Nutrieval</span>
              <p className="font-semibold text-slate-800 leading-none mt-1">Clinical Console</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all border",
              path === item.href || path.startsWith(item.href + "/")
                ? "bg-[linear-gradient(135deg,#1f8a70,#264653)] text-white border-transparent shadow-[0_14px_34px_rgba(31,138,112,0.22)]"
                : "text-slate-700 border-transparent hover:border-[rgba(23,32,51,0.08)] hover:bg-[rgba(255,255,255,0.46)]"
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[rgba(23,32,51,0.08)] space-y-3">
        <div className="glass-panel rounded-2xl p-4">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.26em] text-slate-500">Workspace</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">Fluxo antropométrico</p>
          <p className="mt-1 text-xs text-slate-500">Cadastros, avaliações e evolução em um painel contínuo.</p>
        </div>
        <Link
          href="/api/auth/logout"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-500 hover:bg-[rgba(255,255,255,0.5)] transition-all"
        >
          <span>🚪</span>
          Sair
        </Link>
      </div>
    </aside>
  )
}
