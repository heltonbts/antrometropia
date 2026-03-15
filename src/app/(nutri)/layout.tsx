import { Sidebar } from "@/components/layout/Sidebar"
import { MobileNav } from "@/components/layout/MobileNav"

export default function NutriLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-transparent">
      {/* Sidebar — oculto no mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-auto">
        {/* Header mobile */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-[rgba(15,23,42,0.06)]">
          <div className="w-8 h-8 rounded-xl bg-[linear-gradient(135deg,#06b6d4,#2563eb)] flex items-center justify-center shadow-[0_8px_20px_rgba(6,182,212,0.28)]">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <div>
            <span className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-slate-500">Nutrieval</span>
          </div>
        </header>

        <div className="p-3 pb-24 md:p-6 md:pb-28 lg:p-8 lg:pb-8">
          <div className="glass-panel-strong min-h-[calc(100vh-6rem)] rounded-[24px] p-4 md:p-6 lg:rounded-[32px] lg:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom nav — apenas mobile */}
      <MobileNav />
    </div>
  )
}
