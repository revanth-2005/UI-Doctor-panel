import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/patient/[id]/intake - Get mock food intake for a patient
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Mock intake data
        const intake = {
            breakfast: [
                { id: "1", name: "Oatmeal with Berries", time: "08:00 AM", calories: 350, protein: 12, carbs: 60, fat: 6 },
                { id: "2", name: "Boiled Egg", time: "08:15 AM", calories: 70, protein: 6, carbs: 0, fat: 5 }
            ],
            lunch: [
                { id: "3", name: "Grilled Chicken Salad", time: "01:00 PM", calories: 450, protein: 40, carbs: 15, fat: 20 },
                { id: "4", name: "Brown Rice (1 cup)", time: "01:00 PM", calories: 216, protein: 5, carbs: 45, fat: 2 }
            ],
            dinner: [
                { id: "5", name: "Salmon with Asparagus", time: "07:30 PM", calories: 500, protein: 45, carbs: 10, fat: 25 }
            ],
            snacks: [
                { id: "6", name: "Greek Yogurt", time: "04:00 PM", calories: 120, protein: 15, carbs: 8, fat: 0 }
            ]
        }

        return NextResponse.json({
            success: true,
            data: intake,
            message: 'Intake data retrieved successfully'
        })

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 })
    }
}
