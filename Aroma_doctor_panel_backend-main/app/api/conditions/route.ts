import { NextRequest, NextResponse } from 'next/server'
import { validateConditionRequest } from '@/lib/validation/conditions'
import { CreateConditionResponse, ApiErrorResponse } from '@/lib/types/conditions'
import { config } from '@/lib/config'

/**
 * Create a new medical condition
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateConditionResponse | ApiErrorResponse>> {
  try {
    const body = await request.json()
    console.log('📝 Creating condition with data:', body)

    // Validate the request data
    const validation = validateConditionRequest(body)

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    const { cleanedData } = validation

    if (!cleanedData) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data'
      }, { status: 400 })
    }

    // Send request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/condition/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({
        name: body.conditionName || body.name,
        description: body.description,
        macronutrients: body.macronutrients || {},
        micronutrients: body.micronutrients || {},
        vitamins: body.vitamins || {}
      })
    })

    const backendResult = await backendResponse.json()
    console.log('📋 Backend create condition response:', backendResult)

    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to create condition in backend'
      }, { status: backendResponse.status })
    }

    // Map backend response to frontend format
    // The new backend returns data in a 'data' object with an 'id'
    const resultData = backendResult.data || backendResult.condition || {}

    const newCondition = {
      id: resultData.id || resultData._id || backendResult.id,
      conditionName: resultData.name || resultData.conditionName || body.conditionName || body.name,
      description: resultData.description || body.description,
      macronutrients: resultData.macronutrients || resultData.macros || body.macronutrients,
      micronutrients: resultData.micronutrients || resultData.micros || body.micronutrients,
      vitamins: resultData.vitamins || body.vitamins,
      createdAt: resultData.createdAt || new Date().toISOString(),
      updatedAt: resultData.updatedAt || new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newCondition,
      message: backendResult.message || 'Condition created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating condition:', error)

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * Get all conditions
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'conditionName'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build query parameters for backend
    const backendParams = new URLSearchParams()
    backendParams.append('sortBy', sortBy)
    backendParams.append('sortOrder', sortOrder)
    if (search) backendParams.append('search', search)

    // Send request to MongoDB backend
    const backendUrl = `${config.mongodb.backendUrl}/api/condition/read`
    console.log('🔗 Fetching conditions from read backend for dropdown:', backendUrl)

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        console.warn('⚠️ Conditions list endpoint not found on backend. Returning empty list.');
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Medical conditions service temporarily unavailable (404)'
        })
      }
      throw new Error(`Backend responded with status ${backendResponse.status}`)
    }

    const backendResult = await backendResponse.json()
    console.log('📋 Backend conditions response:', backendResult)

    if (!backendResult.success) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to fetch conditions from backend'
      })
    }

    // Map backend conditions to frontend format
    const conditions = (backendResult.conditions || backendResult.data || []).map((condition: any) => ({
      id: condition._id || condition.id,
      conditionName: condition.name || condition.conditionName,
      description: condition.description,
      macronutrients: condition.macros || condition.macronutrients,
      micronutrients: condition.micros || condition.micronutrients,
      vitamins: condition.vitamins,
      createdAt: condition.createdAt,
      updatedAt: condition.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: conditions,
      message: backendResult.message || `Found ${conditions.length} condition(s)`
    })

  } catch (error) {
    console.error('Error fetching conditions:', error)

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}