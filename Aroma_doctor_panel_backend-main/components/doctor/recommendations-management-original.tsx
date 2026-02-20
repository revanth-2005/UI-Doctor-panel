"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"

type RecommendationStatus = "pending" | "accepted" | "rejected"

const MOCK_PATIENTS = [
  { id: "1", name: "John Doe", email: "john.doe@example.com" },
  { id: "2", name: "Jane Smith", email: "jane.smith@example.com" },
]

const MOCK_CONDITIONS = [
  {
    id: "1",
    name: "Diabetes Type 2",
    recommended_nutrients: { protein: 50, carbs: 150, fat: 45, fiber: 30, calories: 1800 },
  },
  {
    id: "2",
    name: "Hypertension",
    recommended_nutrients: { protein: 60, carbs: 200, fat: 50, fiber: 35, calories: 2000 },
  },
]

const MOCK_RECIPES = [
  { id: "1", name: "Grilled Chicken Salad", condition_id: "1", nutritional_info: { protein: 35, carbs: 15, fat: 12 } },
  {
    id: "2",
    name: "Steamed Vegetables with Quinoa",
    condition_id: "2",
    nutritional_info: { protein: 12, carbs: 45, fat: 8 },
  },
]

const MOCK_RECOMMENDATIONS = [
  {
    id: "1",
    patient_id: "1",
    condition_id: "1",
    recipes: ["1"],
    status: "accepted" as RecommendationStatus,
    shared_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    response_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    patients: MOCK_PATIENTS[0],
    medical_conditions: MOCK_CONDITIONS[0],
    recipes_data: [MOCK_RECIPES[0]],
  },
  {
    id: "2",
    patient_id: "2",
    condition_id: "2",
    recipes: ["2"],
    status: "pending" as RecommendationStatus,
    shared_at: new Date().toISOString(),
    response_at: null,
    patients: MOCK_PATIENTS[1],
    medical_conditions: MOCK_CONDITIONS[1],
    recipes_data: [MOCK_RECIPES[1]],
  },
]

