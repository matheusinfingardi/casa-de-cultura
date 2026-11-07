"use client"

import { useAssistido } from "@/components/painel/use-assistido"
import { Carregando, VazioCard, CartaoInscricao } from "@/components/painel/cartoes"
import Link from "next/link"

export default function InscricoesPage() {
  const { minhas, loading, acao, cancelar } = useAssistido()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas inscrições</h1>
        <p className="text-muted-foreground text-sm">
          Tudo em que você está inscrito e como está sua presença.
        </p>
      </div>

      {loading ? (
        <Carregando />
      ) : !minhas.length ? (
        <VazioCard>
          Você ainda não está inscrito em nada.{" "}
          <Link href="/painel/explorar" className="text-primary font-medium hover:underline">
            Ver o que está disponível
          </Link>
        </VazioCard>
      ) : (
        <div className="flex flex-col gap-3">
          {minhas.map((p) => (
            <CartaoInscricao key={p.id} p={p} ocupado={acao === p.id} onCancelar={cancelar} />
          ))}
        </div>
      )}
    </div>
  )
}
