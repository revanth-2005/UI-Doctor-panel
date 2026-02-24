import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/patient/[id]/intake-by-day
 * Proxies to your separate backend API: /api/intakeByDay
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

        // Use the backend URL from environment variables
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.1.78:3000'
        const backendUrl = `${baseUrl}/api/intakeByDay?user_id=${id}&date=${date}`

        console.log(`📡 Proxying Intake Logs to Backend: ${backendUrl}`)

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
        console.error('❌ Intake Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch intake logs from backend',
            error: error.message
        }, { status: 502 })
    }
}
