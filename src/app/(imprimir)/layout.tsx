export default function ImprimirLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body { background: white !important; color: #0f172a; -webkit-print-color-adjust: exact; }
      `}</style>
      {children}
    </>
  )
}
