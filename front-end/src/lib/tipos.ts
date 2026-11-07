// Tipos das entidades do portal. Refletem as colunas atuais das tabelas.
// Se o back-end mudar o modelo (ex.: novo Postgres), este é o contrato que o front espera.

export type Horario = { horarioInicio: string; horarioFim: string }

export type Responsavel = {
  responsavel: string
  responsavel_id: string | null
}

/** Campos opcionais que ainda não existem no banco real (só na demonstração). */
export type Extras = { descricao?: string; imagem_url?: string; centro_id?: string; endereco_mapa?: string; tem_certificado?: boolean; certificado_liberado?: boolean }

export type DiaSemana = "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo"

export type Recorrencia =
  | { tipo: "Unica"; data: string; horarioInicio: string; horarioFim: string }
  | { tipo: "Semanal"; horarios: Partial<Record<DiaSemana, Horario>> }

export type EventoInput = Responsavel & Extras & {
  nome: string
  local: string
  tipo: string
  data: string
  horarioInicio: string
  horarioFim: string
}
export type Evento = EventoInput & { id: string }

export type AtividadeInput = Responsavel & Extras & {
  nome: string
  local: string
  recorrencia: Recorrencia
}
export type Atividade = AtividadeInput & { id: string }

export type OficinaInput = Responsavel & Extras & {
  nome: string
  vagas: number
  nivel: string
  local: string
  dia: string
  horarioInicio: string
  horarioFim: string
}
export type Oficina = OficinaInput & { id: string }

export type CentroInput = Responsavel & Extras & {
  nome: string
  telefone: string
  endereco: string
}
export type Centro = CentroInput & { id: string }

export type AssistenciaInput = Responsavel & Extras & {
  nome: string
  tipo: string
  local: string
}
export type Assistencia = AssistenciaInput & { id: string }
