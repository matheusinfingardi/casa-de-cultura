"use client"

import { Palette } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ListaEntidade from "@/components/comum/lista-entidade"
import { oficinasApi } from "@/lib/services/entidades"
import { faixaHorario } from "@/lib/formatar"
import type { Oficina } from "@/lib/tipos"
import { SemResponsavel } from "./acoes"
import { NIVEIS } from "./form-oficina"
import { useContagens } from "./use-contagens"

export default function ListaOficinas() {
  const contar = useContagens()
  return (
    <ListaEntidade<Oficina>
      titulo="Oficinas"
      descricao="Turmas com vagas limitadas que acontecem num dia fixo da semana."
      migalhas={[{ label: "Programação" }, { label: "Oficinas" }]}
      icon={Palette}
      singular="oficina"
      genero="f"
      novoHref="/portal/oficinas/novo"
      detalheHref={(i) => `/portal/oficinas/${i.id}`}
      carregar={oficinasApi.listar}
      excluir={(i) => oficinasApi.excluir(i.id)}
      nome={(i) => i.nome}
      busca={(i) => `${i.nome} ${i.local} ${i.responsavel} ${i.dia}`}
      ordemInicial="nome"
      filtros={[{ chave: "nivel", label: "Nível", opcoes: NIVEIS, pegar: (i) => i.nivel }]}
      colunas={[
        { chave: "nome", titulo: "Oficina", render: (i) => i.nome, ordem: (i) => i.nome },
        { chave: "dia", titulo: "Dia e horário", render: (i) => `${i.dia} · ${faixaHorario(i.horarioInicio, i.horarioFim)}` },
        { chave: "nivel", titulo: "Nível", render: (i) => <Badge variant="outline">{NIVEIS.find((n) => n.valor === i.nivel)?.label ?? i.nivel}</Badge> },
        {
          chave: "vagas", titulo: "Vagas",
          render: (i) => {
            const t = contar("oficina", i.id).total
            const lotada = i.vagas > 0 && t >= i.vagas
            return <span className={lotada ? "font-medium text-red-600" : ""}>{t}/{i.vagas}{lotada ? " · lotada" : ""}</span>
          },
          ordem: (i) => contar("oficina", i.id).total,
        },
        { chave: "local", titulo: "Local", render: (i) => i.local, secundaria: true },
        { chave: "resp", titulo: "Responsável", render: (i) => i.responsavel || <SemResponsavel />, secundaria: true },
      ]}
    />
  )
}
