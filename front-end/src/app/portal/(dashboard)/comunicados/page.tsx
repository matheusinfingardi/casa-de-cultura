"use client"

import { useEffect, useState } from "react"
import { Mail, MessageCircle, Send, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import EstadoVazio from "@/components/comum/estado-vazio"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"
import { useAuth } from "@/components/auth/auth-provider"
import { notify } from "@/lib/notify"
import { enviarMensagem, listarMensagens, type Mensagem } from "@/lib/services/extras"
import { listarResumoPresencas } from "@/lib/services/presencas"
import { listarUsuarios, type Usuario } from "@/lib/services/usuarios"
import { atividadesApi, eventosApi, oficinasApi } from "@/lib/services/entidades"

const CANAIS = [
  { valor: "app", label: "Aviso dentro do sistema", icon: Smartphone },
  { valor: "email", label: "E-mail", icon: Mail },
  { valor: "whatsapp", label: "WhatsApp", icon: MessageCircle },
] as const

function Comunicados() {
  const { user } = useAuth()
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [itens, setItens] = useState<{ id: string; nome: string }[]>([])
  const [assunto, setAssunto] = useState("")
  const [texto, setTexto] = useState("")
  const [canal, setCanal] = useState<Mensagem["canal"]>("app")
  const [publico, setPublico] = useState("assistidos")
  const [erros, setErros] = useState<{ assunto?: string; texto?: string }>({})

  useEffect(() => {
    listarMensagens().then(setMensagens)
    listarUsuarios().then(setUsuarios)
    Promise.all([eventosApi.listar(), atividadesApi.listar(), oficinasApi.listar()]).then((l) => setItens(l.flat().map((i) => ({ id: i.id, nome: i.nome }))))
  }, [])

  async function destinatarios(): Promise<{ ids: string[]; nome: string }> {
    if (publico === "assistidos") return { ids: usuarios.filter((u) => u.role === "cliente").map((u) => u.id), nome: "Todos os assistidos" }
    if (publico === "voluntarios") return { ids: usuarios.filter((u) => u.role === "responsavel").map((u) => u.id), nome: "Todos os voluntários" }
    const presencas = await listarResumoPresencas()
    return { ids: presencas.filter((p) => p.item_id === publico).map((p) => p.cliente_id), nome: `Inscritos em ${itens.find((i) => i.id === publico)?.nome}` }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    const novos = { assunto: assunto.trim() ? undefined : "Escreva o assunto", texto: texto.trim() ? undefined : "Escreva a mensagem" }
    setErros(novos)
    if (novos.assunto || novos.texto) return
    const { ids, nome } = await destinatarios()
    await enviarMensagem({ assunto, texto, canal, publico: nome, enviados: ids.length, autor: (user?.user_metadata?.nome as string) ?? "" }, ids)
    setAssunto(""); setTexto("")
    setMensagens(await listarMensagens())
    notify.success(`Comunicado registrado para ${ids.length} pessoas`)
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <form onSubmit={enviar} noValidate className="space-y-6">
        <Secao titulo="Novo comunicado" descricao="E-mail e WhatsApp estão simulados: o envio real depende do back-end. O aviso dentro do sistema aparece no sino de cada pessoa.">
          <Campo label="Para quem">
            {(p) => (
              <CampoSelect {...p} valor={publico} onChange={setPublico} opcoes={[
                { valor: "assistidos", label: "Todos os assistidos" },
                { valor: "voluntarios", label: "Todos os voluntários" },
                ...itens.map((i) => ({ valor: i.id, label: `Inscritos em ${i.nome}` })),
              ]} />
            )}
          </Campo>
          <Campo label="Como enviar">
            {(p) => <CampoSelect {...p} valor={canal} onChange={(v) => setCanal(v as Mensagem["canal"])} opcoes={CANAIS.map((c) => ({ valor: c.valor, label: c.label }))} />}
          </Campo>
          <Campo label="Assunto" obrigatorio erro={erros.assunto}>{(p) => <Input {...p} value={assunto} onChange={(e) => setAssunto(e.target.value)} />}</Campo>
          <Campo label="Mensagem" obrigatorio erro={erros.texto}>{(p) => <Textarea {...p} rows={5} value={texto} onChange={(e) => setTexto(e.target.value)} />}</Campo>
          <Button type="submit" className="w-full sm:w-auto"><Send className="h-4 w-4" aria-hidden /> Enviar comunicado</Button>
        </Secao>
      </form>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Enviados</h2>
        {mensagens.length === 0 ? <EstadoVazio icon={Send} titulo="Nenhum comunicado ainda" /> : (
          <ul className="space-y-3">
            {mensagens.map((m) => {
              const C = CANAIS.find((c) => c.valor === m.canal)
              return (
                <li key={m.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                  <p className="font-semibold">{m.assunto}</p>
                  <p className="mt-1 text-muted-foreground">{m.texto}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{m.publico} · {m.enviados} pessoas · {C?.label} · {new Date(m.created_at).toLocaleDateString("pt-BR")}</p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Comunicados" descricao="Avise assistidos, voluntários ou os inscritos de um item." />
      <SoDemo perfil="admin" rota="/portal/comunicados"><Comunicados /></SoDemo>
    </div>
  )
}
