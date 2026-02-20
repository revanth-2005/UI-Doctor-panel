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
  XCircle,
  Calendar,
  Utensils
} from "lucide-react"

import { 
  fetchDoctorAssignments, 
  reviewAssignment,
  DoctorAssignment,
  ReviewAssignmentRequest
} from "@/lib/api/doctor"
import { fetchRecipes, Recipe } from "@/lib/api/recipes"

export default function RecipesManagement() {
  const [assignments, setAssignments] = useState<DoctorAssignment[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [reviewComments, setReviewComments] = useState<{[key: string]: string}>({})
  const [doctorId, setDoctorId] = useState<string>("")
  const { toast } = useToast()

  // Get doctor ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setDoctorId(user.id || "doctor-1") // fallback ID for demo
    }
  }, [])

  // Load assignments and recipes when doctor ID is available
  useEffect(() => {
    if (doctorId) {
      loadAssignments()
      loadRecipes()
    }
  }, [doctorId])

  // Set up polling for real-time updates
  useEffect(() => {
    if (!doctorId) return

    const pollInterval = setInterval(() => {
      loadAssignments()
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(pollInterval)
  }, [doctorId])

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const result = await fetchDoctorAssignments(doctorId)
      if (result.success && result.data && Array.isArray(result.data)) {
        setAssignments(result.data)
      } else {
        console.error('Invalid assignments response:', result)
        setAssignments([])
        if (!result.success) {
          toast({
            title: "❌ Error",
            description: result.message || "Failed to load assignments",
            variant: "destructive",
            duration: 5000,
          })
        }
      }
    } catch (error) {
      console.error('Error loading assignments:', error)
      setAssignments([])
      toast({
        title: "❌ Error",
        description: "Failed to load recipe assignments",
        variant: "destructive",
        duration: 5000,
      })
    }
    setLoading(false)
  }

  const loadRecipes = async () => {
    try {
      const result = await fetchRecipes()
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

  const handleReviewSubmission = async (assignmentId: string, status: 'approved' | 'rejected') => {
    setSubmitting(assignmentId)
    
    try {
      const reviewData: ReviewAssignmentRequest = {
        assignmentId,
        status,
        comment: reviewComments[assignmentId] || ""
      }

      const result = await reviewAssignment(reviewData)
      
      if (result.success) {
        toast({
          title: "✅ Success",
          description: `Recipe ${status} successfully`,
          variant: status === 'approved' ? 'default' : 'destructive',
          duration: 4000,
        })

        // Clear comment and refresh assignments
        setReviewComments(prev => ({ ...prev, [assignmentId]: "" }))
        await loadAssignments()
      } else {
        toast({
          title: "❌ Error",
          description: result.message || "Failed to submit review",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to submit review",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setSubmitting(null)
    }
  }

  const handleCommentChange = (assignmentId: string, comment: string) => {
    setReviewComments(prev => ({ ...prev, [assignmentId]: comment }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
    }
  }

  const getRecipeDetails = (recipeId: string) => {
    return recipes.find(recipe => recipe._id === recipeId)
  }

  // Filter assignments based on search term and status
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = !searchTerm || 
      (assignment.recipe?.recipeTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.conditionTag.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || assignment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recipe Reviews</h2>
          <p className="text-gray-600">Review and approve assigned recipes for your patients</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          Auto-refreshes every 30 seconds
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by recipe name or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredAssignments.length} of {assignments.length} assignments
          </div>
        </div>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading recipe assignments...</span>
          </div>
        ) : !Array.isArray(assignments) || filteredAssignments.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            {searchTerm || statusFilter ? "No assignments match your filters" : "No recipe assignments yet"}
          </Card>
        ) : (
          filteredAssignments.map((assignment) => {
            const recipe = getRecipeDetails(assignment.recipeId) || assignment.recipe
            const isPending = assignment.status === 'pending'
            const isSubmittingThis = submitting === assignment._id

            return (
              <Card key={assignment._id} className="p-6">
                <div className="space-y-4">
                  {/* Assignment Header */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Utensils className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {recipe?.recipeTitle || 'Unknown Recipe'}
                        </h3>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="text-blue-600">
                          {assignment.conditionTag}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Details */}
                  {recipe && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <p className="text-gray-700">{recipe.shortDescription}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Ingredients:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {recipe.ingredients?.map((ingredient: any, index: number) => (
                              <li key={index}>• {typeof ingredient === 'string' ? ingredient : `${ingredient.amount || ''} ${ingredient.unit || ''} ${ingredient.name}`}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Nutrition Info:</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Calories: {recipe.nutritionInfo?.calories || 0}</div>
                            <div>Protein: {recipe.nutritionInfo?.protein || 0}g</div>
                            <div>Carbs: {recipe.nutritionInfo?.carbs || 0}g</div>
                            <div>Fat: {recipe.nutritionInfo?.fat || 0}g</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {recipe.estimatedTime} minutes
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {recipe.servings} servings
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review Section */}
                  {isPending ? (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Review Comment (Optional)
                        </label>
                        <Textarea
                          value={reviewComments[assignment._id] || ""}
                          onChange={(e) => handleCommentChange(assignment._id, e.target.value)}
                          placeholder="Add your review comments here..."
                          rows={3}
                          disabled={isSubmittingThis}
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleReviewSubmission(assignment._id, 'approved')}
                          disabled={isSubmittingThis}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSubmittingThis ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ThumbsUp className="w-4 h-4 mr-2" />
                          )}
                          Approve Recipe
                        </Button>
                        
                        <Button
                          onClick={() => handleReviewSubmission(assignment._id, 'rejected')}
                          disabled={isSubmittingThis}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {isSubmittingThis ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ThumbsDown className="w-4 h-4 mr-2" />
                          )}
                          Reject Recipe
                        </Button>
                      </div>
                    </div>
                  ) : (
                    assignment.comment && (
                      <div className="border-t pt-4">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Review Comment:</p>
                            <p className="text-sm text-gray-600 mt-1">{assignment.comment}</p>
                          </div>
                        </div>
                      </div>
                    )
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