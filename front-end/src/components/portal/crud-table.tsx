"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Column {
  label: string
  key: string
}

interface CrudTableProps {
  title: string
  columns: Column[]
  data: any[]
  onCreate: () => void
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}

export default function CrudTable({
  title,
  columns,
  data,
  onCreate,
  onEdit,
  onDelete,
}: CrudTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={onCreate}>
          + Criar
        </Button>
      </div>
      <Card className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {columns.map((col) => (
                <th key={col.key} className="text-left p-2">
                  {col.label}
                </th>
              ))}
              <th className="text-right p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b">
                {columns.map((col) => (
                  <td key={col.key} className="p-2">
                    {item[col.key]}
                  </td>
                ))}
                <td className="p-2 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
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
    </div>
  )
}