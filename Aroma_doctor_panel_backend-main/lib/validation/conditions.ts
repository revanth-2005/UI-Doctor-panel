import { CreateConditionRequest, ValidationError, Macronutrients, Micronutrients } from '@/lib/types/conditions'

/**
 * Validates the condition creation request
 */
export function validateConditionRequest(data: any): { 
  isValid: boolean
  errors: ValidationError[]
  cleanedData?: CreateConditionRequest
} {
  const errors: ValidationError[] = []

  // Check required fields
  if (!data.conditionName || typeof data.conditionName !== 'string') {
    errors.push({
      field: 'conditionName',
      message: 'Condition name is required and must be a string'
    })
  } else if (data.conditionName.trim().length === 0) {
    errors.push({
      field: 'conditionName',
      message: 'Condition name cannot be empty'
    })
  }

  // Validate optional description
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push({
      field: 'description',
      message: 'Description must be a string'
    })
  }

  // Clean and validate macronutrients
  const cleanedMacros = validateMacronutrients(data.macronutrients)
  if (cleanedMacros.errors.length > 0) {
    errors.push(...cleanedMacros.errors)
  }

  // Clean and validate micronutrients
  const cleanedMicros = validateMicronutrients(data.micronutrients)
  if (cleanedMicros.errors.length > 0) {
    errors.push(...cleanedMicros.errors)
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  // Return cleaned data
  const cleanedData: CreateConditionRequest = {
    conditionName: data.conditionName.trim(),
    ...(data.description && { description: data.description.trim() }),
    ...(cleanedMacros.data && Object.keys(cleanedMacros.data).length > 0 && { macronutrients: cleanedMacros.data }),
    ...(cleanedMicros.data && Object.keys(cleanedMicros.data).length > 0 && { micronutrients: cleanedMicros.data })
  }

  return { isValid: true, errors: [], cleanedData }
}

/**
 * Validates macronutrients object
 */
function validateMacronutrients(macros: any): { data?: Macronutrients, errors: ValidationError[] } {
  if (!macros || typeof macros !== 'object') {
    return { errors: [] }
  }

  const errors: ValidationError[] = []
  const cleanedMacros: Macronutrients = {}

  const macroFields = ['protein', 'carbs', 'fat', 'fiber', 'calories'] as const

  for (const field of macroFields) {
    const value = macros[field]
    
    if (value !== undefined && value !== null && value !== '') {
      const numValue = parseFloat(value)
      
      if (isNaN(numValue)) {
        errors.push({
          field: `macronutrients.${field}`,
          message: `${field} must be a valid number`
        })
      } else if (numValue < 0) {
        errors.push({
          field: `macronutrients.${field}`,
          message: `${field} must be greater than or equal to 0`
        })
      } else {
        cleanedMacros[field] = numValue
      }
    }
  }

  return { data: cleanedMacros, errors }
}

/**
 * Validates micronutrients object
 */
function validateMicronutrients(micros: any): { data?: Micronutrients, errors: ValidationError[] } {
  if (!micros || typeof micros !== 'object') {
    return { errors: [] }
  }

  const errors: ValidationError[] = []
  const cleanedMicros: Micronutrients = {}

  const microFields = [
    'sodium', 'potassium', 'calcium', 'zinc', 'magnesium', 'iron',
    'vitamin_b12', 'vitamin_d', 'vitamin_c', 'folate'
  ] as const

  for (const field of microFields) {
    const value = micros[field]
    
    if (value !== undefined && value !== null && value !== '') {
      const numValue = parseFloat(value)
      
      if (isNaN(numValue)) {
        errors.push({
          field: `micronutrients.${field}`,
          message: `${field} must be a valid number`
        })
      } else if (numValue < 0) {
        errors.push({
          field: `micronutrients.${field}`,
          message: `${field} must be greater than or equal to 0`
        })
      } else {
        cleanedMicros[field] = numValue
      }
    }
  }

  return { data: cleanedMicros, errors }
}

/**
 * Generates a unique ID for new conditions
 */
export function generateConditionId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `condition_${timestamp}_${random}`
}

/**
 * Sanitizes string inputs
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  return input.trim().replace(/[<>]/g, '') // Basic XSS prevention
}