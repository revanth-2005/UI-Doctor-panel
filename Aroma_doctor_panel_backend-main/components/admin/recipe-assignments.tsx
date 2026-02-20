"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Clock, CheckCircle, XCircle, User, MessageCircle } from "lucide-react"
import { Doctor, RecipeAssignment, CreateAssignmentRequest } from "@/lib/types/admin"
import { fetchDoctors, fetchAssignments, createAssignment } from "@/lib/api/admin"
import { fetchRecipes, Recipe } from "@/lib/api/recipes"









export default function RecipeAssignments() {
  const [assignments, setAssignments] = useState<RecipeAssignment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [conditions, setConditions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [doctorFilter, setDoctorFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const [formData, setFormData] = useState<CreateAssignmentRequest>({
    doctorId: "",
    recipeId: "",
    conditionTag: "",
    note: ""
  })
  const { toast } = useToast()

  // Load data on component mount and when filters change
  useEffect(() => {
    loadDoctors()
    loadRecipes()
    loadConditions()
  }, [])

  useEffect(() => {
    loadAssignments()
  }, [doctorFilter, statusFilter])

  // Set up polling for real-time updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      // Only poll if not showing form or submitting
      if (!showForm && !submitting) {
        loadAssignments(true) // Silent reload
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(pollInterval)
  }, [doctorFilter, statusFilter, showForm, submitting])

  const loadDoctors = async () => {
    try {
      const response = await fetch('/api/admin/doctors')
      const result = await response.json()
      
      if (result.success && result.data && Array.isArray(result.data)) {
        setDoctors(result.data)
      } else {
        console.error('Invalid doctors response:', result)
        setDoctors([])
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      setDoctors([])
    }
  }

  const loadRecipes = async () => {
    try {
      const response = await fetch('/api/recipes')
      const result = await response.json()
      
      if (result.success && result.data && Array.isArray(result.data)) {
        setRecipes(result.data)
      } else {
        console.error('Invalid recipes response:', result)
        setRecipes([])
      }
    } catch (error) {
      console.error('Error loading recipes:', error)
      setRecipes([])
    }
  }

  const loadConditions = async () => {
    try {
      const response = await fetch('https://aroma-db-six.vercel.app/api/condition/list')
      const result = await response.json()
      
      if (result.success && result.conditions) {
        setConditions(result.conditions)
      } else {
        console.error('Invalid conditions response:', result)
        setConditions([])
        toast({
          title: "Error",
          description: result.message || "Failed to load conditions",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading conditions:', error)
      setConditions([])
      toast({
        title: "Error",
        description: "Failed to load medical conditions",
        variant: "destructive"
      })
    }
  }

  const loadAssignments = async (silent: boolean = false) => {
    if (!silent) setLoading(true)
    
    try {
      let url = '/api/admin/assignments'
      const params = new URLSearchParams()
      
      if (doctorFilter) params.append('doctorId', doctorFilter)
      if (statusFilter) params.append('status', statusFilter)
      
      if (params.toString()) {
        url += '?' + params.toString()
      }

      console.log('📡 Loading assignments from:', url)

      const response = await fetch(url)
      const result = await response.json()
      
      console.log('📋 Assignments response:', result)
    
      if (result.success && result.data && Array.isArray(result.data)) {
        const newAssignments = result.data
        
        // Check if there are any status updates since last load
        if (!silent && assignments.length > 0) {
          const updatedAssignments = newAssignments.filter((newAssignment: any) => {
            const oldAssignment = assignments.find(old => old.assignmentId === newAssignment.assignmentId)
            return oldAssignment && oldAssignment.status !== newAssignment.status
          })
          
          // Show notification for status updates
          updatedAssignments.forEach((assignment: any) => {
            toast({
              title: "🔄 Assignment Update",
              description: `${assignment.doctorName} has ${assignment.status} the recipe "${assignment.recipeTitle}"`,
              variant: assignment.status === 'approved' ? 'default' : 'destructive',
              duration: 4000,
            })
          })
        }
        
        setAssignments(newAssignments)
        setLastUpdateTime(new Date())
      } else {
        console.error('Invalid assignments response:', result)
        setAssignments([])
        if (!silent && !result.success) {
          toast({
            title: "⚠️ Loading Error",
            description: result.message,
            variant: "destructive",
            duration: 5000,
          })
        }
      }
      
      if (!silent) setLoading(false)
    } catch (error) {
      console.error('Error loading assignments:', error)
      setAssignments([])
      if (!silent) {
        toast({
          title: "⚠️ Connection Error",
          description: "Failed to load assignments. Please check your connection.",
          variant: "destructive",
          duration: 5000,
        })
        setLoading(false)
      }
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    console.log('🚀 Starting assignment creation process...')
    console.log('📋 Form data being submitted:', formData)
    console.log('✅ Required fields check:', {
      doctorId: !!formData.doctorId,
      recipeId: !!formData.recipeId,
      conditionTag: !!formData.conditionTag
    })

    try {
      console.log('📤 Submitting assignment:', formData)
      
      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', response.headers)
      
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError)
        throw new Error('Invalid response format from server')
      }
      
      console.log('📥 Assignment response:', result)
      
      if (response.ok && result.success) {
        toast({
          title: "✅ Assignment Created Successfully",
          description: `Recipe "${result.data.recipeTitle}" assigned to ${result.data.doctorName}`,
          duration: 4000,
        })
        
        // Reset form and refresh assignments
        setFormData({
          doctorId: "",
          recipeId: "",
          conditionTag: "",
          note: ""
        })
        setShowForm(false)
        await loadAssignments()
        
        console.log('🔄 Assignments reloaded after creation')
      } else {
        // Handle API error responses
        const errorMessage = result.message || 'Unknown error occurred'
        console.error('❌ Assignment creation failed:', result)
        
        // Show specific error messages
        if (response.status === 409) {
          toast({
            title: "⚠️ Assignment Already Exists",
            description: "This recipe is already assigned to this doctor",
            variant: "destructive",
            duration: 5000,
          })
        } else if (response.status === 404) {
          toast({
            title: "⚠️ Recipe Not Found",
            description: "The selected recipe could not be found",
            variant: "destructive",
            duration: 5000,
          })
        } else {
          toast({
            title: "⚠️ Assignment Failed",
            description: errorMessage,
            variant: "destructive",
            duration: 5000,
          })
        }
      }
    } catch (error) {
      console.error('❌ Network error during assignment creation:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "⚠️ Connection Error",
          description: "Cannot connect to the server. Make sure the development server is running on port 3000.",
          variant: "destructive",
          duration: 8000,
        })
      } else {
        toast({
          title: "⚠️ Assignment Error",
          description: "Unable to create assignment. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment => {
    if (!searchTerm) return true
    
    const doctor = doctors.find(d => d.id === assignment.doctorId)
    const recipe = recipes.find(r => r._id === assignment.recipeId)
    
    return (
      doctor?.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe?.recipeTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading && assignments.length === 0) {
    return <div className="text-center py-12">Loading approvals...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Assignment Button and Filters */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Recipe Approval</h2>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>Last updated: {lastUpdateTime.toLocaleTimeString()}</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus size={20} />
              Ask Doctor
            </Button>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assignments by doctor or recipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-w-[140px]"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          >
            <option value="">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.doctorName}
              </option>
            ))}
          </select>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-w-[120px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Create Assignment Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Ask Doctor for Review</h3>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              size="sm"
            >
              Cancel
            </Button>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctorId">Doctor</Label>
                <select
                  id="doctorId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.doctorId}
                  onChange={(e) => {
                    console.log('🔄 Doctor selected:', e.target.value)
                    setFormData({ ...formData, doctorId: e.target.value })
                  }}
                >
                  <option value="">Select Doctor</option>
                  {doctors.filter(d => d.status === 'active').map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.doctorName} {doctor.specialization ? `- ${doctor.specialization}` : ''}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {doctors.length} doctors loaded
                </div>
              </div>
              <div>
                <Label htmlFor="recipeId">Recipe</Label>
                <select
                  id="recipeId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.recipeId}
                  onChange={(e) => {
                    console.log('🔄 Recipe selected:', e.target.value)
                    setFormData({ ...formData, recipeId: e.target.value })
                  }}
                >
                  <option value="">Select Recipe</option>
                  {recipes.map(recipe => (
                    <option key={recipe._id} value={recipe._id}>
                      {recipe.recipeTitle}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {recipes.length} recipes loaded
                </div>
              </div>
              <div className="col-span-2">
                <Label htmlFor="conditionTag">Medical Condition</Label>
                <select
                  id="conditionTag"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.conditionTag}
                  onChange={(e) => {
                    console.log('🔄 Condition selected:', e.target.value)
                    setFormData({ ...formData, conditionTag: e.target.value })
                  }}
                >
                  <option value="">Select Medical Condition</option>
                  {conditions.map((condition, index) => (
                    <option key={condition._id || condition.id || `condition-${index}`} value={condition.name}>
                      {condition.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {conditions.length} conditions loaded
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="note">Notes (Optional)</Label>
              <textarea
                id="note"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Additional instructions or context for the doctor..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={submitting || !formData.doctorId || !formData.recipeId || !formData.conditionTag}
                onClick={() => console.log('🎯 Submit button clicked with data:', formData)}
              >
                {submitting ? "Sending..." : "Ask Doctor"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Assignments List */}
      <div className="grid gap-4">
        {filteredAssignments.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            {searchTerm || doctorFilter || statusFilter 
              ? "No requests match your filters"
              : "No doctor requests yet"}
          </Card>
        ) : (
          filteredAssignments.map((assignment) => {
            const doctor = doctors.find(d => d.id === assignment.doctorId)
            const recipe = recipes.find(r => r._id === assignment.recipeId)
            
            return (
              <Card key={assignment.assignmentId} className={`p-6 border-l-4 ${
                assignment.status === 'approved' ? 'border-l-green-500' : 
                assignment.status === 'rejected' ? 'border-l-red-500' : 
                'border-l-yellow-500'
              } hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      assignment.status === 'approved' ? 'bg-green-100' : 
                      assignment.status === 'rejected' ? 'bg-red-100' : 
                      'bg-yellow-100'
                    }`}>
                      {assignment.status === 'approved' ? (
                        <CheckCircle className="w-7 h-7 text-green-600" />
                      ) : assignment.status === 'rejected' ? (
                        <XCircle className="w-7 h-7 text-red-600" />
                      ) : (
                        <Clock className="w-7 h-7 text-yellow-600" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {recipe?.recipeTitle || assignment.recipeTitle}
                        </h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Assigned to: {doctor?.doctorName || assignment.doctorName}</span>
                        {doctor && <span className="text-gray-500">({doctor.specialization})</span>}
                      </div>
                      <Badge variant="outline" className="text-blue-600 mt-1">
                        {assignment.conditionTag}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Footer Section */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                    <span>Last Updated: {new Date(assignment.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  
                  {assignment.note && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <strong>Notes:</strong> {assignment.note}
                    </div>
                  )}
                  
                  {assignment.status !== 'pending' && assignment.reviewedAt && (
                    <div className="text-sm">
                      <p className="text-gray-500 mb-2">
                        Reviewed: {new Date(assignment.reviewedAt).toLocaleDateString()} at {new Date(assignment.reviewedAt).toLocaleTimeString()}
                      </p>
                      {assignment.doctorComment && (
                        <div className="text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <strong className="text-blue-900">Doctor's Feedback:</strong>
                              <p className="mt-1 text-blue-800">{assignment.doctorComment}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}