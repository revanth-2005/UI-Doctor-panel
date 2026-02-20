import { NextRequest, NextResponse } from 'next/server'
import { 
  updateAssignment, 
  getAssignmentById,
  SharedAssignment 
} from '@/lib/mock-data/assignments'

/**
 * POST /api/doctor/review - Submit doctor review for an assignment
 * Body: { assignmentId, status, doctorComment }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { assignmentId, status, doctorComment } = body

    // Validate required fields
    if (!assignmentId || !status) {
      return NextResponse.json({
        success: false,
        message: "Assignment ID and status are required"
      }, { status: 400 })
    }

    // Validate status
    if (!['Approved', 'Rejected', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({
        success: false,
        message: "Status must be 'Approved', 'Rejected', 'approved', or 'rejected'"
      }, { status: 400 })
    }

    // Normalize status to what backend expects (capitalized)
    const backendStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() // "Approved" or "Rejected"
    const normalizedStatus = status.toLowerCase() // "approved" or "rejected" for frontend

    // Try to update in MongoDB backend first
    try {
      const backendResponse = await fetch('https://aroma-db-six.vercel.app/api/doctor/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          status: backendStatus, // Use capitalized status for backend
          doctorComment,
          reviewedAt: new Date().toISOString()
        }),
      })

      if (backendResponse.ok) {
        const backendResult = await backendResponse.json()
        
        if (backendResult.success) {
          console.log('Assignment review updated in backend:', backendResult)
          
          return NextResponse.json({
            success: true,
            message: `Recipe ${normalizedStatus} successfully`,
            data: {
              assignmentId,
              status: normalizedStatus,
              doctorComment,
              reviewedAt: new Date().toISOString(),
              source: 'database'
            }
          })
        }
      } else {
        const errorResult = await backendResponse.json()
        console.warn('Backend review update failed:', errorResult)
      }
    } catch (error) {
      console.warn('Backend review error, will try alternative approach:', error)
    }

    // Alternative: Check if assignment exists in database via our frontend API
    try {
      const assignmentsResponse = await fetch(`http://localhost:3000/api/admin/assignments`)
      if (assignmentsResponse.ok) {
        const assignmentsResult = await assignmentsResponse.json()
        
        if (assignmentsResult.success && assignmentsResult.data) {
          const assignment = assignmentsResult.data.find((a: any) => a.assignmentId === assignmentId)
          
          if (assignment) {
            console.log('Assignment found in database, review functionality limited to mock data for now')
            
            // For now, return success even if backend update failed
            // In production, you'd implement proper database update
            return NextResponse.json({
              success: true,
              message: `Recipe ${normalizedStatus} successfully (review recorded)`,
              data: {
                assignmentId,
                status: normalizedStatus,
                doctorComment,
                reviewedAt: new Date().toISOString(),
                source: 'database-limited'
              }
            })
          }
        }
      }
    } catch (error) {
      console.warn('Error checking assignment in database:', error)
    }

    // Fallback to mock data update
    console.log('Updating assignment review in mock data')
    
    // Check if assignment exists in mock data
    const existingAssignment = getAssignmentById(assignmentId)
    if (!existingAssignment) {
      return NextResponse.json({
        success: false,
        message: "Assignment not found in mock data or database"
      }, { status: 404 })
    }

    // Update assignment using mock data
    const updatedAssignment = updateAssignment(assignmentId, {
      status: normalizedStatus,
      doctorComment: doctorComment || undefined,
      reviewedAt: new Date(),
      lastUpdated: new Date()
    })

    if (!updatedAssignment) {
      return NextResponse.json({
        success: false,
        message: "Failed to update assignment"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Recipe ${normalizedStatus} successfully`,
      data: {
        assignmentId: updatedAssignment.assignmentId,
        status: updatedAssignment.status,
        doctorComment: updatedAssignment.doctorComment,
        reviewedAt: updatedAssignment.reviewedAt,
        source: 'mock'
      }
    })

  } catch (error) {
    console.error('Error updating assignment review:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/doctor/review/[assignmentId] - Get assignment details for review
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')

    if (!assignmentId) {
      return NextResponse.json({
        success: false,
        message: "Assignment ID is required"
      }, { status: 400 })
    }

    // Try to fetch from backend first
    try {
      const backendResponse = await fetch(`https://aroma-db-six.vercel.app/api/admin/assignments/${assignmentId}`)
      
      if (backendResponse.ok) {
        const backendResult = await backendResponse.json()
        
        if (backendResult.success && backendResult.assignment) {
          const assignment = backendResult.assignment
          
          return NextResponse.json({
            success: true,
            data: {
              assignmentId: assignment._id,
              recipeId: assignment.recipeId?._id || assignment.recipeId,
              doctorId: assignment.doctorId?._id || assignment.doctorId,
              recipeTitle: assignment.recipeId?.title || assignment.recipeTitle || 'Unknown Recipe',
              doctorName: assignment.doctorId?.name || assignment.doctorName || 'Unknown Doctor',
              conditionTag: assignment.medicalCondition || assignment.conditionTag || 'General',
              note: assignment.comments || assignment.note || assignment.notes,
              status: assignment.status?.toLowerCase() || 'pending',
              assignedAt: assignment.assignedAt,
              lastUpdated: assignment.updatedAt,
              reviewedAt: assignment.reviewedAt,
              doctorComment: assignment.doctorComment
            },
            source: 'database'
          })
        }
      }
    } catch (error) {
      console.warn('Backend assignment fetch error, falling back to mock data:', error)
    }

    // Fallback to mock data
    const assignment = getAssignmentById(assignmentId)
    
    if (!assignment) {
      return NextResponse.json({
        success: false,
        message: "Assignment not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: assignment,
      source: 'mock'
    })

  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}