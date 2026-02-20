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
import { Plus, Trash2, Edit2, Eye, Loader2, Activity } from "lucide-react"
import { Condition, CreateConditionRequest, Macronutrients, Micronutrients } from "@/lib/types/conditions"
import { 
  fetchConditions as apieFetchConditions, 
  createCondition as apiCreateCondition, 
  updateCondition as apiUpdateCondition, 
  deleteCondition as apiDeleteCondition 
} from "@/lib/api/conditions"

interface FormData {
  conditionName: string
  description: string
  // Macronutrients
  protein: string
  carbs: string
  fat: string
  fiber: string
  calories: string
  // Micronutrients
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
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [conditionToDelete, setConditionToDelete] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { toast } = useToast()

  // Load conditions on component mount
  useEffect(() => {
    loadConditions()
  }, [])

  const loadConditions = async () => {
    setFetching(true)
    const result = await apieFetchConditions()
    
    if (result.success && result.data) {
      setConditions(result.data)
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive"
      })
    }
    setFetching(false)
  }

  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare the condition data
      const conditionData: CreateConditionRequest = {
        conditionName: formData.conditionName.trim(),
        description: formData.description.trim() || undefined,
      }

      // Add macronutrients if any are provided
      const macronutrients: Macronutrients = {}
      if (formData.protein) macronutrients.protein = parseFloat(formData.protein)
      if (formData.carbs) macronutrients.carbs = parseFloat(formData.carbs)
      if (formData.fat) macronutrients.fat = parseFloat(formData.fat)
      if (formData.fiber) macronutrients.fiber = parseFloat(formData.fiber)
      if (formData.calories) macronutrients.calories = parseFloat(formData.calories)
      
      if (Object.keys(macronutrients).length > 0) {
        conditionData.macronutrients = macronutrients
      }

      // Add micronutrients if any are provided
      const micronutrients: Micronutrients = {}
      if (formData.sodium) micronutrients.sodium = parseFloat(formData.sodium)
      if (formData.potassium) micronutrients.potassium = parseFloat(formData.potassium)
      if (formData.calcium) micronutrients.calcium = parseFloat(formData.calcium)
      if (formData.zinc) micronutrients.zinc = parseFloat(formData.zinc)
      if (formData.magnesium) micronutrients.magnesium = parseFloat(formData.magnesium)
      if (formData.iron) micronutrients.iron = parseFloat(formData.iron)
      if (formData.vitamin_b12) micronutrients.vitamin_b12 = parseFloat(formData.vitamin_b12)
      if (formData.vitamin_d) micronutrients.vitamin_d = parseFloat(formData.vitamin_d)
      if (formData.vitamin_c) micronutrients.vitamin_c = parseFloat(formData.vitamin_c)
      if (formData.folate) micronutrients.folate = parseFloat(formData.folate)
      
      if (Object.keys(micronutrients).length > 0) {
        conditionData.micronutrients = micronutrients
      }

      // Create or update the condition
      const result = editingId 
        ? await apiUpdateCondition(editingId, conditionData)
        : await apiCreateCondition(conditionData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        
        // Refresh the conditions list
        await loadConditions()
        
        // Reset form
        setFormData(initialFormData)
        setShowForm(false)
        setEditingId(null)
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
      setLoading(false)
    }
  }

  const handleEditCondition = (condition: Condition) => {
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
    setEditingId(condition.id)
    setShowForm(true)
  }

  const handleDeleteCondition = async () => {
    if (!conditionToDelete) return
    
    try {
      const result = await apiDeleteCondition(conditionToDelete)
      
      if (result.success) {
        setConditions(conditions.filter((c) => c.id !== conditionToDelete))
        toast({
          title: "Success",
          description: result.message,
        })
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
        description: "Failed to delete condition",
        variant: "destructive"
      })
    } finally {
      setShowDeleteDialog(false)
      setConditionToDelete(null)
    }
  }

  const confirmDeleteCondition = (id: string) => {
    setConditionToDelete(id)
    setShowDeleteDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Medical Conditions</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData(initialFormData)
          }}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
          disabled={loading}
        >
          <Plus size={20} />
          Add Condition
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 shadow-lg">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600" />
              {editingId ? 'Edit Medical Condition' : 'Add New Medical Condition'}
            </h3>
            <p className="text-gray-600 mt-1">Define nutritional guidelines for medical conditions</p>
          </div>
          
          <form onSubmit={handleAddCondition} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">1</span>
                </div>
                <h4 className="font-semibold text-gray-900">Basic Information</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-10">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Condition Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.conditionName}
                    onChange={(e) => setFormData({ ...formData, conditionName: e.target.value })}
                    placeholder="e.g., Diabetes Type 2, Hypertension"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Description</label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the condition"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Macronutrients */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <h4 className="font-semibold text-gray-900">Macronutrients (Optional)</h4>
                <span className="text-sm text-gray-500">- Daily recommended values</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 ml-10">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-green-700">Protein (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    placeholder="50"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-700">Carbs (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                    placeholder="200"
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-yellow-700">Fat (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    placeholder="65"
                    className="border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-orange-700">Fiber (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                    placeholder="30"
                    className="border-orange-200 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-red-700">Calories (kcal)</label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    placeholder="2000"
                    className="border-red-200 focus:border-red-500 focus:ring-red-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Micronutrients */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Beaker className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Micronutrients (Optional)</h4>
                <span className="text-sm text-gray-500">- Vitamins and minerals</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 ml-10">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Sodium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.sodium}
                    onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                    placeholder="1500"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Potassium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                    placeholder="2000"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Calcium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.calcium}
                    onChange={(e) => setFormData({ ...formData, calcium: e.target.value })}
                    placeholder="1000"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Zinc (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.zinc}
                    onChange={(e) => setFormData({ ...formData, zinc: e.target.value })}
                    placeholder="11"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Magnesium (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.magnesium}
                    onChange={(e) => setFormData({ ...formData, magnesium: e.target.value })}
                    placeholder="400"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Iron (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.iron}
                    onChange={(e) => setFormData({ ...formData, iron: e.target.value })}
                    placeholder="18"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Vitamin B12 (µg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vitamin_b12}
                    onChange={(e) => setFormData({ ...formData, vitamin_b12: e.target.value })}
                    placeholder="2.4"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Vitamin D (IU)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vitamin_d}
                    onChange={(e) => setFormData({ ...formData, vitamin_d: e.target.value })}
                    placeholder="600"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Vitamin C (mg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.vitamin_c}
                    onChange={(e) => setFormData({ ...formData, vitamin_c: e.target.value })}
                    placeholder="90"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-700">Folate (µg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.folate}
                    onChange={(e) => setFormData({ ...formData, folate: e.target.value })}
                    placeholder="400"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-purple-200">
              <p className="text-sm text-gray-600">
                <span className="text-red-500">*</span> Required fields
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData(initialFormData)
                  }}
                  disabled={loading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Condition" : "Create Condition"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Conditions List */}
      <div className="grid gap-4">
        {fetching ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading conditions...</p>
          </Card>
        ) : conditions.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">No medical conditions added yet</Card>
        ) : (
          conditions.map((condition) => (
            <Card key={condition.id} className="overflow-hidden border border-gray-200 hover:border-purple-300 transition-colors">
              {/* Condition Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{condition.conditionName}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedCondition(expandedCondition === condition.id ? null : condition.id)}
                          className="p-1 h-auto"
                        >
                          {expandedCondition === condition.id ? (
                            <ChevronUp size={18} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {condition.description && (
                        <p className="text-sm text-gray-600 mt-1">{condition.description}</p>
                      )}
                      
                      {/* Quick Overview - Macronutrients */}
                      {condition.macronutrients && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {condition.macronutrients.calories && (
                            <div className="bg-red-50 px-3 py-1 rounded-full">
                              <span className="text-xs font-medium text-red-700">
                                {condition.macronutrients.calories} kcal
                              </span>
                            </div>
                          )}
                          {condition.macronutrients.protein && (
                            <div className="bg-green-50 px-3 py-1 rounded-full">
                              <span className="text-xs font-medium text-green-700">
                                {condition.macronutrients.protein}g protein
                              </span>
                            </div>
                          )}
                          {condition.macronutrients.carbs && (
                            <div className="bg-blue-50 px-3 py-1 rounded-full">
                              <span className="text-xs font-medium text-blue-700">
                                {condition.macronutrients.carbs}g carbs
                              </span>
                            </div>
                          )}
                          {condition.macronutrients.fat && (
                            <div className="bg-yellow-50 px-3 py-1 rounded-full">
                              <span className="text-xs font-medium text-yellow-700">
                                {condition.macronutrients.fat}g fat
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditCondition(condition)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 size={16} />
                      <span className="ml-1 hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        confirmDeleteCondition(condition.id)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      <span className="ml-1 hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {expandedCondition === condition.id && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="space-y-6">
                      {/* Complete Nutrient Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Beaker className="w-5 h-5 text-purple-600" />
                          <h4 className="font-semibold text-gray-900">Complete Nutritional Profile</h4>
                        </div>
                        
                        {condition.macronutrients && (
                          <div className="mb-6">
                            <h5 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">Macronutrients</h5>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              {condition.macronutrients.calories && (
                                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                                  <div className="text-sm font-medium text-red-800">Calories</div>
                                  <div className="text-2xl font-bold text-red-600">{condition.macronutrients.calories}</div>
                                  <div className="text-xs text-red-600">kcal</div>
                                </div>
                              )}
                              {condition.macronutrients.protein && (
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                  <div className="text-sm font-medium text-green-800">Protein</div>
                                  <div className="text-2xl font-bold text-green-600">{condition.macronutrients.protein}</div>
                                  <div className="text-xs text-green-600">grams</div>
                                </div>
                              )}
                              {condition.macronutrients.carbs && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                  <div className="text-sm font-medium text-blue-800">Carbohydrates</div>
                                  <div className="text-2xl font-bold text-blue-600">{condition.macronutrients.carbs}</div>
                                  <div className="text-xs text-blue-600">grams</div>
                                </div>
                              )}
                              {condition.macronutrients.fat && (
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                                  <div className="text-sm font-medium text-yellow-800">Fat</div>
                                  <div className="text-2xl font-bold text-yellow-600">{condition.macronutrients.fat}</div>
                                  <div className="text-xs text-yellow-600">grams</div>
                                </div>
                              )}
                              {condition.macronutrients.fiber && (
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                  <div className="text-sm font-medium text-orange-800">Fiber</div>
                                  <div className="text-2xl font-bold text-orange-600">{condition.macronutrients.fiber}</div>
                                  <div className="text-xs text-orange-600">grams</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {condition.micronutrients && (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-3 text-sm uppercase tracking-wide">Micronutrients</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                              {Object.entries(condition.micronutrients).map(([key, value]) => (
                                <div key={key} className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                                  <div className="text-xs font-medium text-purple-800 capitalize">
                                    {key.replace('_', ' ').replace(/vitamin/i, 'Vit')}
                                  </div>
                                  <div className="text-lg font-bold text-purple-600">
                                    {value}
                                  </div>
                                  <div className="text-xs text-purple-600">
                                    {key.includes('vitamin_b12') || key.includes('folate') ? 'µg' : 
                                     key.includes('vitamin_d') ? 'IU' : 'mg'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Recipe recommendations section */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span>Associated Recipes</span>
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Coming Soon</span>
                          </h4>
                          <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700 text-sm" disabled>
                            <Plus size={16} />
                            Add Recipe
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 italic">Recipe management and recommendations will be available soon.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medical Condition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medical condition? This action will permanently remove 
              the condition and all its nutritional guidelines. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false)
              setConditionToDelete(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCondition}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Condition
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
