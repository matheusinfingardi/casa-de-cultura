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
  responsavel: string
  local: string
  recorrencia: Recorrencia
  image: File | null
}

export default function FormAtividades() {
  const [form, setForm] = useState<FormData>({
    nome: "", descricao: "", responsavel: "", local: "",
    recorrencia: { tipo: "unica", data: "", horarioInicio: "", horarioFim: "" },
    image: null,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log(form)
  }

  return (
    <FormWrapper titulo="Cadastro de Atividade" submitLabel="Salvar Atividade" onSubmit={handleSubmit}>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Responsável</Label>
          <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Local</Label>
        <Input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} />
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