"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, FlaskConical, HandHeart, HeartHandshake, ShieldCheck, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { iniciarSessaoDemo } from "@/lib/demo/cliente"
import { PERFIL_INFO, type Perfil } from "@/lib/perfis"

const PORTAS: { perfil: Perfil; icon: LucideIcon; rota: string }[] = [
  { perfil: "assistido", icon: HeartHandshake, rota: "/painel" },
  { perfil: "voluntario", icon: HandHeart, rota: "/painel" },
  { perfil: "admin", icon: ShieldCheck, rota: "/portal" },
]

function abrirDemo(perfil: Perfil, rota: string) {
  iniciarSessaoDemo(perfil)
  window.location.assign(rota)
}

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
            <p className="text-center text-sm text-muted-foreground">
              Primeira vez aqui?{" "}
              <Link href="/auth?perfil=assistido&mode=register" className="font-medium text-primary hover:underline">Crie seu cadastro</Link>
              {" · "}
              <Link href="/quero-ser-voluntario" className="font-medium text-primary hover:underline">Quero ser voluntário</Link>
            </p>
          </div>

          <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-50">
            <p className="flex items-center gap-2 font-semibold"><FlaskConical className="h-5 w-5" aria-hidden /> Quer só conhecer o sistema?</p>
            <p className="mb-3 mt-1 text-sm">Veja cada portal com dados de exemplo, sem precisar de senha.</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {PORTAS.map(({ perfil, rota }) => (
                <Button key={perfil} variant="outline" className="border-amber-400 bg-white text-amber-950 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-50" onClick={() => abrirDemo(perfil, rota)}>
                  {PERFIL_INFO[perfil].titulo}
                </Button>
              ))}
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
