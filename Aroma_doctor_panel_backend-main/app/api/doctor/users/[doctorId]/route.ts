import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/doctor/users/[doctorId]
 * Proxies to your separate backend API
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ doctorId: string }> }
) {
    try {
        const { doctorId } = await params

        // Use the backend URL from environment variables
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.1.78:3000'
        const backendUrl = `${baseUrl}/api/doctor/users/${doctorId}`

        console.log(`📡 Proxying List to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        })

        if (!response.ok && response.status === 404) {
            // Fallback to 'patients' endpoint if 'users' is not found
            const fallbackUrl = `${baseUrl}/api/doctor/patients/${doctorId}`
            console.log(`🔄 Path Mismatch - Retrying with Fallback: ${fallbackUrl}`)

            const fallbackResponse = await fetch(fallbackUrl, {
                method: 'GET',
                headers: {
                    'accept': '*/*'
                }
            })

            const fallbackData = await fallbackResponse.json()
            return NextResponse.json(fallbackData, { status: fallbackResponse.status })
        }

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error('❌ List Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Backend server is unreachable. Please ensure your separate backend is running.'
        }, { status: 502 })
    }
}
