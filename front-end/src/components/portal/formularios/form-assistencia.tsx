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

const DIAS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
]

export default function FormAssistencia() {
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    tipo: "",
    profissional: "",
    local: "",

    recorrencia: {
      tipo: "unica",
      data: "",
      horario: "",

      dias: [] as string[],
      horarios: {} as Record<string, { inicio: string; fim: string }>,
    },

    image: null as File | null,
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

  function setHorario(dia: string, key: "inicio" | "fim", value: string) {
    setForm({
      ...form,
      recorrencia: {
        ...form.recorrencia,
        horarios: {
          ...form.recorrencia.horarios,
          [dia]: {
            ...form.recorrencia.horarios[dia],
            [key]: value,
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
      <h1 className="text-2xl font-bold">Cadastro de Assistência</h1>

      <Card className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Recorrência</Label>

            <Select
              value={form.recorrencia.tipo}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  recorrencia: {
                    ...form.recorrencia,
                    tipo: value,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="unica">Única</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.recorrencia.tipo === "unica" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.recorrencia.data}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      recorrencia: {
                        ...form.recorrencia,
                        data: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={form.recorrencia.horario}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      recorrencia: {
                        ...form.recorrencia,
                        horario: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {form.recorrencia.tipo === "semanal" && (
            <div className="space-y-4">

              <Label>Dias da semana</Label>

              <div className="flex flex-wrap gap-2">
                {DIAS.map((dia) => (
                  <Button
                    key={dia}
                    type="button"
                    variant={
                      form.recorrencia.dias.includes(dia)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => toggleDia(dia)}
                  >
                    {dia}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                {form.recorrencia.dias.map((dia) => (
                  <div key={dia} className="space-y-2 border p-3 rounded-md">
                    <Label className="font-bold">{dia}</Label>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Início</Label>
                        <Input
                          type="time"
                          value={
                            form.recorrencia.horarios[dia]?.inicio || ""
                          }
                          onChange={(e) =>
                            setHorario(dia, "inicio", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label>Fim</Label>
                        <Input
                          type="time"
                          value={
                            form.recorrencia.horarios[dia]?.fim || ""
                          }
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
            Salvar
          </Button>
        </form>
      </Card>
    </div>
  )
}