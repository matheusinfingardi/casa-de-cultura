"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoHorarios, CampoResponsavel, CampoSelect } from "@/components/comum/campos"
import CamposExtras, { extrasIniciais } from "@/components/comum/campos-extras"
import FormShell from "@/components/comum/form-shell"
import { useFormulario } from "@/components/comum/use-formulario"
import { eventosApi } from "@/lib/services/entidades"
import { notify } from "@/lib/notify"
import { obrigatorio, validarHorarios, type Erros } from "@/lib/validacao"
import type { Evento, EventoInput } from "@/lib/tipos"

export const TIPOS_EVENTO = [
  { valor: "cultural", label: "Cultural" },
  { valor: "social", label: "Social" },
  { valor: "saude", label: "Saúde" },
  { valor: "educacao", label: "Educação" },
]

function validar(v: EventoInput): Erros<EventoInput> {
  const h = validarHorarios(v.horarioInicio, v.horarioFim)
  return {
    nome: obrigatorio(v.nome, "Dê um nome ao evento"),
    tipo: obrigatorio(v.tipo, "Escolha o tipo do evento"),
    data: obrigatorio(v.data, "Informe a data"),
    local: obrigatorio(v.local, "Informe onde será realizado"),
    horarioInicio: h.inicio,
    horarioFim: h.fim,
  }
}

export default function FormEvento({ item }: { item?: Evento }) {
  const router = useRouter()
  const f = useFormulario<EventoInput>(
    {
      nome: item?.nome ?? "", tipo: item?.tipo ?? "", data: item?.data?.slice(0, 10) ?? "", local: item?.local ?? "",
      horarioInicio: item?.horarioInicio?.slice(0, 5) ?? "", horarioFim: item?.horarioFim?.slice(0, 5) ?? "",
      responsavel: item?.responsavel ?? "", responsavel_id: item?.responsavel_id ?? null,
      ...extrasIniciais(item),
    },
    validar
  )
  const { valores: v, erros } = f
  const e = (k: keyof EventoInput) => erros[k]

  return (
    <FormShell
      titulo={item ? "Editar evento" : "Novo evento"}
      descricao="Eventos acontecem em uma data específica e aparecem no calendário da Visão geral."
      migalhas={[{ label: "Programação" }, { label: "Eventos", href: "/portal/eventos" }, { label: item ? item.nome : "Novo" }]}
      voltarHref={item ? `/portal/eventos/${item.id}` : "/portal/eventos"}
      sujo={f.sujo}
      salvando={f.salvando}
      rotuloSalvar={item ? "Salvar alterações" : "Criar evento"}
      onSubmit={(ev) =>
        f.enviar(ev, async (dados) => {
          let alvo = item?.id
          if (item) await eventosApi.atualizar(item.id, dados)
          else alvo = (await eventosApi.criar(dados)).id
          notify.success(item ? "Evento atualizado" : "Evento criado")
          router.push(`/portal/eventos/${alvo}`)
        })
      }
    >
      <Secao titulo="Sobre o evento">
        <Campo label="Nome do evento" obrigatorio erro={e("nome")}>
          {(p) => <Input {...p} value={v.nome} placeholder="Ex.: Festival de Cultura Popular" onChange={(x) => f.definir("nome", x.target.value)} />}
        </Campo>
        <Campo label="Tipo" obrigatorio erro={e("tipo")}>
          {(p) => <CampoSelect {...p} valor={v.tipo} opcoes={TIPOS_EVENTO} onChange={(x) => f.definir("tipo", x)} />}
        </Campo>
      </Secao>

      <Secao titulo="Quando e onde">
        <Campo label="Data" obrigatorio erro={e("data")}>
          {(p) => <Input {...p} type="date" value={v.data} onChange={(x) => f.definir("data", x.target.value)} className="sm:max-w-56" />}
        </Campo>
        <CampoHorarios
          inicio={v.horarioInicio}
          fim={v.horarioFim}
          erroInicio={e("horarioInicio")}
          erroFim={e("horarioFim")}
          onChange={(i, fim) => { f.definir("horarioInicio", i); f.definir("horarioFim", fim) }}
        />
        <Campo label="Local" obrigatorio erro={e("local")}>
          {(p) => <Input {...p} value={v.local} placeholder="Ex.: Praça Central" onChange={(x) => f.definir("local", x.target.value)} />}
        </Campo>
      </Secao>

      <CamposExtras valores={v} definir={(c, x) => f.definir(c, x)} />

      <Secao titulo="Responsável">
        <CampoResponsavel valorId={v.responsavel_id ?? null} onChange={(id, nome) => { f.definir("responsavel_id", id); f.definir("responsavel", nome) }} />
      </Secao>
    </FormShell>
  )
}
