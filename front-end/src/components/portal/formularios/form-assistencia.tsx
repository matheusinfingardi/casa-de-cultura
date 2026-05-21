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

type AssistenciaFormData = {
  nome: string
  descricao: string
  tipo: string
  profissional: string
  local: string
  recorrente: boolean
  data?: string
  horario?: string
  diaSemana?: string
  image: File | null
}

export default function FormAssistencia({
  onSubmit,
}: {
  onSubmit?: (data: AssistenciaFormData) => void
}) {
  const [form, setForm] = useState<AssistenciaFormData>({
    nome: "",
    descricao: "",
    tipo: "",
    profissional: "",
    local: "",
    recorrente: false,
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
        Cadastro de Assistência
      </h1>

      <Card className="p-6 rounded-2xl shadow-sm">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NOME */}
          <div className="space-y-2">
            <Label>Nome do Atendimento</Label>
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

          {/* TIPO */}
          <div className="space-y-2">
            <Label>Tipo de Atendimento</Label>

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
                <SelectItem value="psicologia">Psicologia</SelectItem>
                <SelectItem value="fonoaudiologia">Fonoaudiologia</SelectItem>
                <SelectItem value="nutricao">Nutrição</SelectItem>
                <SelectItem value="social">Serviço Social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PROFISSIONAL */}
          <div className="space-y-2">
            <Label>Profissional Responsável</Label>
            <Input
              value={form.profissional}
              onChange={(e) =>
                setForm({ ...form, profissional: e.target.value })
              }
            />
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

          {/* RECORRÊNCIA */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.recorrente}
              onChange={(e) =>
                setForm({ ...form, recorrente: e.target.checked })
              }
            />

            <Label>Atendimento recorrente</Label>
          </div>

          {/* CAMPOS DINÂMICOS */}
          {form.recorrente ? (
            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select
                  value={form.diaSemana}
                  onValueChange={(value) =>
                    setForm({ ...form, diaSemana: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="segunda">Segunda</SelectItem>
                    <SelectItem value="terca">Terça</SelectItem>
                    <SelectItem value="quarta">Quarta</SelectItem>
                    <SelectItem value="quinta">Quinta</SelectItem>
                    <SelectItem value="sexta">Sexta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={form.horario || ""}
                  onChange={(e) =>
                    setForm({ ...form, horario: e.target.value })
                  }
                />
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.data || ""}
                  onChange={(e) =>
                    setForm({ ...form, data: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={form.horario || ""}
                  onChange={(e) =>
                    setForm({ ...form, horario: e.target.value })
                  }
                />
              </div>

            </div>
          )}

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

          {/* BOTÃO */}
          <Button type="submit" className="w-full">
            Salvar Assistência
          </Button>

        </form>

      </Card>
    </div>
  )
}