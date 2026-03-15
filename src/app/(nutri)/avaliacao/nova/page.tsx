"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

function NovaAvaliacaoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [pacientes, setPacientes] = useState<{ id: string; nome: string; sexo?: string | null }[]>([])
  const [form, setForm] = useState<FormData>({
    pacienteId: searchParams.get("pacienteId") || "",
    sexoConfirmado: "",
    dataAvaliacao: new Date().toISOString().split("T")[0],
    peso: "", altura: "",
    formulaReferencia: "petroski",
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  useEffect(() => {
    fetch("/api/pacientes")
      .then((r) => r.ok ? r.json().catch(() => []) : [])
      .then((d) => setPacientes(Array.isArray(d) ? d : []))
  }, [])

  async function salvar() {
    setErro("")
    setLoading(true)
    const payload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(form)) {
      if (v === "") continue
      payload[k] = (k === "pacienteId" || k === "dataAvaliacao" || k === "sexoConfirmado" || k === "formulaReferencia") ? v : Number(v)
    }
    const res = await fetch("/api/avaliacoes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setErro(data.erro || "Erro ao salvar"); return }
    router.push(`/avaliacao/${data.avaliacaoId}/resultado`)
  }

  const f = form
  const sf = (u: FormData) => setForm((prev) => ({ ...prev, ...u } as FormData))
  const pacienteSelecionado = pacientes.find((p) => p.id === f.pacienteId)
  const pacNome = pacienteSelecionado?.nome || "—"
  const sexoCadastro = normalizarSexo(pacienteSelecionado?.sexo)
  const sexoDivergente = Boolean(sexoCadastro && f.sexoConfirmado && sexoCadastro !== f.sexoConfirmado)

  function validarFormularioAtual(): string | null {
    if (!f.pacienteId) return "Selecione um paciente"
    if (!f.sexoConfirmado) return "Confirme o sexo do paciente para os cálculos"
    if (!f.peso || !f.altura) return "Peso e altura são obrigatórios"

      if (f.formulaReferencia === "petroski") {
        if (f.sexoConfirmado === "M") {
          if (!f.dobTricipital || !f.dobSubescapular || !f.dobCristaIliaca || !f.dobPanturrilha) {
            return "Petroski masculino exige: Tricipital, Subescapular, Crista Ilíaca e Panturrilha"
          }
        }

        if (f.sexoConfirmado === "F") {
          if (!f.dobTricipital || !f.dobSubescapular || !f.dobCristaIliaca || !f.dobPanturrilha) {
            return "Petroski feminino exige: Tricipital, Subescapular, Crista Ilíaca e Panturrilha"
          }
        }
      }

    return null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/pacientes" className="text-sm text-slate-400 hover:text-slate-600">← Voltar</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Nova Avaliação</h1>
        <p className="text-xs text-slate-400 mt-0.5">Campos marcados com * são necessários para os cálculos principais</p>
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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-8">

        {/* PASSO 0 — Identificação */}
        {step === 0 && (
          <div className="space-y-5">
            <div><h2 className="font-semibold text-slate-800">Identificação</h2></div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Paciente <span className="text-cyan-500 font-semibold">*</span></label>
              <select
                value={f.pacienteId}
                onChange={(e) => {
                  const pacienteId = e.target.value
                  const paciente = pacientes.find((p) => p.id === pacienteId)
                  sf({
                    pacienteId,
                    sexoConfirmado: normalizarSexo(paciente?.sexo) ?? "",
                  })
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white">
                <option value="">Selecione o paciente</option>
                {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Sexo no cadastro</label>
                <div className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-600 bg-slate-50">
                  {pacienteSelecionado ? formatarSexo(pacienteSelecionado.sexo) : "Selecione o paciente"}
                </div>
              </div>
            </div>

            {sexoDivergente && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                O sexo confirmado na avaliação está diferente do cadastro do paciente. Os cálculos desta avaliação usarão o sexo confirmado.
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fórmula de Gordura % <span className="text-cyan-500 font-semibold">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => sf({ formulaReferencia: "petroski" })}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition ${
                    f.formulaReferencia === "petroski" 
                      ? "bg-cyan-50 border-cyan-200 text-cyan-700" 
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Petroski
                </button>
                <button
                  type="button"
                  onClick={() => sf({ formulaReferencia: "faulkner" })}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition ${
                    f.formulaReferencia === "faulkner" 
                      ? "bg-cyan-50 border-cyan-200 text-cyan-700" 
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Faulkner
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Define qual fórmula será usada como referência para Massa Gorda/Magra.
              </p>
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

        {/* PASSO 1 — 9 Dobras Cutâneas */}
        {step === 1 && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Dobras Cutâneas</h2>
            <p className="text-xs text-slate-400 mb-5">Todas em mm. Preencha as disponíveis.</p>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Tricipital"       chave="dobTricipital"    form={f} setForm={sf} obrigatorio />
              <Campo label="Subescapular"     chave="dobSubescapular"  form={f} setForm={sf} obrigatorio />
              <Campo label="Bicipital"        chave="dobBicipital"     form={f} setForm={sf} />
              <Campo label="Crista Ilíaca"    chave="dobCristaIliaca"  form={f} setForm={sf} />
              <Campo label="Supraespinal"     chave="dobSupraespinal"  form={f} setForm={sf} obrigatorio />
              <Campo label="Abdominal"        chave="dobAbdominal"     form={f} setForm={sf} obrigatorio />
              <Campo label="Coxa Anterior"    chave="dobCoxa"          form={f} setForm={sf} obrigatorio />
              <Campo label="Panturrilha Medial" chave="dobPanturrilha" form={f} setForm={sf} obrigatorio />
            </div>
            <Dica>
              <p><strong>Faulkner:</strong> Tricipital + Subescapular + Supraespinal + Abdominal</p>
              <p><strong>Petroski masculino:</strong> Tricipital + Subescapular + Crista Ilíaca + Panturrilha</p>
              <p><strong>Petroski feminino:</strong> Tricipital + Subescapular + Crista Ilíaca + Panturrilha + peso + altura</p>
              <p><strong>Heath-Carter Endo:</strong> Tricipital + Subescapular + Supraespinal</p>
            </Dica>
          </div>
        )}

        {/* PASSO 2 — 7 Circunferências */}
        {step === 2 && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Circunferências</h2>
            <p className="text-xs text-slate-400 mb-5">Todas em cm.</p>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Cintura"          chave="circCintura"        form={f} setForm={sf} placeholder="80.0"  unidade="cm" obrigatorio />
              <Campo label="Quadril"          chave="circQuadril"        form={f} setForm={sf} placeholder="95.0"  unidade="cm" obrigatorio />
              <Campo label="Braço Relaxado"   chave="circBracoRelaxado"  form={f} setForm={sf} placeholder="32.0"  unidade="cm" obrigatorio />
              <Campo label="Braço Contraído"  chave="circBracoContraido" form={f} setForm={sf} placeholder="34.0"  unidade="cm" />
              <Campo label="Panturrilha"      chave="circPanturrilha"    form={f} setForm={sf} placeholder="37.0"  unidade="cm" obrigatorio />
              <Campo label="Coxa Média"       chave="circCoxaMedia"      form={f} setForm={sf} placeholder="55.0"  unidade="cm" obrigatorio />
              <Campo label="Abdômen"          chave="circAbdomen"        form={f} setForm={sf} placeholder="85.0"  unidade="cm" />
            </div>
            <Dica>
              <p><strong>RCQ:</strong> Cintura ÷ Quadril</p>
              <p><strong>CMB:</strong> Braço Relaxado − (π × Tricipital ÷ 10)</p>
              <p><strong>Mesomorfia:</strong> requer Braço Relaxado + Panturrilha</p>
            </Dica>
          </div>
        )}

        {/* PASSO 3 — Diâmetros */}
        {step === 3 && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Diâmetros Ósseos</h2>
            <p className="text-xs text-slate-400 mb-5">Todos em cm. Medidos com paquímetro antropométrico.</p>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Diâm. Úmero"        chave="diamUmero"      form={f} setForm={sf} placeholder="6.5" unidade="cm" />
              <Campo label="Diâm. Fêmur (joelho)" chave="diamFemur"   form={f} setForm={sf} placeholder="9.0" unidade="cm" />
              <Campo label="Diâm. Punho (para massa óssea)" chave="diamPunho" form={f} setForm={sf} placeholder="5.5" unidade="cm" />
              <Campo label="Diâm. Fêmur Distal"  chave="diamFemurDistal" form={f} setForm={sf} placeholder="9.0" unidade="cm" />
            </div>
            <Dica>
              <p><strong>Massa Óssea (Von Dobeln):</strong> requer Diâm. Punho + Diâm. Fêmur/Diâm. Fêmur Distal</p>
              <p><strong>Mesomorfia (Heath-Carter):</strong> requer Diâm. Úmero + Diâm. Fêmur</p>
              <p><strong>Importante:</strong> Úmero não substitui punho no cálculo de massa óssea.</p>
            </Dica>
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
                ["Tricipital", f.dobTricipital ? `${f.dobTricipital} mm` : "—"],
                ["Subescapular", f.dobSubescapular ? `${f.dobSubescapular} mm` : "—"],
                ["Bicipital", f.dobBicipital ? `${f.dobBicipital} mm` : "—"],
                ["Crista Ilíaca", f.dobCristaIliaca ? `${f.dobCristaIliaca} mm` : "—"],
                ["Supraespinal", f.dobSupraespinal ? `${f.dobSupraespinal} mm` : "—"],
                ["Abdominal", f.dobAbdominal ? `${f.dobAbdominal} mm` : "—"],
                ["Coxa", f.dobCoxa ? `${f.dobCoxa} mm` : "—"],
                ["Panturrilha", f.dobPanturrilha ? `${f.dobPanturrilha} mm` : "—"],
                ["─ Circunferências ─", ""],
                ["Cintura", f.circCintura ? `${f.circCintura} cm` : "—"],
                ["Quadril", f.circQuadril ? `${f.circQuadril} cm` : "—"],
                ["Braço Relaxado", f.circBracoRelaxado ? `${f.circBracoRelaxado} cm` : "—"],
                ["Braço Contraído", f.circBracoContraido ? `${f.circBracoContraido} cm` : "—"],
                ["Panturrilha (circ.)", f.circPanturrilha ? `${f.circPanturrilha} cm` : "—"],
                ["Coxa Média", f.circCoxaMedia ? `${f.circCoxaMedia} cm` : "—"],
                ["Abdômen", f.circAbdomen ? `${f.circAbdomen} cm` : "—"],
                ["─ Diâmetros ─", ""],
                ["Diâm. Úmero", f.diamUmero ? `${f.diamUmero} cm` : "—"],
                ["Diâm. Fêmur", f.diamFemur ? `${f.diamFemur} cm` : "—"],
                ["Diâm. Punho", f.diamPunho ? `${f.diamPunho} cm` : "—"],
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
              onClick={() => {
                if (step === 0) {
                  if (!f.pacienteId) return setErro("Selecione um paciente")
                  if (!f.sexoConfirmado) return setErro("Confirme o sexo do paciente para os cálculos")
                  if (!f.peso || !f.altura) return setErro("Peso e altura são obrigatórios")
                }
                setErro("")
                setStep(step + 1)
              }}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-sm shadow-cyan-200">
              Próximo →
            </button>
          ) : (
            <button
              onClick={() => {
                const erroAtual = validarFormularioAtual()
                if (erroAtual) {
                  setErro(erroAtual)
                  return
                }
                salvar()
              }}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60 shadow-sm shadow-cyan-200">
              {loading ? "Calculando..." : "✓ Salvar e ver resultados"}
            </button>
          )}
        </div>
        {erro && step < 4 && <p className="text-red-500 text-sm text-center mt-3">{erro}</p>}
      </div>
    </div>
  )
}

export default function NovaAvaliacaoPage() {
  return <Suspense><NovaAvaliacaoContent /></Suspense>
}
