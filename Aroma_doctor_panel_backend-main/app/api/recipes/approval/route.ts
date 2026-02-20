import { NextRequest, NextResponse } from 'next/server'

// Types for recipe approval workflow
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
  doctorReview?: {
    doctorId: string
    status: 'approved' | 'rejected'
    notes: string
    reviewedAt: string
  }
}

interface ApprovalRequest {
  recipeId: string
  status: 'approved' | 'rejected'
  doctorNotes: string
  doctorId: string
}

// Mock data for pending recipes
const mockPendingRecipes: PendingRecipe[] = [
  {
    id: "recipe-approval-1",
    recipeTitle: "Diabetic-Friendly Quinoa Bowl",
    description: "A nutritious quinoa bowl perfect for diabetes management with low glycemic index ingredients",
    conditionTag: "diabetes",
    ingredients: [
      "1 cup quinoa, rinsed",
      "2 cups low-sodium vegetable broth",
      "1 cup mixed vegetables (bell peppers, cucumber, tomatoes)",
      "1/4 cup olive oil",
      "2 tbsp fresh lemon juice",
      "1 tsp dried oregano",
      "1/4 cup fresh parsley, chopped",
      "1/4 cup red onion, finely diced",
      "Salt and black pepper to taste"
    ],
    instructions: [
      "Rinse quinoa thoroughly under cold water until water runs clear",
      "In a medium saucepan, bring vegetable broth to a boil",
      "Add quinoa, reduce heat to low, cover and simmer for 15 minutes",
      "Remove from heat and let stand for 5 minutes, then fluff with a fork",
      "Allow quinoa to cool to room temperature",
      "Dice vegetables into small, uniform pieces",
      "In a large bowl, whisk together olive oil, lemon juice, and oregano",
      "Add cooled quinoa and all vegetables to the dressing",
      "Toss gently to combine and season with salt and pepper",
      "Garnish with fresh parsley and serve chilled or at room temperature"
    ],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    nutritionInfo: {
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 10
    },
    submittedBy: "admin",
    submittedAt: new Date().toISOString(),
    status: 'pending'
  },
  {
    id: "recipe-approval-2", 
    recipeTitle: "Heart-Healthy Salmon Salad",
    description: "Omega-3 rich salmon salad designed for cardiovascular health with anti-inflammatory ingredients",
    conditionTag: "hypertension",
    ingredients: [
      "6 oz wild-caught salmon fillet",
      "4 cups mixed organic greens (spinach, arugula, lettuce)",
      "1/2 ripe avocado, sliced",
      "1/4 cup raw walnuts, chopped",
      "1/4 cup cherry tomatoes, halved", 
      "2 tbsp extra virgin olive oil",
      "1 tbsp balsamic vinegar",
      "1 tsp Dijon mustard",
      "1 clove garlic, minced",
      "Lemon wedges for serving"
    ],
    instructions: [
      "Preheat grill or grill pan to medium-high heat",
      "Season salmon with salt, pepper, and a drizzle of olive oil",
      "Grill salmon for 4-5 minutes per side until internal temperature reaches 145°F",
      "Let salmon rest for 2 minutes, then flake into bite-sized pieces",
      "Wash and thoroughly dry mixed greens",
      "Arrange greens in a large serving bowl",
      "Top with avocado slices, cherry tomatoes, and walnuts",
      "In a small bowl, whisk together remaining olive oil, balsamic vinegar, Dijon mustard, and minced garlic",
      "Add flaked salmon on top of salad",
      "Drizzle with dressing just before serving",
      "Serve immediately with lemon wedges"
    ],
    prepTime: 10,
    cookTime: 12,
    servings: 2,
    nutritionInfo: {
      calories: 450,
      protein: 35,
      carbs: 8,
      fat: 32
    },
    submittedBy: "admin",
    submittedAt: new Date().toISOString(),
    status: 'pending'
  },
  {
    id: "recipe-approval-3",
    recipeTitle: "Low-Sodium Mediterranean Chicken",
    description: "Herb-crusted chicken breast with Mediterranean vegetables, perfect for blood pressure management",
    conditionTag: "hypertension",
    ingredients: [
      "4 boneless, skinless chicken breasts",
      "2 zucchini, sliced",
      "1 eggplant, diced",
      "1 red bell pepper, strips",
      "1 yellow bell pepper, strips",
      "1/4 cup olive oil",
      "2 tbsp fresh rosemary, chopped",
      "2 tbsp fresh thyme",
      "3 cloves garlic, minced",
      "1 lemon, juiced and zested",
      "1/4 cup fresh basil, chopped",
      "Black pepper to taste"
    ],
    instructions: [
      "Preheat oven to 425°F (220°C)",
      "Pound chicken breasts to even 1-inch thickness",
      "In a small bowl, mix 2 tbsp olive oil, rosemary, thyme, garlic, lemon zest, and black pepper",
      "Rub herb mixture all over chicken breasts",
      "Let chicken marinate for 15 minutes at room temperature",
      "Toss vegetables with remaining olive oil and black pepper",
      "Arrange vegetables on a large baking sheet",
      "Place seasoned chicken on top of vegetables",
      "Bake for 20-25 minutes until chicken reaches 165°F internal temperature",
      "Drizzle with fresh lemon juice and garnish with fresh basil",
      "Let rest for 5 minutes before serving"
    ],
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    nutritionInfo: {
      calories: 285,
      protein: 32,
      carbs: 12,
      fat: 12
    },
    submittedBy: "admin",
    submittedAt: new Date().toISOString(),
    status: 'pending'
  }
]

