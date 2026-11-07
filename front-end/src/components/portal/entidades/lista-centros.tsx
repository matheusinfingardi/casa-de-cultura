"use client"

import { Building2 } from "lucide-react"
import ListaEntidade from "@/components/comum/lista-entidade"
import { centrosApi } from "@/lib/services/entidades"
import type { Centro } from "@/lib/tipos"
import { SemResponsavel } from "./acoes"

export default function ListaCentros() {
  return (
    <ListaEntidade<Centro>
      titulo="Centros"
      descricao="Unidades físicas onde o projeto atua."
      migalhas={[{ label: "Atendimento" }, { label: "Centros" }]}
      icon={Building2}
      tipoItem="centro"
      singular="centro"
      novoHref="/portal/centros/novo"
      detalheHref={(i) => `/portal/centros/${i.id}`}
      carregar={centrosApi.listar}
      excluir={(i) => centrosApi.excluir(i.id)}
      nome={(i) => i.nome}
      busca={(i) => `${i.nome} ${i.endereco} ${i.responsavel}`}
      ordemInicial="nome"
      colunas={[
        { chave: "nome", titulo: "Centro", render: (i) => i.nome, ordem: (i) => i.nome },
        { chave: "endereco", titulo: "Endereço", render: (i) => i.endereco },
        { chave: "telefone", titulo: "Telefone", render: (i) => i.telefone || "—" },
        { chave: "resp", titulo: "Responsável", render: (i) => i.responsavel || <SemResponsavel />, secundaria: true },
      ]}
    />
  )
}
