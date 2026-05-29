"use client"

import { useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { ImageIcon, X } from "lucide-react"

type Props = {
  onChange: (file: File) => void
}

export function ImageField({ onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    onChange(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) handleFile(file)
  }

  function clearImage() {
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <Label>Imagem</Label>

      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-3
            border-2 border-dashed rounded-xl p-8 cursor-pointer
            transition-colors text-center
            ${dragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/40"
            }
          `}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Clique ou arraste uma imagem</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WEBP</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border">
          <img src={preview} className="w-full h-52 object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}