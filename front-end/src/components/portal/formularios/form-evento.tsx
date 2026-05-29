"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { FormWrapper } from "./form-wrapper"
import { ImageField } from "./image-field"

type FormData = {
  nome: string
  descricao: string
  data: string
  horarioInicio: string
  horarioFim: string
  local: string
  tipo: string
  image: File | null
}

export default function FormEvento({ onSubmit }: { onSubmit?: (data: FormData) => void }) {
  const [form, setForm] = useState<FormData>({
    nome: "", descricao: "", data: "",
    horarioInicio: "", horarioFim: "",
    local: "", tipo: "", image: null,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <FormWrapper titulo="Criar Evento" submitLabel="Criar Evento" onSubmit={handleSubmit}>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Nome do Evento</Label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Tipo de Evento</Label>
          <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="educacao">Educação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Data</Label>
          <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Horário Início</Label>
          <Input type="time" value={form.horarioInicio} onChange={(e) => setForm({ ...form, horarioInicio: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Horário Fim</Label>
          <Input type="time" value={form.horarioFim} onChange={(e) => setForm({ ...form, horarioFim: e.target.value })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Local</Label>
        <Input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} />
      </div>

      <ImageField onChange={(image) => setForm({ ...form, image })} />

    </FormWrapper>
  )
}