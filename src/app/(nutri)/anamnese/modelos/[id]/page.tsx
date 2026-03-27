"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import type { Pergunta, TipoPergunta } from "@/lib/modelos-padrao"

const TIPOS: { value: TipoPergunta; label: string; icon: string }[] = [
  { value: "texto",    label: "Texto curto",      icon: "T" },
  { value: "textarea", label: "Texto longo",       icon: "¶" },
  { value: "multipla", label: "Múltipla escolha",  icon: "◉" },
  { value: "checkbox", label: "Caixas de seleção", icon: "☑" },
  { value: "simnao",   label: "Sim / Não",         icon: "◐" },
  { value: "escala",   label: "Escala numérica",   icon: "⋯" },
  { value: "data",     label: "Data",              icon: "📅" },
]

function gerarId() {
  return "q" + Math.random().toString(36).slice(2, 8)
}

function novaPergunta(tipo: TipoPergunta): Pergunta {
  return {
    id:          gerarId(),
    tipo,
    pergunta:    "",
    obrigatoria: false,
    opcoes:      tipo === "multipla" || tipo === "checkbox" ? ["Opção 1", "Opção 2"] : undefined,
    escalaMin:   tipo === "escala" ? 1 : undefined,
    escalaMax:   tipo === "escala" ? 10 : undefined,
    escalaMinLabel: tipo === "escala" ? "" : undefined,
    escalaMaxLabel: tipo === "escala" ? "" : undefined,
  }
}

