// Código de 6 dígitos que muda a cada 30 segundos (RFC 6238), compatível com Google Authenticator.
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

export function gerarSegredo(tamanho = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(tamanho))
  let bits = ""
  bytes.forEach((b) => (bits += b.toString(2).padStart(8, "0")))
  return bits.match(/.{1,5}/g)!.map((c) => B32[parseInt(c.padEnd(5, "0"), 2)]).join("")
}

function decodificar(segredo: string): Uint8Array<ArrayBuffer> {
  let bits = ""
  for (const c of segredo.replace(/=+$/, "").toUpperCase()) bits += B32.indexOf(c).toString(2).padStart(5, "0")
  const bytes = bits.match(/.{8}/g) ?? []
  return new Uint8Array(bytes.map((b) => parseInt(b, 2)))
}

export async function codigoTotp(segredo: string, instante = Date.now(), digitos = 6): Promise<string> {
  const contador = Math.floor(instante / 1000 / 30)
  const buf = new DataView(new ArrayBuffer(8))
  buf.setUint32(0, Math.floor(contador / 2 ** 32))
  buf.setUint32(4, contador >>> 0)
  const chave = await crypto.subtle.importKey("raw", decodificar(segredo), { name: "HMAC", hash: "SHA-1" }, false, ["sign"])
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", chave, buf.buffer))
  const off = h[h.length - 1] & 0xf
  const num = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3]
  return String(num % 10 ** digitos).padStart(digitos, "0")
}

/** Aceita o código atual e os vizinhos (±30 s) por causa de relógios fora de sincronia. */
export async function validarTotp(segredo: string, codigo: string): Promise<boolean> {
  for (const d of [-30000, 0, 30000]) if ((await codigoTotp(segredo, Date.now() + d)) === codigo) return true
  return false
}

export const uriTotp = (segredo: string, conta: string) =>
  `otpauth://totp/${encodeURIComponent("Casa de Cultura:" + conta)}?secret=${segredo}&issuer=${encodeURIComponent("Casa de Cultura")}`
