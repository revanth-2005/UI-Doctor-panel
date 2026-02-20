/**
 * Health check service for MongoDB backend connectivity
 */

import { api } from './client'
import { API_ENDPOINTS } from '../config'

export interface HealthCheckResponse {
  success: boolean
  data?: {
    status: string
    message: string
    timestamp: string
    mongodb: string
  }
  message: string
}

/**
 * Check if the MongoDB backend is running and accessible
 */
export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  try {
    const response = await api.get(API_ENDPOINTS.public.health)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Backend is healthy and running'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Backend health check failed'
      }
    }
  } catch (error: any) {
    console.error('Backend health check error:', error)
    return {
      success: false,
      message: 'Cannot reach backend server at ' + API_ENDPOINTS.public.health
    }
  }
}

/**
 * Get backend info and available endpoints
 */
export async function getBackendInfo(): Promise<HealthCheckResponse> {
  try {
    const response = await api.get(API_ENDPOINTS.public.info)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Backend info retrieved successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to get backend info'
      }
    }
  } catch (error: any) {
    console.error('Backend info error:', error)
    return {
      success: false,
      message: 'Cannot reach backend server'
    }
  }
}