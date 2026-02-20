import { NextRequest, NextResponse } from 'next/server'
import { ReviewRecipeRequest, ReviewRecipeResponse, RecipeReview } from '@/lib/types/recipes'

// Mock storage for recipe reviews - in production this would be MongoDB
let mockReviews: RecipeReview[] = [
  {
    id: 'review_001',
    recipeId: '64e78acdf812a1b2c3d4e5f8',
    doctorId: 'doctor_001',
    status: 'approved',
    comment: 'Excellent recipe for diabetic patients. Good omega-3 content and low carbs.',
    reviewedAt: new Date('2023-11-12T09:15:00Z')
  }
]

/**
 * POST /api/recipes/approve - Approve a recipe
 */
export async function POST(request: NextRequest): Promise<NextResponse<ReviewRecipeResponse>> {
  try {
    const body: ReviewRecipeRequest = await request.json()
    
    // Validate required fields
    if (!body.recipeId || !body.doctorId || !body.status) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: recipeId, doctorId, and status are required'
      }, { status: 400 })
    }
    
    // Validate status
    if (!['approved', 'rejected'].includes(body.status)) {
      return NextResponse.json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      }, { status: 400 })
    }
    
    // Validate comment length if provided
    if (body.comment && body.comment.length > 500) {
      return NextResponse.json({
        success: false,
        message: 'Comment cannot exceed 500 characters'
      }, { status: 400 })
    }
    
    // Check if recipe has already been reviewed by this doctor
    const existingReview = mockReviews.find(
      review => review.recipeId === body.recipeId && review.doctorId === body.doctorId
    )
    
    if (existingReview) {
      return NextResponse.json({
        success: false,
        message: 'You have already reviewed this recipe'
      }, { status: 409 })
    }
    
    // Create new review
    const newReview: RecipeReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      recipeId: body.recipeId,
      doctorId: body.doctorId,
      status: body.status,
      comment: body.comment?.trim() || undefined,
      reviewedAt: new Date()
    }
    
    // Save the review
    mockReviews.push(newReview)
    
    // In a real implementation, you would also update the recipe's status in the recipes collection
    console.log(`Recipe ${body.recipeId} ${body.status} by doctor ${body.doctorId}`)
    
    const actionText = body.status === 'approved' ? 'approved' : 'rejected'
    
    return NextResponse.json({
      success: true,
      data: newReview,
      message: `Recipe successfully ${actionText}`
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error processing recipe review:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}