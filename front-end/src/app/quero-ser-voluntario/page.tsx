"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Campo } from "@/components/comum/campo"
import PaginaSimples from "@/components/comum/pagina-simples"
import { SUPORTE_CONFIGURADO, SUPORTE_EMAIL } from "@/lib/config"
import { notify } from "@/lib/notify"
import { criarPedido } from "@/lib/services/extras"
import { mascararTelefone } from "@/lib/formatar"

type Situacao = "preenchendo" | "enviando" | "enviado" | "por-email"

export default function QueroSerVoluntarioPage() {
  const [v, setV] = useState({ nome: "", email: "", telefone: "", area: "", disponibilidade: "" })
  const [situacao, setSituacao] = useState<Situacao>("preenchendo")
  const set = (k: keyof typeof v, x: string) => setV((a) => ({ ...a, [k]: x }))

  const assunto = encodeURIComponent(`Quero ser voluntário: ${v.nome}`)
    const textoPedido = `Nome: ${v.nome}\nE-mail: ${v.email}\nTelefone: ${v.telefone}\nComo gostaria de ajudar: ${v.area}\nQuando posso: ${v.disponibilidade}`
  const linkEmail = `mailto:${SUPORTE_EMAIL}?subject=${assunto}&body=${encodeURIComponent(textoPedido)}`

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setSituacao("enviando")
    const guardado = await criarPedido(v)
    // Enquanto o banco real não guarda pedidos, a pessoa envia por e-mail, sem perder o que escreveu.
    setSituacao(guardado ? "enviado" : "por-email")
    if (!guardado && SUPORTE_CONFIGURADO) window.location.href = linkEmail
  }

  return (
    <PaginaSimples titulo="Quero ser voluntário" descricao="Conte um pouco sobre você. A coordenação analisa e responde por e-mail." largura="max-w-lg">
      {situacao === "enviado" ? (
        <p role="status" className="rounded-xl bg-green-50 p-4 text-green-900 dark:bg-green-950 dark:text-green-100">Pedido enviado! Obrigado por querer ajudar.</p>
      ) : situacao === "por-email" ? (
        <div role="status" className="space-y-3 rounded-xl border bg-card p-5">
          <p className="font-semibold">Falta só um passo</p>
          {SUPORTE_CONFIGURADO ? (
            <>
              <p>Abrimos um e-mail pronto com o seu pedido. Confira e clique em enviar para que ele chegue à coordenação.</p>
              <Button asChild className="w-full"><a href={linkEmail}>Abrir o e-mail de novo</a></Button>
            </>
          ) : (
            <>
              <p>Seu pedido ainda não foi enviado. Por enquanto, entregue estes dados à coordenação da Casa de Cultura:</p>
              <pre className="whitespace-pre-wrap rounded-xl bg-muted p-3 font-sans text-sm">{textoPedido}</pre>
              <Button className="w-full" onClick={async () => { await navigator.clipboard.writeText(textoPedido); notify.success("Dados copiados") }}>Copiar meus dados</Button>
            </>
          )}
          <Button variant="outline" className="w-full" onClick={() => setSituacao("preenchendo")}>Corrigir meus dados</Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={enviar}>
          <Campo label="Nome completo">{(p) => <Input {...p} required autoComplete="name" value={v.nome} onChange={(e) => set("nome", e.target.value)} />}</Campo>
          <Campo label="E-mail">{(p) => <Input {...p} required type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} />}</Campo>
          <Campo label="Telefone">{(p) => <Input {...p} type="tel" autoComplete="tel" value={v.telefone} onChange={(e) => set("telefone", mascararTelefone(e.target.value))} />}</Campo>
          <Campo label="Como gostaria de ajudar?" dica="Ex.: música, reforço escolar, eventos.">{(p) => <Input {...p} required value={v.area} onChange={(e) => set("area", e.target.value)} />}</Campo>
          <Campo label="Quando você pode?" dica="Ex.: terças à tarde.">{(p) => <Input {...p} required value={v.disponibilidade} onChange={(e) => set("disponibilidade", e.target.value)} />}</Campo>
          <Button type="submit" className="w-full" disabled={situacao === "enviando"}>{situacao === "enviando" ? "Enviando..." : "Enviar pedido"}</Button>
        </form>
      )}
    </PaginaSimples>
  )
}
