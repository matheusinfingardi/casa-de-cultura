import { DIA_POR_INDICE, faixaHorario, dataBR, paraData } from "@/lib/formatar"
import { normalizarRecorrencia, ocorrenciasNoPeriodo, resumoRecorrencia, type Ocorrencia } from "@/lib/agenda"
import { assistenciaApi, atividadesApi, centrosApi, eventosApi, oficinasApi } from "@/lib/services/entidades"
import { ITEM_TIPO_TABLE, type ItemTipo } from "@/lib/services/presencas"
import type { Assistencia, Atividade, Centro, Evento, Oficina } from "@/lib/tipos"

export type ItemView = {
  tipo: ItemTipo
  id: string
  nome: string
  descricao: string
  local: string
  quando: string
  vagas: number | null
  responsavel: string
  responsavel_id: string | null
  imagem_url: string
  centro_id: string
  endereco_mapa: string
  tem_certificado: boolean
  fatos: { rotulo: string; valor: string }[]
  bruto: Evento | Atividade | Oficina | Centro | Assistencia
}

export const API_DO_TIPO = {
  evento: eventosApi, atividade: atividadesApi, oficina: oficinasApi, centro: centrosApi, assistencia: assistenciaApi,
}

export const TIPOS_EVENTO: Record<string, string> = { cultural: "Cultural", social: "Social", saude: "Saúde", educacao: "Educação" }
export const NIVEIS: Record<string, string> = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" }

export function rotaAdmin(tipo: ItemTipo, id?: string) {
  return `/portal/${ITEM_TIPO_TABLE[tipo]}${id ? `/${id}` : ""}`
}

function montar(tipo: ItemTipo, b: Record<string, unknown>): ItemView {
  const s = (k: string) => (b[k] as string | null | undefined) ?? ""
  const base = {
    tipo, id: s("id"), nome: s("nome") || "Sem nome", descricao: s("descricao"), local: s("local"), vagas: null as number | null,
    responsavel: s("responsavel"), responsavel_id: (b.responsavel_id as string | null) ?? null,
    imagem_url: s("imagem_url"), centro_id: s("centro_id"), endereco_mapa: s("endereco_mapa"), tem_certificado: b.tem_certificado === true, bruto: b as ItemView["bruto"],
  }
  if (tipo === "evento") {
    const quando = `${dataBR(s("data"))}, ${faixaHorario(s("horarioInicio"), s("horarioFim"))}`
    return { ...base, quando, fatos: [{ rotulo: "Tipo", valor: TIPOS_EVENTO[s("tipo")] ?? s("tipo") }, { rotulo: "Quando", valor: quando }, { rotulo: "Onde", valor: s("local") }] }
  }
  if (tipo === "atividade") {
    const quando = resumoRecorrencia(normalizarRecorrencia(b.recorrencia))
    return { ...base, quando, fatos: [{ rotulo: "Quando", valor: quando }, { rotulo: "Onde", valor: s("local") }] }
  }
  if (tipo === "oficina") {
    const quando = `Toda ${s("dia").toLowerCase()}, ${faixaHorario(s("horarioInicio"), s("horarioFim"))}`
    return { ...base, quando, vagas: Number(b.vagas) || 0, fatos: [{ rotulo: "Nível", valor: NIVEIS[s("nivel")] ?? s("nivel") }, { rotulo: "Quando", valor: quando }, { rotulo: "Onde", valor: s("local") }, { rotulo: "Vagas", valor: String(b.vagas ?? "") }] }
  }
  if (tipo === "centro") {
    return { ...base, local: s("endereco"), quando: "", fatos: [{ rotulo: "Endereço", valor: s("endereco") }, { rotulo: "Telefone", valor: s("telefone") || "Não informado" }] }
  }
  return { ...base, quando: "", fatos: [{ rotulo: "Tipo de apoio", valor: s("tipo") }, { rotulo: "Onde", valor: s("local") }] }
}

export const paraView = (tipo: ItemTipo, b: unknown) => montar(tipo, b as Record<string, unknown>)

export async function carregarItem(tipo: ItemTipo, id: string): Promise<ItemView | null> {
  const b = await API_DO_TIPO[tipo].buscar(id)
  return b ? montar(tipo, b as unknown as Record<string, unknown>) : null
}

/** Próximas datas de um item nos próximos `dias` dias. */
export function proximasDatas(v: ItemView, dias = 60): Ocorrencia[] {
  const de = new Date()
  const ate = new Date()
  ate.setDate(ate.getDate() + dias)
  return ocorrenciasNoPeriodo(
    {
      eventos: v.tipo === "evento" ? [v.bruto as Evento] : [],
      atividades: v.tipo === "atividade" ? [v.bruto as Atividade] : [],
      oficinas: v.tipo === "oficina" ? [v.bruto as Oficina] : [],
    },
    de, ate
  )
}

/** Tudo o que pode receber inscrição, já no formato de exibição. */
export async function listarItensView(): Promise<ItemView[]> {
  const tipos: ItemTipo[] = ["evento", "atividade", "oficina", "assistencia", "centro"]
  const r = await Promise.all(tipos.map(async (t) => (await API_DO_TIPO[t].listar()).map((b) => paraView(t, b))))
  return r.flat()
}

/** Endereço usado no mapa: o do próprio item, o da unidade ou, por último, o local escrito. */
export function enderecoDoMapa(v: ItemView, enderecoUnidade?: string): string {
  if (v.endereco_mapa) return v.endereco_mapa
  if (enderecoUnidade) return `${enderecoUnidade}, MG`
  return v.local ? `${v.local}, Juiz de Fora - MG` : ""
}

export async function enderecoDaUnidade(v: ItemView): Promise<string | undefined> {
  if (!v.centro_id) return undefined
  return (await centrosApi.buscar(v.centro_id))?.endereco
}

/** Datas que existem de fato para o item, entre `diasAtras` e `diasFrente` a partir de hoje. */
export function datasDoItem(v: ItemView, diasAtras = 30, diasFrente = 30): Ocorrencia[] {
  const de = new Date(); de.setDate(de.getDate() - diasAtras)
  const ate = new Date(); ate.setDate(ate.getDate() + diasFrente)
  return ocorrenciasNoPeriodo(
    {
      eventos: v.tipo === "evento" ? [v.bruto as Evento] : [],
      atividades: v.tipo === "atividade" ? [v.bruto as Atividade] : [],
      oficinas: v.tipo === "oficina" ? [v.bruto as Oficina] : [],
    },
    de, ate
  )
}

/** Libera ou suspende os certificados de um item. */

/** O item acontece dentro dos horários livres da pessoa? `null` quando o item não tem dia fixo. */
export function combinaComHorarios(v: ItemView, horarios: Record<string, { inicio: string; fim: string }[]>): boolean | null {
  const datas = proximasDatas(v, 21)
  if (!datas.length) return null
  return datas.some((o) => {
    const dia = DIA_POR_INDICE[paraData(o.data).getDay()]
    return (horarios[dia] ?? []).some((f) => f.inicio && f.fim && f.inicio <= o.inicio.slice(0, 5) && f.fim >= o.fim.slice(0, 5))
  })
}
