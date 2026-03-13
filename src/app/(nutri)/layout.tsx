import { Sidebar } from "@/components/layout/Sidebar"

export default function NutriLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
          <div className="glass-panel-strong min-h-[calc(100vh-2rem)] rounded-[32px] p-5 md:p-7 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
