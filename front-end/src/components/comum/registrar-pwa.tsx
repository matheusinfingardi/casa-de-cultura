"use client"

import { useEffect } from "react"

/** Registra o service worker (app instalável e telas básicas sem internet). */
export default function RegistrarPwa() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch((e) => console.error("Service worker:", e))
  }, [])
  return null
}