// ── Editor de pergunta ────────────────────────────────────────────────────────
function EditorPergunta({
  pergunta,
  onChange,
  onDelete,
}: {
  pergunta: Pergunta
  onChange: (p: Pergunta) => void
  onDelete: () => void
}) {
  const set = (field: Partial<Pergunta>) => onChange({ ...pergunta, ...field })

  function adicionarOpcao() {
    set({ opcoes: [...(pergunta.opcoes ?? []), `Opção ${(pergunta.opcoes?.length ?? 0) + 1}`] })
  }
  function editarOpcao(i: number, valor: string) {
    const novas = [...(pergunta.opcoes ?? [])]
    novas[i] = valor
    set({ opcoes: novas })
  }
  function removerOpcao(i: number) {
    set({ opcoes: (pergunta.opcoes ?? []).filter((_, j) => j !== i) })
  }

  const tipoInfo = TIPOS.find((t) => t.value === pergunta.tipo)

  return (
    <div className="space-y-3">
      {/* Badge tipo */}
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
        <span>{tipoInfo?.icon}</span> {tipoInfo?.label}
      </span>

      {/* Texto da pergunta */}
      <input
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium"
        placeholder="Digite a pergunta..."
        value={pergunta.pergunta}
        onChange={(e) => set({ pergunta: e.target.value })}
      />

      {/* Opções para multipla/checkbox */}
      {(pergunta.tipo === "multipla" || pergunta.tipo === "checkbox") && (
        <div className="space-y-1.5 pl-1">
          {pergunta.opcoes?.map((op, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-300 text-xs">{pergunta.tipo === "multipla" ? "○" : "□"}</span>
              <input
                className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                value={op}
                onChange={(e) => editarOpcao(i, e.target.value)}
              />
              <button onClick={() => removerOpcao(i)} className="text-slate-300 hover:text-red-400 text-lg leading-none">×</button>
            </div>
          ))}
          <button
            onClick={adicionarOpcao}
            className="text-xs text-[#06b6d4] hover:underline mt-1"
          >
            + Adicionar opção
          </button>
        </div>
      )}

      {/* Config de escala */}
      {pergunta.tipo === "escala" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider">Mínimo</label>
            <input type="number" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm" value={pergunta.escalaMin ?? 1} onChange={(e) => set({ escalaMin: Number(e.target.value) })} />
            <input className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs mt-1" placeholder="Rótulo (ex: Muito ruim)" value={pergunta.escalaMinLabel ?? ""} onChange={(e) => set({ escalaMinLabel: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase tracking-wider">Máximo</label>
            <input type="number" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm" value={pergunta.escalaMax ?? 10} onChange={(e) => set({ escalaMax: Number(e.target.value) })} />
            <input className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs mt-1" placeholder="Rótulo (ex: Excelente)" value={pergunta.escalaMaxLabel ?? ""} onChange={(e) => set({ escalaMaxLabel: e.target.value })} />
          </div>
        </div>
      )}

      {/* Rodapé: obrigatória + excluir */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 accent-cyan-500"
            checked={pergunta.obrigatoria}
            onChange={(e) => set({ obrigatoria: e.target.checked })}
          />
          <span className="text-xs text-slate-500">Obrigatória</span>
        </label>
        <button onClick={onDelete} className="text-xs text-slate-300 hover:text-red-400 transition-colors">
          Excluir pergunta
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function EditorModeloPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [nome,      setNome]      = useState("")
  const [descricao, setDescricao] = useState("")
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [loading,   setLoading]   = useState(true)
  const [salvando,  setSalvando]  = useState(false)
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [showTipos,   setShowTipos]   = useState(false)
  const [salvo,       setSalvo]       = useState(false)

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/anamnese/modelos/${id}`)
    if (res.ok) {
      const d = await res.json()
      setNome(d.nome)
      setDescricao(d.descricao ?? "")
      setPerguntas(d.perguntas ?? [])
    }
    setLoading(false)
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const lista = [...perguntas]
    const [item] = lista.splice(result.source.index, 1)
    lista.splice(result.destination.index, 0, item)
    setPerguntas(lista)
  }

  function adicionarPergunta(tipo: TipoPergunta) {
    const nova = novaPergunta(tipo)
    setPerguntas((prev) => [...prev, nova])
    setSelecionada(nova.id)
    setShowTipos(false)
  }

  function editarPergunta(pergunta: Pergunta) {
    setPerguntas((prev) => prev.map((p) => p.id === pergunta.id ? pergunta : p))
  }

  function excluirPergunta(id: string) {
    setPerguntas((prev) => prev.filter((p) => p.id !== id))
    setSelecionada(null)
  }

  async function salvar() {
    setSalvando(true)
    const res = await fetch(`/api/anamnese/modelos/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ nome, descricao, perguntas }),
    })
    setSalvando(false)
    if (res.ok) {
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Carregando...</div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/anamnese")}
            className="text-slate-400 hover:text-slate-700 text-sm transition-colors"
          >
            ← Voltar
          </button>
          <div>
            <div className="eyebrow">Editor de Modelo</div>
            <input
              className="mt-1 text-xl font-semibold text-slate-900 bg-transparent border-none outline-none focus:bg-slate-50 rounded-lg px-1 -ml-1 w-full max-w-sm"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do modelo..."
            />
          </div>
        </div>
        <button
          onClick={salvar}
          disabled={salvando}
          className={`px-5 py-2.5 text-sm font-semibold rounded-2xl transition-all ${
            salvo
              ? "bg-emerald-500 text-white"
              : "bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white hover:opacity-90 shadow-[0_8px_24px_rgba(6,182,212,0.24)]"
          } disabled:opacity-60`}
        >
          {salvo ? "✓ Salvo" : salvando ? "Salvando..." : "Salvar modelo"}
        </button>
      </div>

      {/* Descrição */}
      <input
        className="mb-5 w-full text-sm text-slate-500 bg-transparent border-none outline-none focus:bg-slate-50 rounded-lg px-1 -ml-1"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição do modelo (opcional)..."
      />

      {/* Layout canvas: lista + editor */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Coluna esquerda — lista de perguntas */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="perguntas">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {perguntas.map((p, i) => (
                    <Draggable key={p.id} draggableId={p.id} index={i}>
                      {(drag, snapshot) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className={`glass-panel rounded-[20px] p-4 cursor-pointer transition-all border ${
                            selecionada === p.id
                              ? "border-cyan-300 shadow-[0_0_0_2px_rgba(6,182,212,0.2)]"
                              : "border-transparent hover:border-slate-200"
                          } ${snapshot.isDragging ? "shadow-lg rotate-1" : ""}`}
                          onClick={() => setSelecionada(selecionada === p.id ? null : p.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Handle drag */}
                            <div {...drag.dragHandleProps} className="mt-0.5 text-slate-300 cursor-grab active:cursor-grabbing select-none" onClick={(e) => e.stopPropagation()}>
                              ⠿
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono">{i + 1}.</span>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                  {TIPOS.find((t) => t.value === p.tipo)?.label}
                                </span>
                                {p.obrigatoria && <span className="text-red-400 text-xs">*</span>}
                              </div>
                              <p className={`text-sm mt-0.5 ${p.pergunta ? "text-slate-800 font-medium" : "text-slate-300 italic"}`}>
                                {p.pergunta || "Sem texto"}
                              </p>
                            </div>
                          </div>

                          {/* Editor inline quando selecionada */}
                          {selecionada === p.id && (
                            <div className="mt-3 pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                              <EditorPergunta
                                pergunta={p}
                                onChange={editarPergunta}
                                onDelete={() => excluirPergunta(p.id)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Botão adicionar pergunta */}
          <div className="relative">
            <button
              onClick={() => setShowTipos((v) => !v)}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-[20px] text-sm text-slate-400 hover:border-cyan-300 hover:text-cyan-500 transition-all font-medium"
            >
              + Adicionar pergunta
            </button>
            {showTipos && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-[20px] shadow-xl border border-slate-100 p-2 grid grid-cols-2 gap-1 z-10">
                {TIPOS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => adicionarPergunta(t.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="text-base w-5 text-center">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {perguntas.length === 0 && (
            <div className="text-center py-12 text-slate-300">
              <p className="text-4xl mb-3">✦</p>
              <p className="text-sm">Clique em "Adicionar pergunta" para começar</p>
            </div>
          )}
        </div>

        {/* Coluna direita — preview */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Preview</p>
          <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-[24px] p-4 flex-1 overflow-y-auto space-y-2">
            {perguntas.length === 0 ? (
              <p className="text-xs text-slate-300 text-center mt-8">Nenhuma pergunta ainda</p>
            ) : (
              perguntas.map((p, i) => (
                <div key={p.id} className="bg-white rounded-[16px] p-3 shadow-sm border border-slate-100">
                  <p className="text-xs font-semibold text-slate-700">
                    <span className="text-slate-400 font-normal mr-1">{i + 1}.</span>
                    {p.pergunta || <span className="text-slate-300 italic">Sem texto</span>}
                    {p.obrigatoria && <span className="text-red-400 ml-1">*</span>}
                  </p>
                  {(p.tipo === "multipla" || p.tipo === "checkbox") && p.opcoes && (
                    <div className="mt-1.5 space-y-1">
                      {p.opcoes.slice(0, 3).map((op, j) => (
                        <div key={j} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full border border-slate-300 flex-shrink-0" />
                          <span className="text-[10px] text-slate-400">{op}</span>
                        </div>
                      ))}
                      {p.opcoes.length > 3 && (
                        <p className="text-[10px] text-slate-300">+{p.opcoes.length - 3} opções</p>
                      )}
                    </div>
                  )}
                  {p.tipo === "escala" && (
                    <div className="mt-1.5 flex gap-1">
                      {Array.from({ length: Math.min((p.escalaMax ?? 10) - (p.escalaMin ?? 1) + 1, 10) }, (_, j) => (
                        <div key={j} className="w-4 h-4 rounded bg-slate-100" />
                      ))}
                    </div>
                  )}
                  {p.tipo === "simnao" && (
                    <div className="mt-1.5 flex gap-1.5">
                      <div className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] text-slate-400">Sim</div>
                      <div className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] text-slate-400">Não</div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
