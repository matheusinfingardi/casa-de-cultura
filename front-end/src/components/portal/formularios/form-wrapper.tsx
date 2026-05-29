"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Props = {
  titulo: string
  submitLabel: string
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
}

export function FormWrapper({ titulo, submitLabel, onSubmit, children }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>

      <Card className="p-4 sm:p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          {children}
          <Button type="submit" className="w-full">
            {submitLabel}
          </Button>
        </form>
      </Card>
    </div>
  )
}