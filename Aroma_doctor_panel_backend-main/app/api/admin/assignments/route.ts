import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { CreateAssignmentRequest, CreateAssignmentResponse, RecipeAssignment, FetchAssignmentsResponse } from '@/lib/types/admin'
import { 
  getAssignments, 
  addAssignment, 
  updateAssignment,
  getAssignmentById,
  mockRecipes, 
  mockDoctors,
  SharedAssignment,
  sharedAssignments 
} from '@/lib/mock-data/assignments'

// Counter for generating unique assignment IDs
let assignmentCounter = 4

/**
 * POST /api/admin/assignments - Create a new recipe assignment
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateAssignmentResponse>> {
  try {
    const body: any = await request.json()
    
    // Support both field name formats
    const doctorId = body.doctorId
    const recipeId = body.recipeId
    const conditionTag = body.conditionTag || body.medicalCondition
    const note = body.note || body.comments
    
    // Validate required fields
    if (!doctorId || !recipeId || !conditionTag) {
      return NextResponse.json({
        success: false,
        message: 'Doctor ID, Recipe ID, and Condition Tag (or medicalCondition) are required'
      }, { status: 400 })
    }

    // 1. Get Doctor Name (Optional validation)
    let doctorName = 'Unknown Doctor'
    try {
        // Try to fetch doctor details from backend
        const doctorsResponse = await fetch(`${config.mongodb.backendUrl}/api/admin/doctors`)
        if (doctorsResponse.ok) {
            const doctorsData = await doctorsResponse.json()
            const foundDoctor = doctorsData.doctors?.find((d: any) => d._id === doctorId)
            if (foundDoctor) {
                doctorName = foundDoctor.name
            }
        }
        
        // Fallback to mock doctors if not found in backend (or backend failed)
        if (doctorName === 'Unknown Doctor') {
            const mockDoctor = mockDoctors.find(d => d.id === doctorId)
            if (mockDoctor) {
                doctorName = mockDoctor.doctorName
            }
        }
    } catch (e) {
        console.warn('Error fetching doctor details:', e)
        // Fallback to mock
        const mockDoctor = mockDoctors.find(d => d.id === doctorId)
        if (mockDoctor) {
            doctorName = mockDoctor.doctorName
        }
    }

    // 2. Get Recipe Title (Validation)
    let recipeTitle = 'Unknown Recipe'
    let recipeFound = false
    
    try {
      // Fetch from backend directly
      const recipesResponse = await fetch(`${config.mongodb.backendUrl}/api/public/recipes`)
      if (recipesResponse.ok) {
        const recipesResult = await recipesResponse.json()
        const allRecipes = recipesResult.recipes || recipesResult.data || []
        const recipe = allRecipes.find((r: any) => r._id === recipeId || r.id === recipeId)
        
        if (recipe) {
            recipeTitle = recipe.title
            recipeFound = true
        }
      }
    } catch (error) {
      console.warn('Could not fetch recipes from backend:', error)
    }

    if (!recipeFound) {
        // Fallback to mock recipes
        const mockRecipe = mockRecipes.find(r => r.id === recipeId)
        if (mockRecipe) {
            recipeTitle = mockRecipe.recipeTitle
            recipeFound = true
        }
    }

    if (!recipeFound) {
      return NextResponse.json({
        success: false,
        message: 'Recipe not found'
      }, { status: 404 })
    }

    // Try to save to MongoDB backend first
    try {
      console.log('💾 Saving assignment to MongoDB with note:', note);
      
      // Use the actual doctor ID from the request
      const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/admin/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipeId,
          patientId: "507f1f77bcf86cd799439011", // Dummy patient ID for now
          doctorId: doctorId,   // Use REAL doctor ObjectId from request
          medicalCondition: conditionTag,
          comments: note || `${conditionTag} treatment assignment`,  // Changed from 'notes' to 'comments'
          note: note || `${conditionTag} treatment assignment`,       // Also include 'note' for compatibility
        }),
      })

      const backendResult = await backendResponse.json()

      if (backendResponse.ok && backendResult.assignment) {
        // Success - return the assignment in the expected frontend format
        const responseAssignment: RecipeAssignment = {
          assignmentId: backendResult.assignment._id,
          recipeId: recipeId,
          doctorId: doctorId,
          recipeTitle: recipeTitle,
          doctorName: doctorName,
          conditionTag: conditionTag,
          note: note,
          status: 'pending',
          assignedAt: backendResult.assignment.createdAt || new Date(),
          lastUpdated: backendResult.assignment.updatedAt || new Date(),
          reviewedAt: undefined,
          doctorComment: undefined
        }

        console.log('✅ Assignment saved to MongoDB database:', responseAssignment.assignmentId)

        return NextResponse.json({
          success: true,
          data: responseAssignment,
          message: 'Recipe assigned to doctor for review (stored in database)'
        }, { status: 201 })
      } else {
        console.warn('Backend assignment failed, falling back to mock data:', backendResult)
        // Fall through to mock data fallback
      }
    } catch (error) {
      console.warn('Backend assignment error, falling back to mock data:', error)
      // Fall through to mock data fallback
    }

    // Fallback: save to mock data if backend fails
    console.log('Using mock data fallback for assignment')
    
    // Check for duplicate assignment in mock data
    const existingAssignments = getAssignments()
    const existingAssignment = existingAssignments.find(
      assignment => assignment.doctorId === doctorId && assignment.recipeId === recipeId
    )
    
    if (existingAssignment) {
      return NextResponse.json({
        success: false,
        message: 'This recipe is already assigned to this doctor'
      }, { status: 409 })
    }

    // Create new assignment in mock data
    const now = new Date()
    const newAssignment: SharedAssignment = {
      assignmentId: `assign_${String(assignmentCounter).padStart(3, '0')}`,
      recipeId: recipeId,
      doctorId: doctorId,
      recipeTitle: recipeTitle,
      doctorName: doctorName,
      conditionTag: conditionTag.trim(),
      note: note?.trim(),
      status: 'pending',
      assignedAt: now,
      lastUpdated: now
    }
    
    // Save the assignment to mock data
    addAssignment(newAssignment)
    assignmentCounter++
    
    // Convert to RecipeAssignment format for response
    const responseAssignment: RecipeAssignment = {
      assignmentId: newAssignment.assignmentId,
      recipeId: newAssignment.recipeId,
      doctorId: newAssignment.doctorId,
      recipeTitle: newAssignment.recipeTitle,
      doctorName: newAssignment.doctorName,
      conditionTag: newAssignment.conditionTag,
      note: newAssignment.note,
      status: newAssignment.status,
      assignedAt: newAssignment.assignedAt,
      lastUpdated: newAssignment.lastUpdated,
      reviewedAt: newAssignment.reviewedAt,
      doctorComment: newAssignment.doctorComment
    }

    return NextResponse.json({
      success: true,
      data: responseAssignment,
      message: 'Recipe assigned to doctor for review (stored in mock data - backend unavailable)'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating assignment:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/assignments - Fetch all recipe assignments
 */
