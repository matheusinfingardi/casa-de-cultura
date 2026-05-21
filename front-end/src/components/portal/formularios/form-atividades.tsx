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

type Recorrencia = {
  tipo: "nenhuma" | "semanal"
  dias: string[]
  horarios: Record<string, { inicio: string; fim: string }>
}

type FormData = {
  nome: string
  descricao: string
  responsavel: string
  local: string
  recorrencia: Recorrencia
  image: File | null
}

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

export default function FormAtividades() {
  const [form, setForm] = useState<FormData>({
    nome: "",
    descricao: "",
    responsavel: "",
    local: "",
    image: null,
    recorrencia: {
      tipo: "nenhuma",
      dias: [],
      horarios: {},
    },
  })

  const [preview, setPreview] = useState<string | null>(null)

  function toggleDia(dia: string) {
    const exists = form.recorrencia.dias.includes(dia)

    setForm({
      ...form,
      recorrencia: {
        ...form.recorrencia,
        dias: exists
          ? form.recorrencia.dias.filter((d) => d !== dia)
          : [...form.recorrencia.dias, dia],
      },
    })
  }

  function setHorario(dia: string, field: "inicio" | "fim", value: string) {
    setForm({
      ...form,
      recorrencia: {
        ...form.recorrencia,
        horarios: {
          ...form.recorrencia.horarios,
          [dia]: {
            ...form.recorrencia.horarios[dia],
            [field]: value,
          },
        },
      },
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log(form)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold">Cadastro de Atividade</h1>

      <Card className="p-6 space-y-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NOME */}
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          {/* DESCRIÇÃO */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>

          {/* RESPONSÁVEL */}
          <div className="space-y-2">
            <Label>Responsável</Label>
            <Input
              value={form.responsavel}
              onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
            />
          </div>

          {/* LOCAL */}
          <div className="space-y-2">
            <Label>Local</Label>
            <Input
              value={form.local}
              onChange={(e) => setForm({ ...form, local: e.target.value })}
            />
          </div>

          {/* RECORRÊNCIA */}
          <div className="space-y-2">
            <Label>Recorrência</Label>

            <Select
              value={form.recorrencia.tipo}
              onValueChange={(value: "nenhuma" | "semanal") =>
                setForm({
                  ...form,
                  recorrencia: {
                    tipo: value,
                    dias: [],
                    horarios: {},
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="nenhuma">Única</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SEMANAL */}
          {form.recorrencia.tipo === "semanal" && (
            <div className="space-y-4">

              <Label>Dias da semana</Label>

              <div className="flex flex-wrap gap-2">
                {DIAS.map((dia) => (
                  <Button
                    key={dia}
                    type="button"
                    variant={form.recorrencia.dias.includes(dia) ? "default" : "outline"}
                    onClick={() => toggleDia(dia)}
                  >
                    {dia}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                {form.recorrencia.dias.map((dia) => (
                  <div key={dia} className="space-y-2 border p-3 rounded-lg">

                    <Label>{dia}</Label>

                    <div className="grid grid-cols-2 gap-2">

                      <div>
                        <Label>Início</Label>
                        <Input
                          type="time"
                          value={form.recorrencia.horarios[dia]?.inicio || ""}
                          onChange={(e) =>
                            setHorario(dia, "inicio", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label>Fim</Label>
                        <Input
                          type="time"
                          value={form.recorrencia.horarios[dia]?.fim || ""}
                          onChange={(e) =>
                            setHorario(dia, "fim", e.target.value)
                          }
                        />
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMAGEM */}
          <div>
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
              className="w-full h-52 object-cover rounded-xl"
            />
          )}

          <Button type="submit" className="w-full">
            Salvar Atividade
          </Button>

        </form>
      </Card>
    </div>
  )
}