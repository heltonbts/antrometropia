"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▣" },
  { href: "/pacientes", label: "Pacientes", icon: "👥" },
  { href: "/avaliacao/nova", label: "Nova Avaliação", icon: "📋" },
  { href: "/conta", label: "Conta", icon: "⚙" },
]

type Uso = { plano: string; totalPacientes: number; limite: number | null }

export function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const [uso, setUso] = useState<Uso | null>(null)

  useEffect(() => {
    fetch("/api/billing/uso")
      .then((r) => r.json())
      .then((d) => { if (!d.erro) setUso(d) })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch("/api/auth/logout")
    router.refresh()
    router.push("/login")
  }

  return (
    <aside className="w-72 min-h-screen border-r border-[rgba(15,23,42,0.08)] bg-[rgba(240,249,255,0.80)] backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(15,23,42,0.08)]">
        <div className="glass-panel rounded-[28px] p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#2563eb)] flex items-center justify-center shadow-[0_12px_30px_rgba(6,182,212,0.30)]">
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
                ? "bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white border-transparent shadow-[0_14px_34px_rgba(6,182,212,0.30)]"
                : "text-slate-700 border-transparent hover:border-[rgba(6,182,212,0.14)] hover:bg-[rgba(240,249,255,0.60)]"
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[rgba(15,23,42,0.08)] space-y-3">
        {uso && uso.plano === "FREE" && uso.limite && (
          <Link href="/conta" className="block glass-panel rounded-2xl p-4 hover:opacity-90 transition-opacity">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.26em] text-slate-500">Plano gratuito</p>
              <span className="text-[11px] font-semibold text-[color:var(--accent)]">Upgrade</span>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              {uso.totalPacientes}/{uso.limite} pacientes
            </p>
            <div className="h-1 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#1f8a70,#264653)] transition-all"
                style={{ width: `${Math.min((uso.totalPacientes / uso.limite) * 100, 100)}%` }}
              />
            </div>
          </Link>
        )}
        {uso && uso.plano === "PRO" && (
          <div className="glass-panel rounded-2xl p-4">
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.26em] text-slate-500">Plano Pro</p>
            <p className="mt-1 text-xs text-slate-500">Pacientes ilimitados</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-slate-500 hover:bg-[rgba(6,182,212,0.08)] transition-all"
        >
          <span>🚪</span>
          Sair
        </button>
      </div>
    </aside>
  )
}
