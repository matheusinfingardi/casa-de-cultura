"use client"

import { CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ListaEntidade from "@/components/comum/lista-entidade"
import { eventosApi } from "@/lib/services/entidades"
import { capitalizar, chaveData, dataBR, faixaHorario } from "@/lib/formatar"
import type { Evento } from "@/lib/tipos"
import { SemResponsavel } from "./acoes"
import { TIPOS_EVENTO } from "./form-evento"
import { useContagens } from "./use-contagens"

export default function ListaEventos() {
  const contar = useContagens()
  const hoje = chaveData(new Date())
  return (
    <ListaEntidade<Evento>
      titulo="Eventos"
      descricao="Acontecimentos em data marcada: festivais, feiras, campanhas e encontros."
      migalhas={[{ label: "Programação" }, { label: "Eventos" }]}
      icon={CalendarDays}
      singular="evento"
      novoHref="/portal/eventos/novo"
      detalheHref={(i) => `/portal/eventos/${i.id}`}
      carregar={eventosApi.listar}
      excluir={(i) => eventosApi.excluir(i.id)}
      nome={(i) => i.nome}
      busca={(i) => `${i.nome} ${i.local} ${i.responsavel}`}
      ordemInicial="data"
      filtros={[
        { chave: "tipo", label: "Tipo", opcoes: TIPOS_EVENTO, pegar: (i) => i.tipo },
        { chave: "quando", label: "Quando", opcoes: [{ valor: "futuro", label: "Próximos" }, { valor: "passado", label: "Já realizados" }], pegar: (i) => ((i.data ?? "") >= hoje ? "futuro" : "passado") },
      ]}
      colunas={[
        { chave: "nome", titulo: "Evento", render: (i) => i.nome, ordem: (i) => i.nome },
        { chave: "data", titulo: "Data", render: (i) => dataBR(i.data), ordem: (i) => i.data ?? "" },
        { chave: "horario", titulo: "Horário", render: (i) => faixaHorario(i.horarioInicio, i.horarioFim) },
        { chave: "local", titulo: "Local", render: (i) => i.local, secundaria: true },
        { chave: "tipo", titulo: "Tipo", render: (i) => <Badge variant="outline">{capitalizar(TIPOS_EVENTO.find((t) => t.valor === i.tipo)?.label ?? i.tipo)}</Badge> },
        { chave: "resp", titulo: "Responsável", render: (i) => i.responsavel || <SemResponsavel />, secundaria: true },
        { chave: "insc", titulo: "Inscritos", render: (i) => contar("evento", i.id).total, ordem: (i) => contar("evento", i.id).total },
      ]}
    />
  )
}
