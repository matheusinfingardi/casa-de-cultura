// Cliente que imita o subconjunto da API do Supabase usado pelo app, guardando tudo no navegador.
// Assim os serviços (lib/services) funcionam igual na demonstração e no banco real.
import { criarBanco, USUARIOS_DEMO, type BancoDemo } from "./dados"
import { definirDemo } from "./modo"

const CHAVE_BANCO = "cc-demo-banco-v9"
const CHAVE_USUARIO = "cc-demo-usuario"

type Linha = Record<string, unknown>
type Erro = { message: string; code?: string } | null
type Resposta = { data: unknown; error: Erro }

let cache: BancoDemo | null = null

export function banco(): BancoDemo {
  if (cache) return cache
  try {
    const salvo = window.localStorage.getItem(CHAVE_BANCO)
    cache = salvo ? (JSON.parse(salvo) as BancoDemo) : criarBanco()
  } catch {
    cache = criarBanco()
  }
  return cache
}

function salvar() {
  try {
    window.localStorage.setItem(CHAVE_BANCO, JSON.stringify(cache))
  } catch {
    /* sem espaço: mantém só em memória */
  }
}

export function restaurarDadosDemo() {
  cache = criarBanco()
  salvar()
}

function usuarioId(): string | null {
  try {
    return window.localStorage.getItem(CHAVE_USUARIO)
  } catch {
    return null
  }
}

function usuarioAuth() {
  const id = usuarioId()
  if (!id) return null
  const p = banco().profiles.find((x) => x.id === id)
  if (!p) return null
  return {
    id,
    aud: "authenticated",
    email: p.email as string,
    user_metadata: { nome: p.nome as string },
    app_metadata: {},
    created_at: p.created_at as string,
  }
}

const NOMES: Record<string, string> = {
  eventos: "evento", atividades: "atividade", oficinas: "oficina", centros: "centro", assistencia: "assistência",
  presencas: "presença", profiles: "usuário", metas: "meta", convites: "convite", pedidos_voluntario: "pedido de voluntário",
  mensagens: "comunicado", certificados: "certificado", fichas: "ficha", dependentes: "familiar", acompanhamento: "acompanhamento",
}
const NAO_AUDITAR = new Set(["auditoria", "notificacoes", "seguranca", "consentimentos", "registros"])

function auditar(tabela: string, acao: string, linha?: Linha) {
  if (NAO_AUDITAR.has(tabela)) return
  const autor = usuarioAuth()?.user_metadata.nome ?? "Sistema"
  const desc = (linha?.nome ?? linha?.item_nome ?? linha?.titulo ?? linha?.assunto ?? linha?.email ?? "") as string
  banco().auditoria.unshift({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    usuario: autor, acao, tabela, descricao: desc || NOMES[tabela] || tabela, created_at: new Date().toISOString(),
  })
}

function projetar(linha: Linha, select: string): Linha {
  if (!select || select === "*") return linha
  const out: Linha = {}
  for (const parte of select.split(/,(?![^()]*\))/).map((t) => t.trim())) {
    if (parte === "*") Object.assign(out, linha)
    else if (parte.startsWith("profiles(")) {
      const p = banco().profiles.find((x) => x.id === linha.cliente_id)
      // Dependentes não têm conta: entram na lista pelo próprio cadastro, ligados a quem cuida deles.
      const d = p ? null : banco().dependentes?.find((x) => x.id === linha.cliente_id)
      out.profiles = p ? { nome: p.nome, email: p.email } : d ? { nome: d.nome, email: "", dependente_de: d.responsavel_id } : null
    } else if (parte.includes(":")) {
      const [alias, col] = parte.split(":")
      out[alias] = linha[col]
    } else out[parte] = linha[parte]
  }
  return out
}

class Consulta implements PromiseLike<Resposta> {
  private op: "select" | "insert" | "update" | "delete" = "select"
  private filtros: ((l: Linha) => boolean)[] = []
  private colunas = "*"
  private umSo = false
  private talvezUm = false
  private ordem: { col: string; asc: boolean } | null = null
  private limite: number | null = null
  private carga: Linha[] | Linha | null = null
  private retornar = false
  private sobrescreve = false

  constructor(private tabela: string) {}

  select(c = "*") {
    this.colunas = c
    if (this.op !== "select") this.retornar = true
    return this
  }
  insert(linhas: Linha[] | Linha) { this.op = "insert"; this.carga = linhas; return this }
  update(valores: Linha) { this.op = "update"; this.carga = valores; return this }
  upsert(linhas: Linha[] | Linha) { this.op = "insert"; this.carga = linhas; this.sobrescreve = true; return this }
  delete() { this.op = "delete"; return this }
  eq(col: string, v: unknown) { this.filtros.push((l) => l[col] === v); return this }
  neq(col: string, v: unknown) { this.filtros.push((l) => l[col] !== v); return this }
  in(col: string, vs: unknown[]) { this.filtros.push((l) => vs.includes(l[col])); return this }
  order(col: string, o?: { ascending?: boolean }) { this.ordem = { col, asc: o?.ascending !== false }; return this }
  limit(n: number) { this.limite = n; return this }
  single() { this.umSo = true; return this }
  maybeSingle() { this.talvezUm = true; return this }

