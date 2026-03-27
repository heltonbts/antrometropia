export type TipoPergunta = "texto" | "textarea" | "multipla" | "checkbox" | "simnao" | "escala" | "data"

export interface Pergunta {
  id: string
  tipo: TipoPergunta
  pergunta: string
  obrigatoria: boolean
  opcoes?: string[]
  escalaMin?: number
  escalaMax?: number
  escalaMinLabel?: string
  escalaMaxLabel?: string
}

export const MODELOS_PADRAO: { nome: string; descricao: string; perguntas: Pergunta[] }[] = [
  {
    nome: "Anamnese Inicial",
    descricao: "Formulário completo para a primeira consulta",
    perguntas: [
      { id: "q1",  tipo: "multipla",  pergunta: "Qual é o seu principal objetivo?", obrigatoria: true, opcoes: ["Perda de peso", "Ganho de massa muscular", "Saúde e bem-estar", "Performance esportiva", "Reeducação alimentar", "Outro"] },
      { id: "q2",  tipo: "texto",     pergunta: "Há quanto tempo você tem esse objetivo?", obrigatoria: false },
      { id: "q3",  tipo: "simnao",    pergunta: "Você tem alguma doença diagnosticada?", obrigatoria: true },
      { id: "q4",  tipo: "texto",     pergunta: "Se sim, qual(is) doença(s)?", obrigatoria: false },
      { id: "q5",  tipo: "simnao",    pergunta: "Faz uso de algum medicamento regularmente?", obrigatoria: true },
      { id: "q6",  tipo: "texto",     pergunta: "Se sim, qual(is) medicamento(s)?", obrigatoria: false },
      { id: "q7",  tipo: "simnao",    pergunta: "Tem alguma alergia ou intolerância alimentar?", obrigatoria: true },
      { id: "q8",  tipo: "texto",     pergunta: "Se sim, qual(is)?", obrigatoria: false },
      { id: "q9",  tipo: "multipla",  pergunta: "Como você avalia seu nível de atividade física atual?", obrigatoria: true, opcoes: ["Sedentário (não pratico exercícios)", "Levemente ativo (1-2x por semana)", "Moderadamente ativo (3-4x por semana)", "Muito ativo (5+ vezes por semana)"] },
      { id: "q10", tipo: "multipla",  pergunta: "Quantas refeições você faz por dia?", obrigatoria: true, opcoes: ["1 a 2 refeições", "3 a 4 refeições", "5 a 6 refeições", "Mais de 6 refeições"] },
      { id: "q11", tipo: "multipla",  pergunta: "Com que frequência consome bebidas alcoólicas?", obrigatoria: false, opcoes: ["Nunca", "Raramente", "Socialmente (fins de semana)", "Frequentemente"] },
      { id: "q12", tipo: "simnao",    pergunta: "Você é fumante?", obrigatoria: false },
      { id: "q13", tipo: "escala",    pergunta: "Como você avalia a qualidade do seu sono?", obrigatoria: true, escalaMin: 1, escalaMax: 10, escalaMinLabel: "Muito ruim", escalaMaxLabel: "Excelente" },
      { id: "q14", tipo: "escala",    pergunta: "Como você avalia seu nível de estresse no dia a dia?", obrigatoria: true, escalaMin: 1, escalaMax: 10, escalaMinLabel: "Sem estresse", escalaMaxLabel: "Muito estressado" },
      { id: "q15", tipo: "checkbox",  pergunta: "Você possui alguma preferência ou restrição alimentar?", obrigatoria: false, opcoes: ["Vegetariano", "Vegano", "Sem glúten", "Sem lactose", "Low carb", "Sem açúcar", "Nenhuma"] },
      { id: "q16", tipo: "textarea",  pergunta: "Descreva um dia típico da sua alimentação (do café da manhã até a noite)", obrigatoria: false },
      { id: "q17", tipo: "textarea",  pergunta: "Há algo mais que gostaria de compartilhar com o nutricionista?", obrigatoria: false },
    ],
  },
  {
    nome: "Retorno / Acompanhamento",
    descricao: "Formulário rápido para consultas de retorno",
    perguntas: [
      { id: "q1", tipo: "escala",   pergunta: "Como você avalia sua evolução desde a última consulta?", obrigatoria: true, escalaMin: 1, escalaMax: 10, escalaMinLabel: "Nenhuma evolução", escalaMaxLabel: "Evolução excelente" },
      { id: "q2", tipo: "multipla", pergunta: "Conseguiu seguir o plano alimentar?", obrigatoria: true, opcoes: ["Sim, totalmente", "Sim, parcialmente", "Pouco", "Não consegui seguir"] },
      { id: "q3", tipo: "textarea", pergunta: "Quais foram as maiores dificuldades?", obrigatoria: false },
      { id: "q4", tipo: "simnao",   pergunta: "Houve alguma mudança significativa na sua rotina desde a última consulta?", obrigatoria: false },
      { id: "q5", tipo: "texto",    pergunta: "Se sim, o que mudou?", obrigatoria: false },
      { id: "q6", tipo: "escala",   pergunta: "Como está seu nível de energia no dia a dia?", obrigatoria: true, escalaMin: 1, escalaMax: 10, escalaMinLabel: "Muito cansado", escalaMaxLabel: "Com muita energia" },
      { id: "q7", tipo: "simnao",   pergunta: "Praticou atividade física no período?", obrigatoria: false },
      { id: "q8", tipo: "multipla", pergunta: "Como está seu sono?", obrigatoria: false, opcoes: ["Melhorou", "Igual", "Piorou"] },
      { id: "q9", tipo: "textarea", pergunta: "Dúvidas ou recados para o nutricionista", obrigatoria: false },
    ],
  },
  {
    nome: "Hábitos Alimentares",
    descricao: "Avaliação detalhada dos hábitos e comportamentos alimentares",
    perguntas: [
      { id: "q1",  tipo: "multipla", pergunta: "Com que frequência você come fora de casa?", obrigatoria: true, opcoes: ["Raramente", "1 a 2 vezes por semana", "3 a 4 vezes por semana", "Todos os dias"] },
      { id: "q2",  tipo: "simnao",   pergunta: "Consome frutas e vegetais diariamente?", obrigatoria: true },
      { id: "q3",  tipo: "multipla", pergunta: "Com que frequência consome alimentos ultraprocessados (salgadinhos, biscoitos, refrigerantes)?", obrigatoria: true, opcoes: ["Raramente ou nunca", "Às vezes (1-2x por semana)", "Frequentemente (3-4x por semana)", "Todos os dias"] },
      { id: "q4",  tipo: "multipla", pergunta: "Quantos copos de água você bebe por dia?", obrigatoria: true, opcoes: ["Menos de 4 copos", "4 a 6 copos", "6 a 8 copos", "Mais de 8 copos"] },
      { id: "q5",  tipo: "simnao",   pergunta: "Costuma pular refeições?", obrigatoria: true },
      { id: "q6",  tipo: "multipla", pergunta: "Se sim, qual refeição pula com mais frequência?", obrigatoria: false, opcoes: ["Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde", "Jantar"] },
      { id: "q7",  tipo: "multipla", pergunta: "Como você se sente na maior parte do tempo em relação à alimentação?", obrigatoria: false, opcoes: ["Satisfeito e sem culpa", "Ansioso com a comida", "Com compulsão em alguns momentos", "Com restrição excessiva"] },
      { id: "q8",  tipo: "checkbox", pergunta: "Quais dessas situações se aplicam a você?", obrigatoria: false, opcoes: ["Como rápido, sem mastigar bem", "Como sem fome por hábito ou ansiedade", "Belisco muito entre as refeições", "Tenho muita fome à noite", "Sinto culpa após comer", "Nenhuma das anteriores"] },
      { id: "q9",  tipo: "textarea", pergunta: "Descreva um dia típico da sua alimentação", obrigatoria: true },
      { id: "q10", tipo: "textarea", pergunta: "Quais alimentos você não consegue abrir mão de jeito nenhum?", obrigatoria: false },
    ],
  },
]
