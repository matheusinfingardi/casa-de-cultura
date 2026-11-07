"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, HandHeart, HeartHandshake, type LucideIcon } from "lucide-react"
import { PERFIL_INFO, type Perfil } from "@/lib/perfis"

const PORTAS: { perfil: Perfil; icon: LucideIcon; rota: string }[] = [
  { perfil: "assistido", icon: HeartHandshake, rota: "/painel" },
  { perfil: "voluntario", icon: HandHeart, rota: "/painel" },
]

export default function Hero() {
  return (
    <section className="flex min-h-screen items-center">
      <div className="container-default grid items-center gap-10 py-10 lg:grid-cols-[1fr_30rem] lg:gap-16">
        <div className="space-y-6">
          <Image src="/logo-evailton.png" alt="Casa de Cultura Evailton Vilela" width={160} height={160} priority className="h-28 w-28 rounded-full bg-white md:h-40 md:w-40" />
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            <span className="text-blue-800 dark:text-blue-300">Casa de Cultura</span>
            <br />
            Evailton Vilela
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Transformando vidas através da cultura, educação, inclusão social e tecnologia.
          </p>
          <p className="text-muted-foreground">Juiz de Fora · Minas Gerais</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-5 rounded-3xl border bg-card p-6 shadow-soft md:p-8">
            <h2 className="text-center text-2xl font-bold">Como você quer entrar?</h2>
            <div className="space-y-3">
              {PORTAS.map(({ perfil, icon: Icon }) => (
                <Link key={perfil} href={`/auth?perfil=${perfil}`} className="group flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-primary hover:bg-muted">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{PERFIL_INFO[perfil].entrada}</span>
                    <span className="block text-sm leading-snug text-muted-foreground">{PERFIL_INFO[perfil].descricao}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              ))}
            </div>
            <div className="border-t pt-5">
              <h3 className="mb-3 text-center font-semibold">Ainda não tem conta?</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/auth?perfil=assistido&mode=register" className="rounded-2xl bg-muted/60 p-3 text-center transition-colors hover:bg-muted">
                  <span className="block font-semibold text-primary">Quero participar</span>
                  <span className="block text-sm text-muted-foreground">Crie seu cadastro de assistido</span>
                </Link>
                <Link href="/quero-ser-voluntario" className="rounded-2xl bg-muted/60 p-3 text-center transition-colors hover:bg-muted">
                  <span className="block font-semibold text-primary">Quero ajudar</span>
                  <span className="block text-sm text-muted-foreground">Peça para ser voluntário</span>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/termos" className="hover:underline">Termos de uso</Link> · <Link href="/privacidade" className="hover:underline">Privacidade</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
