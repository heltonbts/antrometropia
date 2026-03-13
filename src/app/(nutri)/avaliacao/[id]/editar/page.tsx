"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { formatarSexo, normalizarSexo } from "@/lib/utils"

const STEPS = ["Identificação", "Dobras", "Circunferências", "Diâmetros", "Revisão"]

type FormData = Record<string, string>

function Campo({
  label, chave, form, setForm, placeholder = "0.0", unidade = "mm", obrigatorio = false,
}: {
  label: string; chave: string; form: FormData; setForm: (f: FormData) => void
  placeholder?: string; unidade?: string; obrigatorio?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}{" "}
        <span className={obrigatorio ? "text-cyan-500 font-semibold" : "text-slate-400"}>
          ({unidade}){obrigatorio ? " *" : ""}
        </span>
      </label>
      <input
        type="number" step="0.1" min="0"
        value={form[chave] || ""}
        onChange={(e) => setForm({ ...form, [chave]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition bg-white"
      />
    </div>
  )
}

function Dica({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3 text-xs text-cyan-700 space-y-0.5">
      {children}
    </div>
  )
}

function num(v: number | null | undefined): string {
  return v != null ? String(v) : ""
}

export default function EditarAvaliacaoPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [step, setStep] = useState(0)
  const [pacNome, setPacNome] = useState("—")
  const [pacId, setPacId] = useState("")
  const [form, setForm] = useState<FormData>({ formulaReferencia: "petroski" })
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")

  useEffect(() => {
    fetch(`/api/avaliacoes/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((a) => {
        if (!a) return
        setPacNome(a.paciente?.nome ?? "—")
        setPacId(a.paciente?.id ?? "")
        setForm({
          sexoConfirmado:    normalizarSexo(a.paciente?.sexo) ?? "",
          formulaReferencia: a.resultado?.formulaReferencia ?? "petroski",
          dataAvaliacao:     a.dataAvaliacao?.slice(0, 10) ?? "",
          peso:   num(a.peso),
          altura: num(a.altura),
          // Dobras
          dobTricipital:   num(a.dobTricipital),
          dobSubescapular: num(a.dobSubescapular),
          dobBicipital:    num(a.dobBicipital),
          dobCristaIliaca: num(a.dobCristaIliaca ?? a.dobSupraIliaca),
          dobSupraespinal: num(a.dobSupraespinal),
          dobAbdominal:    num(a.dobAbdominal),
          dobCoxa:         num(a.dobCoxa),
          dobPanturrilha:  num(a.dobPanturrilha),
          // Circunferências
          circCintura:        num(a.circCintura),
          circQuadril:        num(a.circQuadril),
          circBracoRelaxado:  num(a.circBracoRelaxado),
          circBracoContraido: num(a.circBracoContraido),
          circPanturrilha:    num(a.circPanturrilha),
          circCoxaMedia:      num(a.circCoxaMedia),
          circAbdomen:        num(a.circAbdomen),
          // Diâmetros
          diamUmero:       num(a.diamUmero),
          diamFemur:       num(a.diamFemur),
          diamPunho:       num(a.diamPunho),
          diamFemurDistal: num(a.diamFemurDistal),
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function salvar() {
    setErro("")
    setSalvando(true)
    const payload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(form)) {
      if (v === "") continue
      payload[k] = (k === "dataAvaliacao" || k === "sexoConfirmado" || k === "formulaReferencia") ? v : Number(v)
    }
    const res = await fetch(`/api/avaliacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSalvando(false)
    if (!res.ok) { setErro(data.erro || "Erro ao salvar"); return }
    router.push(`/avaliacao/${id}/resultado`)
  }

  const f = form
  const sf = (u: Partial<FormData>) => setForm((prev) => ({ ...prev, ...u }))

  function validar(): string | null {
    if (!f.peso || !f.altura) return "Peso e altura são obrigatórios"
    if (f.formulaReferencia === "petroski") {
      if (!f.dobTricipital || !f.dobSubescapular || !f.dobCristaIliaca || !f.dobPanturrilha) {
        return "Petroski exige: Tricipital, Subescapular, Crista Ilíaca e Panturrilha"
      }
    }
    return null
  }

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Carregando avaliação...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/avaliacao/${id}/resultado`} className="text-sm text-slate-400 hover:text-slate-600">
          ← Voltar ao resultado
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Editar Avaliação</h1>
        <p className="text-xs text-slate-400 mt-0.5">{pacNome} — os resultados serão recalculados ao salvar</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1 min-w-0">
            <button
              onClick={() => i < step && setStep(i)}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                i === step ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-200"
                : i < step ? "bg-emerald-500 text-white cursor-pointer"
                : "bg-slate-100 text-slate-400"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </button>
            <span className={`text-xs font-medium truncate hidden sm:block ${i === step ? "text-cyan-600" : "text-slate-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-100 mx-1" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">

        {/* PASSO 0 — Identificação */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-slate-800">Identificação</h2>

            <div className="px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100">
              Paciente: <span className="font-semibold text-slate-800">{pacNome}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Sexo confirmado para cálculo <span className="text-cyan-500 font-semibold">*</span>
              </label>
              <select
                value={f.sexoConfirmado}
                onChange={(e) => sf({ sexoConfirmado: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fórmula de Gordura % <span className="text-cyan-500 font-semibold">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => sf({ formulaReferencia: "petroski" })}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition ${
                    f.formulaReferencia === "petroski" ? "bg-cyan-50 border-cyan-200 text-cyan-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}>
                  Petroski
                </button>
                <button type="button" onClick={() => sf({ formulaReferencia: "faulkner" })}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition ${
                    f.formulaReferencia === "faulkner" ? "bg-cyan-50 border-cyan-200 text-cyan-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}>
                  Faulkner
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data da avaliação <span className="text-cyan-500 font-semibold">*</span></label>
              <input type="date" value={f.dataAvaliacao} onChange={(e) => sf({ dataAvaliacao: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Peso" chave="peso" form={f} setForm={sf} placeholder="70.0" unidade="kg" obrigatorio />
              <Campo label="Altura" chave="altura" form={f} setForm={sf} placeholder="170.0" unidade="cm" obrigatorio />
            </div>
          </div>
        )}

        {/* PASSO 1 — Dobras */}
        {step === 1 && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Dobras Cutâneas</h2>
            <p className="text-xs text-slate-400 mb-5">Todas em mm.</p>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Tricipital"         chave="dobTricipital"    form={f} setForm={sf} obrigatorio />
              <Campo label="Subescapular"       chave="dobSubescapular"  form={f} setForm={sf} obrigatorio />
              <Campo label="Bicipital"          chave="dobBicipital"     form={f} setForm={sf} />
              <Campo label="Crista Ilíaca"      chave="dobCristaIliaca"  form={f} setForm={sf} />
              <Campo label="Supraespinal"       chave="dobSupraespinal"  form={f} setForm={sf} obrigatorio />
              <Campo label="Abdominal"          chave="dobAbdominal"     form={f} setForm={sf} obrigatorio />
              <Campo label="Coxa Anterior"      chave="dobCoxa"          form={f} setForm={sf} obrigatorio />
              <Campo label="Panturrilha Medial" chave="dobPanturrilha"   form={f} setForm={sf} obrigatorio />
            </div>
            <Dica>
              <p><strong>Faulkner:</strong> Tricipital + Subescapular + Supraespinal + Abdominal</p>
              <p><strong>Petroski:</strong> Tricipital + Subescapular + Crista Ilíaca + Panturrilha</p>
            </Dica>
          </div>
        )}

        {/* PASSO 2 — Circunferências */}
        {step === 2 && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Circunferências</h2>
            <p className="text-xs text-slate-400 mb-5">Todas em cm.</p>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Cintura"         chave="circCintura"        form={f} setForm={sf} placeholder="80.0"  unidade="cm" obrigatorio />
              <Campo label="Quadril"         chave="circQuadril"        form={f} setForm={sf} placeholder="95.0"  unidade="cm" obrigatorio />
              <Campo label="Braço Relaxado"  chave="circBracoRelaxado"  form={f} setForm={sf} placeholder="32.0"  unidade="cm" obrigatorio />
              <Campo label="Braço Contraído" chave="circBracoContraido" form={f} setForm={sf} placeholder="34.0"  unidade="cm" />
              <Campo label="Panturrilha"     chave="circPanturrilha"    form={f} setForm={sf} placeholder="37.0"  unidade="cm" obrigatorio />
              <Campo label="Coxa Média"      chave="circCoxaMedia"      form={f} setForm={sf} placeholder="55.0"  unidade="cm" obrigatorio />
              <Campo label="Abdômen"         chave="circAbdomen"        form={f} setForm={sf} placeholder="85.0"  unidade="cm" />
            </div>
          </div>
        )}

        {/* PASSO 3 — Diâmetros */}
        {step === 3 && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Diâmetros Ósseos</h2>
            <p className="text-xs text-slate-400 mb-5">Todos em cm.</p>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Diâm. Úmero"           chave="diamUmero"       form={f} setForm={sf} placeholder="6.5" unidade="cm" />
              <Campo label="Diâm. Fêmur (joelho)"  chave="diamFemur"       form={f} setForm={sf} placeholder="9.0" unidade="cm" />
              <Campo label="Diâm. Punho"            chave="diamPunho"       form={f} setForm={sf} placeholder="5.5" unidade="cm" />
              <Campo label="Diâm. Fêmur Distal"    chave="diamFemurDistal" form={f} setForm={sf} placeholder="9.0" unidade="cm" />
            </div>
          </div>
        )}

        {/* PASSO 4 — Revisão */}
        {step === 4 && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-4">Revisão</h2>
            <div className="space-y-px text-sm">
              {([
                ["Paciente", pacNome],
                ["Sexo confirmado", f.sexoConfirmado === "M" ? "Masculino" : f.sexoConfirmado === "F" ? "Feminino" : "—"],
                ["Fórmula Ref.", f.formulaReferencia === "petroski" ? "Petroski" : "Faulkner"],
                ["Data", f.dataAvaliacao || "—"],
                ["Peso", f.peso ? `${f.peso} kg` : "—"],
                ["Altura", f.altura ? `${f.altura} cm` : "—"],
                ["─ Dobras ─", ""],
                ["Tricipital",    f.dobTricipital   ? `${f.dobTricipital} mm`   : "—"],
                ["Subescapular",  f.dobSubescapular ? `${f.dobSubescapular} mm` : "—"],
                ["Bicipital",     f.dobBicipital    ? `${f.dobBicipital} mm`    : "—"],
                ["Crista Ilíaca", f.dobCristaIliaca ? `${f.dobCristaIliaca} mm` : "—"],
                ["Supraespinal",  f.dobSupraespinal ? `${f.dobSupraespinal} mm` : "—"],
                ["Abdominal",     f.dobAbdominal    ? `${f.dobAbdominal} mm`    : "—"],
                ["Coxa",          f.dobCoxa         ? `${f.dobCoxa} mm`         : "—"],
                ["Panturrilha",   f.dobPanturrilha  ? `${f.dobPanturrilha} mm`  : "—"],
                ["─ Circunferências ─", ""],
                ["Cintura",         f.circCintura        ? `${f.circCintura} cm`        : "—"],
                ["Quadril",         f.circQuadril        ? `${f.circQuadril} cm`        : "—"],
                ["Braço Relaxado",  f.circBracoRelaxado  ? `${f.circBracoRelaxado} cm`  : "—"],
                ["Braço Contraído", f.circBracoContraido ? `${f.circBracoContraido} cm` : "—"],
                ["Panturrilha (circ.)", f.circPanturrilha ? `${f.circPanturrilha} cm`   : "—"],
                ["Coxa Média",      f.circCoxaMedia      ? `${f.circCoxaMedia} cm`      : "—"],
                ["Abdômen",         f.circAbdomen        ? `${f.circAbdomen} cm`        : "—"],
                ["─ Diâmetros ─", ""],
                ["Diâm. Úmero",      f.diamUmero       ? `${f.diamUmero} cm`       : "—"],
                ["Diâm. Fêmur",      f.diamFemur       ? `${f.diamFemur} cm`       : "—"],
                ["Diâm. Punho",      f.diamPunho       ? `${f.diamPunho} cm`       : "—"],
                ["Diâm. Fêmur Dist.", f.diamFemurDistal ? `${f.diamFemurDistal} cm` : "—"],
              ] as [string, string][]).map(([k, v]) => (
                k.startsWith("─") ? (
                  <p key={k} className="text-xs text-slate-400 font-medium pt-3 pb-1">{k}</p>
                ) : (
                  <div key={k} className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">{k}</span>
                    <span className={`font-medium ${v === "—" ? "text-slate-300" : "text-slate-800"}`}>{v}</span>
                  </div>
                )
              ))}
            </div>
            {erro && <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{erro}</div>}
          </div>
        )}

        {/* Navegação */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition">
              ← Voltar
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => { setErro(""); setStep(step + 1) }}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-sm shadow-cyan-200">
              Próximo →
            </button>
          ) : (
            <button
              onClick={() => {
                const erroAtual = validar()
                if (erroAtual) { setErro(erroAtual); return }
                salvar()
              }}
              disabled={salvando}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60 shadow-sm shadow-cyan-200">
              {salvando ? "Salvando..." : "✓ Salvar e ver resultados"}
            </button>
          )}
        </div>
        {erro && step < 4 && <p className="text-red-500 text-sm text-center mt-3">{erro}</p>}
      </div>
    </div>
  )
}
