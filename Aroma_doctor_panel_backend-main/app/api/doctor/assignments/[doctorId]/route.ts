import { NextRequest, NextResponse } from 'next/server'
import { 
  getAssignmentsByDoctor, 
  SharedAssignment 
} from '@/lib/mock-data/assignments'

/**
 * GET /api/doctor/assignments/[doctorId] - Get assignments for a specific doctor
 * Path parameter: doctorId
 * Query parameters: status (optional)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
): Promise<NextResponse> {
  try {
    const { doctorId } = await params
    const { searchParams } = new URL(request.url)
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
      if (status) backendUrl.searchParams.set('status', status)
      
      const backendResponse = await fetch(backendUrl.toString())
      
      if (backendResponse.ok) {
        const backendResult = await backendResponse.json()
        
        if (backendResult.success && backendResult.assignments) {
          // Filter assignments for this doctor from backend data
          let doctorAssignments = backendResult.assignments.filter((assignment: any) => 
            assignment.doctorId === doctorId
          )
          
          // Apply status filter if provided
          if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            doctorAssignments = doctorAssignments.filter((assignment: any) => 
              assignment.status === status
            )
          }
          
          // Convert to frontend format
          const responseAssignments = doctorAssignments.map((assignment: any) => ({
            assignmentId: assignment._id,
            recipeId: assignment.recipeId?._id || assignment.recipeId,
            doctorId: assignment.doctorId?._id || assignment.doctorId || doctorId,
            recipeTitle: assignment.recipeId?.title || assignment.recipeTitle || 'Unknown Recipe',
            doctorName: assignment.doctorId?.name || assignment.doctorName || 'Unknown Doctor',
            conditionTag: assignment.medicalCondition || assignment.conditionTag || 'General',
            note: assignment.comments || assignment.note || assignment.notes,
            status: assignment.status?.toLowerCase() || 'pending',
            assignedAt: assignment.assignedAt,
            lastUpdated: assignment.updatedAt,
            reviewedAt: assignment.reviewedAt,
            doctorComment: assignment.doctorComment
          }))
          
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

    // Convert to consistent format
    const responseAssignments = assignments.map(assignment => ({
      assignmentId: assignment.assignmentId,
      recipeId: assignment.recipeId,
      doctorId: assignment.doctorId,
      recipeTitle: assignment.recipeTitle,
      doctorName: assignment.doctorName,
      conditionTag: assignment.conditionTag,
      note: assignment.note,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      lastUpdated: assignment.lastUpdated,
      reviewedAt: assignment.reviewedAt,
      doctorComment: assignment.doctorComment
    }))

    return NextResponse.json({
      success: true,
      data: responseAssignments,
      message: `Found ${responseAssignments.length} assignment(s) from mock data`,
      totalCount: responseAssignments.length,
      source: 'mock'
    })

  } catch (error) {
    console.error('Error fetching doctor assignments:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}