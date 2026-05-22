"use client"

import { Button } from "@/components/ui/button"
import CrudTable from "./crud-table"

type Props = {
  title: string
  data: any[]
  columns: string[]
  onCreate: () => void
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}

export default function CrudPage({
  title,
  data,
  columns,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={onCreate}>+ Criar</Button>
      </div>
      <CrudTable
        data={data}
        columns={columns}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}