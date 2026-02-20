"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import AdminNav from "@/components/admin/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DoctorManagement from "@/components/admin/doctor-management"
import RecipeAssignments from "@/components/admin/recipe-assignments"
import RealtimeAnalytics from "@/components/admin/realtime-analytics"
import AdminPatientManagement from "@/components/admin/patient-management"
import RecipesManagementNew from "@/components/admin/recipes-management-new"
import { Users, FileText, BarChart3, UserPlus, ChefHat } from "lucide-react"

function AdminDashboardContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("analytics")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      window.location.href = "/"
      return
    }
    setUser(JSON.parse(userData))
    
    // Check URL parameter first, then localStorage
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    } else {
      const savedTab = localStorage.getItem('adminActiveTab')
      if (savedTab) {
        setActiveTab(savedTab)
      }
    }
    
    setLoading(false)
  }, [searchParams])

  // Save active tab to localStorage when it changes
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('adminActiveTab', activeTab)
    }
  }, [activeTab])

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user || user.role !== "admin") return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage doctors, assignments, and system configuration</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Doctors
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Recipes
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Approvals
          </TabsTrigger>
        </TabsList>          <TabsContent value="doctors" className="space-y-6">
            <DoctorManagement />
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <AdminPatientManagement />
          </TabsContent>

          <TabsContent value="recipes" className="space-y-6">
            <RecipesManagementNew />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <RecipeAssignments />
          </TabsContent>          <TabsContent value="analytics" className="space-y-6">
            <RealtimeAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}
