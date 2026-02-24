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
import { Plus, Trash2, CheckCircle, XCircle, Clock, User, Utensils, Loader2, Search } from "lucide-react"

import {
  fetchRecommendations,
  createRecommendation,
  Patient,
  Recommendation,
  CreateRecommendationRequest
} from "@/lib/api/doctor"
import { fetchRecipes, Recipe } from "@/lib/api/recipes"

// Add Condition interface
interface Condition {
  id: string
  conditionName: string
  description?: string
  macros?: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  micros?: {
    sodium: number
    potassium: number
    calcium: number
    zinc: number
    magnesium: number
    iron: number
    vitamin_b12: number
    vitamin_d: number
    vitamin_c: number
    folate: number
  }
}

export default function RecommendationsManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingNutrients, setLoadingNutrients] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [doctorId, setDoctorId] = useState<string>("")
  const { toast } = useToast()

  const [formData, setFormData] = useState<CreateRecommendationRequest>({
    patientId: "",
    recipeId: "", // Optional - can be empty for general diet recommendations
    conditionTag: "",
    notes: "",
    dietAdvice: {
      dailyCalories: "",
      targetProtein: "",
      targetCarbs: "",
      targetFat: "",
      targetFiber: "",
      targetSodium: "",
      targetPotassium: "",
      targetCalcium: "",
      targetZinc: "",
      targetMagnesium: "",
      targetIron: "",
      targetVitaminB12: "",
      targetVitaminD: "",
      targetVitaminC: "",
      targetFolate: "",
      vitamins: "",
      minerals: "",
      hydration: "",
      mealTiming: ""
    }
  })

  // Get doctor ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setDoctorId(user.id || "doctor-1") // fallback ID for demo
    }
  }, [])

  // Load data when doctor ID is available
  useEffect(() => {
    if (doctorId) {
      loadData()
    }
  }, [doctorId])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadPatients(),
        loadRecipes(),
        loadConditions(),
        loadRecommendations()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const loadPatients = async () => {
    try {
      if (!doctorId) return;
      console.log(`🔍 Loading patients for doctor ${doctorId}...`)

      // Use the specific doctor-users endpoint which is known to work
      const response = await fetch(`/api/doctor/users/${doctorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        console.warn(`⚠️ Patient list backend responded with status ${response.status}`);
        setPatients([]);
        return;
      }

      const result = await response.json()
      console.log('📋 Backend patients response for dropdown:', result)

      if (result.success && (result.patients || result.data || Array.isArray(result))) {
        const patientsList = result.patients || result.data || (Array.isArray(result) ? result : []);

        // Map backend data to frontend format for dropdown
        const mappedPatients: Patient[] = patientsList.map((patient: any) => ({
          _id: patient._id || patient.id,
          id: patient._id || patient.id,
          name: patient.name,
          phone: patient.phone,
          userId: patient.userId,
          nutritionLimits: patient.nutritionLimits,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt
        }))

        console.log(`✅ Loaded ${mappedPatients.length} patients for dropdown`)
        setPatients(mappedPatients)
      } else {
        console.warn('Failed to load patients for dropdown:', result.message)
        setPatients([])
        toast({
          title: "⚠️ Warning",
          description: "Failed to load patients for dropdown",
          variant: "destructive",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error loading patients for dropdown:', error)
      setPatients([])
      toast({
        title: "❌ Connection Error",
        description: "Failed to connect to patient database",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const loadRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/approved')
      const result = await response.json()

      if (result.success && result.data && Array.isArray(result.data)) {
        setRecipes(result.data)
        console.log(`📋 Loaded ${result.data.length} approved recipes for recommendations`)
      } else {
        console.warn('Failed to load approved recipes:', result.message)
        setRecipes([])
      }
    } catch (error) {
      console.error('Error loading approved recipes:', error)
      setRecipes([])
    }
  }

  const loadConditions = async () => {
    try {
      console.log('🔍 Loading conditions from MongoDB backend...')

      const response = await fetch('/api/conditions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        console.warn(`⚠️ Conditions list backend responded with status ${response.status}`);
        setConditions([]);
        return;
      }

      const result = await response.json()
      console.log('📋 Backend conditions response for dropdown:', result)

      if (result.success && result.data) {
        // Map backend data to frontend format for dropdown
        const mappedConditions: Condition[] = result.data.map((condition: any) => ({
          id: condition.id,
          conditionName: condition.conditionName,
          description: condition.description,
          macronutrients: condition.macronutrients || condition.macros,
          micronutrients: condition.micronutrients || condition.micros,
          vitamins: condition.vitamins,
          createdAt: condition.createdAt,
          updatedAt: condition.updatedAt
        }))

        console.log(`✅ Loaded ${mappedConditions.length} conditions for dropdown`)
        setConditions(mappedConditions)
      } else {
        console.warn('Failed to load conditions for dropdown:', result.message)
        setConditions([])
        toast({
          title: "⚠️ Warning",
          description: "Failed to load medical conditions for dropdown",
          variant: "destructive",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error loading conditions for dropdown:', error)
      setConditions([])
      toast({
        title: "❌ Connection Error",
        description: "Failed to connect to conditions database",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const loadRecommendations = async () => {
    try {
      // Load from local storage
      const localRecommendations = JSON.parse(localStorage.getItem('diet_recommendations') || '[]')
      setRecommendations(localRecommendations)
      console.log(`📋 Loaded ${localRecommendations.length} recommendations from local storage`)
    } catch (error) {
      console.error('Error loading recommendations:', error)
      setRecommendations([])
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Get doctor name from localStorage
      const userData = localStorage.getItem("user");
      let doctorName = "Your Doctor";
      if (userData) {
        const user = JSON.parse(userData);
        doctorName = user.name || user.doctorName || "Your Doctor";
      }

      const patientName = getPatientName(formData.patientId);
      const recipeName = formData.recipeId ? getRecipeTitle(formData.recipeId) : 'General Diet Advice';

      // --- Backend API Call ---
      console.log('📡 Sending recommendation to backend...')
      const apiResponse = await createRecommendation(doctorId, {
        ...formData,
        patientName,
        recipeName,
        doctorName
      } as any)

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to sync with backend')
      }

      console.log('✅ Backend sync successful:', apiResponse.data)

      // Create recommendation object for local storage display
      const newRecommendation = {
        _id: apiResponse.data?.id || `rec_${Date.now()}`,
        patientId: formData.patientId,
        patientName,
        recipeId: formData.recipeId || undefined,
        recipeName,
        conditionTag: formData.conditionTag,
        notes: formData.notes,
        dietAdvice: formData.dietAdvice,
        status: 'active' as const,
        doctorId,
        doctorName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to local storage for persistent UI state
      const existingRecommendations = JSON.parse(localStorage.getItem('diet_recommendations') || '[]')
      existingRecommendations.unshift(newRecommendation)
      localStorage.setItem('diet_recommendations', JSON.stringify(existingRecommendations))

      // Update state
      setRecommendations(existingRecommendations)

      // --- SMS Sending Logic ---
      const patient = patients.find(p => p._id === formData.patientId);
      if (patient && patient.phone) {
        // Construct message body
        let messageBody = `${doctorName} Recommended Nutrients\n\n`;

        const advice = formData.dietAdvice;
        if (advice) {
          if (advice.dailyCalories) messageBody += `Calories : ${advice.dailyCalories}\n`;
          if (advice.targetProtein) messageBody += `Protein : ${advice.targetProtein}\n`;
          if (advice.targetCarbs) messageBody += `Carbs : ${advice.targetCarbs}\n`;
          if (advice.targetFat) messageBody += `Fat : ${advice.targetFat}\n`;
          if (advice.targetFiber) messageBody += `Fiber : ${advice.targetFiber}\n`;

          if (advice.targetSodium) messageBody += `Sodium : ${advice.targetSodium}\n`;
          if (advice.targetPotassium) messageBody += `Potassium : ${advice.targetPotassium}\n`;
          if (advice.targetCalcium) messageBody += `Calcium : ${advice.targetCalcium}\n`;
          if (advice.targetIron) messageBody += `Iron : ${advice.targetIron}\n`;
          if (advice.targetMagnesium) messageBody += `Magnesium : ${advice.targetMagnesium}\n`;
          if (advice.targetZinc) messageBody += `Zinc : ${advice.targetZinc}\n`;
          if (advice.targetVitaminC) messageBody += `Vitamin C : ${advice.targetVitaminC}\n`;
          if (advice.targetVitaminD) messageBody += `Vitamin D : ${advice.targetVitaminD}\n`;
          if (advice.targetVitaminB12) messageBody += `Vitamin B12 : ${advice.targetVitaminB12}\n`;
          if (advice.targetFolate) messageBody += `Folate : ${advice.targetFolate}\n`;

          if (advice.hydration) messageBody += `Hydration : ${advice.hydration}\n`;
        }

        if (formData.notes) {
          messageBody += `\nNotes: ${formData.notes}`;
        }

        // Call API to send SMS
        try {
          const smsResponse = await fetch('/api/send-sms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: patient.phone,
              body: messageBody
            }),
          });

          const smsResult = await smsResponse.json();
          if (smsResult.success) {
            toast({
              title: "✅ SMS Sent",
              description: `Nutrient details sent to ${patient.name}'s phone`,
              duration: 3000,
              className: "border-green-200 bg-green-50 text-green-800"
            })
          }
        } catch (smsError) {
          console.error('Error sending SMS:', smsError);
        }
      }

      // Mobile app-style success notification
      toast({
        title: "📱 Recommendation Sent!",
        description: `Diet recommendation for ${newRecommendation.patientName} sync'd with backend`,
        duration: 4000,
        className: "border-green-200 bg-green-50 text-green-800"
      })

      handleCancelForm()
    } catch (error: any) {
      console.error('Error creating recommendation:', error)
      toast({
        title: "❌ Sync Failed",
        description: error.message || "Failed to save recommendation to backend. Saved locally instead.",
        duration: 4000,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelForm = () => {
    setFormData({
      patientId: "",
      recipeId: "",
      conditionTag: "",
      notes: "",
      dietAdvice: {
        dailyCalories: "",
        targetProtein: "",
        targetCarbs: "",
        targetFat: "",
        vitamins: "",
        minerals: "",
        hydration: "",
        mealTiming: ""
      }
    })
    setShowForm(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p._id === patientId)
    return patient ? patient.name : 'Unknown Patient'
  }

  const getRecipeTitle = (recipeId?: string) => {
    if (!recipeId) return 'General Diet Advice'
    const recipe = recipes.find(r => r._id === recipeId)
    return recipe ? recipe.recipeTitle : 'Unknown Recipe'
  }

  // Filter recommendations based on search term and status
  const filteredRecommendations = recommendations.filter(recommendation => {
    const patientName = getPatientName(recommendation.patientId)
    const recipeTitle = getRecipeTitle(recommendation.recipeId)

    const matchesSearch = !searchTerm ||
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recommendation.conditionTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recommendation.notes && recommendation.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = !statusFilter || recommendation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#111827]">Patient Recommendations</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Create and manage diet recommendations for your patients</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-xs"
          disabled={patients.length === 0}
        >
          + New Recommendation
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-0 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search recommendations.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium placeholder:text-slate-400 pl-6"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-32 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 focus:ring-0"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="text-sm font-bold text-slate-400">
          {filteredRecommendations.length} of {recommendations.length} recommendations
        </div>
      </div>

      {/* Add Recommendation Form */}
      {showForm && (
        <Card className="p-4 border-0 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🩺</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create Diet Recommendation</h3>
              <p className="text-xs text-gray-500">Quick nutrition guidance for your patient</p>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4">

            {/* Patient & Condition - Compact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="patientId" className="text-sm font-medium text-gray-700">Patient *</Label>
                <select
                  id="patientId"
                  required
                  className="mt-1 w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                >
                  <option value="">Choose patient...</option>
                  {patients.map((patient, index) => (
                    <option key={patient._id || `patient-${index}`} value={patient._id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="conditionTag" className="text-sm font-medium text-gray-700">Condition *</Label>
                <select
                  id="conditionTag"
                  required
                  className="mt-1 w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  value={formData.conditionTag}
                  onChange={async (e) => {
                    const selectedConditionName = e.target.value;

                    // Reset if empty
                    if (!selectedConditionName) {
                      setFormData(prev => ({
                        ...prev,
                        conditionTag: "",
                        dietAdvice: {
                          ...prev.dietAdvice,
                          dailyCalories: "",
                          targetProtein: "",
                          targetCarbs: "",
                          targetFat: "",
                          targetFiber: "",
                          targetSodium: "",
                          targetPotassium: "",
                          targetCalcium: "",
                          targetZinc: "",
                          targetMagnesium: "",
                          targetIron: "",
                          targetVitaminB12: "",
                          targetVitaminD: "",
                          targetVitaminC: "",
                          targetFolate: "",
                        }
                      }));
                      return;
                    }

                    // Handle "Other" or specific condition
                    if (selectedConditionName === "other") {
                      setFormData(prev => ({
                        ...prev,
                        conditionTag: "other",
                        // Keep existing values or clear them? Usually clear for manual entry
                        dietAdvice: {
                          ...prev.dietAdvice,
                          dailyCalories: "",
                          targetProtein: "",
                          targetCarbs: "",
                          targetFat: "",
                          targetFiber: "",
                          targetSodium: "",
                          targetPotassium: "",
                          targetCalcium: "",
                          targetZinc: "",
                          targetMagnesium: "",
                          targetIron: "",
                          targetVitaminB12: "",
                          targetVitaminD: "",
                          targetVitaminC: "",
                          targetFolate: "",
                        }
                      }));
                      return;
                    }

                    const selectedCondition = conditions.find(c => c.conditionName === selectedConditionName);

                    // Update condition tag immediately
                    setFormData(prev => ({
                      ...prev,
                      conditionTag: selectedConditionName
                    }));

                    if (selectedCondition?.id) {
                      setLoadingNutrients(true);
                      try {
                        const response = await fetch(`/api/conditions/${selectedCondition.id}`);
                        const result = await response.json();

                        if (result.success && result.data) {
                          const c = result.data;

                          // Helper to ensure units are correctly formatted
                          const formatUnit = (val: any, unit: string) => {
                            if (!val) return "";
                            const sVal = val.toString();
                            if (sVal.toLowerCase().includes(unit.toLowerCase())) return sVal;
                            // Convert microgram symbol/unit to mcg for display consistency with screenshot
                            if (unit === "µg" || unit === "ug") unit = "mcg";
                            return `${sVal} ${unit}`.replace("  ", " ");
                          };

                          const macros = c.macronutrients || c.macros || {};
                          const micros = c.micronutrients || c.micros || {};
                          const vitamins = c.vitamins || {};

                          setFormData(prev => ({
                            ...prev,
                            dietAdvice: {
                              ...prev.dietAdvice,
                              dailyCalories: formatUnit(macros.calories, "kcal"),
                              targetProtein: formatUnit(macros.protein, "g"),
                              targetCarbs: formatUnit(macros.carbs, "g"),
                              targetFat: formatUnit(macros.fat, "g"),
                              targetFiber: formatUnit(macros.fiber, "g"),

                              targetSodium: formatUnit(micros.sodium, "mg"),
                              targetPotassium: formatUnit(micros.potassium, "mg"),
                              targetCalcium: formatUnit(micros.calcium, "mg"),
                              targetIron: formatUnit(micros.iron, "mg"),
                              targetZinc: formatUnit(micros.zinc, "mg"),
                              targetMagnesium: formatUnit(micros.magnesium || micros.Magnesium, "mg"),

                              targetVitaminC: formatUnit(vitamins.vitaminC || micros.vitamin_c, "mg"),
                              targetVitaminD: formatUnit(vitamins.vitaminD || micros.vitamin_d, "IU"),
                              targetVitaminB12: formatUnit(vitamins.vitaminB12 || micros.vitamin_b12, "mcg"),
                              targetFolate: formatUnit(vitamins.folate || micros.folate, "mcg"),

                              hydration: "8 glasses" // Match screenshot default
                            }
                          }));
                        }
                      } catch (error) {
                        console.error("Error fetching condition details:", error);
                        toast({
                          title: "Error",
                          description: "Failed to load nutrient data for this condition",
                          variant: "destructive"
                        });
                      } finally {
                        setLoadingNutrients(false);
                      }
                    }
                  }}
                >
                  <option value="">Select condition...</option>
                  {conditions.map((condition, index) => (
                    <option key={condition.id || `condition-${index}`} value={condition.conditionName}>
                      {condition.conditionName}
                    </option>
                  ))}
                  <option key="other" value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Nutrition Targets */}
            {formData.conditionTag && formData.conditionTag !== "other" && (
              <div className="bg-green-50 p-3 rounded-lg space-y-4 relative min-h-[200px]">
                {loadingNutrients && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
                    <span className="text-sm text-green-700 font-medium">Loading nutrient data...</span>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                    <span className="text-green-600">🥗</span> Macro Nutrients
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <Label htmlFor="dailyCalories" className="text-xs text-gray-600">Calories</Label>
                      <Input
                        id="dailyCalories"
                        value={formData.dietAdvice?.dailyCalories || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, dailyCalories: e.target.value }
                        })}
                        placeholder="1800 kcal"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetProtein" className="text-xs text-gray-600">Protein</Label>
                      <Input
                        id="targetProtein"
                        value={formData.dietAdvice?.targetProtein || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetProtein: e.target.value }
                        })}
                        placeholder="60-80g"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetCarbs" className="text-xs text-gray-600">Carbs</Label>
                      <Input
                        id="targetCarbs"
                        value={formData.dietAdvice?.targetCarbs || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetCarbs: e.target.value }
                        })}
                        placeholder="200g"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetFat" className="text-xs text-gray-600">Fat</Label>
                      <Input
                        id="targetFat"
                        value={formData.dietAdvice?.targetFat || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetFat: e.target.value }
                        })}
                        placeholder="60g"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetFiber" className="text-xs text-gray-600">Fiber</Label>
                      <Input
                        id="targetFiber"
                        value={formData.dietAdvice?.targetFiber || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetFiber: e.target.value }
                        })}
                        placeholder="25g"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                    <span className="text-blue-600">💊</span> Micro Nutrients
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <Label htmlFor="targetSodium" className="text-xs text-gray-600">Sodium</Label>
                      <Input
                        id="targetSodium"
                        value={formData.dietAdvice?.targetSodium || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetSodium: e.target.value }
                        })}
                        placeholder="2300mg"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetPotassium" className="text-xs text-gray-600">Potassium</Label>
                      <Input
                        id="targetPotassium"
                        value={formData.dietAdvice?.targetPotassium || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetPotassium: e.target.value }
                        })}
                        placeholder="3500mg"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetCalcium" className="text-xs text-gray-600">Calcium</Label>
                      <Input
                        id="targetCalcium"
                        value={formData.dietAdvice?.targetCalcium || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetCalcium: e.target.value }
                        })}
                        placeholder="1000mg"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetIron" className="text-xs text-gray-600">Iron</Label>
                      <Input
                        id="targetIron"
                        value={formData.dietAdvice?.targetIron || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetIron: e.target.value }
                        })}
                        placeholder="18mg"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetMagnesium" className="text-xs text-gray-600">Magnesium</Label>
                      <Input
                        id="targetMagnesium"
                        value={formData.dietAdvice?.targetMagnesium || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetMagnesium: e.target.value }
                        })}
                        placeholder="400mg"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetZinc" className="text-xs text-gray-600">Zinc</Label>
                      <Input
                        id="targetZinc"
                        value={formData.dietAdvice?.targetZinc || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetZinc: e.target.value }
                        })}
                        placeholder="11mg"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetVitaminC" className="text-xs text-gray-600">Vitamin C</Label>
                      <Input
                        id="targetVitaminC"
                        value={formData.dietAdvice?.targetVitaminC || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetVitaminC: e.target.value }
                        })}
                        placeholder="90mg"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetVitaminD" className="text-xs text-gray-600">Vitamin D</Label>
                      <Input
                        id="targetVitaminD"
                        value={formData.dietAdvice?.targetVitaminD || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetVitaminD: e.target.value }
                        })}
                        placeholder="600IU"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetVitaminB12" className="text-xs text-gray-600">Vitamin B12</Label>
                      <Input
                        id="targetVitaminB12"
                        value={formData.dietAdvice?.targetVitaminB12 || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetVitaminB12: e.target.value }
                        })}
                        placeholder="2.4mcg"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetFolate" className="text-xs text-gray-600">Folate</Label>
                      <Input
                        id="targetFolate"
                        value={formData.dietAdvice?.targetFolate || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          dietAdvice: { ...formData.dietAdvice, targetFolate: e.target.value }
                        })}
                        placeholder="400mcg"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="hydration" className="text-xs text-gray-600">Hydration</Label>
                  <Input
                    id="hydration"
                    value={formData.dietAdvice?.hydration || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      dietAdvice: { ...formData.dietAdvice, hydration: e.target.value }
                    })}
                    placeholder="8 glasses"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Compact Recipe Selection */}
            <div>
              <Label htmlFor="recipeId" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-orange-600">🍽️</span> Recipe <span className="text-xs text-gray-400">(optional)</span>
              </Label>
              <select
                id="recipeId"
                className="mt-1 w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                value={formData.recipeId || ""}
                onChange={(e) => setFormData({ ...formData, recipeId: e.target.value })}
              >
                <option value="">General nutrition advice</option>
                {recipes.map((recipe, index) => (
                  <option key={recipe._id || `recipe-${index}`} value={recipe._id}>
                    {recipe.recipeTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Compact Notes */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span className="text-purple-600">📝</span> Special Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Allergies, restrictions, specific guidance..."
                rows={2}
                className="mt-1 text-sm resize-none"
              />
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 h-9 px-6 text-sm font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    📱 Send to Patient
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelForm}
                className="h-9 px-4 text-sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading recommendations...</span>
          </div>
        ) : !Array.isArray(recommendations) || filteredRecommendations.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            {searchTerm || statusFilter ? "No recommendations match your filters" :
              patients.length === 0 ? "Add patients first to create diet recommendations" :
                "No diet recommendations created yet"}
          </Card>
        ) : (
          filteredRecommendations.map((recommendation) => (
            <Card key={recommendation._id} className="p-5 border-[#cbd5e1] shadow-none hover:shadow-md transition-all bg-white rounded-2xl group border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border border-blue-100">
                  <User className="w-5 h-5 text-blue-500" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-[#111827] text-sm">
                        Sent to {recommendation.patientName || getPatientName(recommendation.patientId)}
                      </span>
                      <Badge className="bg-[#64748b] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {recommendation.conditionTag}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(recommendation.createdAt).toLocaleDateString()} at {new Date(recommendation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Diet:</span>
                      <span className="text-xs font-extrabold text-[#111827]">
                        {recommendation.recipeName || getRecipeTitle(recommendation.recipeId)}
                      </span>
                    </div>

                    {recommendation.dietAdvice && (
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                        {recommendation.dietAdvice.dailyCalories && (
                          <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col items-center">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Calories</div>
                            <div className="text-xs font-black text-blue-600">{recommendation.dietAdvice.dailyCalories}</div>
                          </div>
                        )}
                        {recommendation.dietAdvice.targetProtein && (
                          <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col items-center">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protein</div>
                            <div className="text-xs font-black text-orange-600">{recommendation.dietAdvice.targetProtein}</div>
                          </div>
                        )}
                        {recommendation.dietAdvice.targetCarbs && (
                          <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col items-center">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Carbs</div>
                            <div className="text-xs font-black text-emerald-600">{recommendation.dietAdvice.targetCarbs}</div>
                          </div>
                        )}
                        {recommendation.dietAdvice.targetFat && (
                          <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col items-center">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fat</div>
                            <div className="text-xs font-black text-red-600">{recommendation.dietAdvice.targetFat}</div>
                          </div>
                        )}
                        {recommendation.dietAdvice.hydration && (
                          <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col items-center">
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hydration</div>
                            <div className="text-xs font-black text-cyan-600">{recommendation.dietAdvice.hydration}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {recommendation.notes && (
                      <div className="text-xs font-medium text-slate-500 italic mt-2 border-l-2 border-slate-200 pl-3">
                        "{recommendation.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Delivered to patient's mobile device
                    </span>
                    <Badge className={`${recommendation.status === 'active' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-slate-100 text-slate-600'} border-none text-[9px] font-black px-2 py-0.5 rounded-full uppercase`}>
                      {recommendation.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}