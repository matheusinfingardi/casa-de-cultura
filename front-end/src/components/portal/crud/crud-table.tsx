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
        <Card className="p-4 overflow-x-auto">
            <table className="w-full text-sm">

                <thead>
                    <tr className="border-b">
                        {columns.map((col) => (
                            <th key={col} className="text-left p-2 whitespace-nowrap">
                                {formatHeader(col)}
                            </th>
                        ))}

                        <th className="text-right p-2">AÇÕES</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={`${item.id}-${item.dia ?? item.horarioInicio ?? Math.random()}`} className="border-b hover:bg-muted/40">

                            {columns.map((col) => (
                                <td key={col} className="p-2 whitespace-nowrap">
                                    {formatCell(item[col])}
                                </td>
                            ))}

                            <td className="p-2 flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                                    Editar
                                </Button>

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => onDelete(item.id)}
                                >
                                    Excluir
                                </Button>
                            </td>

                        </tr>
                    ))}
                </tbody>

            </table>
        </Card>
    )
}