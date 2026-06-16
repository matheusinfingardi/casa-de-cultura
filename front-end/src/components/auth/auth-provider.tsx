"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { buscarMeuPerfil, type Role } from "@/lib/services/usuarios"

type AuthContextValue = {
  user: User | null
  role: Role | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ativo = true

    async function resolver(sessionUser: User | null) {
      if (!sessionUser) {
        if (!ativo) return
        setUser(null)
        setRole(null)
        setLoading(false)
        return
      }

      const perfil = await buscarMeuPerfil()
      if (!ativo) return
      setUser(sessionUser)
      setRole(perfil?.role ?? null)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      resolver(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true)
      resolver(session?.user ?? null)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
