/**
 * MongoDB Backend Services for Admin Operations
 * Centralized API calls for doctor and assignment management
 */

import { api } from './client'
import { API_ENDPOINTS } from '../config'
import type { 
  Doctor, 
  CreateDoctorRequest, 
  CreateDoctorResponse,
  FetchDoctorsResponse,
  RecipeAssignment, 
  CreateAssignmentRequest, 
  CreateAssignmentResponse,
  FetchAssignmentsResponse
} from '../types/admin'

// ==================== DOCTOR SERVICES ====================

/**
 * Fetch all doctors with optional filters
 */
export async function fetchDoctors(
  search?: string, 
  status?: string
): Promise<FetchDoctorsResponse> {
  try {
    const params: Record<string, string | boolean> = {}
    if (search) params.search = search
    if (status) params.status = status

    const response = await api.get(API_ENDPOINTS.admin.doctors, params)
    
    if (response.success) {
      return {
        success: true,
        data: response.data || [],
        message: response.message,
        totalCount: response.data?.length || 0
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to fetch doctors'
      }
    }
  } catch (error: any) {
    console.error('Error fetching doctors:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Create a new doctor
 */
export async function createDoctor(
  doctorData: CreateDoctorRequest
): Promise<CreateDoctorResponse> {
  try {
    const response = await api.post(API_ENDPOINTS.admin.doctors, doctorData)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Doctor created successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to create doctor'
      }
    }
  } catch (error: any) {
    console.error('Error creating doctor:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Update doctor status
 */
export async function updateDoctorStatus(
  doctorId: string, 
  status: 'active' | 'suspended' | 'pending'
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.put(`${API_ENDPOINTS.admin.doctors}/${doctorId}`, { status })
    
    return {
      success: response.success,
      message: response.message || (response.success ? 'Doctor status updated' : 'Failed to update status')
    }
  } catch (error: any) {
    console.error('Error updating doctor status:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Delete a doctor
 */
export async function deleteDoctor(
  doctorId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`${API_ENDPOINTS.admin.doctors}/${doctorId}`)
    
    return {
      success: response.success,
      message: response.message || (response.success ? 'Doctor deleted successfully' : 'Failed to delete doctor')
    }
  } catch (error: any) {
    console.error('Error deleting doctor:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(doctorId: string): Promise<{ success: boolean; data?: Doctor; message: string }> {
  try {
    const response = await api.get(`${API_ENDPOINTS.admin.doctors}/${doctorId}`)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Doctor fetched successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Doctor not found'
      }
    }
  } catch (error: any) {
    console.error('Error fetching doctor:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

// ==================== ASSIGNMENT SERVICES ====================

/**
 * Fetch all assignments with optional filters
 */
export async function fetchAssignments(
  doctorId?: string, 
  status?: string
): Promise<FetchAssignmentsResponse> {
  try {
    const params: Record<string, string> = {}
    if (doctorId) params.doctorId = doctorId
    if (status) params.status = status

    const response = await api.get(API_ENDPOINTS.admin.assignments, params)
    
    if (response.success) {
      return {
        success: true,
        data: response.data || [],
        message: response.message,
        totalCount: response.data?.length || 0
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to fetch assignments'
      }
    }
  } catch (error: any) {
    console.error('Error fetching assignments:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Create a new recipe assignment
 */
export async function createAssignment(
  assignmentData: CreateAssignmentRequest
): Promise<CreateAssignmentResponse> {
  try {
    const response = await api.post(API_ENDPOINTS.admin.assignments, assignmentData)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Assignment created successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to create assignment'
      }
    }
  } catch (error: any) {
    console.error('Error creating assignment:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Update assignment status (used by doctors)
 */
export async function updateAssignmentStatus(
  assignmentId: string, 
  status: 'approved' | 'rejected', 
  doctorComment?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.put(`${API_ENDPOINTS.admin.assignments}/${assignmentId}`, {
      status,
      doctorComment,
      reviewedAt: new Date()
    })
    
    return {
      success: response.success,
      message: response.message || (response.success ? 'Assignment updated successfully' : 'Failed to update assignment')
    }
  } catch (error: any) {
    console.error('Error updating assignment status:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Get assignments for a specific doctor
 */
export async function getAssignmentsByDoctor(
  doctorId: string, 
  status?: string
): Promise<FetchAssignmentsResponse> {
  try {
    const params: Record<string, string> = {}
    if (status) params.status = status

    const response = await api.get(`${API_ENDPOINTS.admin.assignments}/doctor/${doctorId}`, params)
    
    if (response.success) {
      return {
        success: true,
        data: response.data || [],
        message: response.message,
        totalCount: response.data?.length || 0
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to fetch doctor assignments'
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

/**
 * Delete an assignment
 */
export async function deleteAssignment(
  assignmentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`${API_ENDPOINTS.admin.assignments}/${assignmentId}`)
    
    return {
      success: response.success,
      message: response.message || (response.success ? 'Assignment deleted successfully' : 'Failed to delete assignment')
    }
  } catch (error: any) {
    console.error('Error deleting assignment:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}