"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROLES, ROLE_LABELS, type Role, type Usuario } from "@/lib/services/usuarios"

type Props = {
  data: Usuario[]
  currentUserId?: string
  onChangeRole: (id: string, role: Role) => void
}

const ROLE_BADGE: Record<Role, "default" | "secondary" | "outline"> = {
  admin: "default",
  responsavel: "secondary",
  cliente: "outline",
}

function RoleSelect({
  value,
  disabled,
  onChange,
}: {
  value: Role
  disabled: boolean
  onChange: (role: Role) => void
}) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(v) => onChange(v as Role)}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {ROLE_LABELS[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function UsuariosTable({
  data,
  currentUserId,
  onChangeRole,
}: Props) {
  if (!data?.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Nenhum usuário encontrado
      </Card>
    )
  }

  return (
    <>
      {/* MOBILE */}
      <div className="flex flex-col gap-4 md:hidden">
        {data.map((item) => {
          const isSelf = item.id === currentUserId
          return (
            <Card key={item.id} className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    NOME
                  </span>
                  <span className="text-sm">
                    {item.nome ?? "-"}
                    {isSelf && (
                      <span className="text-muted-foreground"> (você)</span>
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    EMAIL
                  </span>
                  <span className="text-sm break-all">{item.email ?? "-"}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    PAPEL
                  </span>
                  <RoleSelect
                    value={item.role}
                    disabled={isSelf}
                    onChange={(role) => onChangeRole(item.id, role)}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* DESKTOP */}
      <Card className="hidden md:block p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 whitespace-nowrap">NOME</th>
              <th className="text-left p-2 whitespace-nowrap">EMAIL</th>
              <th className="text-left p-2 whitespace-nowrap">PAPEL ATUAL</th>
              <th className="text-right p-2">ALTERAR PAPEL</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const isSelf = item.id === currentUserId
              return (
                <tr key={item.id} className="border-b hover:bg-muted/40">
                  <td className="p-2 whitespace-nowrap">
                    {item.nome ?? "-"}
                    {isSelf && (
                      <span className="text-muted-foreground"> (você)</span>
                    )}
                  </td>
                  <td className="p-2 whitespace-nowrap">{item.email ?? "-"}</td>
                  <td className="p-2 whitespace-nowrap">
                    <Badge variant={ROLE_BADGE[item.role]}>
                      {ROLE_LABELS[item.role]}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex justify-end">
                      <RoleSelect
                        value={item.role}
                        disabled={isSelf}
                        onChange={(role) => onChangeRole(item.id, role)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </>
  )
}
