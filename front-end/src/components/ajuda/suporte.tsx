"use client"

import { useState } from "react"
import { Copy, LifeBuoy, Mail, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Campo } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import { useAuth } from "@/components/auth/auth-provider"
import { notify } from "@/lib/notify"
import { APP_VERSAO, SUPORTE_EMAIL, SUPORTE_WHATSAPP } from "@/lib/config"
import { PERFIL_INFO, ROLE_PERFIL } from "@/lib/perfis"

const CATEGORIAS = [
  "Não consigo entrar",
  "Erro ou tela travada",
  "Dúvida de como usar",
  "Dados incorretos",
  "Sugestão de melhoria",
  "Outro assunto",
].map((c) => ({ valor: c, label: c }))

/** Botão + janela para abrir um chamado com o T.I. O relatório técnico vai preenchido sozinho. */
export default function Suporte({ destaque }: { destaque?: boolean }) {
  const { user, role } = useAuth()
  const [aberto, setAberto] = useState(false)
  const [categoria, setCategoria] = useState("")
  const [descricao, setDescricao] = useState("")
  const [erros, setErros] = useState<{ categoria?: string; descricao?: string }>({})

  function relatorio() {
    const nome = (user?.user_metadata?.nome as string | undefined) ?? "—"
    return [
      `Assunto: ${categoria}`,
      "",
      descricao.trim(),
      "",
      "— Informações técnicas (geradas automaticamente) —",
      `Usuário: ${nome} <${user?.email ?? "—"}>`,
      `Perfil: ${role ? PERFIL_INFO[ROLE_PERFIL[role]].titulo : "—"}`,
      `Página: ${typeof window !== "undefined" ? window.location.pathname : "—"}`,
      `Data e hora: ${new Date().toLocaleString("pt-BR")}`,
      `Versão do sistema: ${APP_VERSAO}`,
      `Navegador: ${typeof navigator !== "undefined" ? navigator.userAgent : "—"}`,
      `Tela: ${typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "—"}`,
    ].join("\n")
  }

  function validar(): boolean {
    const e = {
      categoria: categoria ? undefined : "Escolha o assunto",
      descricao: descricao.trim().length >= 10 ? undefined : "Conte com um pouco mais de detalhe (mínimo 10 letras)",
    }
    setErros(e)
    return !e.categoria && !e.descricao
  }

  function enviarEmail() {
    if (!validar()) return
    const url = `mailto:${SUPORTE_EMAIL}?subject=${encodeURIComponent(`[Suporte Casa de Cultura] ${categoria}`)}&body=${encodeURIComponent(relatorio())}`
    window.location.href = url
    notify.success("Abrimos o seu aplicativo de e-mail com a mensagem pronta. Basta enviar.")
  }

  async function copiar() {
    if (!validar()) return
    try {
      await navigator.clipboard.writeText(relatorio())
      notify.success("Relatório copiado. Cole onde preferir.")
    } catch {
      notify.error("Não foi possível copiar automaticamente")
    }
  }

  function whatsapp() {
    if (!validar()) return
    window.open(`https://wa.me/${SUPORTE_WHATSAPP}?text=${encodeURIComponent(relatorio())}`, "_blank", "noopener")
  }

  return (
    <>
      <Button size={destaque ? "lg" : "default"} onClick={() => setAberto(true)}>
        <LifeBuoy className="h-4 w-4" aria-hidden /> Falar com o Suporte Técnico
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Suporte Técnico (T.I.)</DialogTitle>
            <DialogDescription>
              Conte o que aconteceu. Anexamos sozinhos os dados técnicos que ajudam a equipe a resolver mais rápido.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Campo label="Assunto" obrigatorio erro={erros.categoria}>
              {(p) => <CampoSelect {...p} valor={categoria} opcoes={CATEGORIAS} onChange={setCategoria} />}
            </Campo>
            <Campo label="O que está acontecendo?" obrigatorio erro={erros.descricao} dica="Diga o que você tentou fazer e o que apareceu na tela.">
              {(p) => <Textarea {...p} rows={5} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Ao tentar salvar uma oficina, apareceu a mensagem de erro…" />}
            </Campo>
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              Será enviado para <span className="font-medium text-foreground">{SUPORTE_EMAIL}</span>
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={enviarEmail}><Mail className="h-4 w-4" aria-hidden /> Enviar por e-mail</Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              {SUPORTE_WHATSAPP && <Button variant="outline" className="flex-1" onClick={whatsapp}><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</Button>}
              <Button variant="outline" className="flex-1" onClick={copiar}><Copy className="h-4 w-4" aria-hidden /> Copiar relatório</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
