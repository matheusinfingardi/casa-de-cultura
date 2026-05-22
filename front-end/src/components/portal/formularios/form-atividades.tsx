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

type Horario = {
  horarioInicio: string
  horarioFim: string
}

type FormData = {
  nome: string
  descricao: string
  responsavel: string
  local: string

  recorrencia: {
    tipo: "unica" | "semanal"

    // ÚNICA
    data?: string
    horarioInicio?: string
    horarioFim?: string

    // SEMANAL
    dias?: string[]
    horarios?: Record<string, Horario>
  }

  image: File | null
}

const DIAS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
]

export default function FormAtividades() {
  const [form, setForm] = useState<FormData>({
    nome: "",
    descricao: "",
    responsavel: "",
    local: "",

    recorrencia: {
      tipo: "unica",
      data: "",
      horarioInicio: "",
      horarioFim: "",
    },

    image: null,
  })

  const [preview, setPreview] = useState<string | null>(null)

  function toggleDia(dia: string) {
    if (form.recorrencia.tipo !== "semanal") return

    const dias = form.recorrencia.dias || []

    const exists = dias.includes(dia)

    setForm({
      ...form,

      recorrencia: {
        ...form.recorrencia,

        dias: exists
          ? dias.filter((d) => d !== dia)
          : [...dias, dia],
      },
    })
  }

  function setHorario(
    dia: string,
    field: "horarioInicio" | "horarioFim",
    value: string
  ) {
    if (form.recorrencia.tipo !== "semanal") return

    const horarioAtual =
      form.recorrencia.horarios?.[dia] || {
        horarioInicio: "",
        horarioFim: "",
      }

    setForm({
      ...form,

      recorrencia: {
        ...form.recorrencia,

        horarios: {
          ...form.recorrencia.horarios,

          [dia]: {
            ...horarioAtual,
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

      <h1 className="text-2xl font-bold">
        Cadastro de Atividade
      </h1>

      <Card className="p-6 space-y-6">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div className="space-y-2">
            <Label>Nome</Label>

            <Input
              value={form.nome}
              onChange={(e) =>
                setForm({
                  ...form,
                  nome: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>

            <Textarea
              value={form.descricao}
              onChange={(e) =>
                setForm({
                  ...form,
                  descricao: e.target.value,
                })
              }
            />
          </div>

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

          <div className="space-y-2">

            <Label>Recorrência</Label>

            <Select
              value={form.recorrencia.tipo}
              onValueChange={(value: "unica" | "semanal") => {

                if (value === "unica") {
                  setForm({
                    ...form,

                    recorrencia: {
                      tipo: "unica",
                      data: "",
                      horarioInicio: "",
                      horarioFim: "",
                    },
                  })
                }

                if (value === "semanal") {
                  setForm({
                    ...form,

                    recorrencia: {
                      tipo: "semanal",
                      dias: [],
                      horarios: {},
                    },
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="unica">
                  Única
                </SelectItem>

                <SelectItem value="semanal">
                  Semanal
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.recorrencia.tipo === "unica" && (
            <div className="space-y-4 border rounded-lg p-4">

              <div className="space-y-2">
                <Label>Data</Label>

                <Input
                  type="date"
                  value={form.recorrencia.data || ""}
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

              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label>Horário Início</Label>

                  <Input
                    type="time"
                    value={form.recorrencia.horarioInicio || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,

                        recorrencia: {
                          ...form.recorrencia,
                          horarioInicio: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horário Fim</Label>

                  <Input
                    type="time"
                    value={form.recorrencia.horarioFim || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,

                        recorrencia: {
                          ...form.recorrencia,
                          horarioFim: e.target.value,
                        },
                      })
                    }
                  />
                </div>

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
                      form.recorrencia.dias?.includes(dia)
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

                {form.recorrencia.dias?.map((dia) => (

                  <div
                    key={dia}
                    className="border rounded-lg p-4 space-y-4"
                  >

                    <Label className="font-semibold">
                      {dia}
                    </Label>

                    <div className="grid grid-cols-2 gap-4">

                      <div className="space-y-2">

                        <Label>Horário Início</Label>

                        <Input
                          type="time"
                          value={
                            form.recorrencia.horarios?.[dia]
                              ?.horarioInicio || ""
                          }
                          onChange={(e) =>
                            setHorario(
                              dia,
                              "horarioInicio",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">

                        <Label>Horário Fim</Label>

                        <Input
                          type="time"
                          value={
                            form.recorrencia.horarios?.[dia]
                              ?.horarioFim || ""
                          }
                          onChange={(e) =>
                            setHorario(
                              dia,
                              "horarioFim",
                              e.target.value
                            )
                          }
                        />
                      </div>

                    </div>

                  </div>
                ))}

              </div>
            </div>
          )}

          <div className="space-y-2">

            <Label>Imagem</Label>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {

                const file = e.target.files?.[0]

                if (!file) return

                setForm({
                  ...form,
                  image: file,
                })

                setPreview(
                  URL.createObjectURL(file)
                )
              }}
            />
          </div>

          {preview && (
            <img
              src={preview}
              className="w-full h-52 object-cover rounded-xl"
              alt="Preview"
            />
          )}

          <Button
            type="submit"
            className="w-full"
          >
            Salvar Atividade
          </Button>

        </form>

      </Card>
    </div>
  )
}