"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Calendar, User } from "lucide-react"
import { RecipeDetailsModalProps } from "@/lib/types/recipes"

export default function RecipeDetailsModal({ recipe, isOpen, onClose }: RecipeDetailsModalProps) {
  if (!recipe) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{recipe.recipeTitle}</span>
            <Badge variant={recipe.status === 'approved' ? 'default' : recipe.status === 'rejected' ? 'destructive' : 'secondary'}>
              {recipe.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Condition Tag</h3>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {recipe.conditionTag}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{recipe.estimatedTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>{recipe.servings} servings</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{recipe.fullDescription || recipe.shortDescription}</p>
          </div>

          {/* Nutritional Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Nutritional Information</h3>
            
            {/* Macronutrients */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Macronutrients (per serving)</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {recipe.macronutrients.protein && (
                  <div className="bg-green-50 p-3 rounded border">
                    <div className="text-sm font-medium text-green-800">Protein</div>
                    <div className="text-lg font-bold text-green-600">{recipe.macronutrients.protein}g</div>
                  </div>
                )}
                {recipe.macronutrients.carbs && (
                  <div className="bg-blue-50 p-3 rounded border">
                    <div className="text-sm font-medium text-blue-800">Carbs</div>
                    <div className="text-lg font-bold text-blue-600">{recipe.macronutrients.carbs}g</div>
                  </div>
                )}
                {recipe.macronutrients.fat && (
                  <div className="bg-yellow-50 p-3 rounded border">
                    <div className="text-sm font-medium text-yellow-800">Fat</div>
                    <div className="text-lg font-bold text-yellow-600">{recipe.macronutrients.fat}g</div>
                  </div>
                )}
                {recipe.macronutrients.fiber && (
                  <div className="bg-orange-50 p-3 rounded border">
                    <div className="text-sm font-medium text-orange-800">Fiber</div>
                    <div className="text-lg font-bold text-orange-600">{recipe.macronutrients.fiber}g</div>
                  </div>
                )}
                {recipe.macronutrients.calories && (
                  <div className="bg-red-50 p-3 rounded border">
                    <div className="text-sm font-medium text-red-800">Calories</div>
                    <div className="text-lg font-bold text-red-600">{recipe.macronutrients.calories}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Micronutrients */}
            {recipe.micronutrients && Object.keys(recipe.micronutrients).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Micronutrients (per serving)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(recipe.micronutrients).map(([key, value]) => (
                    value && (
                      <div key={key} className="bg-purple-50 p-3 rounded border">
                        <div className="text-sm font-medium text-purple-800 capitalize">
                          {key.replace('_', ' ').replace(/vitamin/i, 'Vit')}
                        </div>
                        <div className="text-lg font-bold text-purple-600">
                          {value}
                          {key.includes('vitamin_b12') || key.includes('folate') ? 'µg' : 
                           key.includes('vitamin_d') ? 'IU' : 'mg'}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Ingredients</h3>
            <div className="bg-gray-50 p-4 rounded">
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                    <span>
                      {ingredient.amount && ingredient.unit 
                        ? `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`
                        : `${ingredient.amount || ''} ${ingredient.name}`
                      }
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Cooking Instructions</h3>
            <div className="bg-gray-50 p-4 rounded">
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Admin Metadata */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recipe Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Uploaded by: {recipe.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Upload date: {new Date(recipe.uploadedAt).toLocaleDateString()}</span>
              </div>
              {recipe.verifiedDate && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Verified: {new Date(recipe.verifiedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}