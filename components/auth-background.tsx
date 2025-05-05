import type React from "react"

interface AuthBackgroundProps {
  children: React.ReactNode
}

export default function AuthBackground({ children }: AuthBackgroundProps) {
  return <div className="auth-background min-h-screen flex items-center justify-center">{children}</div>
}
