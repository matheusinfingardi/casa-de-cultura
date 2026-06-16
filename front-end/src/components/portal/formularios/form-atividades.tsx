"use client"

import { useEffect, useState } from "react"

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

import { FormWrapper } from "./form-wrapper"
import { RecorrenciaField, type Recorrencia } from "./recorrencia-field"
import { ImageField } from "./image-field"
import { listarResponsaveis, type Usuario } from "@/lib/services/usuarios"

export type FormData = {
  nome: string
  descricao?: string
  responsavel: string
  responsavel_id?: string | null
  local: string
  recorrencia: Recorrencia
  image?: File | null
}

type Props = {
  initialData?: Partial<FormData>
  onSubmit?: (data: FormData) => void
}

export default function FormAtividades({
  initialData,
  onSubmit,
}: Props) {
  const [responsaveis, setResponsaveis] = useState<Usuario[]>([])

  const [form, setForm] = useState<FormData>({
    nome: initialData?.nome || "",
    descricao: initialData?.descricao || "",
    responsavel: initialData?.responsavel || "",
    responsavel_id: initialData?.responsavel_id ?? null,
    local: initialData?.local || "",
    recorrencia:
      initialData?.recorrencia || {
        tipo: "unica",
        data: "",
        horarioInicio: "",
        horarioFim: "",
      },
    image: initialData?.image || null,
  })

  useEffect(() => {
    listarResponsaveis().then(setResponsaveis)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <FormWrapper
      titulo="Cadastro de Atividade"
      submitLabel="Salvar Atividade"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
          <Label>Responsável</Label>
          <Select
            value={form.responsavel_id ?? ""}
            onValueChange={(id) => {
              const sel = responsaveis.find((r) => r.id === id)
              setForm({
                ...form,
                responsavel_id: id,
                responsavel: sel?.nome ?? sel?.email ?? "",
              })
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              {responsaveis.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.nome ?? r.email}
                </SelectItem>
              ))}
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

      <RecorrenciaField
        value={form.recorrencia}
        onChange={(recorrencia) =>
          setForm({
            ...form,
            recorrencia,
          })
        }
      />

      <ImageField
        onChange={(image) =>
          setForm({
            ...form,
            image,
          })
        }
      />
    </FormWrapper>
  )
}