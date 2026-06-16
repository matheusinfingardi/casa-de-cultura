"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { listarResponsaveis, type Usuario } from "@/lib/services/usuarios"

type Props = {
  /** responsavel_id selecionado */
  value?: string | null
  /** recebe o id e o nome (ou email) do responsável escolhido */
  onChange: (id: string, nome: string) => void
}

export function ResponsavelField({ value, onChange }: Props) {
  const [responsaveis, setResponsaveis] = useState<Usuario[]>([])

  useEffect(() => {
    listarResponsaveis().then(setResponsaveis)
  }, [])

  return (
    <div className="space-y-2">
      <Label>Responsável</Label>
      <Select
        value={value ?? ""}
        onValueChange={(id) => {
          const sel = responsaveis.find((r) => r.id === id)
          onChange(id, sel?.nome ?? sel?.email ?? "")
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
      {responsaveis.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhum responsável cadastrado. Defina o papel “Responsável” a um usuário em Usuários.
        </p>
      )}
    </div>
  )
}
