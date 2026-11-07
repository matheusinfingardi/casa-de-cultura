"use client"

import { useEffect, useMemo, useState } from "react"
import { Clock, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { DIAS_SEMANA, mascararTelefone } from "@/lib/formatar"
import { chaveData } from "@/lib/formatar"
import { combinaComHorarios, listarItensView, type ItemView } from "@/lib/itens"
import { notify } from "@/lib/notify"
import { AREAS_AJUDA, SUGESTOES_TAREFAS, buscarDisponibilidade, salvarDisponibilidade, type Disponibilidade, type FaixaHorario } from "@/lib/services/extras"
import { ITEM_TIPO_LABELS, type ItemTipo } from "@/lib/services/presencas"
import { centrosApi } from "@/lib/services/entidades"
import type { Centro } from "@/lib/tipos"

const ESCOLARIDADE = ["Ensino fundamental", "Ensino médio", "Curso técnico", "Ensino superior", "Pós-graduação"].map((x) => ({ valor: x, label: x }))
const FREQUENCIA = ["Toda semana", "Duas vezes por mês", "Uma vez por mês", "Quando houver eventos"].map((x) => ({ valor: x, label: x }))
const GRUPOS: { tipo: ItemTipo; titulo: string }[] = [{ tipo: "atividade", titulo: "Atividades" }, { tipo: "oficina", titulo: "Oficinas" }, { tipo: "evento", titulo: "Eventos" }, { tipo: "assistencia", titulo: "Assistência" }]

/** Botões de múltipla escolha. */
function Escolhas({ rotulo, opcoes, valor, onChange }: { rotulo: string; opcoes: string[]; valor: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={rotulo}>
      {opcoes.map((o) => {
        const on = valor.includes(o)
        return <Button key={o} type="button" size="sm" variant={on ? "default" : "outline"} aria-pressed={on} onClick={() => onChange(on ? valor.filter((x) => x !== o) : [...valor, o])}>{o}</Button>
      })}
    </div>
  )
}

function Formulario() {
  const { user } = useAuth()
  const [d, setD] = useState<Disponibilidade | null>(null)
  const [itens, setItens] = useState<ItemView[]>([])
  const [centros, setCentros] = useState<Centro[]>([])
  const [erros, setErros] = useState<string[]>([])

  useEffect(() => {
    if (user) buscarDisponibilidade(user.id).then(setD)
    listarItensView().then(setItens)
    centrosApi.listar().then(setCentros)
  }, [user])

  const hoje = chaveData(new Date())
  const vigentes = useMemo(() => itens.filter((i) => i.tipo !== "centro" && (i.tipo !== "evento" || ((i.bruto as { data?: string }).data ?? "") >= hoje)), [itens, hoje])
  if (!d) return null

  const set = <K extends keyof Disponibilidade>(k: K, v: Disponibilidade[K]) => setD({ ...d, [k]: v })

  function setFaixas(dia: string, faixas: FaixaHorario[]) {
    if (!d) return
    const horarios = { ...d.horarios, [dia]: faixas }
    if (!faixas.length) delete horarios[dia]
    setD({ ...d, horarios })
  }

  function validar(): string[] {
    const out: string[] = []
    for (const dia of DIAS_SEMANA) {
      for (const f of d?.horarios[dia] ?? []) {
        if (!f.inicio || !f.fim) out.push(`${dia}: informe o início e o término`)
        else if (f.fim <= f.inicio) out.push(`${dia}: o término deve ser depois do início`)
      }
    }
    return [...new Set(out)]
  }

  const combinando = vigentes.filter((i) => combinaComHorarios(i, d.horarios) === true).length

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault()
        const problemas = validar()
        setErros(problemas)
        if (problemas.length) return notify.error("Revise os horários destacados")
        await salvarDisponibilidade(d)
        notify.success("Ficha salva")
      }}
    >
      <Secao titulo="Quando posso ajudar" descricao="Escolha os dias e informe o horário exato. Dá para colocar mais de um horário no mesmo dia.">
        <Escolhas
          rotulo="Dias da semana"
          opcoes={DIAS_SEMANA}
          valor={Object.keys(d.horarios)}
          onChange={(dias) => {
            const horarios: Record<string, FaixaHorario[]> = {}
            for (const dia of dias) horarios[dia] = d.horarios[dia] ?? [{ inicio: "", fim: "" }]
            set("horarios", horarios)
          }}
        />
        {DIAS_SEMANA.filter((x) => d.horarios[x]).map((dia) => (
          <div key={dia} className="rounded-xl border p-3">
            <p className="mb-2 font-semibold">{dia}</p>
            <ul className="space-y-2">
              {d.horarios[dia].map((f, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input type="time" aria-label={`${dia}: início`} className="w-36" value={f.inicio} onChange={(e) => setFaixas(dia, d.horarios[dia].map((x, j) => (j === i ? { ...x, inicio: e.target.value } : x)))} />
                  <span>às</span>
                  <Input type="time" aria-label={`${dia}: término`} className="w-36" value={f.fim} onChange={(e) => setFaixas(dia, d.horarios[dia].map((x, j) => (j === i ? { ...x, fim: e.target.value } : x)))} />
                  <Button type="button" size="icon-sm" variant="ghost" aria-label={`Remover este horário de ${dia}`} onClick={() => setFaixas(dia, d.horarios[dia].filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
            <Button type="button" size="sm" variant="ghost" className="mt-1" onClick={() => setFaixas(dia, [...d.horarios[dia], { inicio: "", fim: "" }])}><Plus className="h-4 w-4" aria-hidden /> Outro horário</Button>
          </div>
        ))}
        {erros.length > 0 && <ul role="alert" className="space-y-1 text-sm text-red-600">{erros.map((e) => <li key={e}>{e}</li>)}</ul>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Com que frequência">{(p) => <CampoSelect {...p} valor={d.frequencia} opcoes={FREQUENCIA} onChange={(x) => set("frequencia", x)} />}</Campo>
          <div className="flex items-end pb-2.5"><label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={d.tem_transporte} onChange={(e) => set("tem_transporte", e.target.checked)} /> Consigo me deslocar entre as unidades</label></div>
        </div>
        {centros.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Unidades em que posso ir</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Unidades">
              {centros.map((c) => {
                const on = d.unidades.includes(c.id)
                return <Button key={c.id} type="button" size="sm" variant={on ? "default" : "outline"} aria-pressed={on} onClick={() => set("unidades", on ? d.unidades.filter((x) => x !== c.id) : [...d.unidades, c.id])}>{c.nome}</Button>
              })}
            </div>
          </div>
        )}
      </Secao>

      <Secao titulo="O que a Casa já oferece e eu quero ajudar" descricao={`Marque onde você gostaria de contribuir. ${combinando} ${combinando === 1 ? "opção combina" : "opções combinam"} com os seus horários.`}>
        <div className="grid gap-6 md:grid-cols-2">
          {GRUPOS.map(({ tipo, titulo }) => {
            const lista = vigentes.filter((i) => i.tipo === tipo)
            if (!lista.length) return null
            return (
              <fieldset key={tipo}>
                <legend className="mb-2 font-semibold">{titulo}</legend>
                <ul className="space-y-1">
                  {lista.map((i) => {
                    const c = combinaComHorarios(i, d.horarios)
                    return (
                      <li key={i.id}>
                        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-muted">
                          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={d.interesses.includes(i.id)} onChange={(e) => set("interesses", e.target.checked ? [...d.interesses, i.id] : d.interesses.filter((x) => x !== i.id))} />
                          <span className="min-w-0">
                            <span className="block font-medium">{i.nome}</span>
                            <span className="block text-sm text-muted-foreground">{i.quando || ITEM_TIPO_LABELS[i.tipo]}</span>
                            {c === true && <Badge variant="secondary" className="mt-1">Combina com seus horários</Badge>}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>
            )
          })}
        </div>
      </Secao>

      <Secao titulo="Coisas que posso fazer" descricao="Escolha as sugestões que combinam com você, ou escreva outra ideia.">
        <Escolhas rotulo="Sugestões de tarefas" opcoes={SUGESTOES_TAREFAS} valor={d.tarefas} onChange={(v) => set("tarefas", v)} />
        <div>
          <p className="mb-2 text-sm font-medium">Áreas de interesse</p>
          <Escolhas rotulo="Áreas de interesse" opcoes={AREAS_AJUDA} valor={d.areas} onChange={(v) => set("areas", v)} />
        </div>
        <Campo label="Outra ideia de como ajudar" dica="Ex.: posso dar uma palestra sobre primeiros socorros.">{(p) => <Textarea {...p} rows={2} value={d.outras_ideias} onChange={(e) => set("outras_ideias", e.target.value)} />}</Campo>
      </Secao>

      <Secao titulo="Dados profissionais">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Profissão">{(p) => <Input {...p} autoComplete="organization-title" value={d.profissao} onChange={(e) => set("profissao", e.target.value)} />}</Campo>
          <Campo label="Onde trabalha">{(p) => <Input {...p} autoComplete="organization" value={d.local_trabalho} onChange={(e) => set("local_trabalho", e.target.value)} />}</Campo>
          <Campo label="Escolaridade">{(p) => <CampoSelect {...p} valor={d.escolaridade} opcoes={ESCOLARIDADE} onChange={(x) => set("escolaridade", x)} />}</Campo>
          <Campo label="Formação ou curso">{(p) => <Input {...p} value={d.formacao} onChange={(e) => set("formacao", e.target.value)} />}</Campo>
          <Campo label="Registro profissional" dica="Se tiver. Ex.: CRP, OAB, CRM.">{(p) => <Input {...p} value={d.registro_profissional} onChange={(e) => set("registro_profissional", e.target.value)} />}</Campo>
          <Campo label="Idiomas ou Libras">{(p) => <Input {...p} value={d.idiomas} onChange={(e) => set("idiomas", e.target.value)} />}</Campo>
        </div>
        <Campo label="Habilidades" dica="Ex.: toca violão, sabe editar vídeos, tem carteira de motorista.">{(p) => <Input {...p} value={d.habilidades} onChange={(e) => set("habilidades", e.target.value)} />}</Campo>
        <Campo label="Experiência" dica="Conte o que você já fez e gosta de fazer.">{(p) => <Textarea {...p} rows={3} value={d.experiencia} onChange={(e) => set("experiencia", e.target.value)} />}</Campo>
      </Secao>

      <Secao titulo="Dados pessoais" descricao="Só a coordenação vê estas informações.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Telefone">{(p) => <Input {...p} type="tel" autoComplete="tel" value={d.telefone} onChange={(e) => set("telefone", mascararTelefone(e.target.value))} />}</Campo>
          <Campo label="Data de nascimento">{(p) => <Input {...p} type="date" autoComplete="bday" value={d.nascimento} onChange={(e) => set("nascimento", e.target.value)} />}</Campo>
          <Campo label="Bairro">{(p) => <Input {...p} value={d.bairro} onChange={(e) => set("bairro", e.target.value)} />}</Campo>
          <Campo label="Cidade">{(p) => <Input {...p} autoComplete="address-level2" value={d.cidade} onChange={(e) => set("cidade", e.target.value)} />}</Campo>
        </div>
        <Campo label="Contato de emergência" dica="Nome e telefone.">{(p) => <Input {...p} value={d.contato_emergencia} onChange={(e) => set("contato_emergencia", e.target.value)} />}</Campo>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={d.whatsapp} onChange={(e) => set("whatsapp", e.target.checked)} /> Este telefone tem WhatsApp</label>
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={d.autoriza_imagem} onChange={(e) => set("autoriza_imagem", e.target.checked)} /> Autorizo o uso da minha imagem em fotos e vídeos da Casa</label>
        </div>
        <Campo label="Observações" dica="Ex.: posso substituir aos sábados, com aviso.">{(p) => <Textarea {...p} rows={2} value={d.observacoes} onChange={(e) => set("observacoes", e.target.value)} />}</Campo>
      </Secao>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button type="submit" size="lg" className="shadow-lg">Salvar ficha</Button>
      </div>
    </form>
  )
}

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader titulo="Minha ficha" descricao="Quando você pode ajudar, de que forma e onde gostaria de contribuir. Quanto mais completa, melhor a coordenação consegue organizar." />
      <SoDemo><Formulario /></SoDemo>
    </div>
  )
}
