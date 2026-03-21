"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export interface AuthUser {
  id: string
  name: string | null
  email: string | null
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id || "",
        name: session.user.name || null,
        email: session.user.email || null,
        role: (session.user as any).role || "student",
      }
    : null

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/login")
    } catch (error) {
      console.error("[Auth] Logout error:", error)
      window.location.href = "/login"
    }
  }

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, isLoading: status === "loading", logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
