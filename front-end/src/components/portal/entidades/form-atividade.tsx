"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoRecorrencia, CampoResponsavel } from "@/components/comum/campos"
import CamposExtras, { erroFoto, extrasIniciais } from "@/components/comum/campos-extras"
import FormShell from "@/components/comum/form-shell"
import { useFormulario } from "@/components/comum/use-formulario"
import { atividadesApi } from "@/lib/services/entidades"
import { normalizarRecorrencia } from "@/lib/agenda"
import { notify } from "@/lib/notify"
import { obrigatorio, validarHorarios, type Erros } from "@/lib/validacao"
import type { Atividade, AtividadeInput, DiaSemana } from "@/lib/tipos"

type ErrosRec = { data?: string; dias?: string; unica?: { inicio?: string; fim?: string }; semanal?: Partial<Record<DiaSemana, { inicio?: string; fim?: string }>> }

function errosRecorrencia(r: AtividadeInput["recorrencia"]): ErrosRec | undefined {
  if (r.tipo === "Unica") {
    const h = validarHorarios(r.horarioInicio, r.horarioFim)
    const out: ErrosRec = { data: obrigatorio(r.data, "Informe a data"), unica: h }
    return out.data || h.inicio || h.fim ? out : undefined
  }
  const dias = Object.keys(r.horarios) as DiaSemana[]
  if (!dias.length) return { dias: "Escolha pelo menos um dia da semana" }
  const semanal: NonNullable<ErrosRec["semanal"]> = {}
  for (const d of dias) {
    const h = validarHorarios(r.horarios[d]!.horarioInicio, r.horarios[d]!.horarioFim)
    if (h.inicio || h.fim) semanal[d] = h
  }
  return Object.keys(semanal).length ? { semanal } : undefined
}

// "recorrencia" não é um campo de texto: o erro guarda um objeto detalhado, tratado à parte.
type Valores = AtividadeInput
function validar(v: Valores): Erros<Valores> {
  return {
    imagem_url: erroFoto(v),
    nome: obrigatorio(v.nome, "Dê um nome à atividade"),
    local: obrigatorio(v.local, "Informe onde acontece"),
    recorrencia: errosRecorrencia(v.recorrencia) ? "invalido" : undefined,
  }
}

export default function FormAtividade({ item }: { item?: Atividade }) {
  const router = useRouter()
  const f = useFormulario<Valores>(
    {
      nome: item?.nome ?? "", local: item?.local ?? "",
      responsavel: item?.responsavel ?? "", responsavel_id: item?.responsavel_id ?? null,
      ...extrasIniciais(item),
      recorrencia: item ? normalizarRecorrencia(item.recorrencia) : { tipo: "Semanal", horarios: {} },
    },
    validar
  )
  const { valores: v, erros } = f
  const detalhes = f.erros.recorrencia ? errosRecorrencia(v.recorrencia) : undefined

  return (
    <FormShell
      titulo={item ? "Editar atividade" : "Nova atividade"}
      descricao="Atividades são encontros que se repetem toda semana (ou acontecem uma única vez), como aulas e treinos."
      migalhas={[{ label: "Programação" }, { label: "Atividades", href: "/portal/atividades" }, { label: item ? item.nome : "Nova" }]}
      voltarHref={item ? `/portal/atividades/${item.id}` : "/portal/atividades"}
      sujo={f.sujo}
      salvando={f.salvando}
      rotuloSalvar={item ? "Salvar alterações" : "Criar atividade"}
      onSubmit={(ev) =>
        f.enviar(ev, async (dados) => {
          let alvo = item?.id
          if (item) await atividadesApi.atualizar(item.id, dados)
          else alvo = (await atividadesApi.criar(dados)).id
          notify.success(item ? "Atividade atualizada" : "Atividade criada")
          router.push(`/portal/atividades/${alvo}`)
        })
      }
    >
      <Secao titulo="Sobre a atividade">
        <Campo label="Nome da atividade" obrigatorio erro={erros.nome}>
          {(p) => <Input {...p} value={v.nome} placeholder="Ex.: Aula de Violão" onChange={(x) => f.definir("nome", x.target.value)} />}
        </Campo>
        <Campo label="Local" obrigatorio erro={erros.local}>
          {(p) => <Input {...p} value={v.local} placeholder="Ex.: Sala de Música" onChange={(x) => f.definir("local", x.target.value)} />}
        </Campo>
      </Secao>

      <Secao titulo="Quando acontece">
        <CampoRecorrencia valor={v.recorrencia} onChange={(r) => f.definir("recorrencia", r)} erros={detalhes} />
      </Secao>

      <CamposExtras erroImagem={erros.imagem_url} valores={v} definir={(c, x) => f.definir(c as never, x as never)} />

      <Secao titulo="Responsável">
        <CampoResponsavel valorId={v.responsavel_id ?? null} onChange={(id, nome) => { f.definir("responsavel_id", id); f.definir("responsavel", nome) }} />
      </Secao>
    </FormShell>
  )
}
