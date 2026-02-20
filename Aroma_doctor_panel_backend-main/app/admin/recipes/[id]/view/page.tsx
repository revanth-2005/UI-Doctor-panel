"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Clock, Users, ChefHat, Loader2 } from "lucide-react"
import Image from "next/image"

interface RecipeData {
  _id: string
  recipe_name: string
  description: string
  ingredients: Array<{
    name: string
    qty: string
    unit: string
  }>
  cooking_steps: Array<{
    step: number
    instruction: string
    time: string
    tips: string[]
  }>
  preparation_steps: string[]
  tags?: {
    mealType?: string
    dietary?: string
    cookware?: string
    cookingTime?: string
    cuisine?: string
  }
  recipe_image_url?: string
  rating?: number
  serving?: number
  yield?: string
  prep_time?: string
  cook_time?: string
  total_time?: string
  nutrition_info?: string
  status: string
}

export default function ViewRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [recipe, setRecipe] = useState<RecipeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecipe()
  }, [id])

  const loadRecipe = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/recipes/${id}`)
      const result = await response.json()

      if (result.success && result.data) {
        setRecipe(result.data)
      }
    } catch (error) {
      console.error("Error loading recipe:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
        <Button onClick={() => router.push('/admin/dashboard?tab=recipes')}>Go Back</Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Draft", variant: "secondary" },
      active: { label: "Active", variant: "default" },
      inactive: { label: "Inactive", variant: "outline" },
      trash: { label: "Trash", variant: "destructive" },
      // Legacy statuses for backwards compatibility
      approved: { label: "Approved", variant: "default" },
      pending: { label: "Pending", variant: "secondary" },
      rejected: { label: "Rejected", variant: "destructive" },
    }
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard?tab=recipes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(`/admin/recipes/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Recipe
          </Button>
        </div>

        {/* Recipe Image & Title */}
        <Card className="mb-6">
          <CardContent className="p-0">
            {recipe.recipe_image_url && (
              <div className="relative w-full h-96 bg-gray-100">
                <Image
                  src={recipe.recipe_image_url}
                  alt={recipe.recipe_name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{recipe.recipe_name}</h1>
                  <p className="text-gray-600 text-lg">{recipe.description}</p>
                </div>
                <div className="ml-4">{getStatusBadge(recipe.status)}</div>
              </div>

              {/* Quick Info */}
              <div className="flex items-center gap-6 text-gray-600">
                {recipe.prep_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="text-xs text-gray-500">Prep Time</div>
                      <div className="font-medium">{recipe.prep_time}</div>
                    </div>
                  </div>
                )}
                {recipe.cook_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="text-xs text-gray-500">Cook Time</div>
                      <div className="font-medium">{recipe.cook_time}</div>
                    </div>
                  </div>
                )}
                {recipe.total_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="text-xs text-gray-500">Total Time</div>
                      <div className="font-medium">{recipe.total_time}</div>
                    </div>
                  </div>
                )}
                {recipe.serving && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <div>
                      <div className="text-xs text-gray-500">Servings</div>
                      <div className="font-medium">{recipe.serving}</div>
                    </div>
                  </div>
                )}
                {recipe.rating && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    <div>
                      <div className="text-xs text-gray-500">Rating</div>
                      <div className="font-medium">{recipe.rating} / 5</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {recipe.tags && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {recipe.tags.mealType && (
                    <Badge variant="outline">{recipe.tags.mealType}</Badge>
                  )}
                  {recipe.tags.dietary && (
                    <Badge variant="outline">{recipe.tags.dietary}</Badge>
                  )}
                  {recipe.tags.cuisine && (
                    <Badge variant="outline">{recipe.tags.cuisine}</Badge>
                  )}
                  {recipe.tags.cookware && (
                    <Badge variant="outline">{recipe.tags.cookware}</Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ingredients & Preparation */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="font-medium">{ingredient.name}</span>
                      <span className="text-gray-600">
                        {ingredient.qty} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preparation Steps */}
            {recipe.preparation_steps && recipe.preparation_steps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preparation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 list-decimal list-inside">
                    {recipe.preparation_steps.map((step, index) => (
                      <li key={index} className="text-gray-700">
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Nutrition Info */}
            {recipe.nutrition_info && (
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{recipe.nutrition_info}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Cooking Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cooking Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recipe.cooking_steps.map((step, index) => (
                    <div key={index} className="relative pl-8">
                      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {step.time && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {step.time}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{step.instruction}</p>
                        {step.tips && step.tips.length > 0 && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-md">
                            <p className="text-xs font-semibold text-blue-900 mb-1">
                              💡 Tips:
                            </p>
                            <ul className="text-xs text-blue-800 space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {index < recipe.cooking_steps.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
