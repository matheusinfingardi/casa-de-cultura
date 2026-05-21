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

// =====================
// TIPOS
// =====================

type RecorrenciaUnica = {
  tipo: "unica"
  data: string
  horarioInicio: string
  horarioFim: string
}

type RecorrenciaSemanal = {
  tipo: "semanal"
  dias: string[]
  horarios: Record<
    string,
    {
      horarioInicio: string
      horarioFim: string
    }
  >
}

type FormData = {
  nome: string
  descricao: string
  tipo: string
  profissional: string
  local: string
  image: File | null
}

export default function FormAssistencia() {
  const [tipoRecorrencia, setTipoRecorrencia] =
    useState<"unica" | "semanal">("unica")

  const [recorrenciaUnica, setRecorrenciaUnica] =
    useState<RecorrenciaUnica>({
      tipo: "unica",
      data: "",
      horarioInicio: "",
      horarioFim: "",
    })

  const [recorrenciaSemanal, setRecorrenciaSemanal] =
    useState<RecorrenciaSemanal>({
      tipo: "semanal",
      dias: [],
      horarios: {},
    })

  const [form, setForm] = useState<FormData>({
    nome: "",
    descricao: "",
    tipo: "",
    profissional: "",
    local: "",
    image: null,
  })

  const [preview, setPreview] = useState<string | null>(null)

  const isSemanal = tipoRecorrencia === "semanal"

  // =====================
  // FUNÇÕES SEMANAIS
  // =====================

  function toggleDia(dia: string) {
    const exists = recorrenciaSemanal.dias.includes(dia)

    setRecorrenciaSemanal({
      ...recorrenciaSemanal,
      dias: exists
        ? recorrenciaSemanal.dias.filter((d) => d !== dia)
        : [...recorrenciaSemanal.dias, dia],
    })
  }

  function setHorario(
    dia: string,
    field: "horarioInicio" | "horarioFim",
    value: string
  ) {
    const atual = recorrenciaSemanal.horarios[dia] || {
      horarioInicio: "",
      horarioFim: "",
    }

    setRecorrenciaSemanal({
      ...recorrenciaSemanal,
      horarios: {
        ...recorrenciaSemanal.horarios,
        [dia]: {
          ...atual,
          [field]: value,
        },
      },
    })
  }

  // =====================
  // SUBMIT
  // =====================

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const recorrencia =
      tipoRecorrencia === "unica"
        ? recorrenciaUnica
        : recorrenciaSemanal

    console.log({
      ...form,
      recorrencia,
    })
  }

  // =====================
  // UI
  // =====================

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold">
        Cadastro de Assistência
      </h1>

      <Card className="p-6 space-y-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NOME */}
          <div>
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) =>
                setForm({ ...form, nome: e.target.value })
              }
            />
          </div>

          {/* DESCRIÇÃO */}
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) =>
                setForm({ ...form, descricao: e.target.value })
              }
            />
          </div>

          {/* TIPO */}
          <div>
            <Label>Tipo</Label>
            <Input
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value })
              }
            />
          </div>

          {/* PROFISSIONAL */}
          <div>
            <Label>Profissional</Label>
            <Input
              value={form.profissional}
              onChange={(e) =>
                setForm({ ...form, profissional: e.target.value })
              }
            />
          </div>

          {/* LOCAL */}
          <div>
            <Label>Local</Label>
            <Input
              value={form.local}
              onChange={(e) =>
                setForm({ ...form, local: e.target.value })
              }
            />
          </div>

          {/* RECORRÊNCIA */}
          <div>
            <Label>Recorrência</Label>

            <Select
              value={tipoRecorrencia}
              onValueChange={(value: "unica" | "semanal") =>
                setTipoRecorrencia(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="unica">Única</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ================= UNICA ================= */}
          {tipoRecorrencia === "unica" && (
            <div className="grid grid-cols-3 gap-3">

              <Input
                type="date"
                value={recorrenciaUnica.data}
                onChange={(e) =>
                  setRecorrenciaUnica({
                    ...recorrenciaUnica,
                    data: e.target.value,
                  })
                }
              />

              <Input
                type="time"
                value={recorrenciaUnica.horarioInicio}
                onChange={(e) =>
                  setRecorrenciaUnica({
                    ...recorrenciaUnica,
                    horarioInicio: e.target.value,
                  })
                }
              />

              <Input
                type="time"
                value={recorrenciaUnica.horarioFim}
                onChange={(e) =>
                  setRecorrenciaUnica({
                    ...recorrenciaUnica,
                    horarioFim: e.target.value,
                  })
                }
              />

            </div>
          )}

          {/* ================= SEMANAL ================= */}
          {isSemanal && (
            <div className="space-y-4">

              <div className="flex flex-wrap gap-2">
                {DIAS.map((dia) => (
                  <Button
                    key={dia}
                    type="button"
                    variant={
                      recorrenciaSemanal.dias.includes(dia)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => toggleDia(dia)}
                  >
                    {dia}
                  </Button>
                ))}
              </div>

              {recorrenciaSemanal.dias.map((dia) => (
                <div key={dia} className="border p-4 rounded-lg">

                  <Label>{dia}</Label>

                  <div className="grid grid-cols-2 gap-3">

                    <Input
                      type="time"
                      value={
                        recorrenciaSemanal.horarios[dia]?.horarioInicio || ""
                      }
                      onChange={(e) =>
                        setHorario(dia, "horarioInicio", e.target.value)
                      }
                    />

                    <Input
                      type="time"
                      value={
                        recorrenciaSemanal.horarios[dia]?.horarioFim || ""
                      }
                      onChange={(e) =>
                        setHorario(dia, "horarioFim", e.target.value)
                      }
                    />

                  </div>

                </div>
              ))}

            </div>
          )}

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

              setPreview(URL.createObjectURL(file))
            }}
          />

          {preview && (
            <img
              src={preview}
              className="w-full h-52 object-cover rounded-xl"
            />
          )}

          <Button type="submit" className="w-full">
            Salvar Assistência
          </Button>

        </form>
      </Card>
    </div>
  )
}