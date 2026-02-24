import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

/**
 * POST /api/doctor/recommendations - Create a new recommendation
 * Proxies to backend: POST /api/recommendation/create
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Map frontend data to backend format according to user's curl example
        const backendData = {
            patient_name: body.patientName || body.patient_name,
            condition_name: body.conditionName || body.condition_name || body.conditionTag,
            doctor_name: body.doctorName || body.doctor_name,
            recipe_name: body.recipeName || body.recipe_name || 'General Diet Advice',
            special_notes: body.notes || body.special_notes || body.recommendationNotes || ''
        }

        console.log('📡 Proxying Recommendation to Backend:', `${config.mongodb.backendUrl}/api/recommendation/create`)
        console.log('📦 Payload:', JSON.stringify(backendData, null, 2))

        const response = await fetch(`${config.mongodb.backendUrl}/api/recommendation/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify(backendData)
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('❌ Backend Recommendation error:', data)
            return NextResponse.json({
                success: false,
                message: data.message || 'Failed to create recommendation on backend'
            }, { status: response.status })
        }

        return NextResponse.json({
            success: true,
            message: data.message || 'Diet recommendation sent successfully',
            data: data.data
        }, { status: 201 })

    } catch (error: any) {
        console.error('❌ Recommendation Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to connect to backend server',
            error: error.message
        }, { status: 502 })
    }
}

/**
 * GET /api/doctor/recommendations - List recommendations (Mock for now or proxy if available)
 */
export async function GET(request: NextRequest) {
    try {
        // For now, we can return empty or mock if the backend doesn't have a list endpoint yet
        // The user didn't provide a list API, so we'll return an empty success for now
        return NextResponse.json({
            success: true,
            data: [],
            message: 'Recommendations cleared for new integration'
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })
    }
}
