import { NextRequest, NextResponse } from 'next/server'
import { 
  getAssignmentsByDoctor, 
  updateAssignment, 
  getAssignmentById,
  SharedAssignment 
} from '@/lib/mock-data/assignments'

/**
 * GET /api/doctor/assignments - Get assignments for a specific doctor
 * Query parameters:
 * - doctorId: ID of the doctor (required)
 * - status: filter by status (optional)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const status = searchParams.get('status')

    if (!doctorId) {
      return NextResponse.json({
        success: false,
        message: "Doctor ID is required"
      }, { status: 400 })
    }

    // Try to fetch from MongoDB backend first
    try {
      const backendUrl = new URL('https://aroma-db-six.vercel.app/api/admin/assignments')
      // Don't pass status to backend - filter on frontend instead since backend uses "Pending" vs "pending"
      
      const backendResponse = await fetch(backendUrl.toString())
      
      if (backendResponse.ok) {
        const backendResult = await backendResponse.json()
        
        if (backendResult.success && backendResult.assignments) {
          // Filter assignments for this doctor from backend data
          let doctorAssignments = backendResult.assignments.filter((assignment: any) => 
            assignment.doctorId?._id === doctorId || assignment.doctorId === doctorId
          )
          
          // Apply status filter if provided (handle both "Pending" and "pending")
          if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            doctorAssignments = doctorAssignments.filter((assignment: any) => {
              const assignmentStatus = assignment.status?.toLowerCase()
              return assignmentStatus === status
            })
          }
          
          // Convert to frontend format
          const responseAssignments = doctorAssignments.map((assignment: any) => {
            console.log('🔍 Raw assignment from backend:', JSON.stringify(assignment, null, 2));
            
            return {
              assignmentId: assignment._id,
              recipeId: assignment.recipeId?._id || assignment.recipeId,
              doctorId: assignment.doctorId?._id || assignment.doctorId,
              recipeTitle: assignment.recipeId?.title || assignment.recipeTitle || 'Unknown Recipe',
              ingredients: assignment.recipeId?.ingredients || [],
              instructions: assignment.recipeId?.instructions || [],
              nutrition: assignment.recipeId?.nutrition || assignment.recipeId?.nutritionInfo || assignment.recipeId?.nutritional_info || {},
              doctorName: assignment.doctorId?.name || assignment.doctorName || 'Unknown Doctor',
              conditionTag: assignment.medicalCondition || assignment.conditionTag || 'General',
              note: assignment.comments || assignment.note || assignment.notes || '',
              status: assignment.status?.toLowerCase() || 'pending',
              assignedAt: assignment.assignedAt,
              lastUpdated: assignment.updatedAt,
              reviewedAt: assignment.reviewedAt,
              doctorComment: assignment.doctorComment
            }
          })
          
          return NextResponse.json({
            success: true,
            data: responseAssignments,
            message: `Found ${responseAssignments.length} assignment(s) from database`,
            totalCount: responseAssignments.length,
            source: 'database'
          })
        }
      }
    } catch (error) {
      console.warn('Backend assignments error, falling back to mock data:', error)
    }

    // Fallback to mock data
    let assignments = getAssignmentsByDoctor(doctorId)

    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      assignments = assignments.filter(assignment => assignment.status === status)
    }

    // Sort by assignment date (newest first)
    assignments.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())

    return NextResponse.json({
      success: true,
      data: assignments,
      message: `Found ${assignments.length} assignment(s)`,
      totalCount: assignments.length
    })

  } catch (error) {
    console.error('Error fetching doctor assignments:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * POST /api/doctor/assignments - Update assignment status (approve/reject)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { assignmentId, status, comment } = body

    if (!assignmentId || !status) {
      return NextResponse.json({
        success: false,
        message: "Assignment ID and status are required"
      }, { status: 400 })
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({
        success: false,
        message: "Status must be 'approved' or 'rejected'"
      }, { status: 400 })
    }

    // Update assignment using shared data
    const updatedAssignment = updateAssignment(assignmentId, {
      status,
      doctorComment: comment || undefined,
      reviewedAt: new Date(),
      lastUpdated: new Date()
    })

    if (!updatedAssignment) {
      return NextResponse.json({
        success: false,
        message: "Assignment not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Recipe ${status} successfully`,
      data: updatedAssignment
    })

  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}