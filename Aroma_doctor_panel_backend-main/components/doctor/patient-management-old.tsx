"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit2, Trash2, User, Mail, Phone, Calendar, Loader2 } from "lucide-react"
import { 
  fetchPatients, 
  createPatient, 
  updatePatient, 
  deletePatient,
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest
} from "@/lib/api/doctor"

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [doctorId, setDoctorId] = useState<string>("")
  const { toast } = useToast()

  const [formData, setFormData] = useState<CreatePatientRequest>({
    name: "",
    phone: "",
    userId: "",
    nutritionLimits: {
      macros: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      },
      micros: {
        sodium: 0,
        potassium: 0,
        calcium: 0,
        zinc: 0,
        magnesium: 0,
        iron: 0,
        vitamin_b12: 0,
        vitamin_d: 0,
        vitamin_c: 0,
        folate: 0
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
            title: "Backend Connection Issue",
            description: "MongoDB backend at localhost:4000 is not responding properly",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Backend Not Running",
          description: "Please ensure MongoDB backend server is running at localhost:4000",
          variant: "destructive"
        })
        console.error('Backend connectivity check failed:', error)
      }
    }

    checkBackendConnection()
  }, [])

  // Get doctor ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setDoctorId(user.id || "doctor-1") // fallback ID for demo
    }
  }, [])

  // Load patients when doctor ID is available
  useEffect(() => {
    loadPatients() // Remove doctorId dependency since backend handles all patients
  }, [])

  const loadPatients = async () => {
    setLoading(true)
    try {
      console.log('🔍 Loading all patients...')
      const result = await fetchPatients() // Remove doctorId parameter
      console.log('📋 Patients fetch result:', result)
      
      if (result.success && result.data && Array.isArray(result.data)) {
        setPatients(result.data)
        toast({
          title: "Success",
          description: `Loaded ${result.data.length} patients from MongoDB`,
        })
      } else {
        console.error('Invalid patients response:', result)
        setPatients([])
        if (!result.success) {
          const errorMessage = result.message || "Failed to load patients"
          // Check if it's a connection error
          if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
            toast({
              title: "Connection Error",
              description: "Cannot connect to MongoDB backend at localhost:4000. Please ensure the backend server is running.",
              variant: "destructive"
            })
          } else {
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive"
            })
          }
        }
      }
    } catch (error) {
      console.error('Error loading patients:', error)
      setPatients([])
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingId) {
        // Update existing patient
        const result = await updatePatient(editingId, formData)
        if (result.success) {
          toast({
            title: "Success",
            description: "Patient updated successfully"
          })
          await loadPatients()
          handleCancelForm()
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          })
        }
      } else {
        // Create new patient
        const result = await createPatient(doctorId, formData)
        if (result.success) {
          toast({
            title: "Success",
            description: "Patient created successfully"
          })
          await loadPatients()
          handleCancelForm()
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPatient = (patient: Patient) => {
    setFormData({
      name: patient.name,
      phone: patient.phone || "",
      userId: patient.userId || "",
      nutritionLimits: {
        macros: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        micros: {
          sodium: 0,
          potassium: 0,
          calcium: 0,
          zinc: 0,
          magnesium: 0,
          iron: 0,
          vitamin_b12: 0,
          vitamin_d: 0,
          vitamin_c: 0,
          folate: 0
        }
      }
    })
    setEditingPatient(patient.id)
    setShowForm(true)
  }

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return

    try {
      const result = await deletePatient(patientId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Patient deleted successfully"
        })
        await loadPatients()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      userId: "",
      nutritionLimits: {
        macros: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        micros: {
          sodium: 0,
          potassium: 0,
          calcium: 0,
          zinc: 0,
          magnesium: 0,
          iron: 0,
          vitamin_b12: 0,
          vitamin_d: 0,
          vitamin_c: 0,
          folate: 0
        }
      }
    })
    setEditingPatient(null)
    setShowForm(false)
  }

  const handleConditionInput = (value: string) => {
    const conditions = value.split(',').map(c => c.trim()).filter(c => c)
    setFormData({ ...formData, medical_conditions: conditions })
  }

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medical_conditions.some(condition => 
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <p className="text-gray-600">Manage your patients and their medical information</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search patients by name, email, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredPatients.length} of {patients.length} patients
          </div>
        </div>
      </Card>

      {/* Add/Edit Patient Form */}
      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Patient" : "Add New Patient"}
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
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="conditions">Medical Conditions (comma-separated)</Label>
              <Input
                id="conditions"
                value={formData.medical_conditions.join(', ')}
                onChange={(e) => handleConditionInput(e.target.value)}
                placeholder="Diabetes Type 2, Hypertension"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter conditions separated by commas
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the patient..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingId ? "Update Patient" : "Create Patient"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Patients List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading patients...</span>
          </div>
        ) : !Array.isArray(patients) || filteredPatients.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            {searchTerm ? "No patients match your search" : "No patients added yet"}
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{patient.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Age {patient.age}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {patient.email}
                      </div>
                      {patient.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {patient.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {patient.medical_conditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                    {patient.notes && (
                      <p className="text-sm text-gray-600 mt-2 max-w-2xl">
                        {patient.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPatient(patient)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePatient(patient._id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}