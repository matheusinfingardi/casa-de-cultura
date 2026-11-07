"use client"

import { Sparkles } from "lucide-react"
import ListaEntidade from "@/components/comum/lista-entidade"
import { atividadesApi } from "@/lib/services/entidades"
import { normalizarRecorrencia, resumoRecorrencia } from "@/lib/agenda"
import type { Atividade } from "@/lib/tipos"
import { BotaoInscritos, SemResponsavel } from "./acoes"
import { useContagens } from "./use-contagens"

export default function ListaAtividades() {
  const contar = useContagens()
  return (
    <ListaEntidade<Atividade>
      titulo="Atividades"
      descricao="Encontros recorrentes, como aulas e treinos, ou ações de data única."
      migalhas={[{ label: "Programação" }, { label: "Atividades" }]}
      icon={Sparkles}
      singular="atividade"
      genero="f"
      novoHref="/portal/atividades/novo"
      editarHref={(i) => `/portal/atividades/${i.id}`}
      carregar={atividadesApi.listar}
      excluir={(i) => atividadesApi.excluir(i.id)}
      nome={(i) => i.nome}
      busca={(i) => `${i.nome} ${i.local} ${i.responsavel}`}
      ordemInicial="nome"
      filtros={[
        { chave: "freq", label: "Frequência", opcoes: [{ valor: "Semanal", label: "Semanais" }, { valor: "Unica", label: "Única vez" }], pegar: (i) => normalizarRecorrencia(i.recorrencia).tipo },
      ]}
      colunas={[
        { chave: "nome", titulo: "Atividade", render: (i) => i.nome, ordem: (i) => i.nome },
        { chave: "quando", titulo: "Quando", render: (i) => resumoRecorrencia(normalizarRecorrencia(i.recorrencia)) },
        { chave: "local", titulo: "Local", render: (i) => i.local, secundaria: true },
        { chave: "resp", titulo: "Responsável", render: (i) => i.responsavel || <SemResponsavel />, secundaria: true },
        { chave: "insc", titulo: "Inscritos", render: (i) => contar("atividade", i.id).total, ordem: (i) => contar("atividade", i.id).total },
      ]}
      acoesExtras={(i) => <BotaoInscritos tipo="atividade" id={i.id} nome={i.nome} />}
    />
  )
}
