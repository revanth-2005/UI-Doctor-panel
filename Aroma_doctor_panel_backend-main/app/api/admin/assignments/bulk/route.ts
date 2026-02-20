import { NextRequest, NextResponse } from 'next/server'
import { 
  addAssignment,
  mockRecipes, 
  mockDoctors,
  SharedAssignment 
} from '@/lib/mock-data/assignments'

// Counter for generating unique assignment IDs
let bulkAssignmentCounter = 100

/**
 * POST /api/admin/assignments/bulk - Bulk create assignments
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { assignments } = body
    
    if (!assignments || !Array.isArray(assignments)) {
      return NextResponse.json({
        success: false,
        message: 'Assignments array is required'
      }, { status: 400 })
    }
    
    const createdAssignments = []
    const failedAssignments = []
    
    for (const assignmentData of assignments) {
      try {
        // Validate required fields
        if (!assignmentData.doctorId || !assignmentData.recipeId || !assignmentData.conditionTag) {
          failedAssignments.push({
            data: assignmentData,
            error: 'Missing required fields: doctorId, recipeId, conditionTag'
          })
          continue
        }
        
        // Check if doctor exists
        const doctor = mockDoctors.find(d => d.id === assignmentData.doctorId)
        if (!doctor) {
          failedAssignments.push({
            data: assignmentData,
            error: 'Doctor not found'
          })
          continue
        }
        
        // Check if recipe exists
        const recipe = mockRecipes.find(r => r.id === assignmentData.recipeId)
        if (!recipe) {
          failedAssignments.push({
            data: assignmentData,
            error: 'Recipe not found'
          })
          continue
        }
        
        // Create new assignment
        const now = new Date()
        const newAssignment: SharedAssignment = {
          assignmentId: `bulk_${String(bulkAssignmentCounter).padStart(3, '0')}`,
          recipeId: assignmentData.recipeId,
          doctorId: assignmentData.doctorId,
          recipeTitle: recipe.recipeTitle,
          doctorName: doctor.doctorName,
          conditionTag: assignmentData.conditionTag.trim(),
          note: assignmentData.note?.trim(),
          status: 'pending',
          assignedAt: now,
          lastUpdated: now
        }
        
        // Save the assignment
        addAssignment(newAssignment)
        createdAssignments.push(newAssignment)
        bulkAssignmentCounter++
        
      } catch (error) {
        failedAssignments.push({
          data: assignmentData,
          error: 'Failed to process assignment'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        created: createdAssignments,
        failed: failedAssignments,
        totalCreated: createdAssignments.length,
        totalFailed: failedAssignments.length
      },
      message: `Bulk operation completed. Created: ${createdAssignments.length}, Failed: ${failedAssignments.length}`
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error in bulk create assignments:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/assignments/bulk - Bulk delete assignments
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { assignmentIds } = body
    
    if (!assignmentIds || !Array.isArray(assignmentIds)) {
      return NextResponse.json({
        success: false,
        message: 'Assignment IDs array is required'
      }, { status: 400 })
    }
    
    const deletedAssignments = []
    const notFoundIds = []
    
    // Import here to access the shared assignments array directly
    const { sharedAssignments } = await import('@/lib/mock-data/assignments')
    
    for (const id of assignmentIds) {
      const assignmentIndex = sharedAssignments.findIndex(a => a.assignmentId === id)
      
      if (assignmentIndex !== -1) {
        const deleted = sharedAssignments.splice(assignmentIndex, 1)[0]
        deletedAssignments.push(deleted)
      } else {
        notFoundIds.push(id)
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        deleted: deletedAssignments,
        notFound: notFoundIds,
        totalDeleted: deletedAssignments.length
      },
      message: `Bulk delete completed. Deleted: ${deletedAssignments.length}, Not found: ${notFoundIds.length}`
    })
    
  } catch (error) {
    console.error('Error in bulk delete assignments:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}