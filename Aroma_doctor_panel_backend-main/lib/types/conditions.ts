// Types for medical conditions and nutritional data

export interface Macronutrients {
  protein?: number    // grams
  carbs?: number      // grams  
  fat?: number        // grams
  fiber?: number      // grams
  calories?: number   // kcal
}

export interface Micronutrients {
  sodium?: number       // mg
  potassium?: number    // mg
  calcium?: number      // mg
  zinc?: number         // mg
  magnesium?: number    // mg
  iron?: number         // mg
  vitamin_b12?: number  // µg
  vitamin_d?: number    // IU
  vitamin_c?: number    // mg
  folate?: number       // µg
}

export interface CreateConditionRequest {
  conditionName: string
  description?: string
  macronutrients?: Macronutrients
  micronutrients?: Micronutrients
}

export interface Condition {
  id: string
  conditionName: string
  description?: string
  macronutrients?: Macronutrients
  micronutrients?: Micronutrients
  createdAt: Date
  updatedAt: Date
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