export default function RecommendationsManagement() {
  const [recommendations, setRecommendations] = useState(MOCK_RECOMMENDATIONS)
  const [patients] = useState(MOCK_PATIENTS)
  const [conditions] = useState(MOCK_CONDITIONS)
  const [recipes] = useState(MOCK_RECIPES)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: "",
    condition_id: "",
    selected_recipes: [] as string[],
  })

  const availableRecipes = formData.condition_id ? recipes.filter((r) => r.condition_id === formData.condition_id) : []

  const handleAddRecommendation = (e: React.FormEvent) => {
    e.preventDefault()

    const patient = patients.find((p) => p.id === formData.patient_id)
    const condition = conditions.find((c) => c.id === formData.condition_id)
    const selectedRecipes = recipes.filter((r) => formData.selected_recipes.includes(r.id))

    const newRecommendation = {
      id: Date.now().toString(),
      patient_id: formData.patient_id,
      condition_id: formData.condition_id,
      recipes: formData.selected_recipes,
      status: "pending" as RecommendationStatus,
      shared_at: new Date().toISOString(),
      response_at: null,
      patients: patient!,
      medical_conditions: condition!,
      recipes_data: selectedRecipes,
    }

    setRecommendations([newRecommendation, ...recommendations])
    setFormData({ patient_id: "", condition_id: "", selected_recipes: [] })
    setShowForm(false)
  }

  const handleDeleteRecommendation = (id: string) => {
    if (!confirm("Are you sure you want to delete this recommendation?")) return
    setRecommendations(recommendations.filter((r) => r.id !== id))
  }

  const getStatusIcon = (status: RecommendationStatus) => {
    switch (status) {
      case "accepted":
        return <CheckCircle size={20} className="text-green-600" />
      case "rejected":
        return <XCircle size={20} className="text-red-600" />
      case "pending":
        return <Clock size={20} className="text-yellow-600" />
    }
  }

  const getStatusBadge = (status: RecommendationStatus) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Patient Recommendations</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setFormData({ patient_id: "", condition_id: "", selected_recipes: [] })
          }}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus size={20} />
          Share Recommendation
        </Button>
      </div>

      {/* Add Recommendation Form */}
      {showForm && (
        <Card className="p-6 bg-indigo-50 border-indigo-200">
          <form onSubmit={handleAddRecommendation} className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                required
              >
                <option value="">Select a patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Condition</label>
              <select
                value={formData.condition_id}
                onChange={(e) => setFormData({ ...formData, condition_id: e.target.value, selected_recipes: [] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                required
              >
                <option value="">Select a condition</option>
                {conditions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipes Selection */}
            {formData.condition_id && availableRecipes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recommended Recipes</label>
                <div className="space-y-2 bg-white p-3 rounded border border-gray-200">
                  {availableRecipes.map((recipe) => (
                    <label key={recipe.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selected_recipes.includes(recipe.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, selected_recipes: [...formData.selected_recipes, recipe.id] })
                          } else {
                            setFormData({
                              ...formData,
                              selected_recipes: formData.selected_recipes.filter((id) => id !== recipe.id),
                            })
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700">{recipe.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.condition_id && availableRecipes.length === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded">
                No recipes available for this condition. Please add recipes first.
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Share Recommendation
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {recommendations.filter((r) => r.status === "pending").length}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Accepted</p>
            <p className="text-2xl font-bold text-green-600">
              {recommendations.filter((r) => r.status === "accepted").length}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">
              {recommendations.filter((r) => r.status === "rejected").length}
            </p>
          </div>
        </Card>
      </div>

      {/* Recommendations List */}
      <div className="grid gap-4">
        {recommendations.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">No recommendations shared yet</Card>
        ) : (
          recommendations.map((rec) => (
            <Card key={rec.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{rec.patients?.name || "Unknown Patient"}</h3>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(rec.status)}`}
                    >
                      {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Condition: <span className="font-medium">{rec.medical_conditions?.name}</span>
                  </p>

                  {/* Recommended Nutrients */}
                  {rec.medical_conditions?.recommended_nutrients && (
                    <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                      <p className="font-medium text-gray-700 mb-1">Daily Nutrient Goals:</p>
                      <div className="grid grid-cols-5 gap-2 text-gray-600">
                        <div>Protein: {rec.medical_conditions.recommended_nutrients.protein || 0}g</div>
                        <div>Carbs: {rec.medical_conditions.recommended_nutrients.carbs || 0}g</div>
                        <div>Fat: {rec.medical_conditions.recommended_nutrients.fat || 0}g</div>
                        <div>Fiber: {rec.medical_conditions.recommended_nutrients.fiber || 0}g</div>
                        <div>Calories: {rec.medical_conditions.recommended_nutrients.calories || 0}</div>
                      </div>
                    </div>
                  )}

                  {/* Recipes */}
                  {rec.recipes_data && rec.recipes_data.length > 0 && (
                    <div className="mb-3">
                      <p className="font-medium text-gray-700 text-sm mb-2">Recommended Recipes:</p>
                      <div className="space-y-2">
                        {rec.recipes_data.map((recipe) => (
                          <div key={recipe.id} className="pl-3 border-l-2 border-indigo-300">
                            <p className="text-sm font-medium text-gray-900">{recipe.name}</p>
                            <p className="text-xs text-gray-600">
                              Protein: {recipe.nutritional_info?.protein || 0}g | Carbs:{" "}
                              {recipe.nutritional_info?.carbs || 0}g | Fat: {recipe.nutritional_info?.fat || 0}g
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      Shared: {new Date(rec.shared_at).toLocaleDateString()}{" "}
                      {new Date(rec.shared_at).toLocaleTimeString()}
                    </p>
                    {rec.response_at && (
                      <p>
                        Response: {new Date(rec.response_at).toLocaleDateString()}{" "}
                        {new Date(rec.response_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusIcon(rec.status)}
                  <Button
                    onClick={() => handleDeleteRecommendation(rec.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
