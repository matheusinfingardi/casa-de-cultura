import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import BannerDemo from "@/components/comum/banner-demo"
import RegistrarPwa from "@/components/comum/registrar-pwa"
import { SCRIPT_PREFERENCIAS } from "@/lib/preferencias"

const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: { default: "Casa de Cultura Evailton Vilela", template: "%s · Casa de Cultura" },
  description: "Transformando vidas através da cultura e educação",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icone-192.png", apple: "/icone-192.png" },
}

export const viewport: Viewport = { themeColor: "#0b3aa8" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_PREFERENCIAS }} />
      </head>
      <body className={poppins.className}>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-lg focus:bg-background focus:p-3">
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <BannerDemo />
          {children}
        </AuthProvider>
        <Toaster />
        <RegistrarPwa />
      </body>
    </html>
  )
}
