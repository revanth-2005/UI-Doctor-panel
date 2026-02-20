import { NextRequest, NextResponse } from 'next/server'
import { 
  getAssignmentById,
  updateAssignment,
  sharedAssignments 
} from '@/lib/mock-data/assignments'

/**
 * GET /api/admin/assignments/[id] - Get specific assignment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const assignmentId = id
    
    const assignment = getAssignmentById(assignmentId)
    
    if (!assignment) {
      return NextResponse.json({
        success: false,
        message: 'Assignment not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: assignment,
      message: 'Assignment retrieved successfully'
    })
    
  } catch (error) {
    console.error('Error fetching assignment:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin/assignments/[id] - Update specific assignment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const assignmentId = id
    const body = await request.json()
    
    const updatedAssignment = updateAssignment(assignmentId, {
      status: body.status,
      doctorComment: body.doctorComment,
      note: body.note,
      conditionTag: body.conditionTag,
      reviewedAt: body.status !== 'pending' ? new Date() : undefined,
      lastUpdated: new Date()
    })
    
    if (!updatedAssignment) {
      return NextResponse.json({
        success: false,
        message: 'Assignment not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: updatedAssignment,
      message: 'Assignment updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating assignment:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/assignments/[id] - Delete specific assignment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const assignmentId = id
    
    const assignmentIndex = sharedAssignments.findIndex(a => a.assignmentId === assignmentId)
    
    if (assignmentIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Assignment not found'
      }, { status: 404 })
    }
    
    const deletedAssignment = sharedAssignments.splice(assignmentIndex, 1)[0]
    
    return NextResponse.json({
      success: true,
      data: deletedAssignment,
      message: 'Assignment deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting assignment:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}