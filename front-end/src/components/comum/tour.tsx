"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Perfil } from "@/lib/perfis"

const PASSOS: Record<Perfil, { titulo: string; texto: string }[]> = {
  admin: [
    { titulo: "Bem-vindo à administração", texto: "A Visão geral mostra o que acontece hoje e o que precisa da sua atenção." },
    { titulo: "Cadastre a programação", texto: "Em Programação e Atendimento você cria eventos, atividades, oficinas, centros e assistências. Cada item tem sua própria página." },
    { titulo: "Acompanhe e preste contas", texto: "Agenda mostra o mês inteiro. Relatórios gera arquivos para enviar a parceiros." },
  ],
  voluntario: [
    { titulo: "Bem-vindo, voluntário", texto: "Aqui ficam os compromissos que a administração atribuiu a você." },
    { titulo: "Registre a presença", texto: "Abra um compromisso e marque quem veio. Funciona até sem internet: enviamos quando a conexão voltar." },
    { titulo: "Check-in por QR Code", texto: "Em Check-in, leia o código do assistido com a câmera e a presença é marcada na hora." },
  ],
  assistido: [
    { titulo: "Que bom ter você aqui", texto: "Em Explorar você encontra atividades, oficinas, eventos e atendimentos." },
    { titulo: "Inscreva-se", texto: "Abra o item e toque em Quero participar. Se a turma estiver cheia, você entra na lista de espera." },
    { titulo: "Acompanhe tudo", texto: "Veja sua agenda, sua presença, seu QR Code e seus certificados." },
  ],
}

/** Apresentação curta no primeiro acesso de cada perfil. */
export default function Tour({ perfil }: { perfil: Perfil }) {
  const chave = `cc-tour-${perfil}`
  const [aberto, setAberto] = useState(false)
  const [passo, setPasso] = useState(0)

  useEffect(() => {
    try {
      if (!localStorage.getItem(chave) && !navigator.webdriver) queueMicrotask(() => setAberto(true))
    } catch { /* sem armazenamento: não mostra */ }
  }, [chave])

  function fechar() {
    try { localStorage.setItem(chave, "1") } catch { /* ok */ }
    setAberto(false)
  }

  const p = PASSOS[perfil][passo]
  const ultimo = passo === PASSOS[perfil].length - 1
  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && fechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">{p.titulo}</DialogTitle>
          <DialogDescription className="text-base">{p.texto}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Passo {passo + 1} de {PASSOS[perfil].length}</p>
          <div className="flex gap-2">
            {!ultimo && <Button variant="ghost" onClick={fechar}>Pular</Button>}
            <Button onClick={() => (ultimo ? fechar() : setPasso(passo + 1))}>{ultimo ? "Começar" : "Próximo"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
