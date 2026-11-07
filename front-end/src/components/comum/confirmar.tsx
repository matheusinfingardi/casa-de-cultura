"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

export default function Confirmar({
  aberto,
  onFechar,
  titulo,
  descricao,
  confirmarLabel = "Confirmar",
  perigoso,
  onConfirmar,
}: {
  aberto: boolean
  onFechar: () => void
  titulo: string
  descricao: React.ReactNode
  confirmarLabel?: string
  perigoso?: boolean
  onConfirmar: () => Promise<void> | void
}) {
  const [ocupado, setOcupado] = useState(false)

  async function confirmar() {
    setOcupado(true)
    try {
      await onConfirmar()
      onFechar()
    } catch {
      // o erro já foi mostrado por toast no serviço
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && !ocupado && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onFechar} disabled={ocupado}>
            Voltar
          </Button>
          <Button variant={perigoso ? "destructive" : "default"} onClick={confirmar} disabled={ocupado}>
            {ocupado ? "Aguarde..." : confirmarLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
