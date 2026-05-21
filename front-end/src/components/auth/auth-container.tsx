"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import LoginForm from "./login-form"
import RegisterForm from "./register-form"
import Link from "next/link"

type Mode = "login" | "register"

export default function AuthContainer() {
    const searchParams = useSearchParams()

    const [mode, setMode] = useState<Mode>("login")

    useEffect(() => {
        const urlMode = searchParams.get("mode")

        if (urlMode === "register") {
            setMode("register")
        } else {
            setMode("login")
        }
    }, [searchParams])

    return (
        <section className="min-h-screen flex items-center justify-center p-4">
            <div className="container-default grid lg:grid-cols-2 gap-10 items-center">
                <div className="hidden lg:flex flex-col gap-6">
                    <Link href="/">
                        <img
                            src="/logo-evailton.png"
                            alt="Casa de Cultura Evailton Vilela"
                            className="w-40 md:w-56 rounded-full"
                        />
                    </Link>
                    <h1 className="text-6xl font-bold leading-tight">
                        <span className="text-blue-800">
                            Casa de Cultura
                        </span>
                        <br />
                        Evailton Vilela
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-xl">
                        Plataforma de acesso aos projetos sociais,
                        oportunidades e atendimentos da instituição.
                    </p>
                </div>
                <Card className="
                    w-full
                    max-w-md
                    mx-auto
                    p-8
                    rounded-3xl
                    shadow-soft
                    border-soft
                ">
                    <div className="grid grid-cols-2 gap-2 mb-8">

                        <Button
                            variant={mode === "login" ? "default" : "outline"}
                            onClick={() => setMode("login")}
                        >
                            Entrar
                        </Button>

                        <Button
                            variant={mode === "register" ? "default" : "outline"}
                            onClick={() => setMode("register")}
                        >
                            Cadastrar
                        </Button>
                    </div>
                    {mode === "login"
                        ? <LoginForm />
                        : <RegisterForm />
                    }

                </Card>

            </div>
        </section>
    )
}