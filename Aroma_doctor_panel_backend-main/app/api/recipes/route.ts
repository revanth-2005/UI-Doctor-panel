import { NextRequest, NextResponse } from 'next/server'
import { Recipe, FetchRecipesResponse } from '@/lib/types/recipes'
import { config } from '@/lib/config'

/**
 * GET /api/recipes - Fetch recipes from external MongoDB service
 * Query parameters:
 * - page: page number (default: 1)
 * - limit: items per page (default: 10)
 * - search: search term (optional)
 */
export async function GET(request: NextRequest): Promise<NextResponse<FetchRecipesResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const search = searchParams.get('search')
    
    // Build query parameters for external service
    const backendParams = new URLSearchParams()
    backendParams.append('page', page)
    backendParams.append('limit', limit)
    if (search) backendParams.append('search', search)
    
    // Fetch from external service
    const backendUrl = `${config.mongodb.recipeServiceUrl}/api/v1/recipes/?${backendParams.toString()}`
    
    console.log('Fetching recipes from:', backendUrl)
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status ${backendResponse.status}`)
    }
    
    const backendResult = await backendResponse.json()
    
    if (!backendResult.ok) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch recipes from backend'
      })
    }
    
    // Map backend recipes to frontend format
    const recipes: Recipe[] = (backendResult.data?.recipes || []).map((recipe: any) => ({
      id: recipe._id,
      _id: recipe._id,
      recipeTitle: recipe.recipe_name,
      conditionTag: recipe.preferenceTag || 'General',
      shortDescription: recipe.description || '',
      fullDescription: recipe.description || '',
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.map((ing: any) => ({
            name: ing.name || '',
            amount: ing.qty || '',
            unit: ing.unit || ''
          }))
        : [],
      instructions: Array.isArray(recipe.cooking_steps)
        ? recipe.cooking_steps.map((step: any) => step.instruction || '')
        : (Array.isArray(recipe.preparation_steps) ? recipe.preparation_steps : []),
      macronutrients: {
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        calories: 0
      },
      micronutrients: {},
      estimatedTime: 30,
      servings: 2,
      uploadedBy: 'System',
      uploadedAt: new Date(recipe.createdAt || Date.now()),
      status: recipe.status === 'active' ? 'approved' : 'pending',
      verifiedDate: recipe.updatedAt ? new Date(recipe.updatedAt) : undefined,
      imageUrl: recipe.recipe_image_url,
      source: recipe.source
    }))
    
    const pagination = backendResult.data?.pagination || {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      totalPages: 0
    }
    
    return NextResponse.json({
      success: true,
      data: recipes,
      message: `Found ${recipes.length} recipe(s)`,
      totalCount: pagination.total,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages
      }
    })
    
  } catch (error) {
    console.error('Error fetching recipes from backend:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error while fetching recipes'
    }, { status: 500 })
  }
}

/**
 * POST /api/recipes - Create a new recipe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const backendUrl = `${config.mongodb.recipeServiceUrl}/api/v1/recipes`
    
    console.log('Creating recipe at:', backendUrl)
    
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json({
        success: false,
        message: errorData.message || `Backend responded with status ${backendResponse.status}`
      }, { status: backendResponse.status })
    }
    
    const result = await backendResponse.json()
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Recipe created successfully'
    })
    
  } catch (error) {
    console.error('Error creating recipe:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error while creating recipe'
    }, { status: 500 })
  }
}