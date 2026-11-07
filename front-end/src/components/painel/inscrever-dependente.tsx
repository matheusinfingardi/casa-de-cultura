"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDemo } from "@/hooks/use-demo"
import type { ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { listarDependentes, type Dependente } from "@/lib/services/extras"
import { listarPresencasDoItem, matricularCliente, removerPresenca, type PresencaDoItem } from "@/lib/services/presencas"

/** Na página da atividade: inscreve ou tira cada dependente sem precisar sair dali. */
export default function InscreverDependente({ item, responsavelId, lotado }: { item: ItemView; responsavelId: string; lotado: boolean }) {
  const demo = useDemo()
  const [deps, setDeps] = useState<Dependente[]>([])
  const [inscritos, setInscritos] = useState<PresencaDoItem[]>([])
  useEffect(() => {
    if (!demo) return
    listarDependentes(responsavelId).then((l) => setDeps(l.filter((d) => !d.parente_id)))
    listarPresencasDoItem(item.tipo, item.id).then(setInscritos)
  }, [demo, responsavelId, item.tipo, item.id])
  if (!deps.length) return null
  const recarregar = async () => setInscritos(await listarPresencasDoItem(item.tipo, item.id))
  return (
    <div className="space-y-2 border-t pt-4">
      <p className="font-semibold">Seus dependentes</p>
      <ul className="space-y-2">
        {deps.map((d) => {
          const ins = inscritos.find((p) => p.cliente_id === d.id)
          return (
            <li key={d.id} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate">{d.nome.split(" ")[0]}</span>
              {ins ? (
                <Button size="sm" variant="outline" aria-label={`Tirar ${d.nome}`} onClick={async () => { await removerPresenca(ins.id); await recarregar(); notify.success(`${d.nome.split(" ")[0]} saiu da atividade`) }}>Tirar</Button>
              ) : (
                <Button size="sm" variant="outline" disabled={lotado} aria-label={`Inscrever ${d.nome}`} onClick={async () => { await matricularCliente(item.tipo, item.id, item.nome, d.id); await recarregar(); notify.success(`Inscrição de ${d.nome.split(" ")[0]} feita`) }}>{lotado ? "Sem vagas" : "Inscrever"}</Button>
              )}
            </li>
          )
        })}
      </ul>
      <Link href="/painel/familia" className="text-sm font-medium text-primary hover:underline">Gerenciar dependentes</Link>
    </div>
  )
}
