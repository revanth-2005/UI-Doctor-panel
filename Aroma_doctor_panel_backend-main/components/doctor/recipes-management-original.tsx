"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Users, 
  MessageCircle, 
  Loader2,
  Search,
  CheckCircle,
  XCircle
} from "lucide-react"

// Assignment interface for doctor review
interface Assignment {
  assignmentId: string
  recipeId: string
  recipeTitle: string
  conditionTag: string
  note: string
  status: 'pending' | 'approved' | 'rejected'
  assignedAt: Date
  reviewedAt?: Date
  doctorComment?: string
}

interface DoctorReviewRequest {
  assignmentId: string
  doctorId: string
  doctorName: string
  status: 'approved' | 'rejected'
  doctorComment?: string
}

/**
 * Fetches assignments for the doctor from the API
 */
async function fetchDoctorAssignments(doctorId: string, status?: string): Promise<{ success: boolean; data?: Assignment[]; message: string }> {
  try {
    const params = new URLSearchParams()
    params.append('doctorId', doctorId)
    if (status) params.append('status', status)
    
    const response = await fetch(`/api/recipes/review?${params.toString()}`)
    const result = await response.json()
    
    if (response.ok) {
      return { 
        success: true, 
        data: result.data?.map((assignment: any) => ({
          ...assignment,
          assignedAt: new Date(assignment.assignedAt),
          reviewedAt: assignment.reviewedAt ? new Date(assignment.reviewedAt) : undefined
        })), 
        message: result.message 
      }
    } else {
      return { success: false, message: result.message || "Failed to fetch assignments" }
    }
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return {
      success: false,
      message: 'Network error occurred while fetching assignments'
    }
  }
}

/**
 * Submits a doctor's review decision
 */
async function submitReview(data: DoctorReviewRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/recipes/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      return { success: true, message: result.message }
    } else {
      return { success: false, message: result.message || "Failed to submit review" }
    }
  } catch (error) {
    console.error('Error submitting review:', error)
    return {
      success: false,
      message: 'Network error occurred while submitting review'
    }
  }
}

export default function RecipesManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [reviewingAssignmentId, setReviewingAssignmentId] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, string>>({})
  const { toast } = useToast()

  // Mock doctor data - in real app this would come from auth context
  const doctorId = "doctor_001"
  const doctorName = "Dr. John Smith"

  // Load assignments on component mount and when filters change
  useEffect(() => {
    loadAssignments()
  }, [statusFilter])

  const loadAssignments = async () => {
    setLoading(true)
    const result = await fetchDoctorAssignments(
      doctorId,
      statusFilter || undefined
    )
    
    if (result.success && result.data) {
      setAssignments(result.data)
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive"
      })
      setAssignments([])
    }
    setLoading(false)
  }

  const handleSubmitReview = async (assignmentId: string, status: 'approved' | 'rejected') => {
    setReviewingAssignmentId(assignmentId)
    
    try {
      const reviewData: DoctorReviewRequest = {
        assignmentId,
        doctorId,
        doctorName,
        status,
        doctorComment: comments[assignmentId]?.trim() || undefined
      }

      const result = await submitReview(reviewData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Decision sent to admin. Thank you for your review!",
        })
        
        // Update the assignment status locally
        setAssignments(prev => prev.map(assignment => 
          assignment.assignmentId === assignmentId 
            ? { 
                ...assignment, 
                status, 
                reviewedAt: new Date(),
                doctorComment: comments[assignmentId]?.trim() || undefined
              }
            : assignment
        ))
        
        // Clear the comment
        setComments(prev => ({ ...prev, [assignmentId]: "" }))
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
      setReviewingAssignmentId(null)
    }
  }

  const updateComment = (assignmentId: string, comment: string) => {
    setComments(prev => ({ ...prev, [assignmentId]: comment }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filter assignments by search term
  const filteredAssignments = assignments.filter(assignment =>
    assignment.recipeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.conditionTag.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recipe Review Assignments</h2>
          <p className="text-gray-600">Review recipes assigned to you by the admin</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </Card>

      {/* Assignment Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading approvals...</span>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            {searchTerm ? "No assignments match your search" : "No assignments yet"}
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.assignmentId} className="p-6">
              <div className="space-y-4">
                {/* Assignment Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.recipeTitle}
                      </h3>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{assignment.conditionTag}</span>
                      </div>
                      <span>Assigned: {assignment.assignedAt.toLocaleDateString()}</span>
                      {assignment.reviewedAt && (
                        <span>Reviewed: {assignment.reviewedAt.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Note */}
                {assignment.note && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-start gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Note from Admin:</p>
                        <p className="text-sm text-blue-800">{assignment.note}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Section for Pending Assignments */}
                {assignment.status === 'pending' && (
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-gray-600" />
                      <label className="text-sm font-medium text-gray-700">
                        Your Review Comment (Optional)
                      </label>
                    </div>
                    <Textarea
                      placeholder="Add your professional assessment, recommendations, or concerns about this recipe..."
                      value={comments[assignment.assignmentId] || ""}
                      onChange={(e) => updateComment(assignment.assignmentId, e.target.value)}
                      className="min-h-[80px]"
                    />
                    
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleSubmitReview(assignment.assignmentId, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={reviewingAssignmentId === assignment.assignmentId}
                      >
                        {reviewingAssignmentId === assignment.assignmentId ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ThumbsUp className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleSubmitReview(assignment.assignmentId, 'rejected')}
                        variant="destructive"
                        disabled={reviewingAssignmentId === assignment.assignmentId}
                      >
                        {reviewingAssignmentId === assignment.assignmentId ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {/* Review History for Completed Assignments */}
                {assignment.status !== 'pending' && assignment.doctorComment && (
                  <div className="bg-gray-50 p-3 rounded-md border-t">
                    <div className="flex items-start gap-2">
                      <MessageCircle className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Your Review:</p>
                        <p className="text-sm text-gray-700">{assignment.doctorComment}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}