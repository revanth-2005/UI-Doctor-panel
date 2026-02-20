"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, UserCheck, UserX, Clock, Loader2, Trash2, CheckCircle } from "lucide-react"
import { Doctor, CreateDoctorRequest } from "@/lib/types/admin"
import { fetchDoctors, createDoctor, updateDoctorStatus, deleteDoctor } from "@/lib/api/admin"

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [formData, setFormData] = useState<CreateDoctorRequest>({
    doctorName: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    status: "active"
  })
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [doctorToDelete, setDoctorToDelete] = useState<{id: string, name: string} | null>(null)
  const [createdDoctorName, setCreatedDoctorName] = useState("")
  const { toast } = useToast()

  // Load doctors on component mount and when filters change
  useEffect(() => {
    loadDoctors()
  }, [searchTerm, statusFilter])

  const loadDoctors = async () => {
    setLoading(true)
    try {
      const result = await fetchDoctors(
        searchTerm || undefined,
        statusFilter || undefined
      )
      
      if (result.success && result.data && Array.isArray(result.data)) {
        console.log('✅ Doctors loaded successfully:', result.data)
        setDoctors(result.data)
      } else {
        console.error('Invalid doctors response:', result)
        setDoctors([])
        if (!result.success) {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      setDoctors([])
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const result = await createDoctor(formData)
      
      if (result.success) {
        // Show success dialog with doctor's name
        setCreatedDoctorName(formData.doctorName)
        setShowSuccessDialog(true)
        
        // Reset form and refresh doctors list
        setFormData({
          doctorName: "",
          email: "",
          phone: "",
          specialization: "",
          licenseNumber: "",
          status: "active"
        })
        setShowForm(false)
        await loadDoctors()
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
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (doctorId: string, newStatus: 'active' | 'suspended' | 'pending') => {
    try {
      const result = await updateDoctorStatus(doctorId, newStatus)
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Doctor status updated to ${newStatus}`,
        })
        await loadDoctors()
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
        description: "Failed to update doctor status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteDoctor = (doctorId: string, doctorName: string) => {
    setDoctorToDelete({ id: doctorId, name: doctorName })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!doctorToDelete) return

    try {
      const result = await deleteDoctor(doctorToDelete.id)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Doctor deleted successfully",
        })
        await loadDoctors()
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
        description: "Failed to delete doctor",
        variant: "destructive"
      })
    } finally {
      setShowDeleteDialog(false)
      setDoctorToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Doctor Button and Filters */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Doctors</h2>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus size={20} />
            Add Doctor
          </Button>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search doctors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-w-[120px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Add Doctor Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Doctor</h3>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              size="sm"
            >
              Cancel
            </Button>
          </div>

          <form onSubmit={handleAddDoctor} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Input
                  id="doctorName"
                  required
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'suspended' | 'pending' })}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Doctor"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Doctors List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading doctors...</span>
          </div>
        ) : !Array.isArray(doctors) || doctors.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">No doctors added yet</Card>
        ) : (
          doctors.map((doctor) => (
            <Card key={doctor.id} className={`p-6 border-l-4 ${
              doctor.status === 'active' ? 'border-l-blue-500' : 
              doctor.status === 'pending' ? 'border-l-yellow-500' : 
              'border-l-red-500'
            } hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    doctor.status === 'active' ? 'bg-blue-100' : 
                    doctor.status === 'pending' ? 'bg-yellow-100' : 
                    'bg-red-100'
                  }`}>
                    <UserCheck className={`w-7 h-7 ${
                      doctor.status === 'active' ? 'text-blue-600' : 
                      doctor.status === 'pending' ? 'text-yellow-600' : 
                      'text-red-600'
                    }`} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-gray-900">{doctor.doctorName}</h3>
                    <p className="text-sm text-gray-600">{doctor.email}</p>
                    {doctor.specialization && <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(doctor.id, 
                      doctor.status === 'active' ? 'suspended' : 'active')}
                    className={doctor.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                  >
                    {doctor.status === 'active' ? (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        Suspend
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  {doctor.status === 'pending' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusUpdate(doctor.id, 'active')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDoctor(doctor.id, doctor.doctorName)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    {doctor.licenseNumber && <span>License: {doctor.licenseNumber}</span>}
                    {doctor.phone && <span>Phone: {doctor.phone}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(doctor.status)}
                    <span className="text-xs text-gray-500">
                      Joined: {new Date(doctor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Doctor Successfully Created!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 mt-2">
              <span className="font-medium text-green-700">Dr. {createdDoctorName}</span> has been successfully added to the system and is now available for recipe assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <AlertDialogAction 
              onClick={() => setShowSuccessDialog(false)}
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete 
              <span className="font-medium text-gray-900"> {doctorToDelete?.name} </span>
              and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}