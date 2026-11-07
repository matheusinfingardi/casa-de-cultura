import { listarItensView, type ItemView } from "@/lib/itens"
import { listarRegistros, listarTodosDependentes, type Registro } from "@/lib/services/extras"
import { listarResumoPresencas } from "@/lib/services/presencas"
import { listarClientes, type Usuario } from "@/lib/services/usuarios"

export type AssistidoRelacionado = { pessoa: Usuario; itens: ItemView[]; registros: Registro[] }

/** Só as pessoas inscritas em itens de que o voluntário é responsável. */
export async function listarAssistidosDoVoluntario(voluntarioId: string): Promise<AssistidoRelacionado[]> {
  const [itens, presencas, clientes, registros, deps] = await Promise.all([listarItensView(), listarResumoPresencas(), listarClientes(), listarRegistros(), listarTodosDependentes()])
  const meus = itens.filter((i) => i.responsavel_id === voluntarioId)
  const ids = new Set(meus.map((i) => i.id))
  const out: AssistidoRelacionado[] = []
  for (const pessoa of clientes) {
    // Quem tem um dependente na atividade também é uma pessoa de contato do voluntário.
    const seus = new Set([pessoa.id, ...deps.filter((d) => d.responsavel_id === pessoa.id).map((d) => d.id)])
    const dele = presencas.filter((p) => seus.has(p.cliente_id) && ids.has(p.item_id)).map((p) => p.item_id)
    if (!dele.length) continue
    out.push({
      pessoa,
      itens: meus.filter((i) => dele.includes(i.id)),
      registros: registros.filter((r) => r.cliente_id === pessoa.id && ids.has(r.item_id)),
    })
  }
  return out
}
