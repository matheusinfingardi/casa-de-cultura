"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Props = {
  data: any[]
  columns: string[]
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}

function formatHeader(col: string) {
  const map: Record<string, string> = {
    nome: "NOME",
    responsavel: "RESPONSÁVEL",
    local: "LOCAL",
    recorrencia: "RECORRÊNCIA",
    dia: "DIA",
    horarioInicio: "HORÁRIO INÍCIO",
    horarioFim: "HORÁRIO FIM",
  }

  return map[col] ?? col.toUpperCase()
}

function formatCell(value: any) {
  if (value === null || value === undefined) return "-"

  if (typeof value !== "string") return String(value)

  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function CrudTable({
  data,
  columns,
  onEdit,
  onDelete,
}: Props) {
  if (!data?.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Nenhum registro encontrado
      </Card>
    )
  }

  return (
    <>
      {/* MOBILE */}
      <div className="flex flex-col gap-4 md:hidden">
        {data.map((item, index) => (
          <Card
            key={`${item.id}-${index}`}
            className="p-4 space-y-4"
          >
            <div className="space-y-3">
              {columns.map((col) => (
                <div
                  key={`${col}-${index}`}
                  className="flex flex-col gap-1"
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {formatHeader(col)}
                  </span>

                  <span className="text-sm">
                    {formatCell(item[col])}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(item)}
              >
                Editar
              </Button>

              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => onDelete(item.id)}
              >
                Excluir
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* DESKTOP */}
      <Card className="hidden md:block p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left p-2 whitespace-nowrap"
                >
                  {formatHeader(col)}
                </th>
              ))}

              <th className="text-right p-2">
                AÇÕES
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr
                key={`${item.id}-${index}`}
                className="border-b hover:bg-muted/40"
              >
                {columns.map((col) => (
                  <td
                    key={`${col}-${index}`}
                    className="p-2 whitespace-nowrap"
                  >
                    {formatCell(item[col])}
                  </td>
                ))}

                <td className="p-2">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                    >
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(item.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}