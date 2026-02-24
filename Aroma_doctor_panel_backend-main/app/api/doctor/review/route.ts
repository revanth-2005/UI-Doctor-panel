import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/doctor/review - Submit doctor review for an assignment
 * Proxies to your separate backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assignmentId, status, doctorComment } = body

    const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
    // For recipe_request, we might need a different endpoint, 
    // but for now we'll try the standard review endpoint on your backend.
    const backendUrl = `${baseUrl}/api/doctor/review`

    console.log(`📡 Proxying Review to Backend: ${backendUrl}`)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({
        assignmentId,
        status,
        doctorComment,
        reviewedAt: new Date().toISOString()
      })
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })

  } catch (error: any) {
    console.error('❌ Review Proxy Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Backend server is unreachable. Please ensure your separate backend is running.'
    }, { status: 502 })
  }
}

/**
 * GET /api/doctor/review - Get assignment details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
    const backendUrl = `${baseUrl}/api/admin/assignments/${assignmentId}`

    console.log(`📡 Proxying Review Detail Fetch to Backend: ${backendUrl}`)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })

  } catch (error: any) {
    console.error('❌ Review Detail Proxy Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Backend server is unreachable.'
    }, { status: 502 })
  }
}