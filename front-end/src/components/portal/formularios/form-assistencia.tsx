"use client"

import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormWrapper } from "./form-wrapper"

export type FormData = {
  nome: string
  tipo: string
  responsavel: string
  local: string
}

type Props = {
  initialData?: Partial<FormData>
  onSubmit?: (data: FormData) => void
}

export default function FormAssistencia({
  initialData,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormData>({
    nome: initialData?.nome || "",
    tipo: initialData?.tipo || "",
    responsavel: initialData?.responsavel || "",
    local: initialData?.local || "",
  })

  function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  console.log("SUBMIT DISPAROU")
  console.log("ONSUBMIT =", onSubmit)
  console.log("FORM =", form)

  onSubmit?.(form)
}

  return (
    <FormWrapper
      titulo="Cadastro de Assistência"
      submitLabel="Salvar Assistência"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input
            value={form.nome}
            onChange={(e) =>
              setForm({ ...form, nome: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Input
            value={form.tipo}
            onChange={(e) =>
              setForm({ ...form, tipo: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Responsável</Label>
          <Input
            value={form.responsavel}
            onChange={(e) =>
              setForm({
                ...form,
                responsavel: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Local</Label>
          <Input
            value={form.local}
            onChange={(e) =>
              setForm({
                ...form,
                local: e.target.value,
              })
            }
          />
        </div>
      </div>
    </FormWrapper>
  )
}