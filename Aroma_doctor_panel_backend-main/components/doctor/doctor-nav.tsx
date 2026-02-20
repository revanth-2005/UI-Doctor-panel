"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ProfileSettings from "./profile-settings"

export default function DoctorNav({ user }: { user: any }) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#14b8a6] rounded-md flex items-center justify-center text-white font-black text-lg">
            M
          </div>
          <h1 className="text-lg font-bold text-[#1e293b]">Doctor Portal</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-500">Doctor: {user.name || "Mani"}</span>

          <Dialog>
            <DialogTrigger asChild>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>Profile Settings</DialogTitle>
                <DialogDescription>
                  Manage your account settings and preferences.
                </DialogDescription>
              </DialogHeader>
              <ProfileSettings user={user} onLogout={handleLogout} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  )
}
