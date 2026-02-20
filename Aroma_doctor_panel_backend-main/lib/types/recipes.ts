// Types for recipe review system

export interface Recipe {
  id: string
  _id?: string
  recipeTitle: string
  conditionTag: string
  shortDescription: string
  fullDescription?: string
  ingredients: Ingredient[]
  instructions: string[]
  macronutrients: {
    protein?: number      // grams
    carbs?: number        // grams
    fat?: number          // grams
    fiber?: number        // grams
    calories?: number     // kcal
  }
  micronutrients?: {
    sodium?: number       // mg
    potassium?: number    // mg
    calcium?: number      // mg
    zinc?: number         // mg
    magnesium?: number    // mg
    iron?: number         // mg
    vitamin_b12?: number  // µg
    vitamin_d?: number    // IU
    vitamin_c?: number    // mg
    folate?: number       // µg
  }
  estimatedTime: number   // minutes
  servings: number
  uploadedBy: string      // admin ID
  uploadedAt: Date
  verifiedDate?: Date
  status: 'pending' | 'approved' | 'rejected' | 'active'
  reviewId?: string       // links to recipe_reviews collection
  imageUrl?: string       // recipe image URL
  source?: string         // recipe source
}

export interface Ingredient {
  name: string
  amount?: string
  unit?: string
  qty?: string
}

export interface RecipeReview {
  id: string
  recipeId: string
  doctorId: string
  status: 'approved' | 'rejected' | 'pending'
  comment?: string
  reviewedAt: Date
}

export interface ReviewRecipeRequest {
  recipeId: string
  doctorId: string
  status: 'approved' | 'rejected'
  comment?: string
}

export interface ReviewRecipeResponse {
  success: boolean
  data?: RecipeReview
  message: string
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface FetchRecipesResponse {
  success: boolean
  data?: Recipe[]
  message: string
  totalCount?: number
  pagination?: PaginationData
}

export interface RecipeDetailsModalProps {
  recipe: Recipe | null
  isOpen: boolean
  onClose: () => void
}

// API Error response
export interface RecipeApiError {
  success: false
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}

export interface CreateRecipeRequest {
  recipeTitle: string
  shortDescription: string
  ingredients: string[]
  instructions: string[]
  conditionTag: string
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
  }
  estimatedTime: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  servings: number
}