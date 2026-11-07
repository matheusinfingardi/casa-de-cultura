"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoResponsavel, CampoSelect } from "@/components/comum/campos"
import CamposExtras, { erroFoto, extrasIniciais } from "@/components/comum/campos-extras"
import FormShell from "@/components/comum/form-shell"
import { useFormulario } from "@/components/comum/use-formulario"
import { assistenciaApi } from "@/lib/services/entidades"
import { notify } from "@/lib/notify"
import { obrigatorio, type Erros } from "@/lib/validacao"
import type { Assistencia, AssistenciaInput } from "@/lib/tipos"

export const TIPOS_ASSISTENCIA = ["Psicológica", "Jurídica", "Social", "Saúde", "Alimentar", "Educacional"].map((t) => ({ valor: t, label: t }))

function validar(v: AssistenciaInput): Erros<AssistenciaInput> {
  return {
    imagem_url: erroFoto(v),
    nome: obrigatorio(v.nome, "Dê um nome ao atendimento"),
    tipo: obrigatorio(v.tipo, "Escolha o tipo de assistência"),
    local: obrigatorio(v.local, "Informe onde é prestado"),
  }
}

export default function FormAssistencia({ item }: { item?: Assistencia }) {
  const router = useRouter()
  const f = useFormulario<AssistenciaInput>(
    {
      nome: item?.nome ?? "", tipo: item?.tipo ?? "", local: item?.local ?? "",
      responsavel: item?.responsavel ?? "", responsavel_id: item?.responsavel_id ?? null,
      ...extrasIniciais(item),
    },
    validar
  )
  const { valores: v, erros } = f

  return (
    <FormShell
      titulo={item ? "Editar assistência" : "Nova assistência"}
      descricao="Serviços de apoio oferecidos às famílias atendidas, como orientação jurídica ou cesta básica."
      migalhas={[{ label: "Atendimento" }, { label: "Assistência", href: "/portal/assistencia" }, { label: item ? item.nome : "Nova" }]}
      voltarHref={item ? `/portal/assistencia/${item.id}` : "/portal/assistencia"}
      sujo={f.sujo}
      salvando={f.salvando}
      rotuloSalvar={item ? "Salvar alterações" : "Criar assistência"}
      onSubmit={(ev) =>
        f.enviar(ev, async (dados) => {
          let alvo = item?.id
          if (item) await assistenciaApi.atualizar(item.id, dados)
          else alvo = (await assistenciaApi.criar(dados)).id
          notify.success(item ? "Assistência atualizada" : "Assistência criada")
          router.push(`/portal/assistencia/${alvo}`)
        })
      }
    >
      <Secao titulo="Sobre o atendimento">
        <Campo label="Nome" obrigatorio erro={erros.nome}>
          {(p) => <Input {...p} value={v.nome} placeholder="Ex.: Orientação Jurídica" onChange={(x) => f.definir("nome", x.target.value)} />}
        </Campo>
        <Campo label="Tipo de assistência" obrigatorio erro={erros.tipo}>
          {(p) => <CampoSelect {...p} valor={v.tipo} opcoes={TIPOS_ASSISTENCIA} onChange={(x) => f.definir("tipo", x)} />}
        </Campo>
        <Campo label="Local" obrigatorio erro={erros.local}>
          {(p) => <Input {...p} value={v.local} placeholder="Ex.: Sala 5" onChange={(x) => f.definir("local", x.target.value)} />}
        </Campo>
      </Secao>

      <CamposExtras erroImagem={erros.imagem_url} valores={v} definir={(c, x) => f.definir(c as never, x as never)} />

      <Secao titulo="Responsável">
        <CampoResponsavel valorId={v.responsavel_id ?? null} onChange={(id, nome) => { f.definir("responsavel_id", id); f.definir("responsavel", nome) }} />
      </Secao>
    </FormShell>
  )
}
