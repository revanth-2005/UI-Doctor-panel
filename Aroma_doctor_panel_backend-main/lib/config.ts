/**
 * Global configuration for the Aroma Diet Plan System
 * This file provides centralized access to environment variables
 */

interface AppConfig {
  mongodb: {
    backendUrl: string
    recipeServiceUrl: string
    uri: string
    dbName: string
  }
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
  }
  app: {
    name: string
    version: string
    environment: string
  }
  auth: {
    jwtSecret: string
    jwtExpiresIn: string
  }
}

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_BACKEND_URL',
  'NEXT_PUBLIC_API_URL'
]

// Check if all required environment variables are set
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`)
}

export const config: AppConfig = {
  mongodb: {
    backendUrl: process.env.MONGODB_BACKEND_URL || 'https://aroma-db-six.vercel.app',
    recipeServiceUrl: process.env.RECIPE_SERVICE_URL || 'http://46.202.162.34:3009',
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aroma_db',
    dbName: process.env.MONGODB_DB_NAME || 'aroma_db'
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://aroma-db-six.vercel.app',
    timeout: parseInt(process.env.API_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3')
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Aroma Diet Plan System',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret-please-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
}

// MongoDB Backend API endpoints - Frontend API routes that proxy to backend
export const API_ENDPOINTS = {
  // Admin routes (for doctor management, assignments, etc.)
  admin: {
    doctors: '/api/admin/doctors',
    assignments: '/api/admin/assignments',
    recipes: '/api/admin/recipes',
    dashboard: '/api/admin/dashboard'
  },
  // Doctor routes
  doctor: {
    assignments: (doctorId: string) => `/api/doctor/assignments/${doctorId}`,
    review: '/api/doctor/review',
    recommendations: '/api/doctor/recommendations'
  },
  // Patient routes
  patient: {
    list: '/api/patient',
    create: '/api/patient',
    byId: (id: string) => `/api/patient/${id}`,
    update: (id: string) => `/api/patient/${id}`,
    delete: (id: string) => `/api/patient/${id}`
  },
  // Recipe routes
  recipes: {
    list: '/api/recipes',
    create: '/api/recipes',
    byId: (id: string) => `/api/recipes/${id}`,
    update: (id: string) => `/api/recipes/${id}`,
    delete: (id: string) => `/api/recipes/${id}`
  },
  // Condition routes  
  conditions: {
    list: '/api/conditions',
    create: '/api/conditions',
    byId: (id: string) => `/api/conditions/${id}`,
    update: (id: string) => `/api/conditions/${id}`,
    delete: (id: string) => `/api/conditions/${id}`
  },
  // Public routes (direct backend access for health checks)
  public: {
    health: `${config.mongodb.backendUrl}/health`,
    info: `${config.mongodb.backendUrl}/`
  }
} as const

// HTTP Client configuration
export const httpConfig = {
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// Utility function to get authorization header
export const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  return {}
}

// Utility function to build API URL with query parameters
export const buildApiUrl = (baseUrl: string, params?: Record<string, string | number | boolean>) => {
  if (!params) return baseUrl
  
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

// Log configuration on startup
if (config.app.environment === 'development') {
  console.log('🔧 App Configuration:', {
    environment: config.app.environment,
    mongoBackendUrl: config.mongodb.backendUrl,
    apiBaseUrl: config.api.baseUrl
  })
}

export default config