"use client"

import { useEffect } from "react"

export function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="print:hidden fixed bottom-6 right-6 flex gap-3 z-50">
      <button
        onClick={() => window.print()}
        className="px-5 py-2.5 bg-[#1f8a70] text-white text-sm font-semibold rounded-2xl shadow-lg hover:opacity-90 transition"
      >
        Imprimir / Salvar PDF
      </button>
      <button
        onClick={() => window.close()}
        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-2xl shadow-lg hover:bg-slate-50 transition"
      >
        Fechar
      </button>
    </div>
  )
}
