// Types for admin doctor management and recipe assignments

export interface Doctor {
  id: string
  doctorName: string
  email: string
  phone?: string
  specialization?: string
  licenseNumber?: string
  status: 'active' | 'suspended' | 'pending'
  assignedRecipesCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateDoctorRequest {
  doctorName: string
  email: string
  phone?: string
  specialization?: string
  licenseNumber?: string
  status?: 'active' | 'suspended' | 'pending'
  password?: string
}

export interface CreateDoctorResponse {
  success: boolean
  data?: Doctor
  message: string
}

export interface FetchDoctorsResponse {
  success: boolean
  data?: Doctor[]
  message: string
  totalCount?: number
}

export interface RecipeAssignment {
  assignmentId: string
  recipeId: string
  doctorId: string
  recipeTitle: string
  doctorName: string
  conditionTag: string
  note?: string
  status: 'pending' | 'approved' | 'rejected'
  doctorComment?: string
  reviewedAt?: Date
  assignedAt: Date
  lastUpdated: Date
}

export interface CreateAssignmentRequest {
  doctorId: string
  recipeId: string
  conditionTag: string
  note?: string
}

export interface CreateAssignmentResponse {
  success: boolean
  data?: RecipeAssignment
  message: string
}

export interface FetchAssignmentsResponse {
  success: boolean
  data?: RecipeAssignment[]
  message: string
  totalCount?: number
}

export interface AssignmentStatusUpdate {
  assignmentId: string
  status: 'approved' | 'rejected'
  doctorComment?: string
  reviewedAt: Date
}

// For the assignment modal/form
export interface AssignmentFormData {
  doctorId: string
  recipeId: string
  conditionTag: string
  note: string
}

// API Error response for admin operations
export interface AdminApiError {
  success: false
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}

// Assignment filters for the admin dashboard
export interface AssignmentFilters {
  doctorId?: string
  conditionTag?: string
  status?: 'pending' | 'approved' | 'rejected'
  dateFrom?: Date
  dateTo?: Date
}

// Statistics for admin dashboard
export interface AdminStats {
  totalDoctors: number
  activeDoctors: number
  totalAssignments: number
  pendingReviews: number
  approvedRecipes: number
  rejectedRecipes: number
}