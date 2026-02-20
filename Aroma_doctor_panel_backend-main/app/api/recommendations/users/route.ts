import { NextRequest, NextResponse } from 'next/server'

// Types for user recommendations
interface UserRecommendation {
  id: string
  userId: string
  userName: string
  doctorId: string
  doctorName: string
  recipeId: string
  recipeTitle: string
  conditionTag: string
  recommendationNotes: string
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'dismissed'
  createdAt: string
  scheduledFor?: string
  completedAt?: string
}

interface CreateRecommendationRequest {
  userId: string
  recipeId: string
  conditionTag: string
  recommendationNotes: string
  priority?: 'low' | 'medium' | 'high'
  scheduledFor?: string
}

interface RecommendationResponse {
  success: boolean
  message: string
  data?: UserRecommendation | UserRecommendation[]
}

// Mock data storage
let mockRecommendations: UserRecommendation[] = [
  {
    id: "rec-001",
    userId: "patient-001",
    userName: "John Smith", 
    doctorId: "doctor-001",
    doctorName: "Dr. Sarah Wilson",
    recipeId: "recipe-approval-1",
    recipeTitle: "Diabetic-Friendly Quinoa Bowl",
    conditionTag: "diabetes",
    recommendationNotes: "This quinoa bowl is perfect for managing blood sugar levels. Try to have this for lunch 3 times a week.",
    priority: "high",
    status: "active",
    createdAt: new Date().toISOString(),
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
  },
  {
    id: "rec-002",
    userId: "patient-002", 
    userName: "Maria Garcia",
    doctorId: "doctor-001",
    doctorName: "Dr. Sarah Wilson",
    recipeId: "recipe-approval-2",
    recipeTitle: "Heart-Healthy Salmon Salad",
    conditionTag: "hypertension",
    recommendationNotes: "Rich in omega-3 fatty acids for heart health. Ideal for dinner 2-3 times per week.",
    priority: "medium",
    status: "active",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  }
]

// Mock approved recipes (these would come from the recipe approval workflow)
const mockApprovedRecipes = [
  {
    id: "recipe-approval-1",
    recipeTitle: "Diabetic-Friendly Quinoa Bowl",
    conditionTag: "diabetes",
    status: "approved"
  },
  {
    id: "recipe-approval-2", 
    recipeTitle: "Heart-Healthy Salmon Salad",
    conditionTag: "hypertension", 
    status: "approved"
  },
  {
    id: "recipe-approval-3",
    recipeTitle: "Low-Sodium Mediterranean Chicken",
    conditionTag: "hypertension",
    status: "approved"
  }
]

// Mock patients data
const mockPatients = [
  { id: "patient-001", name: "John Smith", conditions: ["diabetes"] },
  { id: "patient-002", name: "Maria Garcia", conditions: ["hypertension"] },
  { id: "patient-003", name: "Robert Johnson", conditions: ["diabetes", "hypertension"] }
]

/**
 * GET /api/recommendations/users
 * Query params:
 * - doctorId: string (required) - Get recommendations created by this doctor
 * - userId: string (optional) - Get recommendations for specific user
 * - status: string (optional) - Filter by status
 */
export async function GET(request: NextRequest): Promise<NextResponse<RecommendationResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    if (!doctorId) {
      return NextResponse.json({
        success: false,
        message: 'doctorId query parameter is required'
      }, { status: 400 })
    }

    // Filter recommendations
    let filteredRecommendations = mockRecommendations.filter(
      rec => rec.doctorId === doctorId
    )

    if (userId) {
      filteredRecommendations = filteredRecommendations.filter(
        rec => rec.userId === userId
      )
    }

    if (status && ['active', 'completed', 'dismissed'].includes(status)) {
      filteredRecommendations = filteredRecommendations.filter(
        rec => rec.status === status
      )
    }

    // Sort by creation date (newest first)
    filteredRecommendations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      message: 'Recommendations fetched successfully',
      data: filteredRecommendations
    })

  } catch (error) {
    console.error('Error fetching user recommendations:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch recommendations'
    }, { status: 500 })
  }
}

