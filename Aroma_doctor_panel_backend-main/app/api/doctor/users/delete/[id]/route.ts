import { NextRequest, NextResponse } from 'next/server'

/**
 * DELETE /api/doctor/users/delete/[id]
 * Proxies to your separate backend API
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Use the backend URL from environment variables
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://localhost:4000'
        const backendUrl = `${baseUrl}/api/doctor/users/delete/${id}`

        console.log(`📡 Proxying Delete to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'DELETE',
            headers: {
                'accept': '*/*'
            }
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error('❌ Delete Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Backend server is unreachable. Please ensure your separate backend is running.'
        }, { status: 502 })
    }
}
