"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Eye, Activity, Loader2 } from "lucide-react"
import { Condition, CreateConditionRequest, Macronutrients, Micronutrients } from "@/lib/types/conditions"
import {
  fetchConditions as apiFetchConditions,
  createCondition as apiCreateCondition,
  updateCondition as apiUpdateCondition,
  deleteCondition as apiDeleteCondition
} from "@/lib/api/conditions"

// Form data interface for simplified form
interface FormData {
  conditionName: string
  description: string
  protein: string
  carbs: string
  fat: string
  fiber: string
  calories: string
  sodium: string
  potassium: string
  calcium: string
  zinc: string
  magnesium: string
  iron: string
  vitamin_b12: string
  vitamin_d: string
  vitamin_c: string
  folate: string
}

const initialFormData: FormData = {
  conditionName: "",
  description: "",
  protein: "",
  carbs: "",
  fat: "",
  fiber: "",
  calories: "",
  sodium: "",
  potassium: "",
  calcium: "",
  zinc: "",
  magnesium: "",
  iron: "",
  vitamin_b12: "",
  vitamin_d: "",
  vitamin_c: "",
  folate: ""
}

export default function ConditionsManagement() {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null)
  const [conditionToDelete, setConditionToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { toast } = useToast()

  // Load conditions on component mount
  useEffect(() => {
    loadConditions()
  }, [])

  const loadConditions = async () => {
    setFetching(true)
    try {
      console.log('🔍 Loading conditions from MongoDB backend...')

      const response = await fetch('https://aroma-db-six.vercel.app/api/condition/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`)
      }

      const result = await response.json()
      console.log('📋 Backend conditions response:', result)

      if (result.success && result.conditions) {
        // Map backend data to frontend format
        const mappedConditions: Condition[] = result.conditions.map((condition: any) => ({
          id: condition._id,
          conditionName: condition.name, // Backend uses 'name', frontend uses 'conditionName'
          description: condition.description,
          macronutrients: condition.macros ? {
            calories: condition.macros.calories,
            protein: condition.macros.protein,
            carbs: condition.macros.carbs,
            fat: condition.macros.fat,
            fiber: condition.macros.fiber
          } : undefined,
          micronutrients: condition.micros ? {
            sodium: condition.micros.sodium,
            potassium: condition.micros.potassium,
            calcium: condition.micros.calcium,
            zinc: condition.micros.zinc,
            magnesium: condition.micros.magnesium,
            iron: condition.micros.iron,
            vitamin_b12: condition.micros.vitamin_b12,
            vitamin_d: condition.micros.vitamin_d,
            vitamin_c: condition.micros.vitamin_c,
            folate: condition.micros.folate
          } : undefined
        }))

        console.log(`✅ Loaded ${mappedConditions.length} conditions from MongoDB database`)
        setConditions(mappedConditions)
      } else {
        console.error('Invalid conditions response:', result)
        setConditions([])
        toast({
          title: "❌ Database Error",
          description: result.message || "Failed to load conditions from database",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error loading conditions:', error)
      setConditions([])
      toast({
        title: "❌ Connection Error",
        description: "Failed to connect to conditions database",
        variant: "destructive",
        duration: 5000,
      })
    }
    setFetching(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare the condition data for backend API
      const conditionData: any = {
        name: formData.conditionName.trim(), // Backend expects 'name'
        description: formData.description.trim() || undefined,
      }

      // Add macronutrients if any are provided (backend expects 'macros')
      const macros: any = {}
      if (formData.protein) macros.protein = parseFloat(formData.protein)
      if (formData.carbs) macros.carbs = parseFloat(formData.carbs)
      if (formData.fat) macros.fat = parseFloat(formData.fat)
      if (formData.fiber) macros.fiber = parseFloat(formData.fiber)
      if (formData.calories) macros.calories = parseFloat(formData.calories)

      if (Object.keys(macros).length > 0) {
        conditionData.macros = macros
      }

      // Add micronutrients if any are provided (backend expects 'micros')
      const micros: any = {}
      if (formData.sodium) micros.sodium = parseFloat(formData.sodium)
      if (formData.potassium) micros.potassium = parseFloat(formData.potassium)
      if (formData.calcium) micros.calcium = parseFloat(formData.calcium)
      if (formData.zinc) micros.zinc = parseFloat(formData.zinc)
      if (formData.magnesium) micros.magnesium = parseFloat(formData.magnesium)
      if (formData.iron) micros.iron = parseFloat(formData.iron)
      if (formData.vitamin_b12) micros.vitamin_b12 = parseFloat(formData.vitamin_b12)
      if (formData.vitamin_d) micros.vitamin_d = parseFloat(formData.vitamin_d)
      if (formData.vitamin_c) micros.vitamin_c = parseFloat(formData.vitamin_c)
      if (formData.folate) micros.folate = parseFloat(formData.folate)

      if (Object.keys(micros).length > 0) {
        conditionData.micros = micros
      }

      if (selectedCondition) {
        // UPDATE existing condition
        console.log('🔄 Updating condition:', selectedCondition.id, conditionData)

        const response = await fetch(`https://aroma-db-six.vercel.app/api/condition/${selectedCondition.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(conditionData),
        })

        if (response.ok) {
          const result = await response.json()
          toast({
            title: "✅ Condition Updated",
            description: `${conditionData.name} has been successfully updated`,
            variant: "default",
            duration: 4000,
          })
          await loadConditions() // Reload from backend
          resetForm()
        } else {
          const errorData = await response.json()
          toast({
            title: "❌ Update Failed",
            description: errorData.message || "Unable to update condition. Please try again.",
            variant: "destructive",
            duration: 5000,
          })
        }
      } else {
        // CREATE new condition
        console.log('➕ Creating condition:', conditionData)

        const response = await fetch('https://aroma-db-six.vercel.app/api/condition/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(conditionData),
        })

        if (response.ok) {
          const result = await response.json()
          toast({
            title: "✅ Condition Created",
            description: `${conditionData.name} has been successfully created`,
            variant: "default",
            duration: 4000,
          })
          await loadConditions() // Reload from backend
          resetForm()
        } else {
          const errorData = await response.json()
          toast({
            title: "❌ Creation Failed",
            description: errorData.message || "Unable to create condition. Please check the information and try again.",
            variant: "destructive",
            duration: 5000,
          })
        }
      }
    } catch (error) {
      console.error('Error submitting condition:', error)
      toast({
        title: "❌ Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (condition: Condition) => {
    setFormData({
      conditionName: condition.conditionName,
      description: condition.description || "",
      protein: condition.macronutrients?.protein?.toString() || "",
      carbs: condition.macronutrients?.carbs?.toString() || "",
      fat: condition.macronutrients?.fat?.toString() || "",
      fiber: condition.macronutrients?.fiber?.toString() || "",
      calories: condition.macronutrients?.calories?.toString() || "",
      sodium: condition.micronutrients?.sodium?.toString() || "",
      potassium: condition.micronutrients?.potassium?.toString() || "",
      calcium: condition.micronutrients?.calcium?.toString() || "",
      zinc: condition.micronutrients?.zinc?.toString() || "",
      magnesium: condition.micronutrients?.magnesium?.toString() || "",
      iron: condition.micronutrients?.iron?.toString() || "",
      vitamin_b12: condition.micronutrients?.vitamin_b12?.toString() || "",
      vitamin_d: condition.micronutrients?.vitamin_d?.toString() || "",
      vitamin_c: condition.micronutrients?.vitamin_c?.toString() || "",
      folate: condition.micronutrients?.folate?.toString() || "",
    })
    setSelectedCondition(condition)
    setShowEditDialog(true)
  }

  const handleView = (condition: Condition) => {
    setSelectedCondition(condition)
    setShowViewDialog(true)
  }

  const handleDelete = async () => {
    if (!conditionToDelete) return

    try {
      const conditionName = conditions.find(c => c.id === conditionToDelete)?.conditionName

      const response = await fetch(`https://aroma-db-six.vercel.app/api/condition/${conditionToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "✅ Condition Deleted",
          description: `${conditionName || 'Condition'} has been successfully removed from the system`,
          variant: "default",
          duration: 4000,
        })
        await loadConditions() // Reload from backend
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Delete Failed",
          description: errorData.message || "Unable to delete condition. Please try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error deleting condition:', error)
      toast({
        title: "❌ Connection Error",
        description: "Failed to connect to the server. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setShowDeleteDialog(false)
      setConditionToDelete(null)
    }
  }

  const confirmDelete = (conditionId: string) => {
    setConditionToDelete(conditionId)
    setShowDeleteDialog(true)
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setSelectedCondition(null)
    setShowAddForm(false)
    setShowEditDialog(false)
    setShowViewDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">Medical Conditions</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Manage medical conditions and their nutritional guidelines</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-xs"
          disabled={loading}
        >
          + Add Condition
        </Button>
      </div>

      {/* Conditions List */}
      <div className="space-y-4">
        {fetching ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading conditions...</span>
          </div>
        ) : conditions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No conditions found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first medical condition.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conditions.map((condition) => (
              <Card key={condition.id} className="p-6 border-[#cbd5e1] shadow-none hover:shadow-md transition-all bg-white rounded-2xl group border">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-[#111827] group-hover:text-blue-600 transition-colors">
                      {condition.conditionName}
                    </h3>
                    {condition.description && (
                      <p className="text-xs font-medium text-slate-500 line-clamp-3 leading-relaxed">
                        {condition.description}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <Button
                      onClick={() => handleView(condition)}
                      variant="outline"
                      className="h-9 border-blue-200 text-blue-600 font-bold text-xs px-4 rounded-lg hover:bg-blue-50"
                    >
                      <Eye size={14} className="mr-2" />
                      Details
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(condition)}
                        variant="outline"
                        className="h-9 w-9 p-0 border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        onClick={() => confirmDelete(condition.id)}
                        variant="outline"
                        className="h-9 w-9 p-0 border-red-100 text-red-500 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Condition Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Add New Medical Condition
            </DialogTitle>
            <DialogDescription>
              Create a new medical condition with nutritional guidelines.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.conditionName}
                    onChange={(e) => setFormData({ ...formData, conditionName: e.target.value })}
                    placeholder="e.g., Diabetes Type 2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the condition"
                  />
                </div>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Macronutrients (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    placeholder="65"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiber (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="2000"
                  />
                </div>
              </div>
            </div>

            {/* Micronutrients */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Micronutrients (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sodium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.sodium}
                    onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                    placeholder="2000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calcium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.calcium}
                    onChange={(e) => setFormData({ ...formData, calcium: e.target.value })}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Iron (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.iron}
                    onChange={(e) => setFormData({ ...formData, iron: e.target.value })}
                    placeholder="18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vitamin B12 (µg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vitamin_b12}
                    onChange={(e) => setFormData({ ...formData, vitamin_b12: e.target.value })}
                    placeholder="2.4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vitamin D (IU)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vitamin_d}
                    onChange={(e) => setFormData({ ...formData, vitamin_d: e.target.value })}
                    placeholder="600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vitamin C (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vitamin_c}
                    onChange={(e) => setFormData({ ...formData, vitamin_c: e.target.value })}
                    placeholder="90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Folate (µg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.folate}
                    onChange={(e) => setFormData({ ...formData, folate: e.target.value })}
                    placeholder="400"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => resetForm()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Condition
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Condition Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-green-600" />
              Edit Medical Condition
            </DialogTitle>
            <DialogDescription>
              Update the medical condition and its nutritional guidelines.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.conditionName}
                    onChange={(e) => setFormData({ ...formData, conditionName: e.target.value })}
                    placeholder="e.g., Diabetes Type 2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the condition"
                  />
                </div>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Macronutrients (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    placeholder="65"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiber (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="2000"
                  />
                </div>
              </div>
            </div>

            {/* Micronutrients */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Micronutrients (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sodium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.sodium}
                    onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                    placeholder="1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                    placeholder="2000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calcium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.calcium}
                    onChange={(e) => setFormData({ ...formData, calcium: e.target.value })}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Iron (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.iron}
                    onChange={(e) => setFormData({ ...formData, iron: e.target.value })}
                    placeholder="18"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vitamin B12 (µg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vitamin_b12}
                    onChange={(e) => setFormData({ ...formData, vitamin_b12: e.target.value })}
                    placeholder="2.4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vitamin D (IU)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vitamin_d}
                    onChange={(e) => setFormData({ ...formData, vitamin_d: e.target.value })}
                    placeholder="600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vitamin C (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vitamin_c}
                    onChange={(e) => setFormData({ ...formData, vitamin_c: e.target.value })}
                    placeholder="90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Folate (µg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.folate}
                    onChange={(e) => setFormData({ ...formData, folate: e.target.value })}
                    placeholder="400"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => resetForm()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Condition
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Condition Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Condition Details
            </DialogTitle>
            <DialogDescription>
              View detailed nutritional guidelines for this medical condition.
            </DialogDescription>
          </DialogHeader>

          {selectedCondition && (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedCondition.conditionName}</h3>
                {selectedCondition.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedCondition.description}</p>
                )}
              </div>

              {/* Macronutrients - Only show if any are specified */}
              {(selectedCondition.macronutrients && Object.values(selectedCondition.macronutrients).some(value => value !== undefined && value !== null && value !== 0)) && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <span className="text-sm">🍎</span>
                    <span>Macronutrients (Daily Recommended Values)</span>
                  </h4>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                    {selectedCondition.macronutrients?.protein && selectedCondition.macronutrients.protein > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center min-w-[120px]">
                        <div className="text-xs font-medium text-green-700 mb-1">Protein</div>
                        <div className="text-lg font-bold text-green-600">
                          {selectedCondition.macronutrients.protein}<span className="text-xs ml-0.5">g</span>
                        </div>
                      </div>
                    )}
                    {selectedCondition.macronutrients?.carbs && selectedCondition.macronutrients.carbs > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center min-w-[120px]">
                        <div className="text-xs font-medium text-blue-700 mb-1">Carbohydrates</div>
                        <div className="text-lg font-bold text-blue-600">
                          {selectedCondition.macronutrients.carbs}<span className="text-xs ml-0.5">g</span>
                        </div>
                      </div>
                    )}
                    {selectedCondition.macronutrients?.fat && selectedCondition.macronutrients.fat > 0 && (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center min-w-[120px]">
                        <div className="text-xs font-medium text-yellow-700 mb-1">Fat</div>
                        <div className="text-lg font-bold text-yellow-600">
                          {selectedCondition.macronutrients.fat}<span className="text-xs ml-0.5">g</span>
                        </div>
                      </div>
                    )}
                    {selectedCondition.macronutrients?.fiber && selectedCondition.macronutrients.fiber > 0 && (
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center min-w-[120px]">
                        <div className="text-xs font-medium text-orange-700 mb-1">Fiber</div>
                        <div className="text-lg font-bold text-orange-600">
                          {selectedCondition.macronutrients.fiber}<span className="text-xs ml-0.5">g</span>
                        </div>
                      </div>
                    )}
                    {selectedCondition.macronutrients?.calories && selectedCondition.macronutrients.calories > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center min-w-[120px]">
                        <div className="text-xs font-medium text-red-700 mb-1">Calories</div>
                        <div className="text-lg font-bold text-red-600">
                          {selectedCondition.macronutrients.calories}<span className="text-xs ml-0.5">kcal</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Micronutrients - Only show if any are specified */}
              {(selectedCondition.micronutrients && Object.values(selectedCondition.micronutrients).some(value => value !== undefined && value !== null)) && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <span className="text-sm">🧪</span>
                    <span>Micronutrients (Vitamins & Minerals)</span>
                  </h4>

                  {/* Minerals Section - Only show if any minerals are specified */}
                  {(selectedCondition.micronutrients?.sodium !== undefined && selectedCondition.micronutrients.sodium !== null ||
                    selectedCondition.micronutrients?.potassium !== undefined && selectedCondition.micronutrients.potassium !== null ||
                    selectedCondition.micronutrients?.calcium !== undefined && selectedCondition.micronutrients.calcium !== null ||
                    selectedCondition.micronutrients?.zinc !== undefined && selectedCondition.micronutrients.zinc !== null ||
                    selectedCondition.micronutrients?.magnesium !== undefined && selectedCondition.micronutrients.magnesium !== null ||
                    selectedCondition.micronutrients?.iron !== undefined && selectedCondition.micronutrients.iron !== null) && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">Minerals</h5>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3">
                          {(selectedCondition.micronutrients?.sodium !== undefined && selectedCondition.micronutrients.sodium !== null) && (
                            <div className="bg-purple-50 p-3 rounded border border-purple-200 text-center min-w-[100px]">
                              <div className="text-xs font-medium text-purple-700 mb-1">Sodium</div>
                              <div className="text-sm font-bold text-purple-600">
                                {selectedCondition.micronutrients.sodium}<span className="text-xs ml-0.5">mg</span>
                              </div>
                            </div>
                          )}
                          {(selectedCondition.micronutrients?.potassium !== undefined && selectedCondition.micronutrients.potassium !== null) && (
                            <div className="bg-purple-50 p-3 rounded border border-purple-200 text-center min-w-[100px]">
                              <div className="text-xs font-medium text-purple-700 mb-1">Potassium</div>
                              <div className="text-sm font-bold text-purple-600">
                                {selectedCondition.micronutrients.potassium}<span className="text-xs ml-0.5">mg</span>
                              </div>
                            </div>
                          )}
                          {(selectedCondition.micronutrients?.calcium !== undefined && selectedCondition.micronutrients.calcium !== null) && (
                            <div className="bg-purple-50 p-3 rounded border border-purple-200 text-center min-w-[100px]">
                              <div className="text-xs font-medium text-purple-700 mb-1">Calcium</div>
                              <div className="text-sm font-bold text-purple-600">
                                {selectedCondition.micronutrients.calcium}<span className="text-xs ml-0.5">mg</span>
                              </div>
                            </div>
                          )}
                          {(selectedCondition.micronutrients?.zinc !== undefined && selectedCondition.micronutrients.zinc !== null) && (
                            <div className="bg-purple-50 p-3 rounded border border-purple-200 text-center min-w-[100px]">
                              <div className="text-xs font-medium text-purple-700 mb-1">Zinc</div>
                              <div className="text-sm font-bold text-purple-600">
                                {selectedCondition.micronutrients.zinc}<span className="text-xs ml-0.5">mg</span>
                              </div>
                            </div>
                          )}
                          {(selectedCondition.micronutrients?.magnesium !== undefined && selectedCondition.micronutrients.magnesium !== null) && (
                            <div className="bg-purple-50 p-3 rounded border border-purple-200 text-center min-w-[100px]">
                              <div className="text-xs font-medium text-purple-700 mb-1">Magnesium</div>
                              <div className="text-sm font-bold text-purple-600">
                                {selectedCondition.micronutrients.magnesium}<span className="text-xs ml-0.5">mg</span>
                              </div>
                            </div>
                          )}
                          {(selectedCondition.micronutrients?.iron !== undefined && selectedCondition.micronutrients.iron !== null) && (
                            <div className="bg-purple-50 p-3 rounded border border-purple-200 text-center min-w-[100px]">
                              <div className="text-xs font-medium text-purple-700 mb-1">Iron</div>
                              <div className="text-sm font-bold text-purple-600">
                                {selectedCondition.micronutrients.iron}<span className="text-xs ml-0.5">mg</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Vitamins Section - Only show if any vitamins are specified */}
                  {(selectedCondition.micronutrients?.vitamin_b12 !== undefined && selectedCondition.micronutrients.vitamin_b12 !== null ||
                    selectedCondition.micronutrients?.vitamin_d !== undefined && selectedCondition.micronutrients.vitamin_d !== null ||
                    selectedCondition.micronutrients?.vitamin_c !== undefined && selectedCondition.micronutrients.vitamin_c !== null ||
                    selectedCondition.micronutrients?.folate !== undefined && selectedCondition.micronutrients.folate !== null) && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">Vitamins</h5>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                          {(selectedCondition.micronutrients?.vitamin_b12 !== undefined && selectedCondition.micronutrients.vitamin_b12 !== null) && (
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-200 text-center min-w-[120px]">
                              <div className="text-xs font-medium text-indigo-700 mb-1">Vitamin B12</div>
                              <div className="text-sm font-bold text-indigo-600">
                                {selectedCondition.micronutrients.vitamin_b12}<span className="text-xs ml-0.5">µg</span>
                              </div>
                            </div>
                          )}
                          {(selectedCondition.micronutrients?.vitamin_d !== undefined && selectedCondition.micronutrients.vitamin_d !== null) && (
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-200 text-center min-w-[120px]">
                              <div className="text-xs font-medium text-indigo-700 mb-1">Vitamin D</div>
                              <div className="text-sm font-bold text-indigo-600">
                                {selectedCondition.micronutrients.vitamin_d}<span className="text-xs ml-0.5">IU</span>
                              </div>
                            </div>
                          )}
                          {(selectedCondition.micronutrients?.vitamin_c !== undefined && selectedCondition.micronutrients.vitamin_c !== null) && (
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-200 text-center min-w-[120px]">
                              <div className="text-xs font-medium text-indigo-700 mb-1">Vitamin C</div>
                              <div className="text-sm font-bold text-indigo-600">
                                {selectedCondition.micronutrients.vitamin_c}<span className="text-xs ml-0.5">mg</span>
                              </div>
                            </div>
                          )}
                          {(selectedCondition.micronutrients?.folate !== undefined && selectedCondition.micronutrients.folate !== null) && (
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-200 text-center min-w-[120px]">
                              <div className="text-xs font-medium text-indigo-700 mb-1">Folate</div>
                              <div className="text-sm font-bold text-indigo-600">
                                {selectedCondition.micronutrients.folate}<span className="text-xs ml-0.5">µg</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Show message if no nutritional data is available */}
              {(!selectedCondition.macronutrients || !Object.values(selectedCondition.macronutrients).some(value => value !== undefined && value !== null)) &&
                (!selectedCondition.micronutrients || !Object.values(selectedCondition.micronutrients).some(value => value !== undefined && value !== null)) && (
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
                    <div className="text-gray-400 text-2xl mb-2">📊</div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">No Nutritional Guidelines Set</h5>
                    <p className="text-xs text-gray-500">
                      No specific nutritional values have been configured for this condition.
                      Use the Edit button to add recommended daily values.
                    </p>
                  </div>
                )}

              {/* Clinical Guidelines */}
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h5 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-1">
                  <span className="text-xs">📋</span>
                  Clinical Guidelines
                </h5>
                <p className="text-blue-800 text-xs leading-relaxed">
                  These values represent recommended daily nutritional targets for patients with {selectedCondition.conditionName}.
                  Adjust individual patient recommendations based on their specific needs, medical history, and other factors.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Medical Condition
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete <span className="font-semibold">
                {conditions.find(c => c.id === conditionToDelete)?.conditionName}
              </span>?
              This action will permanently remove the condition and all its nutritional guidelines.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false)
                setConditionToDelete(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Condition
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}