"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, User, Lock, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

export default function ProfileSettings({ user, onLogout }: { user: any, onLogout: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: user.id,
          email: user.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password')
      }

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

      setShowPasswordForm(false)

      toast({
        title: "Success",
        description: "Password updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!showPasswordForm ? (
        <>
          {/* Profile Information */}
          <Card className="border-slate-200 shadow-none rounded-2xl">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                    <User className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#111827]">Profile Information</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Manage your personal account details</p>
                  </div>
                </div>

                <div className="grid gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Full Name</Label>
                    <Input
                      id="name"
                      value={user?.name || "Dr. Vijay"}
                      disabled
                      className="bg-slate-50 border-slate-200 h-10 text-sm font-bold text-[#1e293b] rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-slate-50 border-slate-200 h-10 text-sm font-bold text-[#1e293b] rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</Label>
                    <Input
                      id="role"
                      value={user?.role || "Doctor"}
                      disabled
                      className="capitalize bg-slate-50 border-slate-200 h-10 text-sm font-bold text-[#1e293b] rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={() => setShowPasswordForm(true)}
                    variant="outline"
                    className="w-full font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-11 rounded-xl"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 h-11 rounded-xl"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Change Password Form */}
          <Card className="border-slate-200 shadow-none rounded-2xl">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                    <Lock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#111827]">Change Password</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Update your account security credentials</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPassword" className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="border-slate-200 h-10 text-sm font-bold text-[#1e293b] rounded-lg focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-[11px] font-black text-slate-400 uppercase tracking-widest">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      required
                      className="border-slate-200 h-10 text-sm font-bold text-[#1e293b] rounded-lg focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter new password"
                      required
                      className="border-slate-200 h-10 text-sm font-bold text-[#1e293b] rounded-lg focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setFormData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        })
                      }}
                      className="flex-1 font-bold h-11 border-slate-200 text-slate-600 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] font-bold bg-[#2563eb] hover:bg-blue-700 h-11 rounded-xl"
                    >
                      {loading ? (
                        <>Updating...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
