import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/doctor/recipe-requests
 * Proxies to your separate backend API: /api/recipe_request
 * Enriches the data with patient details if available
 */
export async function GET(request: NextRequest) {
    try {
        // Use the backend URL from environment variables
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
        const backendUrl = `${baseUrl}/api/recipe_request`

        console.log(`📡 Proxying Recipe Requests to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`Backend responded with status ${response.status}`)
        }

        const result = await response.json()

        // If sucessful, try to enrich each request with patient details
        if (result.success && Array.isArray(result.data)) {
            const enrichedData = await Promise.all(result.data.map(async (req: any) => {
                const userId = req.user_id || req.userId;
                if (userId) {
                    try {
                        const patientUrl = `${baseUrl}/api/users/basic_details/${userId}`
                        const patientResp = await fetch(patientUrl, { cache: 'no-store' })
                        if (patientResp.ok) {
                            const patientResult = await patientResp.json()
                            if (patientResult.success && patientResult.data) {
                                return {
                                    ...req,
                                    patient_details: patientResult.data,
                                    // Use name from patient details if not in request
                                    user_name: req.user_name || patientResult.data.name
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`⚠️ Failed to enrich request for user ${userId}:`, err)
                    }
                }
                return req
            }))

            return NextResponse.json({
                ...result,
                data: enrichedData
            })
        }

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('❌ Recipe Request Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch recipe requests from backend',
            error: error.message
        }, { status: 502 })
    }
}

/**
 * POST /api/doctor/recipe-requests
 * Proxies to your separate backend API: /api/recipe_request
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
        const backendUrl = `${baseUrl}/api/recipe_request`

        console.log(`📡 Proxying POST Recipe Request to Backend: ${backendUrl}`)

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error('❌ Recipe Request POST Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to submit recipe request to backend',
            error: error.message
        }, { status: 502 })
    }
}

