import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/doctor/users/create/[doctorId]
 * Proxies to your separate backend API
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ doctorId: string }> }
) {
    try {
        const { doctorId } = await params
        const body = await request.json()

        // Use the backend URL from environment variables
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.1.78:3000'
        const backendUrl = `${baseUrl}/api/doctor/users/create/${doctorId}`

        console.log(`📡 Proxying Create to Backend: ${backendUrl}`)

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
        console.error('❌ Create Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Backend server is unreachable. Please ensure your separate backend is running.'
        }, { status: 502 })
    }
}
