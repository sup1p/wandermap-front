"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AuthBackground from "@/components/auth-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function Login() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("accessToken", data.access)
        localStorage.setItem("refreshToken", data.refresh)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/map")
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthBackground>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-md">WANDERMAP</h1>
        </div>
        <div className="bg-[#3a4a3a]/80 p-10 rounded-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-center text-white mb-6">Log in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm text-gray-200 block mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-[#4a5a4a] border-[#5a6a5a] text-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm text-gray-200 block mb-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-[#4a5a4a] border-[#5a6a5a] text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-[#4a5a4a] hover:bg-[#5a6a5a]" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <div className="text-center mt-4">
            <Link href="/signup" className="text-sm text-gray-300 hover:text-white">
              sign up
            </Link>
          </div>
        </div>
      </div>
    </AuthBackground>
  )
}
