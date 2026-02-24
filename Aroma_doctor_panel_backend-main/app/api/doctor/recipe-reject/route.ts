import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/doctor/recipe-reject
 * Proxies to your separate backend API: /api/recipe_reject
 * Payload: { request_id, doctor_id, reason }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { request_id, doctor_id, reason } = body

        if (!request_id || !doctor_id) {
            return NextResponse.json({
                success: false,
                message: "Request ID and Doctor ID are required"
            }, { status: 400 })
        }

        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
        const backendUrl = `${baseUrl}/api/recipe_reject`

        console.log(`📡 Proxying Recipe Rejection to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify({
                request_id,
                doctor_id,
                reason: reason || "Not suitable for patient condition"
            })
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error('❌ Recipe Rejection Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Backend server is unreachable. Please ensure your separate backend is running.'
        }, { status: 502 })
    }
}
