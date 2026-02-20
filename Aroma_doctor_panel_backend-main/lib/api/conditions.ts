/**
 * Conditions API Client
 * Handles all condition-related operations with MongoDB backend
 */

import { api } from './client'
import { API_ENDPOINTS } from '@/lib/config'
import type { 
  Condition, 
  CreateConditionRequest, 
  CreateConditionResponse,
  ApiErrorResponse 
} from '@/lib/types/conditions'

export interface ConditionApiResponse {
  success: boolean
  data?: Condition[]
  message: string
  error?: string
}

export interface SingleConditionApiResponse {
  success: boolean
  data?: Condition
  message: string
  error?: string
}

/**
 * Fetch all conditions from the backend
 */
export async function fetchConditions(): Promise<ConditionApiResponse> {
  try {
    console.log('🔍 Fetching conditions from:', API_ENDPOINTS.conditions.list)
    
    const response = await api.get(API_ENDPOINTS.conditions.list)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to fetch conditions',
        error: response.error
      }
    }

    console.log('✅ Conditions API response:', response.data)

    // The backend returns data in 'conditions' property
    const rawConditions = Array.isArray(response.data?.conditions) ? response.data.conditions : 
                          Array.isArray(response.data) ? response.data : []

    // Map backend format to frontend format
    // Note: If the data comes from our Next.js API, it might already be formatted.
    // We check for both formats here.
    const conditions = rawConditions.map((condition: any) => ({
      id: condition.id || condition._id,
      conditionName: condition.conditionName || condition.name,
      description: condition.description,
      macronutrients: condition.macronutrients || (condition.macros && Object.keys(condition.macros).length > 0 ? condition.macros : undefined),
      micronutrients: condition.micronutrients || (condition.micros && Object.keys(condition.micros).length > 0 ? condition.micros : undefined),
      createdAt: condition.createdAt ? new Date(condition.createdAt) : new Date(),
      updatedAt: condition.updatedAt ? new Date(condition.updatedAt) : new Date()
    }))

    return {
      success: true,
      data: conditions,
      message: 'Conditions fetched successfully'
    }

  } catch (error) {
    console.error('❌ Error fetching conditions:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch conditions'
    }
  }
}

/**
 * Create a new condition
 */
export async function createCondition(conditionData: CreateConditionRequest): Promise<SingleConditionApiResponse> {
  try {
    console.log('📝 Creating condition:', conditionData)

    // Map the condition data to match backend API format
    const backendConditionData = {
      name: conditionData.conditionName,
      description: conditionData.description,
      macros: conditionData.macronutrients,
      micros: conditionData.micronutrients
    }

    const response = await api.post(API_ENDPOINTS.conditions.create, backendConditionData)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to create condition',
        error: response.error
      }
    }

    console.log('✅ Condition created successfully:', response.data)

    return {
      success: true,
      data: response.data,
      message: response.message || 'Condition created successfully'
    }

  } catch (error) {
    console.error('❌ Error creating condition:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create condition'
    }
  }
}

/**
 * Update an existing condition
 */
export async function updateCondition(conditionId: string, conditionData: CreateConditionRequest): Promise<SingleConditionApiResponse> {
  try {
    console.log('📝 Updating condition:', conditionId, conditionData)

    // Map the condition data to match backend API format
    const backendConditionData = {
      name: conditionData.conditionName,
      description: conditionData.description,
      macros: conditionData.macronutrients ? {
        calories: conditionData.macronutrients.calories,
        protein: conditionData.macronutrients.protein,
        carbs: conditionData.macronutrients.carbs,
        fat: conditionData.macronutrients.fat,
        fiber: conditionData.macronutrients.fiber
      } : undefined,
      micros: conditionData.micronutrients ? {
        sodium: conditionData.micronutrients.sodium,
        potassium: conditionData.micronutrients.potassium,
        calcium: conditionData.micronutrients.calcium,
        zinc: conditionData.micronutrients.zinc,
        magnesium: conditionData.micronutrients.magnesium,
        iron: conditionData.micronutrients.iron,
        vitamin_b12: conditionData.micronutrients.vitamin_b12,
        vitamin_d: conditionData.micronutrients.vitamin_d,
        vitamin_c: conditionData.micronutrients.vitamin_c,
        folate: conditionData.micronutrients.folate
      } : undefined
    }

    const response = await api.put(API_ENDPOINTS.conditions.update(conditionId), backendConditionData)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update condition',
        error: response.error
      }
    }

    console.log('✅ Condition updated successfully:', response.data)

    return {
      success: true,
      data: response.data,
      message: response.message || 'Condition updated successfully'
    }

  } catch (error) {
    console.error('❌ Error updating condition:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update condition'
    }
  }
}

/**
 * Delete a condition
 */
export async function deleteCondition(conditionId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🗑️ Deleting condition:', conditionId)

    const response = await api.delete(API_ENDPOINTS.conditions.delete(conditionId))

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to delete condition'
      }
    }

    console.log('✅ Condition deleted successfully')

    return {
      success: true,
      message: response.message || 'Condition deleted successfully'
    }

  } catch (error) {
    console.error('❌ Error deleting condition:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete condition'
    }
  }
}

/**
 * Fetch a single condition by ID
 */
export async function fetchConditionById(conditionId: string): Promise<SingleConditionApiResponse> {
  try {
    console.log('🔍 Fetching condition by ID:', conditionId)

    const response = await api.get(`${API_ENDPOINTS.conditions.list}/${conditionId}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to fetch condition',
        error: response.error
      }
    }

    console.log('✅ Condition fetched successfully:', response.data)

    return {
      success: true,
      data: response.data,
      message: 'Condition fetched successfully'
    }

  } catch (error) {
    console.error('❌ Error fetching condition:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch condition'
    }
  }
}