  private executar(): Resposta {
    const db = banco()
    db[this.tabela] ??= []
    const passa = (l: Linha) => this.filtros.every((f) => f(l))

    if (this.op === "select") {
      let out = db[this.tabela].filter(passa)
      if (this.ordem) {
        const { col, asc } = this.ordem
        out = [...out].sort((a, b) => String(a[col] ?? "").localeCompare(String(b[col] ?? ""), "pt-BR") * (asc ? 1 : -1))
      }
      if (this.limite != null) out = out.slice(0, this.limite)
      const proj = out.map((l) => projetar(l, this.colunas))
      if (this.umSo) return proj[0] ? { data: proj[0], error: null } : { data: null, error: { message: "Registro não encontrado", code: "PGRST116" } }
      if (this.talvezUm) return { data: proj[0] ?? null, error: null }
      return { data: proj, error: null }
    }

    if (this.op === "insert") {
      const novas: Linha[] = (Array.isArray(this.carga) ? this.carga : [this.carga]).map((l) => ({
        id: `${this.tabela.slice(0, 3)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        created_at: new Date().toISOString(),
        ...(l as Linha),
      }))
      if (this.tabela === "presencas") {
        for (const n of novas) {
          const repetida = db.presencas.some((p) => p.item_tipo === n.item_tipo && p.item_id === n.item_id && p.cliente_id === n.cliente_id)
          if (repetida) return { data: null, error: { message: "duplicate key value", code: "23505" } }
        }
      }
      for (const n of novas) {
        const i = this.sobrescreve ? db[this.tabela].findIndex((x) => x.id === n.id) : -1
        if (i >= 0) db[this.tabela][i] = { ...db[this.tabela][i], ...n }
        else db[this.tabela].push(n)
        auditar(this.tabela, i >= 0 ? "alterou" : "criou", n)
      }
      salvar()
      return { data: this.retornar ? novas : null, error: null }
    }

    if (this.op === "update") {
      const alvo = db[this.tabela].filter(passa)
      for (const l of alvo) {
        Object.assign(l, this.carga as Linha)
        auditar(this.tabela, "alterou", l)
      }
      salvar()
      return { data: this.retornar ? alvo : null, error: null }
    }

    db[this.tabela].filter(passa).forEach((l) => auditar(this.tabela, "excluiu", l))
    db[this.tabela] = db[this.tabela].filter((l) => !passa(l))
    salvar()
    return { data: null, error: null }
  }

  then<A = Resposta, B = never>(ok?: ((r: Resposta) => A | PromiseLike<A>) | null, falha?: ((e: unknown) => B | PromiseLike<B>) | null): PromiseLike<A | B> {
    return Promise.resolve().then(() => this.executar()).then(ok, falha)
  }
}

type Ouvinte = (evento: string, sessao: { user: unknown } | null) => void
const ouvintes = new Set<Ouvinte>()

function sessao() {
  const user = usuarioAuth()
  return user ? { user, access_token: "demo", refresh_token: "demo" } : null
}

export const clienteDemo = {
  from: (tabela: string) => new Consulta(tabela),
  auth: {
    getSession: async () => ({ data: { session: sessao() }, error: null }),
    getUser: async () => ({ data: { user: usuarioAuth() }, error: null }),
    signInWithPassword: async ({ email }: { email: string }) => {
      const p = banco().profiles.find((x) => x.email === email)
      if (!p) return { data: { user: null, session: null }, error: { message: "Invalid login credentials" } }
      window.localStorage.setItem(CHAVE_USUARIO, p.id as string)
      ouvintes.forEach((o) => o("SIGNED_IN", sessao()))
      return { data: { user: usuarioAuth(), session: sessao() }, error: null }
    },
    signUp: async ({ email, options }: { email: string; options?: { data?: { nome?: string } } }) => {
      const db = banco()
      if (db.profiles.some((x) => x.email === email)) return { data: { user: null }, error: { message: "User already registered" } }
      const id = `usr-${Date.now().toString(36)}`
      db.profiles.push({ id, nome: options?.data?.nome ?? email, email, role: "cliente", created_at: new Date().toISOString() })
      salvar()
      return { data: { user: { id, email } }, error: null }
    },
    signOut: async () => {
      window.localStorage.removeItem(CHAVE_USUARIO)
      ouvintes.forEach((o) => o("SIGNED_OUT", null))
      definirDemo(false)
      return { error: null }
    },
    updateUser: async (d: { password?: string; data?: { nome?: string } }) => {
      const id = usuarioId()
      const p = banco().profiles.find((x) => x.id === id)
      if (p && d.data?.nome) { p.nome = d.data.nome; salvar() }
      ouvintes.forEach((o) => o("USER_UPDATED", sessao()))
      return { data: { user: usuarioAuth() }, error: null }
    },
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    onAuthStateChange: (cb: Ouvinte) => {
      ouvintes.add(cb)
      return { data: { subscription: { unsubscribe: () => ouvintes.delete(cb) } } }
    },
  },
}

/** Liga a demonstração como um dos três perfis. A página é recarregada pelo chamador. */
export function iniciarSessaoDemo(perfil: keyof typeof USUARIOS_DEMO) {
  definirDemo(true)
  window.localStorage.setItem(CHAVE_USUARIO, USUARIOS_DEMO[perfil])
}
