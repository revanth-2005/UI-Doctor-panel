import { NextRequest, NextResponse } from 'next/server'

/**
 * PUT /api/doctor/users/update/[id]
 * Proxies to your separate backend API
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Use the backend URL from environment variables
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://localhost:4000'
        const backendUrl = `${baseUrl}/api/doctor/users/update/${id}`

        console.log(`📡 Proxying Update to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify(body)
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error('❌ Update Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Backend server is unreachable. Please ensure your separate backend is running.'
        }, { status: 502 })
    }
}
