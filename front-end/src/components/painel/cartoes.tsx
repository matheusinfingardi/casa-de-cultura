"use client"

import { useState } from "react"
import Link from "next/link"
import { Award, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import CapaItem from "@/components/comum/capa-item"
import Confirmar from "@/components/comum/confirmar"
import type { ItemView } from "@/lib/itens"
import { ITEM_TIPO_LABELS, PRESENCA_LABELS, type MinhaPresenca, type PresencaStatus } from "@/lib/services/presencas"

const STATUS_BADGE: Record<PresencaStatus, "default" | "secondary" | "destructive"> = { presente: "default", marcada: "secondary", ausente: "destructive" }

export function Carregando({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
    </div>
  )
}

export function VazioCard({ children }: { children: React.ReactNode }) {
  return <Card className="p-8 text-center text-muted-foreground">{children}</Card>
}

export function CartaoInscricao({ p, ocupado, onCancelar, comCertificado }: { p: MinhaPresenca; ocupado: boolean; onCancelar: (p: MinhaPresenca) => void; comCertificado?: boolean }) {
  const [confirmando, setConfirmando] = useState(false)
  return (
    <>
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link href={`/painel/item/${p.item_tipo}/${p.item_id}`} className="block truncate font-semibold hover:underline">{p.item_nome ?? "Item"}</Link>
          <p className="text-sm text-muted-foreground">{ITEM_TIPO_LABELS[p.item_tipo]}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_BADGE[p.status]}>{PRESENCA_LABELS[p.status]}</Badge>
          {comCertificado && p.status === "presente" && (
            <Button size="sm" variant="outline" asChild><Link href={`/painel/certificado/${p.id}`}><Award className="h-4 w-4" aria-hidden /> Certificado</Link></Button>
          )}
          <Button size="sm" variant="ghost" disabled={ocupado} onClick={() => setConfirmando(true)}>Cancelar inscrição</Button>
        </div>
      </Card>
      <Confirmar
        aberto={confirmando}
        onFechar={() => setConfirmando(false)}
        titulo="Cancelar inscrição?"
        descricao={<>Você sairá de “{p.item_nome ?? "este item"}”. Pode se inscrever de novo depois.</>}
        confirmarLabel="Cancelar inscrição"
        perigoso
        onConfirmar={() => onCancelar(p)}
      />
    </>
  )
}

/** Cartão de Explorar: leva à página do item, onde a pessoa decide se inscrever. */
export function CartaoItem({ i, inscrito, lotado, vagas }: { i: ItemView; inscrito?: boolean; lotado?: boolean; vagas?: number | null }) {
  return (
    <Link href={`/painel/item/${i.tipo}/${i.id}`} className="group flex w-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors hover:border-primary">
      <CapaItem tipo={i.tipo} imagem={i.imagem_url} className="h-20" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{ITEM_TIPO_LABELS[i.tipo]}</Badge>
          {inscrito && <Badge>Inscrito</Badge>}
          {lotado && !inscrito && <Badge variant="destructive">Lotado</Badge>}
        </div>
        <p className="text-lg font-semibold leading-snug group-hover:underline">{i.nome}</p>
        {i.quando && <p className="text-sm text-muted-foreground">{i.quando}</p>}
        {i.local && <p className="mt-auto flex gap-1.5 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /><span className="min-w-0">{i.local}</span></p>}
        {vagas !== null && vagas !== undefined && vagas > 0 && !inscrito && <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{vagas} {vagas === 1 ? "vaga livre" : "vagas livres"}</p>}
      </div>
    </Link>
  )
}
