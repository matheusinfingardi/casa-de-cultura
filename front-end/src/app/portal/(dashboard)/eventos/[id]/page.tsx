"use client"

import { useParams } from "next/navigation"
import DetalheItem from "@/components/portal/entidades/detalhe-item"

export default function Page() {
  const { id } = useParams<{ id: string }>()
  return <DetalheItem tipo="evento" id={id} />
}
