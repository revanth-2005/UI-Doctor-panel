"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, ArrowLeft, Save, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Ingredient {
  name: string
  qty: string
  unit: string
}

interface IngredientUsed {
  item: string
  quantity: string
}

interface CookingStep {
  step: number
  instruction: string
  time: string
  ingredients_used: IngredientUsed[]
  tips: string[]
}

interface RecipeFormData {
  recipe_name: string
  description: string
  medical_condition: string
  ingredients: Ingredient[]
  cooking_steps: CookingStep[]
  preparation_steps: string[]
  tags: {
    mealType: string
    dietary: string
    cookware: string
    cookingTime: string
    cuisine: string
  }
  recipe_image_url: string
  url: string
  rating: number
  serving: number
  yield: string
  prep_time: string
  cook_time: string
  total_time: string
  nutrition_info: string
  status: string
}

interface RecipeFormProps {
  recipeId?: string
  initialData?: Partial<RecipeFormData>
}

export default function RecipeForm({ recipeId, initialData }: RecipeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [conditions, setConditions] = useState<Array<{ id: string; conditionName: string }>>([])
  const [formData, setFormData] = useState<RecipeFormData>({
    recipe_name: "",
    description: "",
    medical_condition: "",
    ingredients: [{ name: "", qty: "", unit: "" }],
    cooking_steps: [{
      step: 1,
      instruction: "",
      time: "",
      ingredients_used: [{ item: "", quantity: "" }],
      tips: [""]
    }],
    preparation_steps: [""],
    tags: {
      mealType: "",
      dietary: "",
      cookware: "",
      cookingTime: "",
      cuisine: ""
    },
    recipe_image_url: "",
    url: "",
    rating: 0,
    serving: 4,
    yield: "",
    prep_time: "",
    cook_time: "",
    total_time: "",
    nutrition_info: "",
    status: "active"
  })

  useEffect(() => {
    loadConditions()
    if (recipeId) {
      loadRecipe()
    } else if (initialData) {
      setFormData({ ...formData, ...initialData })
    }
  }, [recipeId])

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

  const loadRecipe = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/recipes/${recipeId}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        // Map the response to form format and ensure all required fields exist
        const loadedData = result.data
        setFormData({
          recipe_name: loadedData.recipe_name || loadedData.recipeTitle || "",
          description: loadedData.description || loadedData.shortDescription || "",
          medical_condition: loadedData.medical_condition || "",
          ingredients: loadedData.ingredients || [{ name: "", qty: "", unit: "" }],
          cooking_steps: loadedData.cooking_steps || [{
            step: 1,
            instruction: "",
            time: "",
            ingredients_used: [{ item: "", quantity: "" }],
            tips: [""]
          }],
          preparation_steps: loadedData.preparation_steps || [""],
          tags: loadedData.tags || {
            mealType: "",
            dietary: "",
            cookware: "",
            cookingTime: "",
            cuisine: ""
          },
          recipe_image_url: loadedData.recipe_image_url || loadedData.imageUrl || "",
          url: loadedData.url || "",
          rating: loadedData.rating || 0,
          serving: loadedData.serving || loadedData.servings || 4,
          yield: loadedData.yield || "",
          prep_time: loadedData.prep_time || "",
          cook_time: loadedData.cook_time || "",
          total_time: loadedData.total_time || "",
          nutrition_info: loadedData.nutrition_info || "",
          status: loadedData.status || "active"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load recipe",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading recipe:", error)
      toast({
        title: "Error",
        description: "Failed to load recipe",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const url = recipeId ? `/api/recipes/${recipeId}` : '/api/recipes'
      const method = recipeId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: recipeId ? "Recipe updated successfully" : "Recipe created successfully"
        })
        // Navigate back to recipes tab
        const params = new URLSearchParams()
        params.set('tab', 'recipes')
        router.push(`/admin/dashboard?${params.toString()}`)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save recipe",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error saving recipe:", error)
      toast({
        title: "Error",
        description: "Failed to save recipe",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Ingredient handlers
  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: "", qty: "", unit: "" }]
    })
  }

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    })
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index][field] = value
    setFormData({ ...formData, ingredients: newIngredients })
  }

  // Cooking step handlers
  const addCookingStep = () => {
    setFormData({
      ...formData,
      cooking_steps: [...formData.cooking_steps, {
        step: formData.cooking_steps.length + 1,
        instruction: "",
        time: "",
        ingredients_used: [{ item: "", quantity: "" }],
        tips: [""]
      }]
    })
  }

  const removeCookingStep = (index: number) => {
    setFormData({
      ...formData,
      cooking_steps: formData.cooking_steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        step: i + 1
      }))
    })
  }

  const updateCookingStep = (index: number, field: keyof CookingStep, value: any) => {
    const newSteps = [...formData.cooking_steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData({ ...formData, cooking_steps: newSteps })
  }

  // Preparation step handlers
  const addPreparationStep = () => {
    setFormData({
      ...formData,
      preparation_steps: [...formData.preparation_steps, ""]
    })
  }

  const removePreparationStep = (index: number) => {
    setFormData({
      ...formData,
      preparation_steps: formData.preparation_steps.filter((_, i) => i !== index)
    })
  }

  const updatePreparationStep = (index: number, value: string) => {
    const newSteps = [...formData.preparation_steps]
    newSteps[index] = value
    setFormData({ ...formData, preparation_steps: newSteps })
  }

  if (loading && recipeId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/dashboard?tab=recipes')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {recipeId ? "Edit Recipe" : "Add New Recipe"}
              </h1>
              <p className="text-gray-600 mt-1">
                {recipeId ? "Update recipe details" : "Create a new recipe with all details"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="steps">Cooking Steps</TabsTrigger>
              <TabsTrigger value="preparation">Preparation</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the recipe name and description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipe_name">Recipe Name *</Label>
                    <Input
                      id="recipe_name"
                      value={formData.recipe_name}
                      onChange={(e) => setFormData({ ...formData, recipe_name: e.target.value })}
                      placeholder="e.g., Creamy Tomato Pasta"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="A delicious and easy-to-make pasta dish..."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="medical_condition">Medical Condition</Label>
                    <Select
                      value={formData.medical_condition}
                      onValueChange={(value) => setFormData({ ...formData, medical_condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a condition..." />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serving">Servings *</Label>
                      <Input
                        id="serving"
                        type="number"
                        value={formData.serving}
                        onChange={(e) => setFormData({ ...formData, serving: parseInt(e.target.value) })}
                        placeholder="4"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="yield">Yield</Label>
                      <Input
                        id="yield"
                        value={formData.yield}
                        onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                        placeholder="e.g., 4 servings"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="prep_time">Prep Time</Label>
                      <Input
                        id="prep_time"
                        value={formData.prep_time}
                        onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                        placeholder="10 minutes"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cook_time">Cook Time</Label>
                      <Input
                        id="cook_time"
                        value={formData.cook_time}
                        onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                        placeholder="20 minutes"
                      />
                    </div>

                    <div>
                      <Label htmlFor="total_time">Total Time</Label>
                      <Input
                        id="total_time"
                        value={formData.total_time}
                        onChange={(e) => setFormData({ ...formData, total_time: e.target.value })}
                        placeholder="30 minutes"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nutrition_info">Nutrition Information</Label>
                    <Input
                      id="nutrition_info"
                      value={formData.nutrition_info}
                      onChange={(e) => setFormData({ ...formData, nutrition_info: e.target.value })}
                      placeholder="Calories: 450, Protein: 15g, Carbs: 55g, Fat: 18g"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft - Being created/edited</SelectItem>
                        <SelectItem value="active">Active - Published and visible</SelectItem>
                        <SelectItem value="inactive">Inactive - Temporarily hidden</SelectItem>
                        <SelectItem value="trash">Trash - Soft deleted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ingredients Tab */}
            <TabsContent value="ingredients" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Ingredients</CardTitle>
                      <CardDescription>Add all ingredients with quantities</CardDescription>
                    </div>
                    <Button type="button" onClick={addIngredient} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label>Ingredient Name</Label>
                        <Input
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                          placeholder="e.g., Pasta"
                        />
                      </div>
                      <div className="w-32">
                        <Label>Quantity</Label>
                        <Input
                          value={ingredient.qty}
                          onChange={(e) => updateIngredient(index, 'qty', e.target.value)}
                          placeholder="400"
                        />
                      </div>
                      <div className="w-32">
                        <Label>Unit</Label>
                        <Input
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          placeholder="g"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                        disabled={formData.ingredients.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cooking Steps Tab */}
            <TabsContent value="steps" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Cooking Steps</CardTitle>
                      <CardDescription>Add detailed cooking instructions</CardDescription>
                    </div>
                    <Button type="button" onClick={addCookingStep} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.cooking_steps.map((step, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Step {step.step}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCookingStep(index)}
                            disabled={formData.cooking_steps.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Instruction</Label>
                          <Textarea
                            value={step.instruction}
                            onChange={(e) => updateCookingStep(index, 'instruction', e.target.value)}
                            placeholder="Describe this cooking step..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label>Time</Label>
                          <Input
                            value={step.time}
                            onChange={(e) => updateCookingStep(index, 'time', e.target.value)}
                            placeholder="e.g., 10 minutes"
                          />
                        </div>

                        <div>
                          <Label>Tips (comma-separated)</Label>
                          <Textarea
                            value={step.tips.join(', ')}
                            onChange={(e) => updateCookingStep(index, 'tips', e.target.value.split(',').map(t => t.trim()))}
                            placeholder="Add helpful tips..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preparation Tab */}
            <TabsContent value="preparation" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Preparation Steps</CardTitle>
                      <CardDescription>Add preparation instructions before cooking</CardDescription>
                    </div>
                    <Button type="button" onClick={addPreparationStep} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.preparation_steps.map((step, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label>Step {index + 1}</Label>
                        <Input
                          value={step}
                          onChange={(e) => updatePreparationStep(index, e.target.value)}
                          placeholder="e.g., Chop tomatoes into small pieces"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePreparationStep(index)}
                        disabled={formData.preparation_steps.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tags & Metadata</CardTitle>
                  <CardDescription>Categorize and add additional information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Meal Type</Label>
                      <Input
                        value={formData.tags.mealType}
                        onChange={(e) => setFormData({
                          ...formData,
                          tags: { ...formData.tags, mealType: e.target.value }
                        })}
                        placeholder="e.g., Lunch"
                      />
                    </div>

                    <div>
                      <Label>Dietary</Label>
                      <Input
                        value={formData.tags.dietary}
                        onChange={(e) => setFormData({
                          ...formData,
                          tags: { ...formData.tags, dietary: e.target.value }
                        })}
                        placeholder="e.g., Vegetarian"
                      />
                    </div>

                    <div>
                      <Label>Cookware</Label>
                      <Input
                        value={formData.tags.cookware}
                        onChange={(e) => setFormData({
                          ...formData,
                          tags: { ...formData.tags, cookware: e.target.value }
                        })}
                        placeholder="e.g., Pot and Pan"
                      />
                    </div>

                    <div>
                      <Label>Cooking Time</Label>
                      <Input
                        value={formData.tags.cookingTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          tags: { ...formData.tags, cookingTime: e.target.value }
                        })}
                        placeholder="e.g., 30 minutes"
                      />
                    </div>

                    <div>
                      <Label>Cuisine</Label>
                      <Input
                        value={formData.tags.cuisine}
                        onChange={(e) => setFormData({
                          ...formData,
                          tags: { ...formData.tags, cuisine: e.target.value }
                        })}
                        placeholder="e.g., Italian"
                      />
                    </div>

                    <div>
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        placeholder="4.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recipe_image_url">Recipe Image URL</Label>
                    <Input
                      id="recipe_image_url"
                      value={formData.recipe_image_url}
                      onChange={(e) => setFormData({ ...formData, recipe_image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="url">Recipe URL</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com/recipes/..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/dashboard?tab=recipes')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {recipeId ? "Update Recipe" : "Create Recipe"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
