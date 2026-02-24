import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/patient/[id]/historical-intake
 * Aggregates intake data for multiple days to provide "real-time" data for graphs
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const daysRequested = parseInt(searchParams.get('days') || '7')

        // Use the backend URL from environment variables
        const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.1.78:3000'

        const today = new Date()

        // Prepare list of dates to fetch
        const daysToFetch = []
        for (let i = daysRequested - 1; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(today.getDate() - i)
            const dateString = date.toISOString().split('T')[0]

            // Format label as "1 JAN"
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
            const formattedLabel = `${date.getDate()} ${monthNames[date.getMonth()]}`

            daysToFetch.push({
                label: formattedLabel,
                dateString,
                url: `${baseUrl}/api/intakeByDay?user_id=${id}&date=${dateString}`
            })
        }

        console.log(`📡 Fetching historical intake for ${daysRequested} days for patient ${id}`)

        // Fetch all days in parallel
        const results = await Promise.all(daysToFetch.map(async (dayInfo) => {
            try {
                const response = await fetch(dayInfo.url, {
                    method: 'GET',
                    headers: { 'accept': '*/*' },
                    cache: 'no-store'
                })

                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data) {
                        return {
                            day: dayInfo.label,
                            date: dayInfo.dateString,
                            calories: result.data.calories || 0,
                            protein: result.data.protein || 0,
                            carbs: result.data.carbs || 0,
                            fat: result.data.fat || 0
                        }
                    }
                }
            } catch (err) {
                console.error(`⚠️ Error fetching intake for ${dayInfo.dateString}:`, err)
            }
            // Fallback for missing or error days
            return {
                day: dayInfo.label,
                date: dayInfo.dateString,
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
            }
        }))

        return NextResponse.json({
            success: true,
            data: results,
            message: `Retrieved historical intake for ${daysRequested} days`
        })

    } catch (error: any) {
        console.error('❌ Historical Intake Proxy Error:', error)
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch historical intake data',
            error: error.message
        }, { status: 502 })
    }
}
