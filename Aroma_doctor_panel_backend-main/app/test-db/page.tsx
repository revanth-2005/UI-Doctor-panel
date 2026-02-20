"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Plus, RefreshCw, TestTube, CheckCircle, XCircle } from "lucide-react"
import { fetchDoctors, createDoctor } from "@/lib/api/admin"
import { fetchRecipes, createRecipe } from "@/lib/api/recipes"
import { checkBackendHealth } from "@/lib/api/health"
import { Doctor } from "@/lib/types/admin"
import { Recipe } from "@/lib/api/recipes"

export default function DatabaseTestPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [backendHealth, setBackendHealth] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>({})
  const { toast } = useToast()

  // Doctor form data
  const [doctorForm, setDoctorForm] = useState({
    doctorName: "",
    email: "",
    specialization: "",
    licenseNumber: "",
    phone: "",
    bio: ""
  })

  // Recipe form data
  const [recipeForm, setRecipeForm] = useState({
    recipeTitle: "",
    shortDescription: "",
    ingredients: "",
    instructions: "",
    conditionTag: "",
    estimatedTime: 30,
    servings: 4,
    nutritionInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    }
  })

  useEffect(() => {
    runInitialTests()
  }, [])

  const runInitialTests = async () => {
    setLoading(true)
    const results: any = {}

    // Test 1: Backend Health
    console.log("Testing backend health...")
    try {
      const healthResult = await checkBackendHealth()
      setBackendHealth(healthResult.data)
      results.health = healthResult.success ? "✅ PASS" : "❌ FAIL"
    } catch (error) {
      results.health = "❌ FAIL - " + (error as Error).message
    }

    // Test 2: Fetch Doctors
    console.log("Testing fetch doctors...")
    try {
      const doctorsResult = await fetchDoctors()
      if (doctorsResult.success && doctorsResult.data) {
        setDoctors(doctorsResult.data)
        results.fetchDoctors = `✅ PASS - Found ${doctorsResult.data.length} doctors`
      } else {
        results.fetchDoctors = "❌ FAIL - " + doctorsResult.message
      }
    } catch (error) {
      results.fetchDoctors = "❌ FAIL - " + (error as Error).message
    }

    // Test 3: Fetch Recipes
    console.log("Testing fetch recipes...")
    try {
      const recipesResult = await fetchRecipes()
      if (recipesResult.success && recipesResult.data) {
        setRecipes(recipesResult.data)
        results.fetchRecipes = `✅ PASS - Found ${recipesResult.data.length} recipes`
      } else {
        results.fetchRecipes = "❌ FAIL - " + recipesResult.message
      }
    } catch (error) {
      results.fetchRecipes = "❌ FAIL - " + (error as Error).message
    }

    setTestResults(results)
    setLoading(false)
  }

  const handleCreateDoctor = async () => {
    if (!doctorForm.doctorName || !doctorForm.email) {
      toast({
        title: "Validation Error",
        description: "Doctor name and email are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await createDoctor({
        doctorName: doctorForm.doctorName,
        email: doctorForm.email,
        specialization: doctorForm.specialization,
        licenseNumber: doctorForm.licenseNumber,
        phone: doctorForm.phone
      })

      if (result.success) {
        toast({
          title: "Success!",
          description: "Doctor created successfully in MongoDB",
          variant: "default"
        })
        
        // Reset form
        setDoctorForm({
          doctorName: "",
          email: "",
          specialization: "",
          licenseNumber: "",
          phone: "",
          bio: ""
        })

        // Refresh doctors list
        const doctorsResult = await fetchDoctors()
        if (doctorsResult.success && doctorsResult.data) {
          setDoctors(doctorsResult.data)
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleCreateRecipe = async () => {
    if (!recipeForm.recipeTitle || !recipeForm.shortDescription) {
      toast({
        title: "Validation Error", 
        description: "Recipe title and description are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await createRecipe({
        recipeTitle: recipeForm.recipeTitle,
        shortDescription: recipeForm.shortDescription,
        ingredients: recipeForm.ingredients.split('\n').filter(i => i.trim()),
        instructions: recipeForm.instructions.split('\n').filter(i => i.trim()),
        conditionTag: recipeForm.conditionTag,
        estimatedTime: recipeForm.estimatedTime,
        servings: recipeForm.servings,
        difficulty: 'Medium' as const,
        nutritionInfo: recipeForm.nutritionInfo
      })

      if (result.success) {
        toast({
          title: "Success!",
          description: "Recipe created successfully in MongoDB", 
          variant: "default"
        })

        // Reset form
        setRecipeForm({
          recipeTitle: "",
          shortDescription: "",
          ingredients: "",
          instructions: "",
          conditionTag: "",
          estimatedTime: 30,
          servings: 4,
          nutritionInfo: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0
          }
        })

        // Refresh recipes list
        const recipesResult = await fetchRecipes()
        if (recipesResult.success && recipesResult.data) {
          setRecipes(recipesResult.data)
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: (error as Error).message,
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 MongoDB Database Test Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Test adding doctors and recipes to verify database connectivity
          </p>
        </div>

        {/* Backend Status */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <TestTube className="w-6 h-6" />
            Backend Connection Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-600">Backend Health</div>
              <div className="text-lg font-semibold">{testResults.health || "🔄 Testing..."}</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-600">Fetch Doctors</div>
              <div className="text-lg font-semibold">{testResults.fetchDoctors || "🔄 Testing..."}</div>
            </div>
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-600">Fetch Recipes</div>
              <div className="text-lg font-semibold">{testResults.fetchRecipes || "🔄 Testing..."}</div>
            </div>
          </div>

          {backendHealth && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-800">MongoDB Status: {backendHealth.mongodb}</div>
              <div className="text-sm text-green-600">Last Check: {backendHealth.timestamp}</div>
            </div>
          )}

          <Button
            onClick={runInitialTests}
            disabled={loading}
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Tests
          </Button>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Doctor Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Add New Doctor
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctorName">Doctor Name *</Label>
                  <Input
                    id="doctorName"
                    value={doctorForm.doctorName}
                    onChange={(e) => setDoctorForm({...doctorForm, doctorName: e.target.value})}
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                    placeholder="doctor@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                    placeholder="Nutritionist"
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={doctorForm.licenseNumber}
                    onChange={(e) => setDoctorForm({...doctorForm, licenseNumber: e.target.value})}
                    placeholder="LIC123456"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                  placeholder="+1-555-0123"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({...doctorForm, bio: e.target.value})}
                  placeholder="Brief professional biography..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCreateDoctor}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Add Doctor to Database"}
              </Button>
            </div>

            {/* Current Doctors */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Current Doctors ({doctors.length})</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <div className="font-medium">{doctor.doctorName}</div>
                      <div className="text-sm text-gray-600">{doctor.email}</div>
                    </div>
                    <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                      {doctor.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Add Recipe Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Add New Recipe
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="recipeTitle">Recipe Title *</Label>
                <Input
                  id="recipeTitle"
                  value={recipeForm.recipeTitle}
                  onChange={(e) => setRecipeForm({...recipeForm, recipeTitle: e.target.value})}
                  placeholder="Healthy Mediterranean Bowl"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Description *</Label>
                <Textarea
                  id="shortDescription"
                  value={recipeForm.shortDescription}
                  onChange={(e) => setRecipeForm({...recipeForm, shortDescription: e.target.value})}
                  placeholder="A nutritious and delicious meal..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="conditionTag">Condition Tag</Label>
                  <Input
                    id="conditionTag"
                    value={recipeForm.conditionTag}
                    onChange={(e) => setRecipeForm({...recipeForm, conditionTag: e.target.value})}
                    placeholder="diabetes, heart-health"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedTime">Time (minutes)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={recipeForm.estimatedTime}
                    onChange={(e) => setRecipeForm({...recipeForm, estimatedTime: parseInt(e.target.value) || 30})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                <Textarea
                  id="ingredients"
                  value={recipeForm.ingredients}
                  onChange={(e) => setRecipeForm({...recipeForm, ingredients: e.target.value})}
                  placeholder="2 cups quinoa&#10;1 tbsp olive oil&#10;1 cup cherry tomatoes"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions (one per line)</Label>
                <Textarea
                  id="instructions"
                  value={recipeForm.instructions}
                  onChange={(e) => setRecipeForm({...recipeForm, instructions: e.target.value})}
                  placeholder="Cook quinoa according to package directions&#10;Heat olive oil in pan&#10;Add tomatoes and sauté"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleCreateRecipe}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Add Recipe to Database"}
              </Button>
            </div>

            {/* Current Recipes */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Current Recipes ({recipes.length})</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {recipes.map((recipe) => (
                  <div key={recipe._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <div className="font-medium">{recipe.recipeTitle}</div>
                      <div className="text-sm text-gray-600">{recipe.shortDescription}</div>
                    </div>
                    <Badge variant={recipe.status === 'approved' ? 'default' : 'secondary'}>
                      {recipe.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}