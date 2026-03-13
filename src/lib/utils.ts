import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarData(data: Date | string): string {
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatarNumero(valor: number | null, casas = 1): string {
  if (valor === null || valor === undefined) return "—"
  return valor.toFixed(casas)
}

export function normalizarSexo(valor: string | null | undefined): "M" | "F" | null {
  if (!valor) return null

  const sexo = valor.trim().toLowerCase()

  if (["m", "masculino", "male", "homem", "masc"].includes(sexo)) return "M"
  if (["f", "feminino", "female", "mulher", "fem"].includes(sexo)) return "F"

  return null
}

export function formatarSexo(valor: string | null | undefined): string {
  const sexo = normalizarSexo(valor)
  if (sexo === "M") return "Masculino"
  if (sexo === "F") return "Feminino"
  return "Não informado"
}

export function calcularIdade(dataNascimento: Date | string): number {
  const nasc = new Date(dataNascimento)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

export function corRisco(classificacao: string): string {
  const cl = classificacao.toLowerCase()
  if (cl.includes("muito elevado") || cl.includes("grau iii") || cl.includes("alto")) {
    return "text-red-500"
  }
  if (cl.includes("elevado") || cl.includes("grau i") || cl.includes("grau ii") || cl.includes("moderado") || cl.includes("sobrepeso")) {
    return "text-amber-500"
  }
  return "text-emerald-500"
}

export function bgRisco(classificacao: string): string {
  const cl = classificacao.toLowerCase()
  if (cl.includes("muito elevado") || cl.includes("grau iii") || cl.includes("alto")) {
    return "bg-red-50 border-red-200"
  }
  if (cl.includes("elevado") || cl.includes("grau i") || cl.includes("grau ii") || cl.includes("moderado") || cl.includes("sobrepeso")) {
    return "bg-amber-50 border-amber-200"
  }
  return "bg-emerald-50 border-emerald-200"
}
