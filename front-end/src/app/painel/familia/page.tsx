"use client"

import { useAuth } from "@/components/auth/auth-provider"
import Dependentes from "@/components/comum/dependentes"
import PageHeader from "@/components/comum/page-header"
import SoDemo from "@/components/comum/so-demo"

function Conteudo() {
  const { user } = useAuth()
  return user ? <Dependentes responsavelId={user.id} admin={false} /> : null
}

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="Dependentes" descricao="Cadastre seus filhos e outros dependentes, inscreva cada um nas atividades e acompanhe a frequência." />
      <SoDemo perfil="assistido" rota="/painel/familia"><Conteudo /></SoDemo>
    </div>
  )
}
