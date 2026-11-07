import { beforeEach, describe, expect, it, vi } from "vitest"

// Simula o localStorage do navegador.
const dados = new Map<string, string>()
vi.stubGlobal("window", {
  localStorage: { getItem: (k: string) => dados.get(k) ?? null, setItem: (k: string, v: string) => void dados.set(k, v), removeItem: (k: string) => void dados.delete(k) },
  dispatchEvent: () => true,
})
vi.stubGlobal("Event", class {})

const { clienteDemo, iniciarSessaoDemo, restaurarDadosDemo } = await import("@/lib/demo/cliente")

describe("cliente de demonstração", () => {
  beforeEach(() => { restaurarDadosDemo(); iniciarSessaoDemo("admin") })

  it("os dados não têm nomes de teste", async () => {
    const tabelas = ["eventos", "atividades", "oficinas", "centros", "assistencia"]
    for (const t of tabelas) {
      const { data } = await clienteDemo.from(t).select("*")
      const nomes = (data as { nome: string }[]).map((x) => x.nome.toLowerCase())
      expect(nomes.length).toBeGreaterThan(2)
      expect(nomes.filter((n) => /teste|bbb|asdf|update/.test(n))).toEqual([])
    }
  })

  it("filtra e devolve um registro só", async () => {
    const { data } = await clienteDemo.from("oficinas").select("*").eq("id", "ofi-info").single()
    expect((data as { nome: string }).nome).toBe("Informática Básica")
  })

  it("aplica apelido de coluna", async () => {
    const { data } = await clienteDemo.from("centros").select("id, nome, local:endereco").eq("id", "cen-norte").single()
    expect((data as { local: string }).local).toContain("Benfica")
  })

  it("recusa inscrição repetida", async () => {
    const linha = { item_tipo: "evento", item_id: "evt-natal", item_nome: "Natal", cliente_id: "usr-a1", status: "marcada" }
    expect((await clienteDemo.from("presencas").insert([linha])).error).toBeNull()
    expect((await clienteDemo.from("presencas").insert([linha])).error?.code).toBe("23505")
  })

  it("registra o histórico de ações", async () => {
    await clienteDemo.from("eventos").update({ nome: "Festival Novo" }).eq("id", "evt-festival")
    const { data } = await clienteDemo.from("auditoria").select("*")
    expect((data as { acao: string; descricao: string }[])[0]).toMatchObject({ acao: "alterou", descricao: "Festival Novo" })
  })

  it("a oficina de exemplo está lotada e tem fila", async () => {
    const { data: ins } = await clienteDemo.from("presencas").select("*").eq("item_id", "ofi-info")
    const { data: fila } = await clienteDemo.from("lista_espera").select("*").eq("item_id", "ofi-info")
    expect((ins as unknown[]).length).toBe(12)
    expect((fila as unknown[]).length).toBeGreaterThan(0)
  })

  it("entra com o perfil escolhido", async () => {
    iniciarSessaoDemo("voluntario")
    const { data } = await clienteDemo.auth.getUser()
    expect(data.user?.id).toBe("usr-carlos")
  })
})

describe("presença por dia", () => {
  beforeEach(() => { restaurarDadosDemo(); iniciarSessaoDemo("admin") })
  it("os registros existem e nunca estão no futuro", async () => {
    const { data } = await clienteDemo.from("registros").select("*")
    const l = data as { data: string; status: string }[]
    const hoje = new Date().toISOString().slice(0, 10)
    expect(l.length).toBeGreaterThan(100)
    expect(l.filter((r) => r.data > hoje)).toEqual([])
  })
  it("cada item tem foto", async () => {
    for (const t of ["eventos", "atividades", "oficinas", "centros", "assistencia"]) {
      const { data } = await clienteDemo.from(t).select("*")
      expect((data as { imagem_url?: string }[]).every((x) => x.imagem_url?.startsWith("/demo/"))).toBe(true)
    }
  })
})
