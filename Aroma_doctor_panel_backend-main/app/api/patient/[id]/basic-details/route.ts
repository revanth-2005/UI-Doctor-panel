import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/patient/[id]/basic-details
 * Proxies to your separate backend API: /api/users/basic_details/[id]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Use the backend URL from environment variables
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.1.78:3000'
        const backendUrl = `${baseUrl}/api/users/basic_details/${id}`

        console.log(`📡 Proxying Patient Basic Details to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        })

        if (!response.ok) {
            throw new Error(`Backend responded with status ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error: any) {
        console.error('❌ Patient Details Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch patient details from backend',
            error: error.message
        }, { status: 502 })
    }
}
