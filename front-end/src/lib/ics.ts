import type { Ocorrencia } from "@/lib/agenda"

const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n")
const dt = (d: string, h: string) => `${d.replace(/-/g, "")}T${(h || "00:00").slice(0, 5).replace(":", "")}00`

/** Arquivo de calendário (.ics) que abre no Google Agenda, Outlook e iPhone. */
export function gerarIcs(itens: Ocorrencia[]): string {
  const linhas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Casa de Cultura//Agenda//PT-BR", "CALSCALE:GREGORIAN"]
  for (const o of itens) {
    linhas.push(
      "BEGIN:VEVENT",
      `UID:${o.chave}@casadecultura`,
      `DTSTART;TZID=America/Sao_Paulo:${dt(o.data, o.inicio)}`,
      `DTEND;TZID=America/Sao_Paulo:${dt(o.data, o.fim || o.inicio)}`,
      `SUMMARY:${esc(o.titulo)}`,
      `LOCATION:${esc(o.local)}`,
      "END:VEVENT"
    )
  }
  linhas.push("END:VCALENDAR")
  return linhas.join("\r\n") + "\r\n"
}

export function baixarArquivo(nome: string, conteudo: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
  const a = document.createElement("a")
  a.href = url
  a.download = nome
  a.click()
  URL.revokeObjectURL(url)
}

export const baixarIcs = (nome: string, itens: Ocorrencia[]) => baixarArquivo(nome, gerarIcs(itens), "text/calendar;charset=utf-8")

/** CSV com ponto e vírgula e BOM: abre certo no Excel em português. */
export function gerarCsv(linhas: (string | number)[][]): string {
  const c = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  return "﻿" + linhas.map((l) => l.map(c).join(";")).join("\r\n")
}
