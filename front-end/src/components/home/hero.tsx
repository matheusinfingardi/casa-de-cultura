import Image from "next/image"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, HandHeart, HeartHandshake, ShieldCheck, type LucideIcon } from "lucide-react"
import { PERFIL_INFO, type Perfil } from "@/lib/perfis"

const PORTAS: { perfil: Perfil; icon: LucideIcon }[] = [
    { perfil: "assistido", icon: HeartHandshake },
    { perfil: "voluntario", icon: HandHeart },
    { perfil: "admin", icon: ShieldCheck },
]

export default function Hero() {
    return (
        <section className="min-h-screen flex items-center">
            <div className="container-default grid lg:grid-cols-2 gap-10 items-center py-10">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Image
                            src="/logo-evailton.png"
                            alt="Casa de Cultura Evailton Vilela"
                            width={220}
                            height={220}
                            className="w-40 md:w-56 rounded-full"
                        />
                        <div className="space-y-3">
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                <span className="text-blue-800">
                                    Casa de Cultura
                                </span>
                                <br />
                                Evailton Vilela
                            </h1>
                            <p className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed">
                                Transformando vidas através da cultura,
                                educação, inclusão social e tecnologia.
                            </p>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Card className="p-5 shadow-soft border-soft">
                            <h3 className="font-semibold text-primary">
                                Projetos Sociais
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Cursos, oficinas, atendimentos e oportunidades
                                para a comunidade.
                            </p>
                        </Card>
                        <Card className="p-5 shadow-soft border-soft">
                            <h3 className="font-semibold text-primary">
                                Inclusão e Apoio
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Atendimento acolhedor para crianças,
                                famílias e pessoas em vulnerabilidade.
                            </p>
                        </Card>
                    </div>
                </div>
                <div className="flex justify-center lg:justify-end">
                    <Card className="w-full max-w-md p-6 md:p-8 rounded-3xl shadow-soft border-soft">
                        <div className="space-y-6">
                            <div className="space-y-2 text-center">
                                <h2 className="text-3xl font-bold">Bem-vindo</h2>
                                <p className="text-muted-foreground">
                                    Como você quer entrar?
                                </p>
                            </div>
                            <div className="space-y-3">
                                {PORTAS.map(({ perfil, icon: Icon }) => (
                                    <Link
                                        key={perfil}
                                        href={`/auth?perfil=${perfil}`}
                                        className="group flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
                                    >
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Icon className="h-6 w-6" aria-hidden />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-semibold">
                                                {PERFIL_INFO[perfil].entrada}
                                            </span>
                                            <span className="block text-sm text-muted-foreground leading-snug">
                                                {PERFIL_INFO[perfil].descricao}
                                            </span>
                                        </span>
                                        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
                                    </Link>
                                ))}
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                                Primeira vez por aqui?{" "}
                                <Link
                                    href="/auth?perfil=assistido&mode=register"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Crie seu cadastro de assistido
                                </Link>
                            </p>
                            <div className="pt-4 border-t text-center">
                                <p className="text-sm text-muted-foreground">
                                    Juiz de Fora • Minas Gerais
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    )
}