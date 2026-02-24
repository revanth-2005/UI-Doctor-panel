// Types for medical conditions and nutritional data

export interface Macronutrients {
  protein?: number | string    // grams
  carbs?: number | string    // grams  
  fat?: number | string    // grams
  fiber?: number | string    // grams
  calories?: number | string  // kcal
  [key: string]: any
}

export interface Micronutrients {
  sodium?: number | string      // mg
  potassium?: number | string   // mg
  calcium?: number | string     // mg
  zinc?: number | string        // mg
  magnesium?: number | string   // mg
  iron?: number | string        // mg
  vitamin_b12?: number | string // µg
  vitamin_d?: number | string   // IU
  vitamin_c?: number | string   // mg
  folate?: number | string      // µg
  [key: string]: any
}

export interface CreateConditionRequest {
  conditionName: string
  description?: string
  macronutrients?: Macronutrients
  micronutrients?: Micronutrients
  vitamins?: Record<string, any>
}

export interface Condition {
  id: string
  conditionName: string
  description?: string
  macronutrients?: Macronutrients
  micronutrients?: Micronutrients
  macros?: Macronutrients
  micros?: Micronutrients
  vitamins?: Record<string, any>
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateConditionResponse {
  success: boolean
  data?: Condition
  message: string
  error?: string
}

// Validation error type
export interface ValidationError {
  field: string
  message: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: ValidationError[]
}