import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Casa de Cultura Evailton Vilela",
    short_name: "Casa de Cultura",
    description: "Atividades, oficinas, eventos e atendimentos da Casa de Cultura.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f8ff",
    theme_color: "#0b3aa8",
    lang: "pt-BR",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
