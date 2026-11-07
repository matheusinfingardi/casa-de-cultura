import { criarServico } from "./crud"
import type {
  Evento, EventoInput,
  Atividade, AtividadeInput,
  Oficina, OficinaInput,
  Centro, CentroInput,
  Assistencia, AssistenciaInput,
} from "@/lib/tipos"

export const eventosApi = criarServico<Evento, EventoInput>("eventos", { singular: "o evento", plural: "os eventos" })
export const atividadesApi = criarServico<Atividade, AtividadeInput>("atividades", { singular: "a atividade", plural: "as atividades" })
export const oficinasApi = criarServico<Oficina, OficinaInput>("oficinas", { singular: "a oficina", plural: "as oficinas" })
export const centrosApi = criarServico<Centro, CentroInput>("centros", { singular: "o centro", plural: "os centros" })
export const assistenciaApi = criarServico<Assistencia, AssistenciaInput>("assistencia", { singular: "a assistência", plural: "as assistências" })
