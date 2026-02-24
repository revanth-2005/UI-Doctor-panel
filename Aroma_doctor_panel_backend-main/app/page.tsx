"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"admin" | "doctor">("doctor")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Use different endpoints based on role
      const endpoint = role === 'doctor' ? '/api/doctor/login' : '/api/auth/admin'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      })

      const data = await response.json()

      if (data.success) {
        // Normalize user data based on the response structure
        const userData = role === 'doctor' ? {
          id: data.data.doctorId,
          name: data.data.doctorName,
          email: data.data.email,
          role: 'doctor',
          specialization: data.data.specialization
        } : {
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          role: 'admin'
        }

        localStorage.setItem("user", JSON.stringify(userData))

        // Redirect based on role
        if (role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/doctor/dashboard")
        }
      } else {
        setError(data.message || "Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <Card className="overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2 min-h-[600px]">
            {/* Left Side - Image */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-64 h-64 mx-auto mb-6">
                  <Image
                    src="/drpanda.png"
                    alt="Dr. Panda"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
                <p className="text-blue-100">Aroma Nutrition Portal</p>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="p-8 md:p-12 flex items-center justify-center bg-white">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
                  <p className="text-gray-600">Medical Diet Plan Management</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Login as</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setRole("doctor")}
                        variant={role === "doctor" ? "default" : "outline"}
                        className="flex-1"
                      >
                        Doctor
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setRole("admin")}
                        variant={role === "admin" ? "default" : "outline"}
                        className="flex-1"
                      >
                        Admin
                      </Button>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {/* Login Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-base font-medium"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
