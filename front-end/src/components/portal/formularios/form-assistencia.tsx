"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormWrapper } from "./form-wrapper"
import { RecorrenciaField, type Recorrencia } from "./recorrencia-field"
import { ImageField } from "./image-field"

type FormData = {
  nome: string
  descricao: string
  tipo: string
  profissional: string
  local: string
  recorrencia: Recorrencia
  image: File | null
}

export default function FormAssistencia() {
  const [form, setForm] = useState<FormData>({
    nome: "", descricao: "", tipo: "", profissional: "", local: "",
    recorrencia: { tipo: "unica", data: "", horarioInicio: "", horarioFim: "" },
    image: null,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log(form)
  }

  return (
    <FormWrapper titulo="Cadastro de Assistência" submitLabel="Salvar Assistência" onSubmit={handleSubmit}>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Profissional</Label>
          <Input value={form.profissional} onChange={(e) => setForm({ ...form, profissional: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Local</Label>
          <Input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
      </div>

      <RecorrenciaField
        value={form.recorrencia}
        onChange={(recorrencia) => setForm({ ...form, recorrencia })}
      />

      <ImageField onChange={(image) => setForm({ ...form, image })} />

    </FormWrapper>
  )
}