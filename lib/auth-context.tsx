"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { login, register, logout, getSession } from "@/app/actions"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load user from session on initial render
  useEffect(() => {
    async function loadUser() {
      try {
        const sessionUser = await getSession()
        if (sessionUser) {
          setUser(sessionUser)
        }
      } catch (error) {
        console.error("Failed to load user session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const result = await login(email, password)
      if (result.success && result.user) {
        setUser(result.user)
      }
      setIsLoading(false)
      return result
    } catch (error) {
      setIsLoading(false)
      return { success: false, message: "An error occurred" }
    }
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      const result = await register(name, email, password)
      if (result.success && result.user) {
        setUser(result.user)
      }
      setIsLoading(false)
      return result
    } catch (error) {
      setIsLoading(false)
      return { success: false, message: "An error occurred" }
    }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
