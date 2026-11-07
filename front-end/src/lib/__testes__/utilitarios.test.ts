import { describe, expect, it } from "vitest"
import { dataBR, iniciais, mascararTelefone, normalizarDia } from "@/lib/formatar"
import { gerarCsv, gerarIcs } from "@/lib/ics"
import { codigoTotp, validarTotp } from "@/lib/totp"
import { lerCodigo, codigoDaPessoa } from "@/lib/checkin"
import { obrigatorio, validarHorarios, validarTelefone } from "@/lib/validacao"

describe("formatar", () => {
  it("normaliza dias", () => {
    expect(normalizarDia("TERÇA-FEIRA")).toBe("Terça")
    expect(normalizarDia("sabado")).toBe("Sábado")
    expect(normalizarDia("12222112")).toBeNull()
  })
  it("máscara de telefone", () => {
    expect(mascararTelefone("32999998888")).toBe("(32) 99999-8888")
    expect(mascararTelefone("3232154400")).toBe("(32) 3215-4400")
  })
  it("data sem deslocar o fuso", () => {
    expect(dataBR("2026-11-07")).toBe("07/11/2026")
  })
  it("iniciais", () => {
    expect(iniciais("Ana Maria Souza")).toBe("AS")
    expect(iniciais(null)).toBe("?")
  })
})

describe("validação", () => {
  it("término depois do início", () => {
    expect(validarHorarios("19:00", "18:00").fim).toBeTruthy()
    expect(validarHorarios("18:00", "19:00")).toEqual({})
  })
  it("telefone opcional, mas completo", () => {
    expect(validarTelefone("")).toBeUndefined()
    expect(validarTelefone("(32) 9999")).toBeTruthy()
  })
  it("obrigatório", () => {
    expect(obrigatorio("  ", "erro")).toBe("erro")
  })
})

describe("verificação em duas etapas (RFC 6238)", () => {
  // Vetor oficial: segredo ASCII "12345678901234567890" em base32
  const segredo = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"
  it("gera o código esperado", async () => {
    expect(await codigoTotp(segredo, 59_000, 8)).toBe("94287082")
    expect(await codigoTotp(segredo, 1111111109_000, 8)).toBe("07081804")
  })
  it("recusa código errado", async () => {
    expect(await validarTotp(segredo, "000000")).toBe(false)
  })
})

describe("arquivos", () => {
  it("ics com CRLF e horário de Brasília", () => {
    const t = gerarIcs([{ chave: "c", itemId: "i", tipo: "evento", titulo: "Sarau, poesia", data: "2026-12-05", inicio: "19:00", fim: "21:00", local: "Sede", responsavel: "", href: "" }])
    expect(t).toContain("DTSTART;TZID=America/Sao_Paulo:20261205T190000")
    expect(t).toContain("SUMMARY:Sarau\\, poesia")
    expect(t.endsWith("\r\n")).toBe(true)
  })
  it("csv abre certo no Excel", () => {
    expect(gerarCsv([["a", 1], ['b"c', 2]])).toBe('﻿"a";"1"\r\n"b""c";"2"')
  })
  it("qr code ida e volta", () => {
    expect(lerCodigo(codigoDaPessoa("usr-ana"))).toBe("usr-ana")
    expect(lerCodigo(" usr-ana ")).toBe("usr-ana")
  })
})
