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

import { FormWrapper } from "./form-wrapper"

export type FormData = {
  nome: string
  responsavel: string
  vagas: number
  nivel: string
  local: string
  dia: string
  horarioInicio: string
  horarioFim: string
}

type Props = {
  initialData?: Partial<FormData>
  onSubmit?: (data: FormData) => void
}

export default function FormOficinas({
  initialData,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormData>({
    nome: initialData?.nome || "",
    responsavel: initialData?.responsavel || "",
    vagas: initialData?.vagas || 0,
    nivel: initialData?.nivel || "",
    local: initialData?.local || "",
    dia: initialData?.dia || "",
    horarioInicio: initialData?.horarioInicio || "",
    horarioFim: initialData?.horarioFim || "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <FormWrapper
      titulo="Cadastro de Oficina"
      submitLabel="Salvar Oficina"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input
            value={form.nome}
            onChange={(e) =>
              setForm({ ...form, nome: e.target.value })
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Vagas</Label>
          <Input
            type="number"
            value={form.vagas}
            onChange={(e) =>
              setForm({
                ...form,
                vagas: Number(e.target.value),
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Nível</Label>

          <Select
            value={form.nivel}
            onValueChange={(value) =>
              setForm({
                ...form,
                nivel: value,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="iniciante">
                Iniciante
              </SelectItem>

              <SelectItem value="intermediario">
                Intermediário
              </SelectItem>

              <SelectItem value="avancado">
                Avançado
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label>Dia</Label>

          <Input
            value={form.dia}
            onChange={(e) =>
              setForm({
                ...form,
                dia: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Horário Início</Label>

          <Input
            type="time"
            value={form.horarioInicio}
            onChange={(e) =>
              setForm({
                ...form,
                horarioInicio: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Horário Fim</Label>

          <Input
            type="time"
            value={form.horarioFim}
            onChange={(e) =>
              setForm({
                ...form,
                horarioFim: e.target.value,
              })
            }
          />
        </div>
      </div>
    </FormWrapper>
  )
}