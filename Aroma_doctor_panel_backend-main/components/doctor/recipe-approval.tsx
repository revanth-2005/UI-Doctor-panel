"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { config } from "@/lib/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageCircle,
  Utensils,
  Loader2,
  ChefHat,
  AlertCircle,
  ArrowLeft,
  Check,
  X,
  RotateCw,
  Image as ImageIcon,
  User,
  Activity
} from "lucide-react"
import { getRecipeById } from "@/lib/api/recipes"

// Types for recipe approval
interface PendingRecipe {
  id: string
  _id?: string
  recipeTitle: string
  description: string
  conditionTag: string
  ingredients: string[]
  instructions: string[]
  prepTime: number
  cookTime: number
  servings: number
  nutritionInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
  submittedBy: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
  assignmentData?: any // Keep original assignment data for updates
}

interface ReviewData {
  recipeId: string
  status: 'approved' | 'rejected'
  doctorNotes: string
  doctorId: string
}

export default function RecipeApproval() {
  const [pendingRecipes, setPendingRecipes] = useState<PendingRecipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<PendingRecipe | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [doctorId, setDoctorId] = useState<string>("")
  const [activeTab, setActiveTab] = useState<'eligible' | 'need-review'>('eligible')
  const { toast } = useToast()

  // Get doctor ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      // Map frontend doctor IDs to real MongoDB ObjectIds
      let realDoctorId = user.id || "doctor-1"

      // Map mock doctor IDs to real MongoDB doctor ObjectIds
      const doctorIdMapping: { [key: string]: string } = {
        'doctor-1': '699807109f57554e0817ac82',    // Primary Doctor ID from provided curl
        'doctor_001': '699807109f57554e0817ac82',  // Dr. John Smith -> map to real backend ID
        'doctor_002': '69148e86ab8b9f5dd9000fcd',  // Dr. Sarah Johnson
        '1': '699807109f57554e0817ac82'             // Default to user's provided ID
      }

      // Use mapped ID if available, otherwise use the real ObjectId directly
      if (doctorIdMapping[realDoctorId]) {
        realDoctorId = doctorIdMapping[realDoctorId]
      }

      console.log(`🔍 Doctor ID mapping: ${user.id} -> ${realDoctorId}`)
      setDoctorId(realDoctorId)
    }
  }, [])

  // Load pending recipes
  useEffect(() => {
    loadPendingRecipes()
  }, [])

  const loadPendingRecipes = async () => {
    setLoading(true)
    try {
      console.log(`📡 Fetching Recipe Requests from backend...`)

      // Fetch from the new recipe_request API via proxy
      const response = await fetch(`/api/doctor/recipe-requests`)
      const result = await response.json()

      if (result.success && result.data) {
        const transformedRecipes = result.data.map((req: any) => ({
          id: req._id,
          _id: req._id,
          recipeTitle: req.recipe_name || 'Unnamed Recipe',
          description: `Patient requested recipe for ${req.medical_condition || 'General Health'}`,
          conditionTag: req.medical_condition || 'General',
          ingredients: [],
          instructions: [],
          prepTime: 20,
          cookTime: 30,
          servings: 2,
          nutritionInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          // Use user_name from enriched API or fallback to ID mapping
          submittedBy: req.user_name || (req.user_id === "69982eba9f57554e0817ac84" ? "Bob" : (req.user_id || "Patient")),
          submittedAt: req.requested_at,
          status: req.status || 'pending',
          adminNotes: req.patient_details ?
            `Patient: ${req.user_name} | Phone: ${req.patient_details.phone || 'N/A'} | Condition: ${req.medical_condition}` :
            `Request ID: ${req._id}`,
          assignmentData: req
        }))

        setPendingRecipes(transformedRecipes)
      } else {
        setPendingRecipes([])
      }
    } catch (error) {
      console.error('Error loading recipe requests:', error)
      toast({
        title: "❌ Fetch Error",
        description: "Could not connect to the recipe approval backend.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReviewRecipe = async (status: 'approved' | 'rejected') => {
    if (!selectedRecipe || !reviewNotes.trim()) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please provide review notes before submitting",
        duration: 3000,
      })
      return
    }

    setSubmitting(true)
    try {
      let response;
      if (status === 'approved') {
        // Use the specialized Approval API provided by the user
        response = await fetch(`/api/doctor/recipe-approval`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: selectedRecipe.id,
            doctor_id: doctorId
          })
        })
      } else {
        // Use specialized Rejection API provided by the user
        response = await fetch(`/api/doctor/recipe-reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: selectedRecipe.id,
            doctor_id: doctorId,
            reason: reviewNotes.trim()
          })
        })
      }

      const result = await response.json()

      if (result.success) {
        setPendingRecipes(prev => prev.filter(recipe => recipe.id !== selectedRecipe.id))
        toast({
          title: "✅ Success",
          description: result.message || `Recipe ${status} successfully`,
          duration: 4000,
        })
        setShowReviewDialog(false)
        setSelectedRecipe(null)
        setReviewNotes("")
      } else {
        toast({
          title: "⚠️ Issue",
          description: result.message || "Unable to update recipe status",
          duration: 5000,
        })
      }

    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "⚠️ Connection Issue",
        description: "Please check your connection and try again",
        duration: 5000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickStatusUpdate = async (recipe: PendingRecipe, status: 'approved' | 'rejected') => {
    setLoading(true)
    try {
      let response;
      if (status === 'approved') {
        response = await fetch(`/api/doctor/recipe-approval`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: recipe.id,
            doctor_id: doctorId
          })
        })
      } else {
        response = await fetch(`/api/doctor/recipe-reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: recipe.id,
            doctor_id: doctorId,
            reason: 'Quick rejection from dashboard'
          })
        })
      }

      const result = await response.json()
      if (result.success) {
        setPendingRecipes(prev => prev.filter(r => r.id !== recipe.id))
        toast({
          title: status === 'approved' ? "✅ Recipe Approved" : "❌ Recipe Rejected",
          description: result.message || `The recipe has been marked as ${status}.`,
          duration: 3000,
        })
      } else {
        toast({ title: "Error", description: result.message || "Failed to update status", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const openReviewDialog = async (recipe: PendingRecipe) => {
    // Fetch full recipe details to ensure we have nutrition info
    try {
      let recipeId = recipe.assignmentData?.recipe_id || recipe.assignmentData?.recipeId || recipe.id;

      // Handle case where recipeId is an object (populated field)
      if (typeof recipeId === 'object' && recipeId !== null) {
        recipeId = (recipeId as any)._id || (recipeId as any).id;
      }

      // Only fetch if we have a valid ID (it's null for new recipe requests)
      if (recipeId && recipeId !== "null" && recipeId !== "undefined") {
        const result = await getRecipeById(recipeId);
        if (result.success && result.data) {
          // Merge fetched data with existing recipe data
          const nutritionData = result.data.nutritionInfo ||
            (result.data as any).nutrition ||
            recipe.nutritionInfo;

          const fullRecipe = {
            ...recipe,
            nutritionInfo: nutritionData,
            ingredients: result.data.ingredients || recipe.ingredients,
            instructions: result.data.instructions || recipe.instructions
          };
          setSelectedRecipe(fullRecipe);
        } else {
          setSelectedRecipe(recipe);
        }
      } else {
        // For new requests with no recipe selected yet
        setSelectedRecipe({
          ...recipe,
          ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : ["No ingredients provided for this request"],
          instructions: recipe.instructions.length > 0 ? recipe.instructions : ["Doctor needs to assign a recipe or provide instructions"]
        });
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      setSelectedRecipe(recipe);
    }

    setReviewNotes("")
    setShowReviewDialog(true)
  }

  const openViewDialog = async (recipe: PendingRecipe) => {
    // Similar logic for View Dialog
    try {
      let recipeId = recipe.assignmentData?.recipe_id || recipe.assignmentData?.recipeId || recipe.id;
      if (typeof recipeId === 'object' && recipeId !== null) {
        recipeId = (recipeId as any)._id || (recipeId as any).id;
      }

      if (recipeId && recipeId !== "null" && recipeId !== "undefined") {
        const result = await getRecipeById(recipeId);
        if (result.success && result.data) {
          const nutritionData = result.data.nutritionInfo ||
            (result.data as any).nutrition ||
            recipe.nutritionInfo;

          const fullRecipe = {
            ...recipe,
            nutritionInfo: nutritionData,
            ingredients: result.data.ingredients || recipe.ingredients,
            instructions: result.data.instructions || recipe.instructions
          };
          setSelectedRecipe(fullRecipe);
        } else {
          setSelectedRecipe(recipe);
        }
      } else {
        setSelectedRecipe({
          ...recipe,
          ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : ["No ingredients provided for this request"],
          instructions: recipe.instructions.length > 0 ? recipe.instructions : ["Doctor needs to assign a recipe or provide instructions"]
        });
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      setSelectedRecipe(recipe);
    }

    setShowViewDialog(true)
  }

  // Filter recipes based on search
  const filteredRecipes = pendingRecipes.filter(recipe =>
    recipe.recipeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.conditionTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getConditionBadgeColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'diabetes':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'hypertension':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'heart disease':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Recipe Approval Queue Header */}
        <div className="mb-2">
          <h2 className="text-2xl font-extrabold text-[#111827]">Recipe Approval Queue</h2>
        </div>

        {/* Pending Recipes Queue - Full Width Single Column */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <span className="ml-4 text-slate-500 font-bold text-lg">Fetching recipes...</span>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <ChefHat className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-extrabold text-xl">No recipes in queue</p>
              <p className="text-slate-400 font-medium text-sm mt-1">All submissions have been processed</p>
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="p-0 overflow-hidden border-[#cbd5e1] shadow-none hover:shadow-lg transition-all group bg-white rounded-2xl border">
                <div className="flex h-full min-h-[160px]">
                  {/* Left side: Premium Image Placeholder */}
                  <div className="w-32 sm:w-40 bg-[#f8fafc] flex items-center justify-center border-r border-[#cbd5e1] shrink-0">
                    <ImageIcon className="h-10 w-10 text-slate-300" />
                  </div>

                  {/* Right side: Detailed Content & Actions */}
                  <div className="flex-1 p-6 flex items-center justify-between">
                    <div className="space-y-2">
                      {/* Recipe Title - Extra Bold */}
                      <h3 className="text-xl font-extrabold text-[#111827] leading-tight">
                        {recipe.recipeTitle}
                      </h3>

                      {/* Patient & Condition Details */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full border border-blue-100" title={`ID: ${recipe.assignmentData?.user_id || recipe.assignmentData?.userId || 'N/A'}`}>
                          <User className="w-3 h-3 text-blue-500" />
                          <span className="text-[11px] font-black text-blue-700 uppercase tracking-tight">
                            Patient: {recipe.submittedBy}
                            {recipe.assignmentData?.patient_details?.age && ` | ${recipe.assignmentData.patient_details.age}Y`}
                            {recipe.assignmentData?.patient_details?.gender && ` | ${recipe.assignmentData.patient_details.gender}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          <Activity className="w-3 h-3 text-emerald-500" />
                          <span className="text-[11px] font-black text-emerald-700 uppercase tracking-tight">Condition: {recipe.conditionTag}</span>
                        </div>
                      </div>

                      {/* Clinical Note / Patient Info */}
                      <div className="text-sm text-slate-400 font-medium max-w-2xl">
                        <span className="font-extrabold text-slate-500 italic">Details: </span>
                        {recipe.assignmentData?.patient_details ? (
                          <span className="text-slate-600 font-bold">
                            {recipe.assignmentData.patient_details.phone && `📱 ${recipe.assignmentData.patient_details.phone}`}
                            {recipe.assignmentData.patient_details.email && ` | 📧 ${recipe.assignmentData.patient_details.email}`}
                            {recipe.assignmentData.patient_details.address && ` | 📍 ${recipe.assignmentData.patient_details.address}`}
                          </span>
                        ) : (
                          recipe.adminNotes || "No additional patient details available"
                        )}
                      </div>
                    </div>

                    {/* Circular Primary Actions (Larger click targets) */}
                    <div className="flex items-center gap-4 pl-6 shrink-0">
                      <button
                        onClick={() => handleQuickStatusUpdate(recipe, 'approved')}
                        disabled={loading}
                        className="w-11 h-11 rounded-full border-2 border-[#14b8a6] bg-white flex items-center justify-center text-[#14b8a6] hover:bg-[#14b8a6] hover:text-white transition-all shadow-sm disabled:opacity-50"
                        title="Approve"
                      >
                        <Check className="h-6 w-6" strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => handleQuickStatusUpdate(recipe, 'rejected')}
                        disabled={loading}
                        className="w-11 h-11 rounded-full border-2 border-[#f43f5e] bg-white flex items-center justify-center text-[#f43f5e] hover:bg-[#f43f5e] hover:text-white transition-all shadow-sm disabled:opacity-50"
                        title="Reject"
                      >
                        <X className="h-6 w-6" strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => loadPendingRecipes()}
                        className="w-11 h-11 rounded-full border-2 border-[#f59e0b] bg-white flex items-center justify-center text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white transition-all shadow-sm"
                        title="Refresh"
                      >
                        <RotateCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* View Recipe Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-blue-600" />
              Recipe Details
            </DialogTitle>
            <DialogDescription>
              Review the complete recipe information before approval
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 overflow-x-hidden">
            {selectedRecipe && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedRecipe.recipeTitle}</h3>
                  <p className="text-gray-600 mb-3">{selectedRecipe.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge className={`${getConditionBadgeColor(selectedRecipe.conditionTag)} border`}>
                      {selectedRecipe.conditionTag}
                    </Badge>
                    <span className="text-gray-700">Prep: {selectedRecipe.prepTime}min</span>
                    <span className="text-gray-700">Cook: {selectedRecipe.cookTime}min</span>
                    <span className="text-gray-700">Serves: {selectedRecipe.servings}</span>
                  </div>
                </div>

                {/* Nutrition Info */}
                {selectedRecipe.nutritionInfo && (
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                      <h4 className="font-semibold text-gray-900">
                        Nutrition Information <span className="text-xs font-normal text-gray-500 ml-1">(per serving)</span>
                      </h4>
                    </div>
                    {Object.keys(selectedRecipe.nutritionInfo).length > 0 ? (
                      <div className="w-full overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
                        <div className="flex gap-3">
                          {Object.entries(selectedRecipe.nutritionInfo).map(([key, value]) => (
                            (value !== undefined && value !== null) && (
                              <div key={key} className="flex-shrink-0 min-w-[120px] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center group">
                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mb-2 group-hover:bg-orange-100 transition-colors">
                                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                </div>
                                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 text-center">
                                  {key.replace(/_/g, ' ')}
                                </div>
                                <div className="flex items-baseline">
                                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                                    {value}
                                  </span>
                                  <span className="text-xs font-medium text-gray-400 ml-1">
                                    {key.toLowerCase().includes('calories') ? 'kcal' : 'g'}
                                  </span>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center border border-dashed border-gray-200">
                        <p className="text-gray-500 italic">No nutrition information available for this recipe.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                    Ingredients
                  </h4>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient: any, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {typeof ingredient === 'string' ? ingredient : `${ingredient.amount || ''} ${ingredient.unit || ''} ${ingredient.name}`}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Notes for the Doctor */}
                {selectedRecipe.adminNotes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                      Notes for the Doctor
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm text-gray-700">
                      {selectedRecipe.adminNotes}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50 shrink-0">
            <Button
              onClick={() => setShowViewDialog(false)}
              variant="outline"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowViewDialog(false)
                if (selectedRecipe) openReviewDialog(selectedRecipe)
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Review Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Recipe Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-orange-600" />
              Review Recipe
            </DialogTitle>
            <DialogDescription>
              Provide your professional review for this recipe suggestion
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedRecipe && (
              <div className="space-y-4">
                {/* Recipe Summary */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900">{selectedRecipe.recipeTitle}</h4>
                  <p className="text-sm text-gray-600 mt-1">{selectedRecipe.description}</p>
                  <Badge className={`${getConditionBadgeColor(selectedRecipe.conditionTag)} border mt-2`}>
                    {selectedRecipe.conditionTag}
                  </Badge>
                </div>

                {/* Nutrition Info Preview */}
                {selectedRecipe.nutritionInfo && (
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Nutrition Information (per serving)
                    </h5>
                    {Object.keys(selectedRecipe.nutritionInfo).length > 0 ? (
                      <div className="w-full overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
                        <div className="flex gap-2">
                          {Object.entries(selectedRecipe.nutritionInfo).map(([key, value]) => (
                            (value !== undefined && value !== null) && (
                              <div key={key} className="flex-shrink-0 min-w-[90px] bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                                <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5 text-center">
                                  {key.replace(/_/g, ' ')}
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  {value}<span className="text-[10px] font-normal text-gray-500 ml-0.5">{key.toLowerCase().includes('calories') ? 'kcal' : 'g'}</span>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded text-center border border-dashed border-gray-200">
                        <p className="text-xs text-gray-500 italic">No nutrition information available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes for the Doctor Preview */}
                {selectedRecipe.adminNotes && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <h5 className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-1">
                      Notes for the Doctor
                    </h5>
                    <p className="text-sm text-yellow-800">
                      {selectedRecipe.adminNotes}
                    </p>
                  </div>
                )}

                {/* Review Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Provide detailed feedback about the recipe's suitability for the medical condition, nutritional value, safety considerations, and any suggested modifications..."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your review will be sent to the admin for final decision
                  </p>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Medical Review Required</p>
                    <p className="text-amber-700 mt-1">
                      Please ensure this recipe is medically appropriate for the specified condition before approval.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50 shrink-0">
            <Button
              onClick={() => {
                setShowReviewDialog(false)
                setSelectedRecipe(null)
                setReviewNotes("")
              }}
              variant="outline"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleReviewRecipe('rejected')}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              disabled={submitting || !reviewNotes.trim()}
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Reject
            </Button>
            <Button
              onClick={() => handleReviewRecipe('approved')}
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting || !reviewNotes.trim()}
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}