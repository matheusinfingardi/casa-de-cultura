"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DIAS = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
]

export type RecorrenciaValue = {
  tipo: "semanal" | "quinzenal" | "mensal"
  dias: {
    dia: string
    horarios: string[]
  }[]
}

type Props = {
  value: RecorrenciaValue
  onChange: (value: RecorrenciaValue) => void
}

export default function RecorrenciaField({ value, onChange }: Props) {
  function setTipo(tipo: RecorrenciaValue["tipo"]) {
    onChange({ ...value, tipo })
  }

  function toggleDia(dia: string) {
    const exists = value.dias.find((d) => d.dia === dia)

    if (exists) {
      onChange({
        ...value,
        dias: value.dias.filter((d) => d.dia !== dia),
      })
    } else {
      onChange({
        ...value,
        dias: [...value.dias, { dia, horarios: [] }],
      })
    }
  }

  function addHorario(dia: string, horario: string) {
    if (!horario) return

    onChange({
      ...value,
      dias: value.dias.map((d) =>
        d.dia === dia
          ? { ...d, horarios: [...d.horarios, horario] }
          : d
      ),
    })
  }

  return (
    <div className="space-y-6">

      {/* TIPO */}
      <div className="space-y-2">
        <Label>Recorrência</Label>

        <Select value={value.tipo} onValueChange={setTipo}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="semanal">Semanal</SelectItem>
            <SelectItem value="quinzenal">Quinzenal</SelectItem>
            <SelectItem value="mensal">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DIAS */}
      <div className="space-y-2">
        <Label>Dias da semana</Label>

        <div className="flex flex-wrap gap-2">
          {DIAS.map((dia) => {
            const active = value.dias.some((d) => d.dia === dia)

            return (
              <button
                key={dia}
                type="button"
                onClick={() => toggleDia(dia)}
                className={`
                  px-3 py-1 rounded-full border text-sm cursor-pointer
                  ${active ? "bg-black text-white" : "bg-white"}
                `}
              >
                {dia}
              </button>
            )
          })}
        </div>
      </div>

      {/* HORÁRIOS */}
      {value.dias.map((d) => (
        <div key={d.dia} className="border rounded-lg p-3 space-y-2">

          <Label className="capitalize">
            Horários - {d.dia}
          </Label>

          <Input
            type="time"
            onChange={(e) => addHorario(d.dia, e.target.value)}
          />

          {d.horarios.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {d.horarios.join(", ")}
            </div>
          )}

        </div>
      ))}

    </div>
  )
}