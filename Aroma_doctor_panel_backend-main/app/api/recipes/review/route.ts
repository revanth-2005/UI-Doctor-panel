import { NextRequest, NextResponse } from 'next/server'

// Interface for doctor review submission
interface DoctorReviewRequest {
  assignmentId: string
  doctorId: string
  doctorName: string
  status: 'approved' | 'rejected'
  doctorComment?: string
}

interface DoctorReviewResponse {
  success: boolean
  message: string
  data?: {
    assignmentId: string
    status: string
    reviewedAt: Date
  }
}

// Mock assignment storage - in production this would be MongoDB
let mockAssignments: Array<{
  assignmentId: string
  recipeId: string
  doctorId: string
  recipeTitle: string
  doctorName: string
  conditionTag: string
  note: string
  status: 'pending' | 'approved' | 'rejected'
  doctorComment: string | null
  reviewedAt: Date | null
  assignedAt: Date
  lastUpdated: Date
}> = [
  {
    assignmentId: 'assignment_001',
    recipeId: '64e78acdf812a1b2c3d4e5f6',
    doctorId: 'doctor_001',
    recipeTitle: 'Grilled Chicken Salad',
    doctorName: 'Dr. John Smith',
    conditionTag: 'Diabetes Type 2',
    note: 'Please review for diabetic patients with controlled carb intake',
    status: 'pending',
    doctorComment: null,
    reviewedAt: null,
    assignedAt: new Date('2023-11-10T10:00:00Z'),
    lastUpdated: new Date('2023-11-10T10:00:00Z')
  },
  {
    assignmentId: 'assignment_002',
    recipeId: '64e78acdf812a1b2c3d4e5f7',
    doctorId: 'doctor_002',
    recipeTitle: 'Mediterranean Quinoa Bowl',
    doctorName: 'Dr. Sarah Wilson',
    conditionTag: 'Heart Disease',
    note: 'Focus on heart-healthy aspects',
    status: 'pending',
    doctorComment: null,
    reviewedAt: null,
    assignedAt: new Date('2023-11-09T14:30:00Z'),
    lastUpdated: new Date('2023-11-09T14:30:00Z')
  },
  {
    assignmentId: 'assignment_003',
    recipeId: '64e78acdf812a1b2c3d4e5f8',
    doctorId: 'doctor_001',
    recipeTitle: 'Anti-inflammatory Turmeric Smoothie',
    doctorName: 'Dr. John Smith',
    conditionTag: 'Arthritis',
    note: 'Check anti-inflammatory properties',
    status: 'approved',
    doctorComment: 'Excellent anti-inflammatory benefits. Perfect for arthritis patients.',
    reviewedAt: new Date('2023-11-08T16:45:00Z'),
    assignedAt: new Date('2023-11-08T09:00:00Z'),
    lastUpdated: new Date('2023-11-08T16:45:00Z')
  }
]

/**
 * POST /api/recipes/review - Submit doctor's review decision
 * 
 * Request body:
 * {
 *   "assignmentId": "assignment_001",
 *   "doctorId": "doctor_001", 
 *   "doctorName": "Dr. John Smith",
 *   "status": "approved" | "rejected",
 *   "doctorComment": "Optional comment from doctor"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<DoctorReviewResponse>> {
  try {
    const body: DoctorReviewRequest = await request.json()

    // Validate required fields
    if (!body.assignmentId || !body.doctorId || !body.doctorName || !body.status) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: assignmentId, doctorId, doctorName, and status are required"
      }, { status: 400 })
    }

    // Validate status value
    if (!['approved', 'rejected'].includes(body.status)) {
      return NextResponse.json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'"
      }, { status: 400 })
    }

    // Find the assignment
    const assignmentIndex = mockAssignments.findIndex(
      assignment => assignment.assignmentId === body.assignmentId
    )

    if (assignmentIndex === -1) {
      return NextResponse.json({
        success: false,
        message: "Assignment not found"
      }, { status: 404 })
    }

    const assignment = mockAssignments[assignmentIndex]

    // Verify the doctor matches
    if (assignment.doctorId !== body.doctorId) {
      return NextResponse.json({
        success: false,
        message: "You are not authorized to review this assignment"
      }, { status: 403 })
    }

    // Check if already reviewed
    if (assignment.status !== 'pending') {
      return NextResponse.json({
        success: false,
        message: "This assignment has already been reviewed"
      }, { status: 400 })
    }

    // Update the assignment
    const now = new Date()
    mockAssignments[assignmentIndex] = {
      ...assignment,
      status: body.status,
      doctorComment: body.doctorComment || null,
      reviewedAt: now,
      lastUpdated: now
    }

    console.log(`🔄 Doctor Review Update:`, {
      assignment: body.assignmentId,
      doctor: body.doctorName,
      decision: body.status,
      comment: body.doctorComment,
      timestamp: now.toISOString()
    })

    // In a real application, this would:
    // 1. Update the MongoDB record
    // 2. Emit a WebSocket event to notify admin panels
    // 3. Create a notification record
    // 4. Send push notification to admin users

    return NextResponse.json({
      success: true,
      message: `Review ${body.status} successfully. Admin has been notified.`,
      data: {
        assignmentId: body.assignmentId,
        status: body.status,
        reviewedAt: now
      }
    })

  } catch (error) {
    console.error('Error processing doctor review:', error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}

/**
 * GET /api/recipes/review?doctorId={doctorId} - Get assignments for doctor review
 * 
 * Query parameters:
 * - doctorId: string (required) - ID of the doctor
 * - status: 'pending' | 'approved' | 'rejected' (optional) - Filter by status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const statusFilter = searchParams.get('status')

    if (!doctorId) {
      return NextResponse.json({
        success: false,
        message: "doctorId query parameter is required"
      }, { status: 400 })
    }

    // Filter assignments for the specific doctor
    let filteredAssignments = mockAssignments.filter(
      assignment => assignment.doctorId === doctorId
    )

    // Apply status filter if provided
    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      filteredAssignments = filteredAssignments.filter(
        assignment => assignment.status === statusFilter
      )
    }

    // Sort by assigned date (newest first)
    filteredAssignments.sort((a, b) => 
      new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    )

    // Transform for doctor dashboard
    const assignments = filteredAssignments.map(assignment => ({
      assignmentId: assignment.assignmentId,
      recipeId: assignment.recipeId,
      recipeTitle: assignment.recipeTitle,
      conditionTag: assignment.conditionTag,
      note: assignment.note,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      reviewedAt: assignment.reviewedAt,
      doctorComment: assignment.doctorComment
    }))

    return NextResponse.json({
      success: true,
      message: "Assignments fetched successfully",
      data: assignments,
      totalCount: assignments.length
    })

  } catch (error) {
    console.error('Error fetching doctor assignments:', error)
    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}