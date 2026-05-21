import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

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
                    <Card className="
            w-full
            max-w-md
            p-8
            rounded-3xl
            shadow-soft
            border-soft
          ">
                        <div className="space-y-6">
                            <div className="space-y-2 text-center">
                                <h2 className="text-3xl font-bold">
                                    Bem-vindo
                                </h2>
                                <p className="text-muted-foreground">
                                    Acesse sua conta ou crie um cadastro.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <Link href="/auth?mode=login">
                                    <Button
                                        className="w-full h-12 text-base cursor-pointer mb-5"
                                        size="lg"
                                    >
                                        Entrar
                                    </Button>
                                </Link>
                                <Link href="/auth?mode=register">
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 text-base cursor-pointer"
                                        size="lg"
                                    >
                                        Criar Conta
                                    </Button>
                                </Link>
                            </div>
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