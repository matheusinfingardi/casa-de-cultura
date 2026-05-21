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
  tipo: "nenhuma" | "semanal" | "quinzenal" | "mensal"
  dias: string[]
  horarios: Record<string, string[]>
}

type FormData = {
  nome: string
  descricao: string
  instrutor: string
  nivel: string
  vagas: number | ""
  local: string
  recorrencia: Recorrencia
  image: File | null
}

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

export default function FormOficinas() {
  const [form, setForm] = useState<FormData>({
    nome: "",
    descricao: "",
    instrutor: "",
    nivel: "",
    vagas: "",
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

  function setHorario(dia: string, horario: string) {
    setForm({
      ...form,
      recorrencia: {
        ...form.recorrencia,
        horarios: {
          ...form.recorrencia.horarios,
          [dia]: [horario],
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
        Cadastro de Oficina
      </h1>

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
            <Label>Instrutor</Label>
            <Input
              value={form.instrutor}
              onChange={(e) => setForm({ ...form, instrutor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Nível</Label>
            <Select
              value={form.nivel}
              onValueChange={(value) =>
                setForm({ ...form, nivel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Iniciante">Iniciante</SelectItem>
                <SelectItem value="Intermediário">Intermediário</SelectItem>
                <SelectItem value="Avançado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vagas</Label>
            <Input
              type="number"
              value={form.vagas}
              onChange={(e) =>
                setForm({ ...form, vagas: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Local</Label>
            <Input
              value={form.local}
              onChange={(e) => setForm({ ...form, local: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Recorrência</Label>

            <Select
              value={form.recorrencia.tipo}
              onValueChange={(value: any) =>
                setForm({
                  ...form,
                  recorrencia: { ...form.recorrencia, tipo: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="nenhuma">Única</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.recorrencia.tipo !== "nenhuma" && (
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

              <div className="space-y-3">
                {form.recorrencia.dias.map((dia) => (
                  <div key={dia} className="space-y-1">
                    <Label>{dia} horário</Label>
                    <Input
                      type="time"
                      value={form.recorrencia.horarios[dia]?.[0] || ""}
                      onChange={(e) => setHorario(dia, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {preview && (
            <img
              src={preview}
              className="w-full h-52 object-cover rounded-xl"
            />
          )}

          <Button className="w-full">
            Salvar Oficina
          </Button>

        </form>
      </Card>
    </div>
  )
}