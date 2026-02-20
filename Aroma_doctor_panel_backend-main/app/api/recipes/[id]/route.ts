import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

/**
 * GET /api/recipes/[id] - Fetch a single recipe by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const backendUrl = `${config.mongodb.recipeServiceUrl}/api/v1/recipes/${id}`
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: `Recipe not found`
      }, { status: 404 })
    }
    
    const result = await backendResponse.json()
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Recipe fetched successfully'
    })
    
  } catch (error) {
    console.error('Error fetching recipe:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error while fetching recipe'
    }, { status: 500 })
  }
}

/**
 * PUT /api/recipes/[id] - Update a recipe
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const backendUrl = `${config.mongodb.recipeServiceUrl}/api/v1/recipes/${id}`
    
    console.log('Updating recipe at:', backendUrl)
    
    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
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
      message: 'Recipe updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating recipe:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error while updating recipe'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/recipes/[id] - Delete a recipe
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const backendUrl = `${config.mongodb.recipeServiceUrl}/api/v1/recipes/${id}`
    
    console.log('Deleting recipe at:', backendUrl)
    
    const backendResponse = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete recipe'
      }, { status: backendResponse.status })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting recipe:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error while deleting recipe'
    }, { status: 500 })
  }
}