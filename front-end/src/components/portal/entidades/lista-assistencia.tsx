"use client"

import { HeartHandshake } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ListaEntidade from "@/components/comum/lista-entidade"
import { assistenciaApi } from "@/lib/services/entidades"
import type { Assistencia } from "@/lib/tipos"
import { BotaoInscritos, SemResponsavel } from "./acoes"
import { TIPOS_ASSISTENCIA } from "./form-assistencia"
import { useContagens } from "./use-contagens"

export default function ListaAssistencia() {
  const contar = useContagens()
  return (
    <ListaEntidade<Assistencia>
      titulo="Assistência"
      descricao="Serviços de apoio às famílias atendidas pelo projeto."
      migalhas={[{ label: "Atendimento" }, { label: "Assistência" }]}
      icon={HeartHandshake}
      singular="assistência"
      genero="f"
      novoHref="/portal/assistencia/novo"
      editarHref={(i) => `/portal/assistencia/${i.id}`}
      carregar={assistenciaApi.listar}
      excluir={(i) => assistenciaApi.excluir(i.id)}
      nome={(i) => i.nome}
      busca={(i) => `${i.nome} ${i.tipo} ${i.local} ${i.responsavel}`}
      ordemInicial="nome"
      filtros={[{ chave: "tipo", label: "Tipo", opcoes: TIPOS_ASSISTENCIA, pegar: (i) => i.tipo }]}
      colunas={[
        { chave: "nome", titulo: "Atendimento", render: (i) => i.nome, ordem: (i) => i.nome },
        { chave: "tipo", titulo: "Tipo", render: (i) => <Badge variant="outline">{i.tipo}</Badge> },
        { chave: "local", titulo: "Local", render: (i) => i.local, secundaria: true },
        { chave: "resp", titulo: "Responsável", render: (i) => i.responsavel || <SemResponsavel />, secundaria: true },
        { chave: "insc", titulo: "Atendidos", render: (i) => contar("assistencia", i.id).total, ordem: (i) => contar("assistencia", i.id).total },
      ]}
      acoesExtras={(i) => <BotaoInscritos tipo="assistencia" id={i.id} nome={i.nome} />}
    />
  )
}
