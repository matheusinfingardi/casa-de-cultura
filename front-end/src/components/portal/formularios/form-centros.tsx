"use client"

import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type CentroFormData = {
  nome: string
  endereco: string
  responsavel: string
  telefone: string
  descricao: string
  funcionamento: string
  image: File | null
}

export default function FormCentros({
  onSubmit,
}: {
  onSubmit?: (data: CentroFormData) => void
}) {
  const [form, setForm] = useState<CentroFormData>({
    nome: "",
    endereco: "",
    responsavel: "",
    telefone: "",
    descricao: "",
    funcionamento: "",
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
        Cadastro de Centro
      </h1>

      <Card className="p-6 space-y-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NOME */}
          <div className="space-y-2">
            <Label>Nome do Centro</Label>
            <Input
              value={form.nome}
              onChange={(e) =>
                setForm({ ...form, nome: e.target.value })
              }
            />
          </div>

          {/* ENDEREÇO */}
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={form.endereco}
              onChange={(e) =>
                setForm({ ...form, endereco: e.target.value })
              }
            />
          </div>

          {/* RESPONSÁVEL */}
          <div className="space-y-2">
            <Label>Responsável</Label>
            <Input
              value={form.responsavel}
              onChange={(e) =>
                setForm({ ...form, responsavel: e.target.value })
              }
            />
          </div>

          {/* TELEFONE */}
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={form.telefone}
              onChange={(e) =>
                setForm({ ...form, telefone: e.target.value })
              }
            />
          </div>

          {/* FUNCIONAMENTO */}
          <div className="space-y-2">
            <Label>Horário de Funcionamento</Label>
            <Input
              value={form.funcionamento}
              onChange={(e) =>
                setForm({ ...form, funcionamento: e.target.value })
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
            Salvar Centro
          </Button>

        </form>

      </Card>
    </div>
  )
}