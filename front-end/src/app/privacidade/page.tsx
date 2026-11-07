import type { Metadata } from "next"
import PaginaSimples from "@/components/comum/pagina-simples"

export const metadata: Metadata = { title: "Política de privacidade" }

const BLOCOS = [
  ["Quais dados guardamos", "Nome, e-mail, telefone, inscrições, presenças e as informações da sua ficha, quando você preencher."],
  ["Para que usamos", "Para organizar as atividades, registrar presenças, fazer contato e prestar contas de forma resumida a parceiros."],
  ["Quem pode ver", "Você, a equipe de administração e o voluntário responsável pelo item em que você está inscrito. Não vendemos seus dados."],
  ["Crianças e adolescentes", "Os dados de menores de idade são informados e acompanhados pelo responsável legal."],
  ["Seus direitos", "Em Minha conta › Meus dados você pode baixar tudo o que guardamos ou pedir a exclusão da sua conta, como prevê a LGPD."],
  ["Contato", "Dúvidas sobre seus dados: use o botão Falar com o Suporte Técnico, na página Ajuda."],
]

export default function PrivacidadePage() {
  return (
    <PaginaSimples titulo="Política de privacidade" descricao="Texto-modelo: precisa de revisão jurídica antes do uso oficial." largura="max-w-3xl">
      <div className="space-y-5">
        {BLOCOS.map(([t, x]) => <section key={t}><h2 className="text-lg font-semibold">{t}</h2><p className="text-muted-foreground">{x}</p></section>)}
      </div>
    </PaginaSimples>
  )
}
