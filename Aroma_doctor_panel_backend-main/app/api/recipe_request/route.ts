import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/recipe_request
 * Proxies to the backend API: http://172.16.0.112:3000/api/recipe_request
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
        const backendUrl = `${baseUrl}/api/recipe_request`

        console.log(`📡 Root Proxying POST Recipe Request to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error('❌ Root Recipe Request POST Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to submit recipe request to backend',
            error: error.message
        }, { status: 502 })
    }
}

/**
 * GET /api/recipe_request
 * Proxies to the backend API: http://172.16.0.112:3000/api/recipe_request
 */
export async function GET(request: NextRequest) {
    try {
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
        const backendUrl = `${baseUrl}/api/recipe_request`

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            },
            cache: 'no-store'
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch recipe requests',
            error: error.message
        }, { status: 502 })
    }
}
