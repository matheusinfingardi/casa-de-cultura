"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoHorarios, CampoResponsavel, CampoSelect } from "@/components/comum/campos"
import CamposExtras, { erroFoto, extrasIniciais } from "@/components/comum/campos-extras"
import FormShell from "@/components/comum/form-shell"
import { useFormulario } from "@/components/comum/use-formulario"
import { oficinasApi } from "@/lib/services/entidades"
import { DIAS_SEMANA, normalizarDia } from "@/lib/formatar"
import { notify } from "@/lib/notify"
import { obrigatorio, validarHorarios, type Erros } from "@/lib/validacao"
import type { Oficina, OficinaInput } from "@/lib/tipos"

export const NIVEIS = [
  { valor: "iniciante", label: "Iniciante" },
  { valor: "intermediario", label: "Intermediário" },
  { valor: "avancado", label: "Avançado" },
]

function validar(v: OficinaInput): Erros<OficinaInput> {
  const h = validarHorarios(v.horarioInicio, v.horarioFim)
  return {
    imagem_url: erroFoto(v),
    nome: obrigatorio(v.nome, "Dê um nome à oficina"),
    local: obrigatorio(v.local, "Informe onde acontece"),
    dia: obrigatorio(v.dia, "Escolha o dia da semana"),
    nivel: obrigatorio(v.nivel, "Escolha o nível"),
    vagas: !Number.isInteger(v.vagas) || v.vagas < 1 ? "Informe pelo menos 1 vaga" : v.vagas > 500 ? "Número de vagas muito alto" : undefined,
    horarioInicio: h.inicio,
    horarioFim: h.fim,
  }
}

export default function FormOficina({ item }: { item?: Oficina }) {
  const router = useRouter()
  const f = useFormulario<OficinaInput>(
    {
      nome: item?.nome ?? "", local: item?.local ?? "", nivel: item?.nivel ?? "",
      dia: normalizarDia(item?.dia) ?? item?.dia ?? "", vagas: item?.vagas ?? 15,
      horarioInicio: item?.horarioInicio?.slice(0, 5) ?? "", horarioFim: item?.horarioFim?.slice(0, 5) ?? "",
      responsavel: item?.responsavel ?? "", responsavel_id: item?.responsavel_id ?? null,
      ...extrasIniciais(item),
    },
    validar
  )
  const { valores: v, erros } = f

  return (
    <FormShell
      titulo={item ? "Editar oficina" : "Nova oficina"}
      descricao="Oficinas são turmas com vagas limitadas, que acontecem num dia fixo da semana."
      migalhas={[{ label: "Programação" }, { label: "Oficinas", href: "/portal/oficinas" }, { label: item ? item.nome : "Nova" }]}
      voltarHref={item ? `/portal/oficinas/${item.id}` : "/portal/oficinas"}
      sujo={f.sujo}
      salvando={f.salvando}
      rotuloSalvar={item ? "Salvar alterações" : "Criar oficina"}
      onSubmit={(ev) =>
        f.enviar(ev, async (dados) => {
          let alvo = item?.id
          if (item) await oficinasApi.atualizar(item.id, dados)
          else alvo = (await oficinasApi.criar(dados)).id
          notify.success(item ? "Oficina atualizada" : "Oficina criada")
          router.push(`/portal/oficinas/${alvo}`)
        })
      }
    >
      <Secao titulo="Sobre a oficina">
        <Campo label="Nome da oficina" obrigatorio erro={erros.nome}>
          {(p) => <Input {...p} value={v.nome} placeholder="Ex.: Pintura em Tela" onChange={(x) => f.definir("nome", x.target.value)} />}
        </Campo>
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo label="Nível" obrigatorio erro={erros.nivel}>
            {(p) => <CampoSelect {...p} valor={v.nivel} opcoes={NIVEIS} onChange={(x) => f.definir("nivel", x)} />}
          </Campo>
          <Campo label="Vagas" obrigatorio erro={erros.vagas} dica="Quantas pessoas a turma comporta.">
            {(p) => <Input {...p} type="number" min={1} inputMode="numeric" value={Number.isNaN(v.vagas) ? "" : v.vagas} onChange={(x) => f.definir("vagas", x.target.value === "" ? NaN : Number(x.target.value))} />}
          </Campo>
        </div>
      </Secao>

      <Secao titulo="Quando e onde">
        <Campo label="Dia da semana" obrigatorio erro={erros.dia} className="sm:max-w-56">
          {(p) => <CampoSelect {...p} valor={v.dia} opcoes={DIAS_SEMANA.map((d) => ({ valor: d, label: d }))} onChange={(x) => f.definir("dia", x)} />}
        </Campo>
        <CampoHorarios
          inicio={v.horarioInicio}
          fim={v.horarioFim}
          erroInicio={erros.horarioInicio}
          erroFim={erros.horarioFim}
          onChange={(i, fim) => { f.definir("horarioInicio", i); f.definir("horarioFim", fim) }}
        />
        <Campo label="Local" obrigatorio erro={erros.local}>
          {(p) => <Input {...p} value={v.local} placeholder="Ex.: Ateliê" onChange={(x) => f.definir("local", x.target.value)} />}
        </Campo>
      </Secao>

      <CamposExtras erroImagem={erros.imagem_url} valores={v} definir={(c, x) => f.definir(c, x)} />

      <Secao titulo="Responsável">
        <CampoResponsavel valorId={v.responsavel_id ?? null} onChange={(id, nome) => { f.definir("responsavel_id", id); f.definir("responsavel", nome) }} />
      </Secao>
    </FormShell>
  )
}
