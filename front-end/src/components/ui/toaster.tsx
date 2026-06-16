"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { subscribe, type Toast } from "@/lib/notify"

const DURACAO = 4000

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = subscribe((toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, DURACAO)
    })
    return unsubscribe
  }, [])

  function fechar(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          onClick={() => fechar(t.id)}
          className={`flex items-start gap-3 rounded-lg border p-4 shadow-md cursor-pointer transition-all ${
            t.tipo === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-green-50 border-green-200 text-green-800"
          }`}
        >
          <span className="text-sm flex-1">{t.mensagem}</span>
          <X className="w-4 h-4 shrink-0 opacity-60" />
        </div>
      ))}
    </div>
  )
}
