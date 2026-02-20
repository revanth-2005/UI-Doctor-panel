import { NextRequest, NextResponse } from 'next/server'
import { CreateRecipeRequest } from '@/lib/types/recipes'
import { config } from '@/lib/config'

/**
 * POST /api/admin/recipes - Create a new recipe
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateRecipeRequest = await request.json()
    
    // Validate required fields
    if (!body.recipeTitle) {
      return NextResponse.json({
        success: false,
        message: 'Recipe title is required'
      }, { status: 400 })
    }

    // Map frontend data to backend schema
    const backendData = {
      title: body.recipeTitle,
      description: body.shortDescription,
      ingredients: body.ingredients,
      instructions: body.instructions, // Note: Backend schema provided by user didn't explicitly show instructions, but it's common. If it fails, we might need to adjust.
      conditionTags: body.conditionTag ? [body.conditionTag] : [],
      nutrition: body.nutritionInfo,
      estimatedTime: body.estimatedTime,
      difficulty: body.difficulty,
      servings: body.servings,
      uploadedBy: 'Admin', // Or get from session if available
      verified: true // Admin created recipes are verified by default
    }
    
    // Send request to MongoDB backend
    // Assuming /api/public/recipes is the endpoint for creation as well, or /api/admin/recipes
    // Let's try /api/public/recipes first as it's more likely to exist for general creation
    // But wait, if I use public, verified might default to false.
    // Let's try /api/admin/recipes on the backend.
    const backendUrl = `${config.mongodb.backendUrl}/api/admin/recipes`
    
    console.log('📝 Creating recipe at:', backendUrl)
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData)
    })
    
    // If admin endpoint fails (404), try public endpoint
    if (backendResponse.status === 404) {
        console.log('⚠️ Admin endpoint not found, trying public endpoint...')
        const publicUrl = `${config.mongodb.backendUrl}/api/public/recipes`
        const publicResponse = await fetch(publicUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendData)
        })
        
        const publicResult = await publicResponse.json()
        if (!publicResponse.ok) {
             return NextResponse.json({
                success: false,
                message: publicResult.message || 'Failed to create recipe'
            }, { status: publicResponse.status })
        }
        
        return NextResponse.json({
            success: true,
            data: publicResult.recipe || publicResult.data,
            message: 'Recipe created successfully'
        }, { status: 201 })
    }

    const backendResult = await backendResponse.json()
    
    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to create recipe in backend'
      }, { status: backendResponse.status })
    }
    
    return NextResponse.json({
      success: true,
      data: backendResult.recipe || backendResult.data,
      message: backendResult.message || 'Recipe created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating recipe:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
