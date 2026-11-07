import type { Metadata } from "next"
import PaginaSimples from "@/components/comum/pagina-simples"

export const metadata: Metadata = { title: "Termos de uso" }

const BLOCOS = [
  ["O que é este sistema", "Um serviço gratuito da Casa de Cultura Evailton Vilela para organizar atividades, oficinas, eventos e atendimentos."],
  ["Sua conta", "Use dados verdadeiros e não compartilhe sua senha. Você é responsável pelo que for feito com a sua conta."],
  ["Inscrições", "A inscrição não garante vaga quando a turma é limitada. Se estiver cheia, você pode entrar na lista de espera."],
  ["Uso correto", "Não é permitido tentar acessar dados de outras pessoas nem atrapalhar o funcionamento do sistema."],
  ["Mudanças", "Estes termos podem mudar. Avisaremos pelo próprio sistema quando houver alteração importante."],
]

export default function TermosPage() {
  return (
    <PaginaSimples titulo="Termos de uso" descricao="Texto-modelo: precisa de revisão jurídica antes do uso oficial." largura="max-w-3xl">
      <div className="space-y-5">
        {BLOCOS.map(([t, x]) => <section key={t}><h2 className="text-lg font-semibold">{t}</h2><p className="text-muted-foreground">{x}</p></section>)}
      </div>
    </PaginaSimples>
  )
}
