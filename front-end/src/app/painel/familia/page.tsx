"use client"

import { useEffect, useState } from "react"
import { Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { notify } from "@/lib/notify"
import { atividadesApi, oficinasApi } from "@/lib/services/entidades"
import { listarDependentes, removerDependente, salvarDependente, type Dependente } from "@/lib/services/extras"

const PARENTESCO = ["Filho", "Filha", "Neto", "Neta", "Sobrinho", "Sobrinha", "Outro"].map((x) => ({ valor: x, label: x }))

function idade(nasc: string) {
  if (!nasc) return null
  const n = new Date(nasc)
  const h = new Date()
  let a = h.getFullYear() - n.getFullYear()
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) a--
  return a
}

function Familia() {
  const { user } = useAuth()
  const [lista, setLista] = useState<Dependente[]>([])
  const [opcoes, setOpcoes] = useState<{ valor: string; label: string }[]>([])
  const [v, setV] = useState({ nome: "", nascimento: "", parentesco: "", atividade: "" })
  const [erro, setErro] = useState("")

  useEffect(() => {
    if (user) listarDependentes(user.id).then(setLista)
    Promise.all([atividadesApi.listar(), oficinasApi.listar()]).then((l) => setOpcoes(l.flat().map((i) => ({ valor: i.nome, label: i.nome }))))
  }, [user])

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    if (!v.nome.trim() || !v.parentesco) return setErro("Preencha o nome e o parentesco")
    setErro("")
    await salvarDependente({ ...v, responsavel_id: user!.id })
    setLista(await listarDependentes(user!.id))
    setV({ nome: "", nascimento: "", parentesco: "", atividade: "" })
    notify.success("Familiar adicionado")
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Minha família</h2>
        {lista.length === 0 ? <p className="text-muted-foreground">Ninguém cadastrado ainda.</p> : (
          <ul className="space-y-3">
            {lista.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm">
                <div className="min-w-0">
                  <p className="font-semibold">{d.nome}</p>
                  <p className="text-muted-foreground">{d.parentesco}{idade(d.nascimento) !== null ? `, ${idade(d.nascimento)} anos` : ""}</p>
                  {d.atividade && <p className="text-sm text-muted-foreground">Participa de {d.atividade}</p>}
                </div>
                <Button size="icon-sm" variant="ghost" className="text-red-700 dark:text-red-300" aria-label={`Remover ${d.nome}`} onClick={async () => { await removerDependente(d.id); setLista(await listarDependentes(user!.id)) }}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={adicionar} noValidate>
        <Secao titulo="Adicionar familiar">
          <Campo label="Nome" obrigatorio erro={erro}>{(p) => <Input {...p} value={v.nome} onChange={(e) => setV({ ...v, nome: e.target.value })} />}</Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Parentesco" obrigatorio>{(p) => <CampoSelect {...p} valor={v.parentesco} opcoes={PARENTESCO} onChange={(x) => setV({ ...v, parentesco: x })} />}</Campo>
            <Campo label="Data de nascimento">{(p) => <Input {...p} type="date" value={v.nascimento} onChange={(e) => setV({ ...v, nascimento: e.target.value })} />}</Campo>
          </div>
          <Campo label="Atividade">{(p) => <CampoSelect {...p} valor={v.atividade} opcoes={opcoes} onChange={(x) => setV({ ...v, atividade: x })} />}</Campo>
          <Button type="submit"><UserPlus className="h-4 w-4" aria-hidden /> Adicionar</Button>
        </Secao>
      </form>
    </div>
  )
}

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Família" descricao="Cuide das inscrições das crianças e de quem depende de você." />
      <SoDemo perfil="assistido" rota="/painel/familia"><Familia /></SoDemo>
    </div>
  )
}
