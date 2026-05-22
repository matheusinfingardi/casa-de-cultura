"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/dist/client/link"

type Mode = "login" | "register"

export default function AdminAuth() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")

  function handleLogin() {
    router.push("/portal")
  }

  function handleRegister() {
    router.push("/portal")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center">
          <Link href="/">
            <img
              src="/logo-evailton.png"
              alt="Casa de Cultura Evailton Vilela"
              className="w-40 md:w-56 rounded-full"
            />
          </Link>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            Portal Administrativo
          </h1>

          <p className="text-muted-foreground text-sm">
            Casa de Cultura Evailton Vilela
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="cursor-pointer"
            variant={mode === "login" ? "default" : "outline"}
            onClick={() => setMode("login")}
          >
            Entrar
          </Button>
          <Button
            className="cursor-pointer"
            variant={mode === "register" ? "default" : "outline"}
            onClick={() => setMode("register")}
          >
            Cadastrar
          </Button>
        </div>
        <div className="space-y-4">

          {mode === "register" && (
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Nome do administrador" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Email</Label>
            <Input placeholder="admin@exemplo.com" />
          </div>

          <div className="space-y-2">
            <Label>Senha</Label>
            <Input type="password" />
          </div>

          {mode === "login" ? (
            <Button className="w-full cursor-pointer" onClick={handleLogin}>
              Entrar
            </Button>
          ) : (
            <Button className="w-full cursor-pointer" onClick={handleRegister}>
              Criar conta
            </Button>
          )}

        </div>

      </Card>

    </div>
  )
}