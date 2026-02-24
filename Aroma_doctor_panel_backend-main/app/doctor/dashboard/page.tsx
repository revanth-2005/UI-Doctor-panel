"use client"

import { useState, useEffect } from "react"
import DoctorNav from "@/components/doctor/doctor-nav"
import PatientManagement from "@/components/doctor/patient-management"
import ConditionsManagement from "@/components/doctor/conditions-management"
import RecommendationsManagement from "@/components/doctor/recommendations-management"
import RecipeApproval from "@/components/doctor/recipe-approval"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("patients")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      window.location.href = "/"
      return
    }
    setUser(JSON.parse(userData))
    setLoading(false)
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user || user.role !== "doctor") return null

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <DoctorNav user={user} />
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Doctor Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Manage patients, conditions, review recipes, and create recommendations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full bg-[#f1f5f9] p-1.5 rounded-xl h-auto gap-1 border-none">
            <TabsTrigger
              value="patients"
              className="flex-1 py-3 text-sm font-bold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-[#1e293b] data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700"
            >
              Patients
            </TabsTrigger>
            <TabsTrigger
              value="conditions"
              className="flex-1 py-3 text-sm font-bold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-[#1e293b] data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700"
            >
              Conditions
            </TabsTrigger>
            <TabsTrigger
              value="recipe-approval"
              className="flex-1 py-3 text-sm font-bold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-[#1e293b] data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700"
            >
              Recipe Approval
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="flex-1 py-3 text-sm font-bold rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:text-[#1e293b] data-[state=active]:shadow-sm text-slate-500 hover:text-slate-700"
            >
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="mt-10 outline-none">
            <PatientManagement user={user} />
          </TabsContent>

          <TabsContent value="conditions" className="mt-10 outline-none">
            <ConditionsManagement />
          </TabsContent>

          <TabsContent value="recipe-approval" className="mt-10 outline-none">
            <RecipeApproval />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-10 outline-none">
            <RecommendationsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
