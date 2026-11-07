"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoResponsavel } from "@/components/comum/campos"
import CamposExtras, { erroFoto, extrasIniciais } from "@/components/comum/campos-extras"
import FormShell from "@/components/comum/form-shell"
import { useFormulario } from "@/components/comum/use-formulario"
import { centrosApi } from "@/lib/services/entidades"
import { mascararTelefone } from "@/lib/formatar"
import { notify } from "@/lib/notify"
import { obrigatorio, validarTelefone, type Erros } from "@/lib/validacao"
import type { Centro, CentroInput } from "@/lib/tipos"

function validar(v: CentroInput): Erros<CentroInput> {
  return {
    imagem_url: erroFoto(v),
    nome: obrigatorio(v.nome, "Dê um nome ao centro"),
    endereco: obrigatorio(v.endereco, "Informe o endereço"),
    telefone: validarTelefone(v.telefone),
  }
}

export default function FormCentro({ item }: { item?: Centro }) {
  const router = useRouter()
  const f = useFormulario<CentroInput>(
    {
      nome: item?.nome ?? "", endereco: item?.endereco ?? "", telefone: item?.telefone ?? "",
      responsavel: item?.responsavel ?? "", responsavel_id: item?.responsavel_id ?? null,
      ...extrasIniciais(item, false),
    },
    validar
  )
  const { valores: v, erros } = f

  return (
    <FormShell
      titulo={item ? "Editar centro" : "Novo centro"}
      descricao="Centros são as unidades físicas onde o projeto atua."
      migalhas={[{ label: "Atendimento" }, { label: "Centros", href: "/portal/centros" }, { label: item ? item.nome : "Novo" }]}
      voltarHref={item ? `/portal/centros/${item.id}` : "/portal/centros"}
      sujo={f.sujo}
      salvando={f.salvando}
      rotuloSalvar={item ? "Salvar alterações" : "Criar centro"}
      onSubmit={(ev) =>
        f.enviar(ev, async (dados) => {
          let alvo = item?.id
          if (item) await centrosApi.atualizar(item.id, dados)
          else alvo = (await centrosApi.criar(dados)).id
          notify.success(item ? "Centro atualizado" : "Centro criado")
          router.push(`/portal/centros/${alvo}`)
        })
      }
    >
      <Secao titulo="Identificação">
        <Campo label="Nome do centro" obrigatorio erro={erros.nome}>
          {(p) => <Input {...p} value={v.nome} placeholder="Ex.: Centro Comunitário Norte" onChange={(x) => f.definir("nome", x.target.value)} />}
        </Campo>
      </Secao>

      <Secao titulo="Contato e endereço">
        <Campo label="Endereço" obrigatorio erro={erros.endereco} dica="Rua, número e bairro.">
          {(p) => <Input {...p} autoComplete="street-address" value={v.endereco} onChange={(x) => f.definir("endereco", x.target.value)} />}
        </Campo>
        <Campo label="Telefone" erro={erros.telefone} className="sm:max-w-64">
          {(p) => <Input {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder="(32) 99999-9999" value={v.telefone} onChange={(x) => f.definir("telefone", mascararTelefone(x.target.value))} />}
        </Campo>
      </Secao>

      <CamposExtras erroImagem={erros.imagem_url} valores={v} definir={(c, x) => f.definir(c as never, x as never)} comUnidade={false} />

      <Secao titulo="Responsável">
        <CampoResponsavel valorId={v.responsavel_id ?? null} onChange={(id, nome) => { f.definir("responsavel_id", id); f.definir("responsavel", nome) }} />
      </Secao>
    </FormShell>
  )
}
