import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatarNumero, calcularIdade, formatarSexo } from "@/lib/utils"
import { PrintTrigger } from "./PrintTrigger"

export default async function ImprimirAvaliacaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: { resultado: true, paciente: true },
  })

  if (!avaliacao || !avaliacao.resultado) return notFound()

  const r = avaliacao.resultado
  const p = avaliacao.paciente
  const formula = r.formulaReferencia === "faulkner" ? "Faulkner" : "Petroski"
  const dataFormatada = new Date(avaliacao.dataAvaliacao).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  })
  const idade = calcularIdade(p.dataNascimento)

  const resultados = [
    ["IMC", formatarNumero(r.imc), "kg/m²", r.classificacaoImc],
    [`% Gordura (${formula})`, formula === "Faulkner" ? formatarNumero(r.percGorduraFaulkner) : formatarNumero(r.percGorduraPetroski), "%", null],
    ["Massa Gorda", formatarNumero(r.massaGorda), "kg", null],
    ["Massa Magra", formatarNumero(r.massaMagra), "kg", null],
    ["Massa Muscular (SMM)", formatarNumero(r.massaMuscular), "kg", null],
    ["Massa Óssea", formatarNumero(r.massaOssea), "kg", null],
    ["RCQ", formatarNumero(r.rcq, 2), "", r.classificacaoRcq],
    ["Risco — Cintura", "", "", r.riscoCintura],
    ["CMB", formatarNumero(r.cmb), "cm", null],
    ["CMC", formatarNumero(r.cmc), "cm", null],
    ["Soma 6 Dobras", formatarNumero(r.soma6Dobras), "mm", r.classificacao6Dobras],
    ["Soma Todas as Dobras", formatarNumero(r.somaTodasDobras), "mm", null],
  ] as [string, string, string, string | null][]

  const medicoes = [
    ["Peso", avaliacao.peso, "kg"],
    ["Altura", avaliacao.altura, "cm"],
    avaliacao.dobTricipital != null     ? ["Dobra Tricipital", avaliacao.dobTricipital, "mm"] : null,
    avaliacao.dobSubescapular != null   ? ["Dobra Subescapular", avaliacao.dobSubescapular, "mm"] : null,
    avaliacao.dobBicipital != null      ? ["Dobra Bicipital", avaliacao.dobBicipital, "mm"] : null,
    avaliacao.dobAxilarMedia != null    ? ["Dobra Axilar Média", avaliacao.dobAxilarMedia, "mm"] : null,
    avaliacao.dobSupraIliaca != null    ? ["Dobra Supra-ilíaca", avaliacao.dobSupraIliaca, "mm"] : null,
    avaliacao.dobCristaIliaca != null   ? ["Dobra Crista Ilíaca", avaliacao.dobCristaIliaca, "mm"] : null,
    avaliacao.dobSupraespinal != null   ? ["Dobra Supraespinal", avaliacao.dobSupraespinal, "mm"] : null,
    avaliacao.dobAbdominal != null      ? ["Dobra Abdominal", avaliacao.dobAbdominal, "mm"] : null,
    avaliacao.dobCoxa != null           ? ["Dobra Coxa", avaliacao.dobCoxa, "mm"] : null,
    avaliacao.dobPanturrilha != null    ? ["Dobra Panturrilha", avaliacao.dobPanturrilha, "mm"] : null,
    avaliacao.circCintura != null       ? ["Circ. Cintura", avaliacao.circCintura, "cm"] : null,
    avaliacao.circQuadril != null       ? ["Circ. Quadril", avaliacao.circQuadril, "cm"] : null,
    avaliacao.circBracoRelaxado != null ? ["Circ. Braço Relaxado", avaliacao.circBracoRelaxado, "cm"] : null,
    avaliacao.circBracoContraido != null? ["Circ. Braço Contraído", avaliacao.circBracoContraido, "cm"] : null,
    avaliacao.circPanturrilha != null   ? ["Circ. Panturrilha", avaliacao.circPanturrilha, "cm"] : null,
    avaliacao.circCoxaMedia != null     ? ["Circ. Coxa Média", avaliacao.circCoxaMedia, "cm"] : null,
    avaliacao.circAbdomen != null       ? ["Circ. Abdômen", avaliacao.circAbdomen, "cm"] : null,
    avaliacao.diamUmero != null         ? ["Diâm. Úmero", avaliacao.diamUmero, "cm"] : null,
    avaliacao.diamFemur != null         ? ["Diâm. Fêmur", avaliacao.diamFemur, "cm"] : null,
    avaliacao.diamPunho != null         ? ["Diâm. Punho", avaliacao.diamPunho, "cm"] : null,
  ].filter(Boolean) as [string, number, string][]

  return (
    <>
      <PrintTrigger />

      <div className="max-w-3xl mx-auto px-8 py-10 print:px-6 print:py-8">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#1f8a70] flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Nutrieval</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Avaliação Física</h1>
            <p className="text-slate-500 text-sm mt-1">{dataFormatada}</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p className="font-semibold text-slate-800">{p.nome}</p>
            <p>{idade} anos · {formatarSexo(p.sexo)}</p>
            <p className="text-xs mt-1">Protocolo: {formula}</p>
          </div>
        </div>

        {/* Resultados */}
        <section className="mb-8">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">Resultados</h2>
          <div className="grid grid-cols-3 gap-2">
            {resultados.map(([titulo, valor, unidade, badge]) => {
              if (!valor && !badge) return null
              return (
                <div key={titulo} className="border border-slate-100 rounded-xl p-3 bg-slate-50">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{titulo}</p>
                  {valor && (
                    <p className="text-lg font-bold text-slate-900 mt-1">
                      {valor}
                      {unidade && <span className="text-xs font-normal text-slate-400 ml-1">{unidade}</span>}
                    </p>
                  )}
                  {badge && <p className="text-xs font-semibold text-slate-600 mt-0.5">{badge}</p>}
                </div>
              )
            })}
          </div>
        </section>

        {/* Somatotipo */}
        {r.endomorfia != null && r.mesomorfia != null && r.ectomorfia != null && (
          <section className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">Somatotipo — Heath-Carter</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Endomorfia", r.endomorfia, "Adiposidade"],
                ["Mesomorfia", r.mesomorfia, "Muscularidade"],
                ["Ectomorfia", r.ectomorfia, "Linearidade"],
              ].map(([label, val, desc]) => (
                <div key={label as string} className="border border-slate-100 rounded-xl p-3 bg-slate-50 text-center">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{label as string}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatarNumero(val as number, 2)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc as string}</p>
                </div>
              ))}
            </div>
            {r.biotipo && (
              <p className="text-center text-sm text-slate-600 mt-3 font-semibold">Biotipo: {r.biotipo}</p>
            )}
          </section>
        )}

        {/* Medições */}
        <section className="mb-8">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">Medições Realizadas</h2>
          <div className="grid grid-cols-2 gap-x-8">
            {medicoes.map(([label, valor, unidade]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-slate-100 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800">{valor} <span className="text-slate-400 font-normal">{unidade}</span></span>
              </div>
            ))}
          </div>
        </section>

        {/* Rodapé */}
        <footer className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Nutrieval · nutrieval.com.br</span>
          <span>Impresso em {new Date().toLocaleDateString("pt-BR")}</span>
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 1.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  )
}
