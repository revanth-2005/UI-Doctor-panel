/**
 * MongoDB Backend Services for Doctor Operations
 * API calls for patient management, assignments, and recommendations
 */

import { api } from './client'
import { API_ENDPOINTS } from '../config'

// ==================== PATIENT INTERFACES ====================

export interface Patient {
  _id: string
  id?: string // For compatibility, some components use id instead of _id
  name: string
  phone: string
  userId: string
  assignedDoctorId?: string
  medicalCondition?: string
  nutritionLimits?: {
    macros?: {
      calories?: number
      protein?: number
      carbs?: number
      fat?: number
      fiber?: number
    }
    micros?: {
      sodium?: number
      potassium?: number
      calcium?: number
      zinc?: number
      magnesium?: number
      iron?: number
      vitamin_b12?: number
      vitamin_d?: number
      vitamin_c?: number
      folate?: number
    }
  }
  createdAt?: Date
  updatedAt?: Date
}

export interface CreatePatientRequest {
  name: string
  phone: string
  userId?: string
  assignedDoctorId?: string
  medicalCondition?: string
  nutritionLimits?: {
    macros?: {
      calories?: number
      protein?: number
      carbs?: number
      fat?: number
      fiber?: number
    }
    micros?: {
      sodium?: number
      potassium?: number
      calcium?: number
      zinc?: number
      magnesium?: number
      iron?: number
      vitamin_b12?: number
      vitamin_d?: number
      vitamin_c?: number
      folate?: number
    }
  }
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {}

// ==================== RECOMMENDATION INTERFACES ====================

export interface Recommendation {
  _id: string
  patientId: string
  patientName?: string // For local storage recommendations
  doctorId: string
  recipeId?: string // Made optional
  recipeName?: string // For local storage recommendations
  conditionTag: string
  notes?: string
  status: 'active' | 'completed' | 'cancelled'
  dietAdvice?: {
    dailyCalories?: string
    targetProtein?: string
    targetCarbs?: string
    targetFat?: string
    targetFiber?: string
    targetSodium?: string
    targetPotassium?: string
    targetCalcium?: string
    targetZinc?: string
    targetMagnesium?: string
    targetIron?: string
    targetVitaminB12?: string
    targetVitaminD?: string
    targetVitaminC?: string
    targetFolate?: string
    vitamins?: string
    minerals?: string
    hydration?: string
    mealTiming?: string
  }
  createdAt: Date | string
  updatedAt: Date | string
  // Populated fields
  patient?: Patient
  recipe?: any
}

export interface CreateRecommendationRequest {
  patientId: string
  recipeId?: string // Made optional - can be empty for general diet recommendations
  conditionTag: string
  notes?: string
  dietAdvice?: {
    dailyCalories?: string
    targetProtein?: string
    targetCarbs?: string
    targetFat?: string
    targetFiber?: string
    targetSodium?: string
    targetPotassium?: string
    targetCalcium?: string
    targetZinc?: string
    targetMagnesium?: string
    targetIron?: string
    targetVitaminB12?: string
    targetVitaminD?: string
    targetVitaminC?: string
    targetFolate?: string
    vitamins?: string
    minerals?: string
    hydration?: string
    mealTiming?: string
  }
}

// ==================== ASSIGNMENT INTERFACES ====================

export interface DoctorAssignment {
  _id: string
  recipeId: string
  doctorId: string
  conditionTag: string
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
  assignedAt: Date
  reviewedAt?: Date
  // Populated fields
  recipe?: any
}

export interface ReviewAssignmentRequest {
  assignmentId: string
  status: 'approved' | 'rejected'
  comment?: string
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message: string
  totalCount?: number
}

// ==================== PATIENT SERVICES ====================

/**
 * Fetch all patients for the current doctor
 */
/**
 * Fetch all patients for a doctor (or all patients if no doctorId filtering needed)
 */
export async function fetchPatients(doctorId?: string): Promise<ApiResponse<Patient[]>> {
  try {
    console.log('🔍 Fetching patients...')
    
    // Use the patient list endpoint - the backend will handle any doctor-specific filtering
    const response = await api.get(API_ENDPOINTS.patient.list, {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    
    console.log('📋 Raw patients API response:', response)
    
    if (response.success) {
      // The backend returns data in 'patients' property, not 'data'
      let patients = Array.isArray(response.data?.patients) ? response.data.patients : 
                    Array.isArray(response.data) ? response.data : []
      
      // Map _id to id for compatibility
      patients = patients.map((patient: any) => ({
        ...patient,
        id: patient._id || patient.id
      }))
      
      console.log('📋 Processed patients:', patients)
      
      return {
        success: true,
        data: patients,
        message: response.message || `Found ${patients.length} patients`,
        totalCount: patients.length
      }
    } else {
      console.error('❌ Failed to fetch patients:', response)
      return {
        success: false,
        message: response.message || 'Failed to fetch patients'
      }
    }
  } catch (error: any) {
    console.error('❌ Error fetching patients:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred while fetching patients'
    }
  }
}

/**
 * Create a new patient
 */
export async function createPatient(doctorId: string, patientData: CreatePatientRequest): Promise<ApiResponse<Patient>> {
  try {
    console.log('📝 Creating patient:', patientData)

    // Map the patient data to match backend API format
    const backendPatientData = {
      name: patientData.name,
      phone: patientData.phone,
      userId: patientData.userId || `user_${Date.now()}`, // Generate userId if not provided
      assignedDoctorId: patientData.assignedDoctorId || doctorId, // Use provided ID or fallback to current doctor
      medicalCondition: patientData.medicalCondition,
      nutritionLimits: {
        macros: {
          calories: patientData.nutritionLimits?.macros?.calories,
          protein: patientData.nutritionLimits?.macros?.protein,
          carbs: patientData.nutritionLimits?.macros?.carbs,
          fat: patientData.nutritionLimits?.macros?.fat,
          fiber: patientData.nutritionLimits?.macros?.fiber
        },
        micros: {
          sodium: patientData.nutritionLimits?.micros?.sodium,
          potassium: patientData.nutritionLimits?.micros?.potassium,
          calcium: patientData.nutritionLimits?.micros?.calcium,
          zinc: patientData.nutritionLimits?.micros?.zinc,
          magnesium: patientData.nutritionLimits?.micros?.magnesium,
          iron: patientData.nutritionLimits?.micros?.iron,
          vitamin_b12: patientData.nutritionLimits?.micros?.vitamin_b12,
          vitamin_d: patientData.nutritionLimits?.micros?.vitamin_d,
          vitamin_c: patientData.nutritionLimits?.micros?.vitamin_c,
          folate: patientData.nutritionLimits?.micros?.folate
        }
      }
    }

    const response = await api.post(API_ENDPOINTS.patient.create, backendPatientData)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Patient created successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to create patient'
      }
    }
  } catch (error: any) {
    console.error('Error creating patient:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Update an existing patient
 */
export async function updatePatient(patientId: string, patientData: UpdatePatientRequest): Promise<ApiResponse<Patient>> {
  try {
    const response = await api.put(API_ENDPOINTS.patient.update(patientId), patientData)
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Patient updated successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to update patient'
      }
    }
  } catch (error: any) {
    console.error('Error updating patient:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Delete a patient
 */
export async function deletePatient(patientId: string): Promise<ApiResponse<boolean>> {
  try {
    const response = await api.delete(API_ENDPOINTS.patient.delete(patientId))
    
    if (response.success) {
      return {
        success: true,
        message: response.message || 'Patient deleted successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to delete patient'
      }
    }
  } catch (error: any) {
    console.error('Error deleting patient:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

// ==================== ASSIGNMENT SERVICES ====================

/**
 * Fetch assignments for the current doctor
 */
export async function fetchDoctorAssignments(doctorId: string): Promise<ApiResponse<DoctorAssignment[]>> {
  try {
    const response = await api.get(`${API_ENDPOINTS.doctor.assignments}/${doctorId}`)
    
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
 * Submit assignment review (approve/reject)
 */
export async function reviewAssignment(reviewData: ReviewAssignmentRequest): Promise<ApiResponse<DoctorAssignment>> {
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

// ==================== RECOMMENDATION SERVICES ====================

/**
 * Fetch recommendations for the current doctor
 */
export async function fetchRecommendations(doctorId: string): Promise<ApiResponse<Recommendation[]>> {
  try {
    const response = await api.get(`${API_ENDPOINTS.doctor.recommendations}/${doctorId}`)
    
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
        message: response.message || 'Failed to fetch recommendations'
      }
    }
  } catch (error: any) {
    console.error('Error fetching recommendations:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}

/**
 * Create a new recommendation
 */
export async function createRecommendation(doctorId: string, recommendationData: CreateRecommendationRequest): Promise<ApiResponse<Recommendation>> {
  try {
    const response = await api.post(API_ENDPOINTS.doctor.recommendations, {
      ...recommendationData,
      doctorId
    })
    
    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message || 'Recommendation created successfully'
      }
    } else {
      return {
        success: false,
        message: response.message || 'Failed to create recommendation'
      }
    }
  } catch (error: any) {
    console.error('Error creating recommendation:', error)
    return {
      success: false,
      message: error.message || 'Network error occurred'
    }
  }
}