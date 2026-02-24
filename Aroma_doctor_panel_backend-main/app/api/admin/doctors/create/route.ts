import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/doctors/create
 * Proxies to your separate backend API: /api/doctor/create
 * Payload: { name, email, phone, specialization, licenseNumber, password, status }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Use the backend URL from environment variables
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
        const backendUrl = `${baseUrl}/api/doctor/create`

        console.log(`📡 Proxying Doctor Creation to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify(body)
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error('❌ Create Doctor Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Backend server is unreachable. Please ensure your separate backend is running.',
            error: error.message
        }, { status: 502 })
    }
}
