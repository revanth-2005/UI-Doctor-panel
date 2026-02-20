"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function AdminNav({ user }: { user: any }) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
          <h1 className="text-xl font-bold text-gray-900">Doctor Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Admin: {user.email}</span>
          <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 bg-transparent">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