/**
 * POST /api/recommendations/users
 * Create a new user recommendation
 */
export async function POST(request: NextRequest): Promise<NextResponse<RecommendationResponse>> {
  try {
    const body = await request.json()
    const { userId, recipeId, conditionTag, recommendationNotes, priority = 'medium', scheduledFor } = body as CreateRecommendationRequest
    
    // Get doctor info from headers or body (in real app, from JWT token)
    const doctorId = request.headers.get('x-doctor-id') || body.doctorId || 'doctor-001'
    const doctorName = request.headers.get('x-doctor-name') || body.doctorName || 'Dr. Sarah Wilson'

    // Validate required fields
    if (!userId || !recipeId || !conditionTag || !recommendationNotes) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userId, recipeId, conditionTag, and recommendationNotes are required'
      }, { status: 400 })
    }

    // Validate priority
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid priority. Must be low, medium, or high'
      }, { status: 400 })
    }

    // Verify patient exists
    const patient = mockPatients.find(p => p.id === userId)
    if (!patient) {
      return NextResponse.json({
        success: false,
        message: 'Patient not found'
      }, { status: 404 })
    }

    // Verify recipe exists and is approved
    const recipe = mockApprovedRecipes.find(r => r.id === recipeId)
    if (!recipe) {
      return NextResponse.json({
        success: false,
        message: 'Recipe not found or not approved'
      }, { status: 404 })
    }

    // Check if patient has the condition
    if (!patient.conditions.includes(conditionTag.toLowerCase())) {
      console.warn(`⚠️ Patient ${patient.name} doesn't have condition ${conditionTag}, but recommendation is being created anyway`)
    }

    // Create new recommendation
    const newRecommendation: UserRecommendation = {
      id: `rec-${Date.now()}`,
      userId,
      userName: patient.name,
      doctorId,
      doctorName,
      recipeId,
      recipeTitle: recipe.recipeTitle,
      conditionTag,
      recommendationNotes,
      priority,
      status: 'active',
      createdAt: new Date().toISOString(),
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined
    }

    // Add to mock storage
    mockRecommendations.push(newRecommendation)

    console.log('📝 New user recommendation created:', {
      id: newRecommendation.id,
      patient: patient.name,
      recipe: recipe.recipeTitle,
      condition: conditionTag,
      doctor: doctorName,
      priority,
      createdAt: newRecommendation.createdAt
    })

    // In real application, this would:
    // 1. Save to MongoDB
    // 2. Send notification to user's app
    // 3. Create a calendar reminder if scheduledFor is set
    // 4. Log the recommendation for analytics

    return NextResponse.json({
      success: true,
      message: 'Recommendation created successfully',
      data: newRecommendation
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user recommendation:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create recommendation'
    }, { status: 500 })
  }
}

/**
 * PUT /api/recommendations/users
 * Update recommendation status (mark as completed, dismissed, etc.)
 */
export async function PUT(request: NextRequest): Promise<NextResponse<RecommendationResponse>> {
  try {
    const body = await request.json()
    const { recommendationId, status } = body

    if (!recommendationId || !status) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: recommendationId and status are required'
      }, { status: 400 })
    }

    if (!['active', 'completed', 'dismissed'].includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status. Must be active, completed, or dismissed'
      }, { status: 400 })
    }

    // Find and update recommendation
    const recIndex = mockRecommendations.findIndex(rec => rec.id === recommendationId)
    if (recIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Recommendation not found'
      }, { status: 404 })
    }

    const updatedRecommendation = {
      ...mockRecommendations[recIndex],
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : mockRecommendations[recIndex].completedAt
    }

    mockRecommendations[recIndex] = updatedRecommendation

    console.log('📝 Recommendation status updated:', {
      id: recommendationId,
      newStatus: status,
      patient: updatedRecommendation.userName,
      recipe: updatedRecommendation.recipeTitle
    })

    return NextResponse.json({
      success: true,
      message: 'Recommendation updated successfully',
      data: updatedRecommendation
    })

  } catch (error) {
    console.error('Error updating recommendation:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update recommendation'
    }, { status: 500 })
  }
}