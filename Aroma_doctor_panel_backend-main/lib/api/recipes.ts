/**
 * MongoDB Backend Services for Recipe Operations
 * Centralized API calls for recipe management and reviews
 */

import { api } from './client'
import { API_ENDPOINTS } from '../config'

// Recipe interfaces for MongoDB backend
export interface Recipe {
  _id: string
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
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  reviewedBy?: string
  reviewedAt?: Date
  reviewComment?: string
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

export interface DoctorReviewRequest {
  assignmentId: string
  doctorId: string
  doctorName: string
  status: 'approved' | 'rejected'
  doctorComment?: string
}

// ==================== RECIPE SERVICES ====================

/**
 * Fetch all recipes with optional filters
 */
export async function fetchRecipes(
  condition?: string,
  status?: string,
  search?: string
): Promise<{ success: boolean; data?: Recipe[]; message: string }> {
  try {
    const params: Record<string, string> = {}
    if (condition) params.condition = condition
    if (status) params.status = status
    if (search) params.search = search

    // Use recipes endpoint
    const response = await api.get(API_ENDPOINTS.recipes.list, params)
    
    if (response.success) {
      return {
        success: true,
        data: response.data || [],
        message: response.message || 'Recipes fetched successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to fetch recipes'
      }
    }
  } catch (error: any) {
    console.error('Error fetching recipes:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Create a new recipe
 */
export async function createRecipe(
  recipeData: CreateRecipeRequest
): Promise<{ success: boolean; data?: Recipe; message: string }> {
  try {
    const response = await api.post(API_ENDPOINTS.admin.recipes, recipeData)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Recipe created successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to create recipe'
      }
    }
  } catch (error: any) {
    console.error('Error creating recipe:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(
  recipeId: string
): Promise<{ success: boolean; data?: Recipe; message: string }> {
  try {
    const response = await api.get(`${API_ENDPOINTS.admin.recipes}/${recipeId}`)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Recipe fetched successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Recipe not found'
      }
    }
  } catch (error: any) {
    console.error('Error fetching recipe:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Update a recipe
 */
export async function updateRecipe(
  recipeId: string,
  recipeData: Partial<CreateRecipeRequest>
): Promise<{ success: boolean; data?: Recipe; message: string }> {
  try {
    const response = await api.put(`${API_ENDPOINTS.admin.recipes}/${recipeId}`, recipeData)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Recipe updated successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to update recipe'
      }
    }
  } catch (error: any) {
    console.error('Error updating recipe:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(
  recipeId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`${API_ENDPOINTS.admin.recipes}/${recipeId}`)
    
    return {
      success: response.success,
      message: response.message || (response.success ? 'Recipe deleted successfully' : 'Failed to delete recipe')
    }
  } catch (error: any) {
    console.error('Error deleting recipe:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

// ==================== DOCTOR REVIEW SERVICES ====================

/**
 * Submit doctor review for recipe assignment
 */
export async function submitDoctorReview(
  reviewData: DoctorReviewRequest
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await api.post(API_ENDPOINTS.doctor.review, reviewData)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Review submitted successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to submit review'
      }
    }
  } catch (error: any) {
    console.error('Error submitting review:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Get doctor assignments for review
 */
export async function getDoctorAssignments(
  doctorId: string,
  status?: string
): Promise<{ success: boolean; data?: any[]; message: string }> {
  try {
    const params: Record<string, string> = { doctorId }
    if (status) params.status = status

    const response = await api.get(API_ENDPOINTS.admin.assignments, params)
    
    if (response.success) {
      return {
        success: true,
        data: response.data || [],
        message: response.message || 'Assignments fetched successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to fetch assignments'
      }
    }
  } catch (error: any) {
    console.error('Error fetching doctor assignments:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

// ==================== RECIPE ANALYTICS ====================

/**
 * Get recipe statistics
 */
export async function getRecipeStats(): Promise<{ 
  success: boolean; 
  data?: {
    totalRecipes: number
    pendingReviews: number
    approvedRecipes: number
    rejectedRecipes: number
    topConditions: Array<{ condition: string; count: number }>
  }; 
  message: string 
}> {
  try {
    const response = await api.get(`${API_ENDPOINTS.admin.recipes}/stats`)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Stats fetched successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to fetch stats'
      }
    }
  } catch (error: any) {
    console.error('Error fetching recipe stats:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}