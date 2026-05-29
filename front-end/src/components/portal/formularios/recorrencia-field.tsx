"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"

const DIAS = ["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"]

export type Horario = { horarioInicio: string; horarioFim: string }

export type Recorrencia =
  | { tipo: "unica";   data: string; horarioInicio: string; horarioFim: string }
  | { tipo: "semanal"; dias: string[]; horarios: Record<string, Horario> }

type Props = {
  value: Recorrencia
  onChange: (value: Recorrencia) => void
}

export function RecorrenciaField({ value, onChange }: Props) {
  function handleTipo(tipo: "unica" | "semanal") {
    if (tipo === "unica") {
      onChange({ tipo: "unica", data: "", horarioInicio: "", horarioFim: "" })
    } else {
      onChange({ tipo: "semanal", dias: [], horarios: {} })
    }
  }

  function toggleDia(dia: string) {
    if (value.tipo !== "semanal") return
    const exists = value.dias.includes(dia)
    onChange({
      ...value,
      dias: exists ? value.dias.filter((d) => d !== dia) : [...value.dias, dia],
    })
  }

  function setHorario(dia: string, field: keyof Horario, val: string) {
    if (value.tipo !== "semanal") return
    const atual = value.horarios[dia] || { horarioInicio: "", horarioFim: "" }
    onChange({
      ...value,
      horarios: { ...value.horarios, [dia]: { ...atual, [field]: val } },
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Recorrência</Label>
        <Select value={value.tipo} onValueChange={(v: "unica" | "semanal") => handleTipo(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="unica">Única</SelectItem>
            <SelectItem value="semanal">Semanal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.tipo === "unica" && (
        <div className="space-y-4 border p-4 rounded-lg">
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={value.data}
              onChange={(e) => onChange({ ...value, data: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário Início</Label>
              <Input
                type="time"
                value={value.horarioInicio}
                onChange={(e) => onChange({ ...value, horarioInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário Fim</Label>
              <Input
                type="time"
                value={value.horarioFim}
                onChange={(e) => onChange({ ...value, horarioFim: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {value.tipo === "semanal" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {DIAS.map((dia) => (
              <Button
                key={dia}
                type="button"
                size="sm"
                variant={value.dias.includes(dia) ? "default" : "outline"}
                onClick={() => toggleDia(dia)}
              >
                {dia}
              </Button>
            ))}
          </div>
          {value.dias.map((dia) => (
            <div key={dia} className="border p-4 rounded-lg space-y-3">
              <Label className="font-semibold">{dia}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input
                    type="time"
                    value={value.horarios[dia]?.horarioInicio || ""}
                    onChange={(e) => setHorario(dia, "horarioInicio", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input
                    type="time"
                    value={value.horarios[dia]?.horarioFim || ""}
                    onChange={(e) => setHorario(dia, "horarioFim", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}