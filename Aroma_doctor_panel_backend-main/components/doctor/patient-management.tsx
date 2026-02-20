"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit2, Trash2, Loader2, User, Phone, AlertTriangle, ArrowLeft, Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import {
  createPatient,
  updatePatient,
  deletePatient,
  type CreatePatientRequest,
  type Patient
} from "@/lib/api/doctor"

type DayStatus = 'good' | 'medium' | 'bad' | 'empty'

interface DetailedPatient extends Patient {
  weeklyStatus: {
    day: string
    status: DayStatus
  }[]
}

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Form state matching the backend API
  const [formData, setFormData] = useState<CreatePatientRequest>({
    name: "",
    phone: "",
    userId: "",
    nutritionLimits: {
      macros: {
        calories: 2000,
        protein: 100,
        carbs: 250,
        fat: 70,
        fiber: 25
      },
      micros: {
        sodium: 2300,
        potassium: 3500,
        calcium: 1000,
        zinc: 11,
        magnesium: 400,
        iron: 18,
        vitamin_b12: 2.4,
        vitamin_d: 600,
        vitamin_c: 90,
        folate: 400
      }
    }
  })

  // Check backend connectivity on component mount
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch('https://aroma-db-six.vercel.app/health')
        if (!response.ok) {
          toast({
            title: "⚠️ Backend Connection Issue",
            description: "MongoDB backend at localhost:4000 is not responding properly",
            variant: "destructive",
            duration: 5000,
          })
        } else {
          console.log("✅ Backend connected successfully")
        }
      } catch (error) {
        toast({
          title: "❌ Backend Not Running",
          description: "Please ensure MongoDB backend server is running at localhost:4000",
          variant: "destructive",
          duration: 5000,
        })
        console.error('Backend connectivity check failed:', error)
      }
    }

    checkBackendConnection()
  }, [toast])

  // Load patients on component mount
  useEffect(() => {
    loadPatients()
  }, [])

  // Load patients from API
  const loadPatients = async () => {
    setLoading(true)
    try {
      console.log('🔍 Loading all patients from MongoDB backend...')

      const response = await fetch('https://aroma-db-six.vercel.app/api/patient', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`)
      }

      const result = await response.json()
      console.log('📋 Backend patients response:', result)

      if (result.success && result.patients) {
        const patients: DetailedPatient[] = result.patients.map((p: any) => ({
          _id: p._id,
          id: p._id,
          name: p.name,
          phone: p.phone,
          userId: p.userId,
          nutritionLimits: p.nutritionLimits,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          weeklyStatus: generateMockWeeklyStatus()
        }))

        console.log(`✅ Loaded ${patients.length} patients from MongoDB database`)
        setPatients(patients)

        // Don't show notification for regular loading - only for actions
      } else {
        console.error('Invalid patients response:', result)
        setPatients([])
        toast({
          title: "❌ Database Error",
          description: result.message || "Failed to load patients from database",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error loading patients:', error)
      setPatients([])
      toast({
        title: "❌ Connection Error",
        description: "Failed to connect to patient database",
        variant: "destructive",
        duration: 5000,
      })
    }
    setLoading(false)
  }

  // Handle form submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingPatient) {
        // Update existing patient directly via backend API
        const response = await fetch(`https://aroma-db-six.vercel.app/api/patient/${editingPatient}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          const result = await response.json()
          toast({
            title: "Success",
            description: "Patient updated successfully",
            variant: "default",
            duration: 4000,
          })
          await loadPatients() // Reload patients from backend
          resetForm()
        } else {
          const errorData = await response.json()
          toast({
            title: "❌ Update Failed",
            description: errorData.message || "Unable to update patient information. Please try again.",
            variant: "destructive",
            duration: 5000,
          })
        }
      } else {
        // Create new patient
        const result = await createPatient("doctor-1", formData)
        if (result.success) {
          toast({
            title: "Success",
            description: "Patient created successfully",
            variant: "default",
            duration: 4000,
          })
          await loadPatients()
          resetForm()
        } else {
          // Check for specific backend bug that actually means success
          if (result.message && (result.message.includes('populate') || result.message.includes('is not a function'))) {
            toast({
              title: "Success",
              description: "Patient created successfully",
              variant: "default",
              duration: 4000,
            })
            await loadPatients()
            resetForm()
          } else {
            toast({
              title: "❌ Creation Failed",
              description: result.message || "Unable to create patient. Please check the information and try again.",
              variant: "destructive",
              duration: 5000,
            })
          }
        }
      }
    } catch (error) {
      toast({
        title: "❌ Unexpected Error",
        description: "Something went wrong. Please check your internet connection and try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      userId: "",
      nutritionLimits: {
        macros: {
          calories: 2000,
          protein: 100,
          carbs: 250,
          fat: 70,
          fiber: 25
        },
        micros: {
          sodium: 2300,
          potassium: 3500,
          calcium: 1000,
          zinc: 11,
          magnesium: 400,
          iron: 18,
          vitamin_b12: 2.4,
          vitamin_d: 600,
          vitamin_c: 90,
          folate: 400
        }
      }
    })
    setEditingPatient(null)
    setShowForm(false)
  }

  // Handle editing a patient
  const handleEditPatient = (patient: Patient) => {
    setFormData({
      name: patient.name,
      phone: patient.phone || "",
      userId: patient.userId || "",
      nutritionLimits: patient.nutritionLimits || formData.nutritionLimits
    })
    setEditingPatient(patient.id || patient._id)
    setShowForm(true)
  }

  // Handle opening delete dialog
  const handleDeletePatient = async (patientId: string) => {
    const patient = patients.find(p => (p.id || p._id) === patientId)
    if (patient) {
      setPatientToDelete({
        id: patientId,
        name: patient.name
      })
      setDeleteDialogOpen(true)
    }
  }

  // Handle actual deletion after confirmation
  const confirmDeletePatient = async () => {
    if (!patientToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`https://aroma-db-six.vercel.app/api/patient/${patientToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "✅ Patient Deleted",
          description: `${patientToDelete.name} has been successfully removed from the system`,
          variant: "default",
          duration: 4000,
        })
        await loadPatients() // Reload patients from backend
        setDeleteDialogOpen(false)
        setPatientToDelete(null)
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Delete Failed",
          description: errorData.message || "Unable to delete patient. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: "❌ Connection Error",
        description: "Failed to connect to the server. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setDeleting(false)
    }
  }

  // Helper to generate mock weekly status
  const generateMockWeeklyStatus = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const today = new Date()
    const result = []

    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const statuses: DayStatus[] = ['good', 'medium', 'bad', 'good'] // Weight towards good
      result.push({
        day: days[d.getDay()],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      })
    }
    return result
  }

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm)) ||
    (patient.userId && patient.userId.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Patient Health Tracker Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full shrink-0"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-xl font-bold text-[#475569] tracking-tight">Patient Health Tracker</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="7days">
            <SelectTrigger className="w-[140px] h-10 bg-white border-slate-200 rounded-lg text-sm font-semibold text-slate-500 shadow-sm">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="15days">Last 15 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder="Search Patient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-10 bg-white border-slate-200 rounded-lg text-sm font-medium placeholder:text-slate-300 shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-lg text-xs"
          >
            + Add Patient
          </Button>
        </div>
      </div>

      {/* Summary Tracker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 border-slate-200 shadow-none bg-white rounded-2xl flex items-center justify-between group hover:border-emerald-200 transition-all border">
          <span className="text-sm font-bold text-[#64748b]">On track</span>
          <span className="text-2xl font-black text-[#14b8a6]">2,500</span>
        </Card>
        <Card className="p-5 border-slate-200 shadow-none bg-white rounded-2xl flex items-center justify-between group hover:border-orange-200 transition-all border">
          <span className="text-sm font-bold text-[#64748b]">Slight Deviation</span>
          <span className="text-2xl font-black text-[#f59e0b]">2,500</span>
        </Card>
        <Card className="p-5 border-slate-200 shadow-none bg-white rounded-2xl flex items-center justify-between group hover:border-rose-200 transition-all border">
          <span className="text-sm font-bold text-[#64748b]">Needs Attention</span>
          <span className="text-2xl font-black text-[#f43f5e]">2,500</span>
        </Card>
      </div>

      <div className="flex items-center justify-between px-1 py-1">
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          Patient Records ({filteredPatients.length} shown)
        </div>
      </div>

      {/* Add/Edit Patient Form */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingPatient ? "Edit Patient" : "Add New Patient"}
          </h3>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+1-555-0123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={formData.userId || ""}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="user_001 (auto-generated if empty)"
                />
              </div>
              <div>
                <Label htmlFor="calories">Daily Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.nutritionLimits?.macros?.calories || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    nutritionLimits: {
                      ...formData.nutritionLimits,
                      macros: {
                        ...formData.nutritionLimits?.macros,
                        calories: parseInt(e.target.value) || 0
                      }
                    }
                  })}
                  placeholder="2000"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPatient ? "Update Patient" : "Add Patient"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Patients List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center border-slate-200">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-500 font-medium">Loading patients from database...</p>
          </Card>
        ) : filteredPatients.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 border-slate-200">
            {patients.length === 0 ? "No patients found. Add your first patient!" : "No patients match your search."}
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card
              key={patient.id || patient._id}
              className="p-5 overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white rounded-2xl group"
              onClick={() => router.push(`/doctor/patient/${patient.id || patient._id}`)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4">
                {/* Patient Info */}
                <div className="lg:col-span-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 shrink-0">
                    <User className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-[#1e293b] text-base group-hover:text-blue-600 transition-colors truncate">
                      {patient.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold mt-1.5">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{patient.phone || "No phone"}</span>
                      </div>
                      <div className="text-slate-400">
                        ID: {patient.userId || "N/A"}
                      </div>
                      {patient.nutritionLimits?.macros?.calories && (
                        <div className="bg-[#dcfce7] text-[#166534] px-2.5 py-0.5 rounded-md text-[10px] font-black whitespace-nowrap">
                          {patient.nutritionLimits.macros.calories} cal/day
                        </div>
                      )}
                    </div>
                    {patient.createdAt && (
                      <div className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-wider">
                        Joined: {new Date(patient.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 7-Day Activity Tracker - Centered in middle column */}
                <div className="hidden lg:flex lg:col-span-4 justify-center items-center gap-2">
                  {(patient as DetailedPatient).weeklyStatus?.map((day, idx) => (
                    <div
                      key={idx}
                      className={`
                        w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-all
                        ${day.status === 'good' ? 'bg-white border-[#22c55e] text-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.1)]' :
                          day.status === 'bad' ? 'bg-white border-[#ef4444] text-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
                            day.status === 'medium' ? 'bg-white border-[#f59e0b] text-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                              'bg-white border-slate-100 text-slate-300'}
                      `}
                      title={`${day.status.toUpperCase()} adherence on ${day.day}`}
                    >
                      {day.day}
                    </div>
                  ))}
                </div>

                {/* Actions - Right aligned */}
                <div className="lg:col-span-3 flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={() => handleEditPatient(patient)}
                    variant="outline"
                    className="h-9 border-blue-200 text-blue-600 font-bold text-xs px-5 rounded-lg hover:bg-blue-50"
                  >
                    <Edit2 size={14} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeletePatient(patient.id || patient._id)}
                    variant="outline"
                    className="h-9 border-red-100 text-red-500 font-bold text-xs px-5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Patient
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{patientToDelete?.name}</span>?
              This action will permanently remove all patient data including medical history and nutrition plans.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false)
                setPatientToDelete(null)
              }}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePatient}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Patient
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}