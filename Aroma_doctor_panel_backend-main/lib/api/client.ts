/**
 * HTTP Client for MongoDB Backend API
 * Centralized HTTP handling with error management and retry logic
 */

import { config, httpConfig, getAuthHeaders, buildApiUrl } from '../config'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  error?: string
  statusCode?: number
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  timeout?: number
  retries?: number
}

class HttpClient {
  private baseUrl: string
  private defaultTimeout: number
  private defaultRetries: number

  constructor() {
    this.baseUrl = config.mongodb.backendUrl
    this.defaultTimeout = config.api.timeout
    this.defaultRetries = config.api.retryAttempts
  }

  /**
   * Make an HTTP request to the MongoDB backend
   */
  async request<T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      params,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries
    } = options

    const url = buildApiUrl(endpoint, params)
    const authHeaders = getAuthHeaders()

    const requestConfig: RequestInit = {
      method,
      headers: {
        ...httpConfig.headers,
        ...authHeaders,
        ...headers
      } as HeadersInit,
      signal: AbortSignal.timeout(timeout)
    }

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body)
    }

    let lastError: any = null
    
    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔗 API Request [${method}]: ${url}${attempt > 0 ? ` (Retry ${attempt})` : ''}`)
        
        const response = await fetch(url, requestConfig)
        const data = await response.json()

        if (response.ok) {
          console.log(`✅ API Success [${response.status}]: ${url}`)
          return {
            success: true,
            data: data.data || data,
            message: data.message || 'Request successful',
            statusCode: response.status
          }
        } else {
          console.warn(`⚠️ API Error [${response.status}]: ${url}`, data)
          return {
            success: false,
            message: data.message || `HTTP ${response.status}: ${response.statusText}`,
            error: data.error || response.statusText,
            statusCode: response.status
          }
        }
      } catch (error: any) {
        lastError = error
        console.error(`❌ API Request Failed [Attempt ${attempt + 1}]: ${url}`, error)

        // Don't retry on client-side errors
        if (error.name === 'AbortError' || error.name === 'TypeError') {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    return {
      success: false,
      message: lastError?.message || 'Network error occurred',
      error: lastError?.name || 'NetworkError',
      statusCode: 0
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  /**
   * Upload file
   */
  async upload<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const authHeaders = getAuthHeaders()

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: authHeaders as Record<string, string>
    })
  }

  /**
   * Health check for the backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get(`${this.baseUrl}/health`)
      return response.success
    } catch (error) {
      console.error('❌ Backend health check failed:', error)
      return false
    }
  }

  /**
   * Test MongoDB connection
   */
  async testConnection(): Promise<ApiResponse> {
    return this.get(`${this.baseUrl}/api/test/connection`)
  }
}

// Create singleton instance
export const httpClient = new HttpClient()

// Export for convenience
export const api = {
  get: httpClient.get.bind(httpClient),
  post: httpClient.post.bind(httpClient),
  put: httpClient.put.bind(httpClient),
  delete: httpClient.delete.bind(httpClient),
  patch: httpClient.patch.bind(httpClient),
  upload: httpClient.upload.bind(httpClient),
  healthCheck: httpClient.healthCheck.bind(httpClient),
  testConnection: httpClient.testConnection.bind(httpClient)
}

export default httpClient