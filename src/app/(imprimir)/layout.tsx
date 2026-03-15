export default function ImprimirLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
