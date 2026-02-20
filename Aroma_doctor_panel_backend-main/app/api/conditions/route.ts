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
      },
      body: JSON.stringify({
        name: cleanedData.conditionName,
        description: cleanedData.description,
        macros: cleanedData.macronutrients || {},
        micros: cleanedData.micronutrients || {}
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
    const newCondition = {
      id: backendResult.condition._id || backendResult.condition.id,
      conditionName: backendResult.condition.name || backendResult.condition.conditionName,
      description: backendResult.condition.description,
      macronutrients: backendResult.condition.macros || backendResult.condition.macronutrients,
      micronutrients: backendResult.condition.micros || backendResult.condition.micronutrients,
      createdAt: backendResult.condition.createdAt,
      updatedAt: backendResult.condition.updatedAt
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
    const backendUrl = `${config.mongodb.backendUrl}/api/condition/list?${backendParams.toString()}`
    console.log('🔗 Fetching conditions from backend:', backendUrl)
    
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