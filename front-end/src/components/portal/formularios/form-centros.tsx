"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormWrapper } from "./form-wrapper"
import { ImageField } from "./image-field"

type FormData = {
  nome: string
  endereco: string
  responsavel: string
  telefone: string
  descricao: string
  image: File | null
}

export default function FormCentros({ onSubmit }: { onSubmit?: (data: FormData) => void }) {
  const [form, setForm] = useState<FormData>({
    nome: "", endereco: "", responsavel: "",
    telefone: "", descricao: "", image: null,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <FormWrapper titulo="Cadastro de Centro" submitLabel="Salvar Centro" onSubmit={handleSubmit}>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Nome do Centro</Label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Responsável</Label>
          <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Endereço</Label>
          <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
      </div>

      <ImageField onChange={(image) => setForm({ ...form, image })} />

    </FormWrapper>
  )
}