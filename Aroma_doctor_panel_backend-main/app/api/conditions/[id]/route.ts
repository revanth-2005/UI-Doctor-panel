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

    // Use the 'read' endpoint to get full details for a specific condition
    const backendUrl = `${config.mongodb.backendUrl}/api/condition/read`
    console.log('🔗 Fetching condition details from read backend:', backendUrl)

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
        message: backendResult.message || 'Failed to fetch conditions from backend'
      }, { status: backendResponse.status })
    }

    // Find the specific condition by ID in the list
    const conditions = backendResult.data || []
    const resultData = conditions.find((c: any) => (c._id === conditionId || c.id === conditionId))

    if (!resultData) {
      return NextResponse.json({
        success: false,
        message: 'Condition not found'
      }, { status: 404 })
    }

    const condition = {
      id: resultData._id || resultData.id,
      conditionName: resultData.name || resultData.conditionName,
      description: resultData.description,
      macronutrients: resultData.macronutrients || resultData.macros,
      micronutrients: resultData.micronutrients || resultData.micros,
      vitamins: resultData.vitamins,
      createdAt: resultData.createdAt,
      updatedAt: resultData.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: condition,
      message: 'Condition details retrieved successfully'
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
    const backendUrl = `${config.mongodb.backendUrl}/api/condition/update/${conditionId}`
    console.log('🔄 Proxying Update to Backend:', backendUrl)

    const backendResponse = await fetch(backendUrl, {
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
    const resultData = backendResult.data || backendResult.condition || {}

    const updatedCondition = {
      id: resultData._id || resultData.id || conditionId,
      conditionName: resultData.name || resultData.conditionName,
      description: resultData.description,
      macronutrients: resultData.macronutrients || resultData.macros,
      micronutrients: resultData.micronutrients || resultData.micros,
      vitamins: resultData.vitamins,
      createdAt: resultData.createdAt,
      updatedAt: resultData.updatedAt
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
    const backendUrl = `${config.mongodb.backendUrl}/api/condition/delete/${conditionId}`
    console.log('🗑️ Proxying Delete to Backend:', backendUrl)

    const backendResponse = await fetch(backendUrl, {
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