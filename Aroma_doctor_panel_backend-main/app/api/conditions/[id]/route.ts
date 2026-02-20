import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

/**
 * GET /api/conditions/[id] - Get a specific condition
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const conditionId = id

    if (!conditionId) {
      return NextResponse.json({
        success: false,
        message: 'Condition ID is required'
      }, { status: 400 })
    }

    // Send request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/condition/${conditionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const backendResult = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to fetch condition from backend'
      }, { status: backendResponse.status })
    }

    // Map backend response to frontend format
    const condition = {
      id: backendResult.condition._id || backendResult.condition.id,
      conditionName: backendResult.condition.conditionName,
      description: backendResult.condition.description,
      macronutrients: backendResult.condition.macronutrients,
      micronutrients: backendResult.condition.micronutrients,
      createdAt: backendResult.condition.createdAt,
      updatedAt: backendResult.condition.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: condition,
      message: backendResult.message || 'Condition retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching condition:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * PUT /api/conditions/[id] - Update a condition
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const conditionId = id
    const body = await request.json()

    if (!conditionId) {
      return NextResponse.json({
        success: false,
        message: 'Condition ID is required'
      }, { status: 400 })
    }

    // Send update request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/condition/${conditionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const backendResult = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to update condition in backend'
      }, { status: backendResponse.status })
    }

    // Map backend response to frontend format
    const updatedCondition = {
      id: backendResult.condition._id || backendResult.condition.id,
      conditionName: backendResult.condition.conditionName,
      description: backendResult.condition.description,
      macronutrients: backendResult.condition.macronutrients,
      micronutrients: backendResult.condition.micronutrients,
      createdAt: backendResult.condition.createdAt,
      updatedAt: backendResult.condition.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: updatedCondition,
      message: backendResult.message || 'Condition updated successfully'
    })

  } catch (error) {
    console.error('Error updating condition:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/conditions/[id] - Delete a condition
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const conditionId = id

    if (!conditionId) {
      return NextResponse.json({
        success: false,
        message: 'Condition ID is required'
      }, { status: 400 })
    }

    // Send delete request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/condition/${conditionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const backendResult = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to delete condition from backend'
      }, { status: backendResponse.status })
    }

    return NextResponse.json({
      success: true,
      message: backendResult.message || 'Condition deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting condition:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}