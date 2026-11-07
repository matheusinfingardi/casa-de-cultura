export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" aria-hidden />
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
