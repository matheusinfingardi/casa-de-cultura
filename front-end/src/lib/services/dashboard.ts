import { eventosApi, atividadesApi, oficinasApi, centrosApi, assistenciaApi } from "./entidades"
import { listarUsuarios, type Usuario } from "./usuarios"
import { listarResumoPresencas, type PresencaResumo } from "./presencas"
import type { Assistencia, Atividade, Centro, Evento, Oficina } from "@/lib/tipos"

export type DadosDashboard = {
  eventos: Evento[]
  atividades: Atividade[]
  oficinas: Oficina[]
  centros: Centro[]
  assistencias: Assistencia[]
  usuarios: Usuario[]
  presencas: PresencaResumo[]
}

/** Carrega tudo o que a Visão geral precisa, em paralelo. */
export async function carregarDashboard(): Promise<DadosDashboard> {
  const [eventos, atividades, oficinas, centros, assistencias, usuarios, presencas] = await Promise.all([
    eventosApi.listar(), atividadesApi.listar(), oficinasApi.listar(), centrosApi.listar(),
    assistenciaApi.listar(), listarUsuarios(), listarResumoPresencas(),
  ])
  return { eventos, atividades, oficinas, centros, assistencias, usuarios, presencas }
}
