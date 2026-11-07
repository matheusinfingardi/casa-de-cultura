"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { DIAS_SEMANA } from "@/lib/formatar"
import { notify } from "@/lib/notify"
import { buscarDisponibilidade, salvarDisponibilidade, type Disponibilidade } from "@/lib/services/extras"

const PERIODOS = ["Manhã", "Tarde", "Noite", "Manhã e tarde", "Tarde e noite", "Qualquer horário"].map((p) => ({ valor: p, label: p }))

function Formulario() {
  const { user } = useAuth()
  const [d, setD] = useState<Disponibilidade | null>(null)
  useEffect(() => { if (user) buscarDisponibilidade(user.id).then(setD) }, [user])
  if (!d) return null
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await salvarDisponibilidade(d); notify.success("Disponibilidade salva") }}>
      <Secao titulo="Quando você pode ajudar?">
        <div>
          <p className="mb-2 text-sm font-medium">Dias da semana</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Dias da semana">
            {DIAS_SEMANA.map((x) => {
              const on = d.dias.includes(x)
              return <Button key={x} type="button" size="sm" variant={on ? "default" : "outline"} aria-pressed={on} onClick={() => setD({ ...d, dias: on ? d.dias.filter((y) => y !== x) : [...d.dias, x] })}>{x}</Button>
            })}
          </div>
        </div>
        <Campo label="Período">{(p) => <CampoSelect {...p} valor={d.periodo} opcoes={PERIODOS} onChange={(x) => setD({ ...d, periodo: x })} />}</Campo>
        <Campo label="Observações">{(p) => <Input {...p} value={d.observacoes} onChange={(e) => setD({ ...d, observacoes: e.target.value })} />}</Campo>
        <Button type="submit">Salvar</Button>
      </Secao>
    </form>
  )
}

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader titulo="Disponibilidade" descricao="A administração usa esta informação para organizar a programação." />
      <SoDemo perfil="voluntario" rota="/painel/disponibilidade"><Formulario /></SoDemo>
    </div>
  )
}
