"use client"

import Link from "next/link"
import { Hourglass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import PageHeader from "@/components/comum/page-header"
import { Carregando, CartaoInscricao, VazioCard } from "@/components/painel/cartoes"
import { useAssistido } from "@/components/painel/use-assistido"

export default function InscricoesPage() {
  const { minhas, espera, loading, acao, cancelar, sairFila } = useAssistido()
  return (
    <div className="space-y-6">
      <PageHeader titulo="Minhas inscrições" descricao="Veja sua situação em cada item e baixe certificados dos que você participou." />
      {loading ? <Carregando /> : (
        <>
          {minhas.length === 0 ? (
            <VazioCard>
              Você ainda não se inscreveu em nada.{" "}
              <Link href="/painel/explorar" className="font-medium text-primary hover:underline">Ver o que está disponível</Link>
            </VazioCard>
          ) : (
            <div className="flex flex-col gap-3">{minhas.map((p) => <CartaoInscricao key={p.id} p={p} ocupado={acao === p.id} onCancelar={cancelar} comCertificado />)}</div>
          )}
          {espera.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Lista de espera</h2>
              {espera.map((e) => (
                <Card key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <Link href={`/painel/item/${e.item_tipo}/${e.item_id}`} className="flex items-center gap-2 font-semibold hover:underline"><Hourglass className="h-4 w-4" aria-hidden />{e.item_nome}</Link>
                  <Button size="sm" variant="ghost" onClick={() => sairFila(e)}>Sair da lista</Button>
                </Card>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}
