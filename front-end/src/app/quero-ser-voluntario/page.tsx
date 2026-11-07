"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Campo } from "@/components/comum/campo"
import PaginaSimples from "@/components/comum/pagina-simples"
import SoDemo from "@/components/comum/so-demo"
import { criarPedido } from "@/lib/services/extras"
import { mascararTelefone } from "@/lib/formatar"

export default function QueroSerVoluntarioPage() {
  const [v, setV] = useState({ nome: "", email: "", telefone: "", area: "", disponibilidade: "" })
  const [enviado, setEnviado] = useState(false)
  const set = (k: keyof typeof v, x: string) => setV((a) => ({ ...a, [k]: x }))

  return (
    <PaginaSimples titulo="Quero ser voluntário" descricao="Conte um pouco sobre você. A coordenação analisa e responde por e-mail." largura="max-w-lg">
      <SoDemo perfil="assistido" rota="/quero-ser-voluntario">
        {enviado ? (
          <p role="status" className="rounded-xl bg-green-50 p-4 text-green-900 dark:bg-green-950 dark:text-green-100">Pedido enviado! Obrigado por querer ajudar.</p>
        ) : (
          <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); await criarPedido(v); setEnviado(true) }}>
            <Campo label="Nome completo">{(p) => <Input {...p} required autoComplete="name" value={v.nome} onChange={(e) => set("nome", e.target.value)} />}</Campo>
            <Campo label="E-mail">{(p) => <Input {...p} required type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} />}</Campo>
            <Campo label="Telefone">{(p) => <Input {...p} type="tel" autoComplete="tel" value={v.telefone} onChange={(e) => set("telefone", mascararTelefone(e.target.value))} />}</Campo>
            <Campo label="Como gostaria de ajudar?" dica="Ex.: música, reforço escolar, eventos.">{(p) => <Input {...p} required value={v.area} onChange={(e) => set("area", e.target.value)} />}</Campo>
            <Campo label="Quando você pode?" dica="Ex.: terças à tarde.">{(p) => <Input {...p} required value={v.disponibilidade} onChange={(e) => set("disponibilidade", e.target.value)} />}</Campo>
            <Button type="submit" className="w-full">Enviar pedido</Button>
          </form>
        )}
      </SoDemo>
    </PaginaSimples>
  )
}
