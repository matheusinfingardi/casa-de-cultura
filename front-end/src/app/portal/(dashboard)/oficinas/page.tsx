"use client"

import { useRouter } from "next/navigation"
import CrudPage from "@/components/portal/crud/crud-page"

export default function OficinasPage() {
  const router = useRouter()

  const data = [
    {
      id: "1",
      nome: "Oficina de Cabelo",
      responsavel: "Maria Clara",
      vagas: 20,
      nivel: "iniciante",
      local: "Centro Norte",
      dia: "Segunda",
      horarioInicio: "14:00",
      horarioFim: "16:00",
    },
    {
      id: "2",
      nome: "Oficina de Manicure",
      responsavel: "José Silva",
      vagas: 15,
      nivel: "intermediario",
      local: "Centro Sul",
      dia: "Quarta",
      horarioInicio: "10:00",
      horarioFim: "12:00",
    },
  ]

  const columns = [
    "nome",
    "responsavel",
    "vagas",
    "nivel",
    "local",
    "dia",
    "horarioInicio",
    "horarioFim",
  ]

  return (
    <CrudPage
      title="Oficinas"
      data={data}
      columns={columns}
      onCreate={() => router.push("/portal/oficinas/novo")}
      onEdit={(item) => router.push(`/portal/oficinas/${item.id}`)}
      onDelete={(id) => console.log(id)}
    />
  )
}