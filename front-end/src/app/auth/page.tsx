import { Suspense } from "react"
import AuthContainer from "@/components/auth/auth-container"

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div>Carregando...</div>}>
        <AuthContainer />
      </Suspense>
    </main>
  )
}