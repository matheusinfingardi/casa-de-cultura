"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { Campo, Secao } from "@/components/comum/campo"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { DIAS_SEMANA, mascararTelefone } from "@/lib/formatar"
import { notify } from "@/lib/notify"
import { AREAS_AJUDA, PERIODOS_DIA, buscarDisponibilidade, salvarDisponibilidade, type Disponibilidade } from "@/lib/services/extras"

function Formulario() {
  const { user } = useAuth()
  const [d, setD] = useState<Disponibilidade | null>(null)
  useEffect(() => { if (user) buscarDisponibilidade(user.id).then(setD) }, [user])
  if (!d) return null

  function alternarGrade(dia: string, periodo: string) {
    if (!d) return
    const atual = d.grade[dia] ?? []
    const novo = atual.includes(periodo) ? atual.filter((p) => p !== periodo) : [...atual, periodo]
    const grade = { ...d.grade, [dia]: novo }
    if (!novo.length) delete grade[dia]
    setD({ ...d, grade })
  }

  return (
    <form className="space-y-6" onSubmit={async (e) => { e.preventDefault(); await salvarDisponibilidade(d); notify.success("Ficha salva") }}>
      <Secao titulo="Quando posso ajudar" descricao="Marque os dias e períodos livres. A coordenação usa isso para organizar a programação.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-96">
            <thead><tr className="text-left text-sm text-muted-foreground"><th scope="col" className="py-2 font-semibold">Dia</th>{PERIODOS_DIA.map((p) => <th key={p} scope="col" className="px-2 py-2 text-center font-semibold">{p}</th>)}</tr></thead>
            <tbody className="divide-y">
              {DIAS_SEMANA.map((dia) => (
                <tr key={dia}>
                  <th scope="row" className="py-2 text-left font-medium">{dia}</th>
                  {PERIODOS_DIA.map((p) => {
                    const on = d.grade[dia]?.includes(p)
                    return (
                      <td key={p} className="px-2 py-1.5 text-center">
                        <button type="button" aria-pressed={!!on} aria-label={`${dia}, ${p}`} onClick={() => alternarGrade(dia, p)} className={`inline-flex h-10 w-full max-w-24 items-center justify-center rounded-lg border ${on ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                          {on && <Check className="h-4 w-4" aria-hidden />}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>

      <Secao titulo="Como posso ajudar" descricao="Escolha tudo o que combina com você.">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Áreas de ajuda">
          {AREAS_AJUDA.map((a) => {
            const on = d.areas.includes(a)
            return <Button key={a} type="button" size="sm" variant={on ? "default" : "outline"} aria-pressed={on} onClick={() => setD({ ...d, areas: on ? d.areas.filter((x) => x !== a) : [...d.areas, a] })}>{a}</Button>
          })}
        </div>
        <Campo label="Formação ou profissão">{(p) => <Input {...p} value={d.formacao} onChange={(e) => setD({ ...d, formacao: e.target.value })} />}</Campo>
        <Campo label="Experiência" dica="Conte o que você já fez e gosta de fazer.">{(p) => <Textarea {...p} rows={3} value={d.experiencia} onChange={(e) => setD({ ...d, experiencia: e.target.value })} />}</Campo>
      </Secao>

      <Secao titulo="Contato">
        <Campo label="Telefone" className="sm:max-w-64">{(p) => <Input {...p} type="tel" autoComplete="tel" value={d.telefone} onChange={(e) => setD({ ...d, telefone: mascararTelefone(e.target.value) })} />}</Campo>
        <Campo label="Observações" dica="Ex.: posso substituir aos sábados, com aviso.">{(p) => <Textarea {...p} rows={2} value={d.observacoes} onChange={(e) => setD({ ...d, observacoes: e.target.value })} />}</Campo>
      </Secao>

      <Button type="submit" size="lg">Salvar ficha</Button>
    </form>
  )
}

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader titulo="Minha ficha" descricao="Sua disponibilidade e como você pode ajudar a Casa de Cultura." />
      <SoDemo perfil="voluntario" rota="/painel/ficha"><Formulario /></SoDemo>
    </div>
  )
}
