import { describe, expect, it } from "vitest"
import { normalizarRecorrencia, ocorrenciasNoPeriodo, resumoRecorrencia, gradeDoMes } from "@/lib/agenda"
import type { Atividade, Evento, Oficina } from "@/lib/tipos"

const resp = { responsavel: "", responsavel_id: null }

describe("normalizarRecorrencia", () => {
  it("aceita minúsculas e dias com -feira", () => {
    const r = normalizarRecorrencia({ tipo: "semanal", horarios: { "Segunda-feira": { horarioInicio: "18:00", horarioFim: "19:00" } } })
    expect(r).toEqual({ tipo: "Semanal", horarios: { Segunda: { horarioInicio: "18:00", horarioFim: "19:00" } } })
  })
  it("entende o formato antigo com lista de dias", () => {
    const r = normalizarRecorrencia({ tipo: "semanal", dias: ["Terça"], horarios: {} })
    expect(r.tipo === "Semanal" && r.horarios["Terça"]).toBeTruthy()
  })
  it("sem dados vira data única vazia", () => {
    expect(normalizarRecorrencia(null)).toEqual({ tipo: "Unica", data: "", horarioInicio: "", horarioFim: "" })
  })
})

describe("resumoRecorrencia", () => {
  it("resume dias com o mesmo horário", () => {
    const h = { horarioInicio: "17:00", horarioFim: "18:00" }
    expect(resumoRecorrencia({ tipo: "Semanal", horarios: { "Terça": h, Quinta: h } })).toBe("Toda terça e quinta, 17:00 às 18:00")
  })
  it("avisa quando os horários são diferentes", () => {
    expect(resumoRecorrencia({ tipo: "Semanal", horarios: { "Terça": { horarioInicio: "17:00", horarioFim: "18:00" }, Quinta: { horarioInicio: "09:00", horarioFim: "10:00" } } })).toContain("horários diferentes")
  })
})

describe("ocorrenciasNoPeriodo", () => {
  const novembro = [new Date(2026, 10, 1), new Date(2026, 10, 30)] as const
  it("repete atividade semanal em todos os dias certos", () => {
    const atividades = [{ id: "a", nome: "Violão", local: "", ...resp, recorrencia: { tipo: "Semanal", horarios: { Segunda: { horarioInicio: "18:00", horarioFim: "19:00" } } } }] as Atividade[]
    expect(ocorrenciasNoPeriodo({ eventos: [], atividades, oficinas: [] }, ...novembro).map((o) => o.data)).toEqual(["2026-11-02", "2026-11-09", "2026-11-16", "2026-11-23", "2026-11-30"])
  })
  it("ignora dados inválidos do banco (ano absurdo, dia que não existe)", () => {
    const eventos = [{ id: "e", nome: "x", data: "30300-03-30", ...resp }] as unknown as Evento[]
    const oficinas = [{ id: "o", nome: "y", dia: "12222112", ...resp }] as unknown as Oficina[]
    expect(ocorrenciasNoPeriodo({ eventos, atividades: [], oficinas }, ...novembro)).toEqual([])
  })
})

it("grade do mês tem 6 semanas e começa no domingo", () => {
  const g = gradeDoMes(2026, 10)
  expect(g).toHaveLength(42)
  expect(g[0].data.getDay()).toBe(0)
})
