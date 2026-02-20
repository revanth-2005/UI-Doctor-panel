"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Plus, Edit2, Trash2, Loader2, User, Phone, AlertTriangle, Stethoscope, Activity } from "lucide-react"
import { 
  createPatient, 
  fetchPatients,
  updatePatient,
  deletePatient,
  type CreatePatientRequest,
  type Patient 
} from "@/lib/api/doctor"
import { fetchDoctors } from "@/lib/api/admin"
import { Doctor } from "@/lib/types/admin"

export default function AdminPatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    phone: string
    userId: string
    assignedDoctorId: string
    medicalCondition: string
  }>({
    name: "",
    phone: "",
    userId: "",
    assignedDoctorId: "",
    medicalCondition: ""
  })

  const [conditions, setConditions] = useState<any[]>([])

  // Load patients, doctors, and conditions on component mount
  useEffect(() => {
    loadPatients()
    loadDoctors()
    loadConditions()
  }, [])

  const loadConditions = async () => {
    try {
      const response = await fetch('/api/conditions')
      const result = await response.json()
      if (result.success && result.data) {
        setConditions(result.data)
      }
    } catch (error) {
      console.error('Error loading conditions:', error)
    }
  }

  const loadDoctors = async (): Promise<void> => {
    try {
      const result = await fetchDoctors()
      if (result.success && result.data && Array.isArray(result.data)) {
        console.log('✅ Loaded doctors:', result.data.length, 'doctors');
        console.log('Doctor list:', result.data.map(d => ({ id: d.id, name: d.doctorName })));
        setDoctors(result.data)
      } else {
        console.warn("Doctors data is not an array:", result)
        setDoctors([])
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      setDoctors([])
    }
  }

  // Load patients from API
  const loadPatients = async () => {
    setLoading(true)
    try {
      const result = await fetchPatients()
      
      if (result.success && result.data) {
        // Ensure all patients have both _id and id fields
        const patientsWithIds = result.data
          .filter(p => p._id || p.id) // Filter out patients without valid IDs
          .map(p => ({
            ...p,
            _id: (p._id || p.id) as string,
            id: (p._id || p.id) as string
          }))
        console.log('Loaded patients:', patientsWithIds)
        setPatients(patientsWithIds)
      } else {
        console.warn("Failed to load patients:", result.message)
        setPatients([])
        toast({
          title: "⚠️ Warning",
          description: result.message || "Could not load patients",
          variant: "destructive",
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
        // Update existing patient
        console.log('========================================');
        console.log('🔄 UPDATING PATIENT');
        console.log('editingPatient ID:', editingPatient);
        console.log('Form data:', JSON.stringify(formData, null, 2));
        console.log('========================================');
        
        // Get the original patient to preserve nutritionLimits
        const originalPatient = patients.find(p => (p._id || p.id) === editingPatient);
        
        // Build update payload - include all fields
        const updateData: any = {
          name: formData.name,
          phone: formData.phone,
          userId: formData.userId,
          nutritionLimits: originalPatient?.nutritionLimits || {
            macros: { calories: 2000, protein: 100, carbs: 250, fat: 70, fiber: 25 },
            micros: {}
          }
        };
        
        // Handle doctor assignment - backend uses AssgnDocId and AssgnDocName
        if (formData.assignedDoctorId) {
          const selectedDoctor = doctors.find(d => d.id === formData.assignedDoctorId);
          if (selectedDoctor) {
            updateData.AssgnDocId = selectedDoctor.id;
            updateData.AssgnDocName = selectedDoctor.doctorName;
            console.log('✅ Assigned doctor:', selectedDoctor.doctorName, 'ID:', selectedDoctor.id);
          }
        }
        
        // Find the condition ID from the conditions list
        if (formData.medicalCondition) {
          const selectedCondition = conditions.find(c => c.conditionName === formData.medicalCondition);
          if (selectedCondition && selectedCondition.id) {
            updateData.medicalCondition = selectedCondition.id; // Send the ObjectId, not the name
            console.log('✅ Selected condition:', selectedCondition.conditionName, 'ID:', selectedCondition.id);
          }
        }
        
        console.log('📤 Sending update data:', JSON.stringify(updateData, null, 2));
        
        const result = await updatePatient(editingPatient, updateData);

        console.log('📊 Update result:', JSON.stringify(result, null, 2));

        if (result.success) {
          toast({
            title: "Success",
            description: "Patient updated successfully",
            variant: "default",
            duration: 4000,
          })
          await loadPatients()
          resetForm()
        } else {
          toast({
            title: "❌ Update Failed",
            description: result.message || "Unable to update patient information.",
            variant: "destructive",
            duration: 5000,
          })
        }
      } else {
        // Create new patient
        // We use the selected doctor ID as the "creator" or "assigned" doctor
        if (!formData.assignedDoctorId) {
          toast({
            title: "⚠️ Missing Information",
            description: "Please assign a doctor to the patient",
            variant: "destructive",
            duration: 3000,
          })
          setSubmitting(false)
          return
        }

        // Construct the patient data
        const patientData: CreatePatientRequest = {
          name: formData.name,
          phone: formData.phone,
          userId: formData.userId,
          assignedDoctorId: formData.assignedDoctorId,
          medicalCondition: formData.medicalCondition,
          nutritionLimits: {
             macros: { calories: 2000, protein: 100, carbs: 250, fat: 70, fiber: 25 }, // Defaults
             micros: {} 
          }
        }

        // Add doctor ID and Name to the patient data (backend expects AssgnDocId and AssgnDocName)
        const selectedDoctor = doctors.find(d => d.id === formData.assignedDoctorId);
        if (selectedDoctor) {
          (patientData as any).AssgnDocId = selectedDoctor.id;
          (patientData as any).AssgnDocName = selectedDoctor.doctorName;
          console.log('✅ Creating patient with doctor:', selectedDoctor.doctorName, 'ID:', selectedDoctor.id);
        }

        // Convert condition name to ID
        const selectedCondition = conditions.find(c => c.conditionName === formData.medicalCondition);
        if (selectedCondition && selectedCondition.id) {
          patientData.medicalCondition = selectedCondition.id;
          console.log('✅ Creating patient with condition:', selectedCondition.conditionName, 'ID:', selectedCondition.id);
        }

        const result = await createPatient(formData.assignedDoctorId, patientData)
        
        if (result.success) {
          toast({
            title: "Success",
            description: "Patient created and assigned successfully",
            variant: "default", 
            duration: 4000,
          })
          await loadPatients()
          resetForm()
        } else {
           // Check for specific backend bug that actually means success (copied from doctor component)
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
              description: result.message || "Unable to create patient.",
              variant: "destructive",
              duration: 5000,
            })
          }
        }
      }
    } catch (error) {
      toast({
        title: "❌ Unexpected Error",
        description: "Something went wrong. Please try again.",
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
      assignedDoctorId: "",
      medicalCondition: ""
    })
    setEditingPatient(null)
    setShowForm(false)
  }

  // Handle editing a patient
  const handleEditPatient = (patient: any) => {
    // Use MongoDB _id as the identifier for backend operations
    const patientId = patient._id || patient.id;
    console.log("Editing patient with _id:", patientId, "Full patient object:", patient);
    
    if (!patientId) {
      console.error("Cannot edit patient: Missing _id", patient);
      toast({
        title: "Error",
        description: "Cannot edit this patient record due to missing ID.",
        variant: "destructive"
      });
      return;
    }

    // Check if doctors are loaded
    if (doctors.length === 0) {
      console.error("⚠️ Doctors not loaded yet!");
      toast({
        title: "Please wait",
        description: "Loading doctor information...",
        variant: "default"
      });
      // Reload doctors and try again
      loadDoctors().then(() => {
        setTimeout(() => handleEditPatient(patient), 500);
      }).catch(err => {
        console.error("Failed to load doctors:", err);
      });
      return;
    }

    // Extract doctor ID - backend may return it as an object or string
    let doctorId = "";
    if (patient.AssgnDocId) {
      if (typeof patient.AssgnDocId === 'object') {
        doctorId = patient.AssgnDocId._id || patient.AssgnDocId.id || "";
      } else {
        doctorId = patient.AssgnDocId;
      }
    }
    console.log("📋 Extracted doctor ID:", doctorId);
    console.log("📋 Available doctors:", doctors.map(d => ({ id: d.id, name: d.doctorName })));
    console.log("📋 Doctor ID matches?", doctors.some(d => d.id === doctorId));

    setFormData({
      name: patient.name,
      phone: patient.phone || "",
      userId: patient.userId || "",
      assignedDoctorId: doctorId,
      medicalCondition: (patient.medicalCondition && typeof patient.medicalCondition === 'object')
        ? (patient.medicalCondition.name || patient.medicalCondition.conditionName || "")
        : (patient.medicalCondition || "")
    })
    
    console.log("📋 Set formData.assignedDoctorId to:", doctorId);
    
    setEditingPatient(patientId)
    // Don't set showForm to true - we show inline edit form instead
  }

  // Handle opening delete dialog
  const handleDeletePatient = async (patientId: string) => {
    const patient = patients.find(p => (p._id || p.id) === patientId)
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
      const result = await deletePatient(patientToDelete.id)

      if (result.success) {
        toast({
          title: "✅ Patient Deleted",
          description: `${patientToDelete.name} has been successfully removed`,
          variant: "default",
          duration: 4000,
        })
        await loadPatients()
        setDeleteDialogOpen(false)
        setPatientToDelete(null)
      } else {
        toast({
          title: "❌ Delete Failed",
          description: result.message || "Unable to delete patient.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: "❌ Connection Error",
        description: "Failed to connect to the server.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setDeleting(false)
    }
  }

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm)) ||
    (patient.userId && patient.userId.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <p className="text-gray-600 mt-1">Manage patients and assign them to doctors</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Patient
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search patients by name, phone, or user ID..."
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

      {/* Add New Patient Form - Only show when adding, not editing */}
      {showForm && !editingPatient && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Patient</h3>
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
              
              {/* New Fields */}
              <div>
                <Label htmlFor="doctor">Assign Doctor *</Label>
                <Select 
                  value={formData.assignedDoctorId} 
                  onValueChange={(value) => setFormData({ ...formData, assignedDoctorId: value })}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.doctorName} ({doctor.specialization || 'General'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Medical Condition</Label>
                <Select 
                  value={formData.medicalCondition} 
                  onValueChange={(value) => setFormData({ ...formData, medicalCondition: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.id} value={condition.conditionName}>
                        {condition.conditionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Patient
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
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading patients...</p>
          </Card>
        ) : filteredPatients.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            {patients.length === 0 ? "No patients found. Add your first patient!" : "No patients match your search."}
          </Card>
        ) : (
          filteredPatients.map((patient: any) => {
            const patientId = patient._id || patient.id
            const isEditing = editingPatient === patientId
            
            console.log('Rendering patient:', patient.name, '_id:', patientId, 'userId:', patient.userId, 'isEditing:', isEditing)
            
            return (
              <div key={patientId}>
                <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{patient.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{patient.phone || "No phone"}</span>
                          </div>
                          <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                            ID: {patient.userId || patient.id || patient._id}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditPatient(patient)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        <Edit2 size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeletePatient(patient._id || patient.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  {/* Footer with details */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {/* Display Assigned Doctor if we can match the ID */}
                      {(patient.AssgnDocId || patient.AssgnDocName) && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Stethoscope className="w-4 h-4" />
                          <span>{patient.AssgnDocName || "Assigned Doctor"}</span>
                        </div>
                      )}

                      {/* Display Medical Condition */}
                      {patient.medicalCondition && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <Activity className="w-4 h-4" />
                          <span>
                            {typeof patient.medicalCondition === 'object' 
                              ? (patient.medicalCondition as any).name || "Condition"
                              : patient.medicalCondition}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Edit Form - Show directly below this patient card */}
                {isEditing && (
                  <Card className="p-6 mt-2 border-2 border-blue-200 bg-blue-50/30">
                    <h3 className="text-lg font-semibold mb-4">Edit Patient</h3>
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-name">Full Name *</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-phone">Phone *</Label>
                          <Input
                            id="edit-phone"
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
                          <Label htmlFor="edit-userId">User ID</Label>
                          <Input
                            id="edit-userId"
                            value={formData.userId || ""}
                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                            placeholder="user_001"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-doctor">Assign Doctor *</Label>
                          <Select 
                            value={formData.assignedDoctorId} 
                            onValueChange={(value) => setFormData({ ...formData, assignedDoctorId: value })}
                            required
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a doctor" />
                            </SelectTrigger>
                            <SelectContent>
                              {doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  {doctor.doctorName} ({doctor.specialization || 'General'})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="edit-condition">Medical Condition</Label>
                          <Select 
                            value={formData.medicalCondition} 
                            onValueChange={(value) => setFormData({ ...formData, medicalCondition: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              {conditions.map((condition) => (
                                <SelectItem key={condition.id} value={condition.conditionName}>
                                  {condition.conditionName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" disabled={submitting}>
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Update Patient
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}
              </div>
            )
          })
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
              This action will permanently remove all patient data.
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
