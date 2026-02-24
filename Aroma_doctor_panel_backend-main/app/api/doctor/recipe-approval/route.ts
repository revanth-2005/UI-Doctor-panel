import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/doctor/recipe-approval
 * Proxies to your separate backend API: /api/recipe_approval
 * Payload: { request_id, doctor_id }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { request_id, doctor_id } = body

        if (!request_id || !doctor_id) {
            return NextResponse.json({
                success: false,
                message: "Request ID and Doctor ID are required"
            }, { status: 400 })
        }

        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
        const backendUrl = `${baseUrl}/api/recipe_approval`

        console.log(`📡 Proxying Recipe Approval to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify({
                request_id,
                doctor_id
            })
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error('❌ Recipe Approval Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Backend server is unreachable. Please ensure your separate backend is running.'
        }, { status: 502 })
    }
}
