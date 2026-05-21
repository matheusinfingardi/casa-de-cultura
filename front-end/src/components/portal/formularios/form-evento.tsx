"use client"

import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type EventoFormData = {
  nome: string
  descricao: string
  data: string
  horario: string
  local: string
  tipo: string
  image: File | null
}

export default function FormEvento({
  onSubmit,
}: {
  onSubmit?: (data: EventoFormData) => void
}) {
  const [form, setForm] = useState<EventoFormData>({
    nome: "",
    descricao: "",
    data: "",
    horario: "",
    local: "",
    tipo: "",
    image: null,
  })

  const [preview, setPreview] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    onSubmit?.(form)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold">
        Criar Evento
      </h1>

      <Card className="p-6 rounded-2xl shadow-sm">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NOME */}
          <div className="space-y-2">
            <Label>Nome do Evento</Label>
            <Input
              value={form.nome}
              onChange={(e) =>
                setForm({ ...form, nome: e.target.value })
              }
            />
          </div>

          {/* DESCRIÇÃO */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) =>
                setForm({ ...form, descricao: e.target.value })
              }
            />
          </div>

          {/* DATA / HORÁRIO */}
          <div className="grid grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) =>
                  setForm({ ...form, data: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={form.horario}
                onChange={(e) =>
                  setForm({ ...form, horario: e.target.value })
                }
              />
            </div>

          </div>

          {/* LOCAL */}
          <div className="space-y-2">
            <Label>Local</Label>
            <Input
              value={form.local}
              onChange={(e) =>
                setForm({ ...form, local: e.target.value })
              }
            />
          </div>

          {/* TIPO */}
          <div className="space-y-2">
            <Label>Tipo de Evento</Label>

            <Select
              value={form.tipo}
              onValueChange={(value) =>
                setForm({ ...form, tipo: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* IMAGEM */}
          <div className="space-y-2">
            <Label>Imagem (opcional)</Label>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return

                setForm({ ...form, image: file })
                setPreview(URL.createObjectURL(file))
              }}
            />
          </div>

          {/* PREVIEW */}
          {preview && (
            <div className="overflow-hidden rounded-xl border">
              <img
                src={preview}
                className="w-full h-52 object-cover"
              />
            </div>
          )}

          {/* BOTÕES */}
          <Button type="submit" className="w-full">
            Criar Evento
          </Button>

        </form>

      </Card>
    </div>
  )
}