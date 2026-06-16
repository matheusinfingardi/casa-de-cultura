import { redirect } from "next/navigation"

export default function PortalLoginRedirect() {
  redirect("/auth?mode=login")
}
