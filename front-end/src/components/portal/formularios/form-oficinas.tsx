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

type OficinaFormData = {
  nome: string
  descricao: string
  instrutor: string
  local: string
  nivel: string
  vagas: number | null
  recorrente: boolean
  data?: string
  horario?: string
  diaSemana?: string
  image: File | null
}

export default function FormOficinas({
  onSubmit,
}: {
  onSubmit?: (data: OficinaFormData) => void
}) {
  const [form, setForm] = useState<OficinaFormData>({
    nome: "",
    descricao: "",
    instrutor: "",
    local: "",
    nivel: "",
    vagas: null,
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
        Cadastro de Oficina
      </h1>

      <Card className="p-6 space-y-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NOME */}
          <div className="space-y-2">
            <Label>Nome da Oficina</Label>
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

          {/* INSTRUTOR */}
          <div className="space-y-2">
            <Label>Instrutor</Label>
            <Input
              value={form.instrutor}
              onChange={(e) =>
                setForm({ ...form, instrutor: e.target.value })
              }
            />
          </div>

          {/* NÍVEL */}
          <div className="space-y-2">
            <Label>Nível</Label>

            <Select
              value={form.nivel}
              onValueChange={(value) =>
                setForm({ ...form, nivel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* VAGAS */}
          <div className="space-y-2">
            <Label>Vagas</Label>
            <Input
              type="number"
              value={form.vagas ?? ""}
              onChange={(e) =>
                setForm({ ...form, vagas: Number(e.target.value) })
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
            <Label>Oficina recorrente</Label>
          </div>

          {/* CAMPOS DINÂMICOS */}
          {form.recorrente ? (
            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Input
                  value={form.diaSemana || ""}
                  onChange={(e) =>
                    setForm({ ...form, diaSemana: e.target.value })
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
            <Label>Imagem</Label>
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

          {preview && (
            <img
              src={preview}
              className="w-full h-52 object-cover rounded-xl border"
            />
          )}

          <Button className="w-full" type="submit">
            Salvar Oficina
          </Button>

        </form>

      </Card>
    </div>
  )
}