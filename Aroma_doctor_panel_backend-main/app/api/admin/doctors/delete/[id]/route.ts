import { NextRequest, NextResponse } from 'next/server'

/**
 * DELETE /api/admin/doctors/delete/[id]
 * Proxies to your separate backend API: /api/doctor/delete/[id]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
        const backendUrl = `${baseUrl}/api/doctor/delete/${id}`

        console.log(`📡 Proxying Doctor Deletion to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'DELETE',
            headers: {
                'accept': '*/*'
            }
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error('❌ Delete Doctor Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Backend server is unreachable. Please ensure your separate backend is running.',
            error: error.message
        }, { status: 502 })
    }
}