export async function GET(request: NextRequest): Promise<NextResponse<FetchAssignmentsResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const conditionTag = searchParams.get('conditionTag')
    const status = searchParams.get('status')
    
    let responseAssignments: RecipeAssignment[] = []
    
    // Try to fetch from MongoDB backend first
    try {
      const backendUrl = new URL('https://aroma-db-six.vercel.app/api/admin/assignments')
      if (status) backendUrl.searchParams.set('status', status)
      
      const backendResponse = await fetch(backendUrl.toString())
      
      if (backendResponse.ok) {
        const backendResult = await backendResponse.json()
        
        if (backendResult.success && backendResult.assignments) {
          console.log('Fetched assignments from MongoDB backend:', backendResult.assignments.length)
          
          // Convert backend assignments to frontend format
          responseAssignments = backendResult.assignments.map((assignment: any) => ({
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
          }))
          
          // Apply frontend filters
          if (doctorId) {
            responseAssignments = responseAssignments.filter(
              assignment => assignment.doctorId === doctorId
            )
          }
          
          if (conditionTag) {
            responseAssignments = responseAssignments.filter(
              assignment => assignment.conditionTag.toLowerCase().includes(conditionTag.toLowerCase())
            )
          }
          
          return NextResponse.json({
            success: true,
            data: responseAssignments,
            message: `Found ${responseAssignments.length} assignment(s) from database`,
            totalCount: responseAssignments.length
          })
        }
      } else {
        console.warn('Backend assignments fetch failed, falling back to mock data')
      }
    } catch (error) {
      console.warn('Backend assignments error, falling back to mock data:', error)
    }
    
    // Fallback to mock data
    console.log('Using mock data for assignments')
    let filteredAssignments = getAssignments()
    
    // Filter by doctor if provided
    if (doctorId) {
      filteredAssignments = filteredAssignments.filter(
        assignment => assignment.doctorId === doctorId
      )
    }
    
    // Filter by condition tag if provided
    if (conditionTag) {
      filteredAssignments = filteredAssignments.filter(
        assignment => assignment.conditionTag.toLowerCase().includes(conditionTag.toLowerCase())
      )
    }
    
    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filteredAssignments = filteredAssignments.filter(
        assignment => assignment.status === status
      )
    }
    
    // Sort by last updated date (newest first)
    filteredAssignments.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
    
    // Convert to RecipeAssignment format for response
    responseAssignments = filteredAssignments.map(assignment => ({
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
      totalCount: responseAssignments.length
    })
    
  } catch (error) {
    console.error('Error fetching assignments:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin/assignments - Update assignment status (bulk or single)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { assignmentId, assignmentIds, status, doctorComment } = body
    
    // Handle single assignment update
    if (assignmentId) {
      const updatedAssignment = updateAssignment(assignmentId, {
        status,
        doctorComment,
        reviewedAt: status !== 'pending' ? new Date() : undefined,
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
    }
    
    // Handle bulk assignment update
    if (assignmentIds && Array.isArray(assignmentIds)) {
      const updatedAssignments = []
      const notFoundIds = []
      
      for (const id of assignmentIds) {
        const updated = updateAssignment(id, {
          status,
          doctorComment,
          reviewedAt: status !== 'pending' ? new Date() : undefined,
          lastUpdated: new Date()
        })
        
        if (updated) {
          updatedAssignments.push(updated)
        } else {
          notFoundIds.push(id)
        }
      }
      
      return NextResponse.json({
        success: true,
        data: {
          updated: updatedAssignments,
          notFound: notFoundIds,
          totalUpdated: updatedAssignments.length
        },
        message: `Updated ${updatedAssignments.length} assignment(s)`
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Assignment ID or Assignment IDs are required'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Error updating assignment:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/assignments - Delete assignment(s)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { assignmentId, assignmentIds } = body
    
    // Handle single assignment deletion
    if (assignmentId) {
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
    }
    
    // Handle bulk assignment deletion
    if (assignmentIds && Array.isArray(assignmentIds)) {
      const deletedAssignments = []
      const notFoundIds = []
      
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
        message: `Deleted ${deletedAssignments.length} assignment(s)`
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Assignment ID or Assignment IDs are required'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Error deleting assignment:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}