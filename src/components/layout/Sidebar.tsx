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
    <aside className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="font-bold text-slate-800">NutriEval</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              path === item.href || path.startsWith(item.href + "/")
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-200"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/api/auth/logout"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all"
        >
          <span>🚪</span>
          Sair
        </Link>
      </div>
    </aside>
  )
}
