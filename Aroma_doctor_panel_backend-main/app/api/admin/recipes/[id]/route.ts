import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

/**
 * GET /api/admin/recipes/[id] - Get a specific recipe by ID from MongoDB backend (Admin route)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const recipeId = id

    if (!recipeId) {
      return NextResponse.json({
        success: false,
        message: 'Recipe ID is required'
      }, { status: 400 })
    }

    // Use public endpoint as requested by user
    const backendUrl = `${config.mongodb.backendUrl}/api/public/recipes/${recipeId}`
    console.log(`Fetching recipe from backend: ${backendUrl}`)

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const backendResult = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to fetch recipe from backend'
      }, { status: backendResponse.status })
    }

    if (!backendResult.success || !backendResult.recipe) {
      return NextResponse.json({
        success: false,
        message: 'Recipe not found'
      }, { status: 404 })
    }

    const recipeData = backendResult.recipe

    // Map backend response to frontend format expected by lib/api/recipes.ts
    // The backend returns 'nutrition', but frontend expects 'nutritionInfo'
    const mappedRecipe = {
      ...recipeData,
      id: recipeData._id || recipeData.id,
      nutritionInfo: recipeData.nutrition || recipeData.nutritionInfo || {},
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || []
    }

    return NextResponse.json({
      success: true,
      data: mappedRecipe,
      message: 'Recipe retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching recipe by ID:', error)

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/recipes/[id] - Delete a recipe
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const recipeId = id

    if (!recipeId) {
      return NextResponse.json({
        success: false,
        message: 'Recipe ID is required'
      }, { status: 400 })
    }

    // Try admin endpoint first, then public if needed
    let backendUrl = `${config.mongodb.backendUrl}/api/admin/recipes/${recipeId}`
    console.log(`Deleting recipe at: ${backendUrl}`)

    let backendResponse = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (backendResponse.status === 404) {
        console.log('⚠️ Admin delete endpoint not found, trying public endpoint...')
        backendUrl = `${config.mongodb.backendUrl}/api/public/recipes/${recipeId}`
        backendResponse = await fetch(backendUrl, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
    }

    const backendResult = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to delete recipe'
      }, { status: backendResponse.status })
    }

    return NextResponse.json({
      success: true,
      message: backendResult.message || 'Recipe deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting recipe:', error)

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