// GET - Fetch pending recipes for approval
export async function GET() {
  try {
    // In a real application, this would fetch from MongoDB
    // Filter only pending recipes that need doctor approval
    const pendingRecipes = mockPendingRecipes.filter(recipe => recipe.status === 'pending')
    
    return NextResponse.json({
      success: true,
      data: pendingRecipes,
      message: `Found ${pendingRecipes.length} recipes pending approval`,
      totalCount: pendingRecipes.length
    })
  } catch (error) {
    console.error('Error fetching pending recipes for approval:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch pending recipes'
    }, { status: 500 })
  }
}

// POST - Submit recipe approval/rejection
export async function POST(request: NextRequest) {
  try {
    const body: ApprovalRequest = await request.json()
    
    // Validate required fields
    if (!body.recipeId || !body.status || !body.doctorNotes || !body.doctorId) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: recipeId, status, doctorNotes, and doctorId are required'
      }, { status: 400 })
    }

    // Validate status
    if (!['approved', 'rejected'].includes(body.status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      }, { status: 400 })
    }

    // Find the recipe
    const recipeIndex = mockPendingRecipes.findIndex(r => r.id === body.recipeId)
    if (recipeIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Recipe not found'
      }, { status: 404 })
    }

    const recipe = mockPendingRecipes[recipeIndex]

    // Check if already reviewed
    if (recipe.status !== 'pending') {
      return NextResponse.json({
        success: false,
        message: 'Recipe has already been reviewed'
      }, { status: 400 })
    }

    // Update recipe with doctor's review
    const reviewedAt = new Date().toISOString()
    mockPendingRecipes[recipeIndex] = {
      ...recipe,
      status: body.status as 'approved' | 'rejected',
      doctorReview: {
        doctorId: body.doctorId,
        status: body.status,
        notes: body.doctorNotes,
        reviewedAt
      }
    }

    console.log('📝 Recipe approval submitted:', {
      recipeId: body.recipeId,
      recipeTitle: recipe.recipeTitle,
      status: body.status,
      doctorId: body.doctorId,
      notes: body.doctorNotes,
      reviewedAt
    })

    // Mock admin notification - in real app, this would:
    // 1. Send notification to admin dashboard
    // 2. Update admin notification count
    // 3. Send email notification if configured
    console.log('🔔 Admin notification:', {
      type: 'recipe_reviewed',
      recipeTitle: recipe.recipeTitle,
      conditionTag: recipe.conditionTag,
      doctorDecision: body.status,
      doctorNotes: body.doctorNotes,
      timestamp: reviewedAt,
      requiresAdminAction: true
    })

    // If approved, mock adding to available recipes database
    if (body.status === 'approved') {
      console.log('✅ Recipe approved - will be available for recommendations:', {
        recipeId: body.recipeId,
        recipeTitle: recipe.recipeTitle,
        conditionTag: recipe.conditionTag
      })
    }

    return NextResponse.json({
      success: true,
      message: `Recipe ${body.status} successfully. Admin has been notified and will make the final decision.`,
      data: {
        recipeId: body.recipeId,
        status: body.status,
        reviewedAt,
        reviewedBy: body.doctorId,
        adminNotified: true
      }
    })

  } catch (error) {
    console.error('Error submitting recipe approval:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to submit recipe approval'
    }, { status: 500 })
  }
}