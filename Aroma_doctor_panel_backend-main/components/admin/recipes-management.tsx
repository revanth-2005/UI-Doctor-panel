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
import { Plus, Search, Loader2, Trash2, Edit, ChefHat } from "lucide-react"
import { Recipe, CreateRecipeRequest, fetchRecipes, createRecipe, deleteRecipe } from "@/lib/api/recipes"
import { fetchConditions } from "@/lib/api/conditions"
import { Condition } from "@/lib/types/conditions"

export default function RecipesManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [conditionFilter, setConditionFilter] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<{
    title: string
    conditionTag: string
    description: string
  }>({
    title: "",
    conditionTag: "",
    description: ""
  })

  const { toast } = useToast()

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Reload recipes when filters change
  useEffect(() => {
    loadRecipes()
  }, [searchTerm, conditionFilter])

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadRecipes(), loadConditions()])
    setLoading(false)
  }

  const loadConditions = async () => {
    try {
      const result = await fetchConditions()
      if (result.success && result.data) {
        console.log('✅ Loaded conditions:', result.data)
        setConditions(result.data)
      } else {
        console.error('❌ Failed to load conditions:', result)
      }
    } catch (error) {
      console.error('Error loading conditions:', error)
    }
  }

  const loadRecipes = async () => {
    try {
      const result = await fetchRecipes(
        conditionFilter || undefined,
        undefined, // status
        searchTerm || undefined
      )
      
      if (result.success && result.data) {
        setRecipes(result.data)
      } else {
        setRecipes([])
      }
    } catch (error) {
      console.error('Error loading recipes:', error)
      setRecipes([])
    }
  }

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Find selected condition to get default nutrients
      const selectedCondition = conditions.find(c => c.conditionName === formData.conditionTag)
      
      // Prepare recipe data matching the API interface
      const recipeData: CreateRecipeRequest = {
        recipeTitle: formData.title,
        shortDescription: formData.description,
        conditionTag: formData.conditionTag,
        // Default values for required fields not in the simplified form
        ingredients: [], 
        instructions: [],
        estimatedTime: 30,
        difficulty: 'Medium',
        servings: 1,
        // Auto-populate nutrition from condition if available
        nutritionInfo: {
          calories: selectedCondition?.macronutrients?.calories || 0,
          protein: selectedCondition?.macronutrients?.protein || 0,
          carbs: selectedCondition?.macronutrients?.carbs || 0,
          fat: selectedCondition?.macronutrients?.fat || 0,
          fiber: selectedCondition?.macronutrients?.fiber || 0,
          sugar: 0 // Default as it's not in condition macros
        }
      }

      const result = await createRecipe(recipeData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Recipe created successfully",
        })
        
        // Reset form
        setFormData({
          title: "",
          conditionTag: "",
          description: ""
        })
        setShowForm(false)
        await loadRecipes()
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

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    try {
      const result = await deleteRecipe(recipeId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Recipe deleted successfully",
        })
        await loadRecipes()
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
        description: "Failed to delete recipe",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Recipes</h2>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus size={20} />
            Add Recipe
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background min-w-[150px]"
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
          >
            <option value="">All Conditions</option>
            {conditions.map((c, i) => (
              <option key={c.id || i} value={c.conditionName}>{c.conditionName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Recipe Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Recipe</h3>
            <Button variant="outline" onClick={() => setShowForm(false)} size="sm">
              Cancel
            </Button>
          </div>

          <form onSubmit={handleAddRecipe} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Recipe Name</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chicken Biryani"
                />
              </div>
              
              <div>
                <Label htmlFor="condition">Medical Condition</Label>
                <select
                  id="condition"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.conditionTag}
                  onChange={(e) => setFormData({ ...formData, conditionTag: e.target.value })}
                  required
                >
                  <option value="">Select a condition...</option>
                  {conditions.map((c, i) => (
                    <option key={c.id || i} value={c.conditionName}>{c.conditionName}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  * Nutrients will be automatically fetched based on the selected condition.
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the recipe..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Recipe"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Recipes List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No recipes found. Add one to get started.
          </div>
        ) : (
          recipes.map((recipe) => (
            <Card key={recipe._id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{recipe.recipeTitle}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {recipe.conditionTag}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {recipe.shortDescription || "No description provided."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {recipe.nutritionInfo?.calories ? `${recipe.nutritionInfo.calories} kcal` : 'N/A'}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteRecipe(recipe._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
