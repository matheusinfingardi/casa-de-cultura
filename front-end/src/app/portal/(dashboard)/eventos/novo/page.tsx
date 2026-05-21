"use client"

import { useRouter } from "next/navigation"
import FormEvento from "@/components/portal/formularios/form-evento"

export default function NewEventPage() {
  const router = useRouter()

  function handleSubmit(data: any) {
    console.log("salvar no backend:", data)

    router.push("/portal/eventos")
  }

  return <FormEvento onSubmit={handleSubmit} />
}