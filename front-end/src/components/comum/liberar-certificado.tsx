"use client"

import { useState } from "react"
import { Award, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDemo } from "@/hooks/use-demo"
import { definirLiberacaoCertificado, type ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { notificar } from "@/lib/services/extras"
import { listarPresencasDoItem } from "@/lib/services/presencas"
import Confirmar from "./confirmar"

/** O responsável (ou a administração) libera os certificados no final da atividade. */
export default function LiberarCertificado({ item, presentes, aoMudar }: { item: ItemView; presentes: number; aoMudar: () => unknown }) {
  const demo = useDemo()
  const [confirmando, setConfirmando] = useState(false)
  if (!demo || !item.tem_certificado) return null

  async function liberar() {
    await definirLiberacaoCertificado(item.tipo, item.id, true)
    const inscritos = await listarPresencasDoItem(item.tipo, item.id)
    await Promise.all(inscritos.map((p) => notificar(p.cliente_id, "Seu certificado está pronto", `O certificado de ${item.nome} foi liberado. Baixe em Minhas inscrições.`, "/painel/inscricoes")))
    notify.success("Certificados liberados")
    await aoMudar()
  }

  async function suspender() {
    await definirLiberacaoCertificado(item.tipo, item.id, false)
    notify.success("Liberação suspensa")
    await aoMudar()
  }

  return (
    <section aria-labelledby="titulo-certificados" className="rounded-2xl border bg-card p-5 shadow-sm">
      <h2 id="titulo-certificados" className="flex items-center gap-2 text-lg font-semibold"><Award className="h-5 w-5 text-primary" aria-hidden /> Certificados</h2>
      {item.certificado_liberado ? (
        <>
          <p className="mt-2 flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden /> Liberados</p>
          <p className="mt-1 text-muted-foreground">Quem tem presença registrada e o responsável já podem baixar.</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={suspender}>Suspender liberação</Button>
        </>
      ) : (
        <>
          <p className="mt-2 text-muted-foreground">Quando terminar, libere para {presentes} {presentes === 1 ? "pessoa" : "pessoas"} com presença baixarem o certificado.</p>
          <Button className="mt-3" onClick={() => setConfirmando(true)}>Liberar certificados</Button>
        </>
      )}
      <Confirmar
        aberto={confirmando}
        onFechar={() => setConfirmando(false)}
        titulo="Liberar os certificados?"
        descricao={<>Cada pessoa com presença em “{item.nome}” recebe um aviso e pode baixar o certificado. Você também recebe o seu, como responsável.</>}
        confirmarLabel="Liberar"
        onConfirmar={liberar}
      />
    </section>
  )
}
