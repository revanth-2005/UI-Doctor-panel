// Shared mock data for recipe assignments
// In production, this would be replaced with MongoDB database calls

export interface SharedAssignment {
  assignmentId: string
  recipeId: string
  doctorId: string
  recipeTitle: string
  doctorName: string
  conditionTag: string
  note?: string
  status: 'pending' | 'approved' | 'rejected'
  assignedAt: Date
  lastUpdated: Date
  reviewedAt?: Date
  doctorComment?: string
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

// Shared assignments storage
export let sharedAssignments: SharedAssignment[] = [
  {
    assignmentId: 'assign_001',
    recipeId: '64e78acdf812a1b2c3d4e5f6',
    doctorId: '1',
    recipeTitle: 'Grilled Chicken Salad',
    doctorName: 'Dr. Vijay',
    conditionTag: 'Diabetes Type 2',
    note: 'Standard low-carb option. Fiber is slightly low.',
    status: 'pending',
    assignedAt: new Date('2024-11-10T10:00:00Z'),
    lastUpdated: new Date('2024-11-10T10:00:00Z'),
    nutrition: { calories: 350, protein: 40, carbs: 12, fat: 15 }
  },
  {
    assignmentId: 'assign_002',
    recipeId: 'recipe_2',
    doctorId: '1',
    recipeTitle: 'Low-Carb Salmon Stir-fry',
    doctorName: 'Dr. Vijay',
    conditionTag: 'Hypertension',
    note: 'Evaluate sodium levels in the soy sauce substitute.',
    status: 'pending',
    assignedAt: new Date('2024-11-11T09:30:00Z'),
    lastUpdated: new Date('2024-11-11T09:30:00Z'),
    nutrition: { calories: 420, protein: 35, carbs: 8, fat: 28 }
  },
  {
    assignmentId: 'assign_003',
    recipeId: 'recipe_3',
    doctorId: '1',
    recipeTitle: 'Quinoa & Avocado Buddha Bowl',
    doctorName: 'Dr. Vijay',
    conditionTag: 'Heart Disease',
    note: 'Excellent healthy fat profile. High caloric density.',
    status: 'pending',
    assignedAt: new Date('2024-11-12T14:15:00Z'),
    lastUpdated: new Date('2024-11-12T14:15:00Z'),
    nutrition: { calories: 580, protein: 18, carbs: 65, fat: 32 }
  },
  {
    assignmentId: 'assign_004',
    recipeId: 'recipe_4',
    doctorId: '1',
    recipeTitle: 'Lentil Herb Soup',
    doctorName: 'Dr. Vijay',
    conditionTag: 'Diabetes',
    note: 'High fiber content. Good for glycemic control.',
    status: 'pending',
    assignedAt: new Date('2024-11-13T11:00:00Z'),
    lastUpdated: new Date('2024-11-13T11:00:00Z'),
    nutrition: { calories: 310, protein: 22, carbs: 45, fat: 4 }
  },
  {
    assignmentId: 'assign_005',
    recipeId: 'recipe_5',
    doctorId: '1',
    recipeTitle: 'Spinach & Feta Stuffed Chicken',
    doctorName: 'Dr. Vijay',
    conditionTag: 'Keto / Diabetes',
    note: 'Premium protein source. Check saturated fat levels.',
    status: 'pending',
    assignedAt: new Date('2024-11-14T10:00:00Z'),
    lastUpdated: new Date('2024-11-14T10:00:00Z'),
    nutrition: { calories: 380, protein: 45, carbs: 5, fat: 20 }
  },
  {
    assignmentId: 'assign_006',
    recipeId: 'recipe_6',
    doctorId: '1',
    recipeTitle: 'Mediterranean Roasted Chickpeas',
    doctorName: 'Dr. Vijay',
    conditionTag: 'Heart Disease',
    note: 'Great snack alternative. Monitor olive oil usage.',
    status: 'pending',
    assignedAt: new Date('2024-11-15T08:45:00Z'),
    lastUpdated: new Date('2024-11-15T08:45:00Z'),
    nutrition: { calories: 210, protein: 10, carbs: 30, fat: 7 }
  },
  {
    assignmentId: 'assign_007',
    recipeId: 'recipe_7',
    doctorId: '1',
    recipeTitle: 'Zucchini Noodles w/ Pesto',
    doctorName: 'Dr. Vijay',
    conditionTag: 'Hypertension',
    note: 'Ideal low-sodium pasta replacement.',
    status: 'pending',
    assignedAt: new Date('2024-11-16T16:20:00Z'),
    lastUpdated: new Date('2024-11-16T16:20:00Z'),
    nutrition: { calories: 280, protein: 8, carbs: 12, fat: 24 }
  }
]

// Utility functions to manipulate shared data
export const addAssignment = (assignment: SharedAssignment) => {
  sharedAssignments.push(assignment)
}

export const updateAssignment = (assignmentId: string, updates: Partial<SharedAssignment>) => {
  const index = sharedAssignments.findIndex(a => a.assignmentId === assignmentId)
  if (index !== -1) {
    sharedAssignments[index] = { ...sharedAssignments[index], ...updates }
    return sharedAssignments[index]
  }
  return null
}

export const getAssignments = () => {
  return [...sharedAssignments]
}

export const getAssignmentsByDoctor = (doctorId: string) => {
  return sharedAssignments.filter(a => a.doctorId === doctorId)
}

export const getAssignmentById = (assignmentId: string) => {
  return sharedAssignments.find(a => a.assignmentId === assignmentId)
}

// Delete assignment by ID
export const deleteAssignment = (assignmentId: string) => {
  const index = sharedAssignments.findIndex(a => a.assignmentId === assignmentId)
  if (index !== -1) {
    return sharedAssignments.splice(index, 1)[0]
  }
  return null
}

// Recipe and Doctor data
export const mockRecipes = [
  {
    id: '64e78acdf812a1b2c3d4e5f6',
    _id: '64e78acdf812a1b2c3d4e5f6',
    recipeTitle: 'Grilled Chicken Salad',
    conditionTag: 'Diabetes Type 2'
  },
  {
    id: '64e78acdf812a1b2c3d4e5f7',
    _id: '64e78acdf812a1b2c3d4e5f7',
    recipeTitle: 'Steamed Vegetables with Quinoa',
    conditionTag: 'Hypertension'
  },
  {
    id: '64e78acdf812a1b2c3d4e5f8',
    _id: '64e78acdf812a1b2c3d4e5f8',
    recipeTitle: 'Baked Salmon with Herbs',
    conditionTag: 'Diabetes Type 2'
  }
]

export const mockDoctors = [
  {
    id: '1',
    doctorName: 'Dr. Vijay',
    email: 'doctor@example.com',
    specialization: 'General Medicine'
  },
  {
    id: 'doctor_001',
    doctorName: 'Dr. John Smith',
    email: 'john.smith@example.com',
    specialization: 'Endocrinologist'
  },
  {
    id: 'doctor_002',
    doctorName: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    specialization: 'Cardiologist'
  }
]