import { NextRequest, NextResponse } from 'next/server'
import { Doctor } from '@/lib/types/admin'
import { config } from '@/lib/config'

/**
 * PUT /api/admin/doctors/[id] - Update doctor status or information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const doctorId = id
    const body = await request.json()
    
    if (!doctorId) {
      return NextResponse.json({
        success: false,
        message: 'Doctor ID is required'
      }, { status: 400 })
    }
    
    // Send update request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/admin/doctors/${doctorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    const backendResult = await backendResponse.json()
    
    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to update doctor in backend'
      }, { status: backendResponse.status })
    }

    // Update doctor login status
    if (backendResult.doctor?.email && backendResult.doctor?.status) {
      try {
        // Try to update status in auth service
        await fetch(`${config.mongodb.backendUrl}/api/doctor-login/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: backendResult.doctor.email,
            status: backendResult.doctor.status
          })
        }).catch(err => console.error('Auth service update failed:', err));
      } catch (error) {
        console.error('Failed to update doctor login status:', error);
      }
    }
    
    // Map backend response to frontend format
    const updatedDoctor: Doctor = {
      id: backendResult.doctor._id || backendResult.doctor.id,
      doctorName: backendResult.doctor.name,
      email: backendResult.doctor.email,
      phone: backendResult.doctor.phone,
      specialization: backendResult.doctor.specialization,
      licenseNumber: backendResult.doctor.licenseNumber,
      status: backendResult.doctor.status,
      assignedRecipesCount: backendResult.doctor.assignedRecipesCount || 0,
      createdAt: new Date(backendResult.doctor.createdAt),
      updatedAt: new Date(backendResult.doctor.updatedAt)
    }
    
    return NextResponse.json({
      success: true,
      data: updatedDoctor,
      message: backendResult.message || 'Doctor updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating doctor:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/doctors/[id] - Delete a doctor
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const doctorId = id
    
    if (!doctorId) {
      return NextResponse.json({
        success: false,
        message: 'Doctor ID is required'
      }, { status: 400 })
    }
    
    // Send delete request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/admin/doctors/${doctorId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const backendResult = await backendResponse.json()
    
    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to delete doctor from backend'
      }, { status: backendResponse.status })
    }
    
    return NextResponse.json({
      success: true,
      message: backendResult.message || 'Doctor deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting doctor:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/doctors/[id] - Get a specific doctor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const doctorId = id
    
    if (!doctorId) {
      return NextResponse.json({
        success: false,
        message: 'Doctor ID is required'
      }, { status: 400 })
    }
    
    // Send request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/admin/doctors/${doctorId}`)
    
    const backendResult = await backendResponse.json()
    
    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to fetch doctor from backend'
      }, { status: backendResponse.status })
    }
    
    // Map backend response to frontend format
    const doctor: Doctor = {
      id: backendResult.doctor._id || backendResult.doctor.id,
      doctorName: backendResult.doctor.name,
      email: backendResult.doctor.email,
      phone: backendResult.doctor.phone,
      specialization: backendResult.doctor.specialization,
      licenseNumber: backendResult.doctor.licenseNumber,
      status: backendResult.doctor.status,
      assignedRecipesCount: backendResult.doctor.assignedRecipesCount || 0,
      createdAt: new Date(backendResult.doctor.createdAt),
      updatedAt: new Date(backendResult.doctor.updatedAt)
    }
    
    return NextResponse.json({
      success: true,
      data: doctor,
      message: backendResult.message || 'Doctor retrieved successfully'
    })
    
  } catch (error) {
    console.error('Error fetching doctor:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}