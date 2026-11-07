"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  PRESENCA_LABELS,
  ITEM_TIPO_LABELS,
  type ItemResponsavel,
  type MinhaPresenca,
  type PresencaStatus,
} from "@/lib/services/presencas"

const STATUS_BADGE: Record<PresencaStatus, "default" | "secondary" | "outline" | "destructive"> = {
  presente: "default",
  marcada: "secondary",
  ausente: "destructive",
}

export function Carregando({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  )
}

export function VazioCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="p-8 text-center text-muted-foreground text-sm">{children}</Card>
  )
}

export function CartaoInscricao({
  p,
  ocupado,
  onCancelar,
}: {
  p: MinhaPresenca
  ocupado: boolean
  onCancelar: (p: MinhaPresenca) => void
}) {
  const [confirmando, setConfirmando] = useState(false)

  return (
    <>
      <Card className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium truncate">{p.item_nome ?? "Item"}</p>
          <Badge variant="outline" className="mt-1">
            {ITEM_TIPO_LABELS[p.item_tipo]}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_BADGE[p.status]}>{PRESENCA_LABELS[p.status]}</Badge>
          <Button
            size="sm"
            variant="outline"
            disabled={ocupado}
            onClick={() => setConfirmando(true)}
          >
            Cancelar inscrição
          </Button>
        </div>
      </Card>

      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar inscrição?</DialogTitle>
            <DialogDescription>
              Você sairá de “{p.item_nome ?? "este item"}”. Pode se inscrever de novo depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmando(false)}>
              Manter inscrição
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmando(false)
                onCancelar(p)
              }}
            >
              Cancelar inscrição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function CartaoDisponivel({
  i,
  ocupado,
  onInscrever,
}: {
  i: ItemResponsavel
  ocupado: boolean
  onInscrever: (i: ItemResponsavel) => void
}) {
  return (
    <Card className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium truncate">{i.nome ?? "Item"}</p>
        <div className="flex items-center gap-2 mt-1 min-w-0">
          <Badge variant="outline">{ITEM_TIPO_LABELS[i.tipo]}</Badge>
          {i.local && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {i.local}
            </span>
          )}
        </div>
      </div>
      <Button size="sm" onClick={() => onInscrever(i)} disabled={ocupado}>
        {ocupado ? "Inscrevendo..." : "Inscrever-me"}
      </Button>
    </Card>
  )
}
