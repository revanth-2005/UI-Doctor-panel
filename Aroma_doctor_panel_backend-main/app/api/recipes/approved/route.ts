import { NextRequest, NextResponse } from 'next/server'

// Types for approved recipes
interface ApprovedRecipe {
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
  approvedAt: string
  approvedBy: string
  status: 'approved'
}

// Mock approved recipes (in real app, these come from recipe assignments that were approved)
const mockApprovedRecipes: ApprovedRecipe[] = [
  {
    id: "approved-recipe-1",
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
    approvedAt: new Date().toISOString(),
    approvedBy: "Dr. Sarah Wilson",
    status: 'approved'
  },
  {
    id: "approved-recipe-2", 
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
    approvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    approvedBy: "Dr. Michael Chen",
    status: 'approved'
  },
  {
    id: "approved-recipe-3",
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
    approvedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    approvedBy: "Dr. Emily Davis",
    status: 'approved'
  },
  {
    id: "approved-recipe-4",
    recipeTitle: "Anti-Inflammatory Turmeric Smoothie",
    description: "Nutrient-dense smoothie with turmeric and ginger for inflammation management",
    conditionTag: "arthritis",
    ingredients: [
      "1 cup unsweetened almond milk",
      "1/2 frozen banana",
      "1/2 cup frozen pineapple chunks",
      "1 tsp turmeric powder",
      "1/2 tsp fresh ginger, grated",
      "1 tbsp chia seeds",
      "1 tbsp almond butter",
      "1/2 tsp vanilla extract",
      "Pinch of black pepper",
      "1 tsp honey (optional)"
    ],
    instructions: [
      "Add all ingredients to a high-speed blender",
      "Blend on high for 60-90 seconds until smooth and creamy",
      "Add more almond milk if needed for desired consistency",
      "Taste and adjust sweetness with honey if desired",
      "Pour into a glass and serve immediately",
      "Garnish with a sprinkle of chia seeds if desired"
    ],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    nutritionInfo: {
      calories: 245,
      protein: 8,
      carbs: 28,
      fat: 12
    },
    approvedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    approvedBy: "Dr. Sarah Wilson",
    status: 'approved'
  }
]

/**
 * GET /api/recipes/approved
 * Get all approved recipes for recommendations
 * Query params:
 * - condition: string (optional) - filter by condition tag
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conditionFilter = searchParams.get('condition')

    let recipes = mockApprovedRecipes

    // Filter by condition if specified
    if (conditionFilter) {
      recipes = recipes.filter(recipe => 
        recipe.conditionTag.toLowerCase().includes(conditionFilter.toLowerCase())
      )
    }

    // Sort by approval date (newest first)
    recipes.sort((a, b) => 
      new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime()
    )

    console.log(`📋 Fetching approved recipes: ${recipes.length} found${conditionFilter ? ` for condition "${conditionFilter}"` : ''}`)

    return NextResponse.json({
      success: true,
      data: recipes,
      message: `Found ${recipes.length} approved recipes`,
      totalCount: recipes.length
    })

  } catch (error) {
    console.error('Error fetching approved recipes:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch approved recipes'
    }, { status: 500 })
  }
}