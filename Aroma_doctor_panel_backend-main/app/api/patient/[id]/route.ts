import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

/**
 * GET /api/patient/[id] - Get a specific patient
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const patientId = id

    if (!patientId) {
      return NextResponse.json({
        success: false,
        message: 'Patient ID is required'
      }, { status: 400 })
    }

    // Send request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/patient/${patientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const backendResult = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to fetch patient from backend'
      }, { status: backendResponse.status })
    }

    // Map backend response to frontend format
    const patient = {
      _id: backendResult.patient._id || backendResult.patient.id,
      id: backendResult.patient._id || backendResult.patient.id,
      name: backendResult.patient.name,
      phone: backendResult.patient.phone,
      userId: backendResult.patient.userId,
      nutritionLimits: backendResult.patient.nutritionLimits,
      assignedDoctorId: backendResult.patient.assignedDoctorId,
      medicalCondition: backendResult.patient.medicalCondition,
      createdAt: backendResult.patient.createdAt,
      updatedAt: backendResult.patient.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: patient,
      message: backendResult.message || 'Patient retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * PUT /api/patient/[id] - Update a patient
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const patientId = id
    const body = await request.json()

    console.log('========================================');
    console.log('📝 PUT /api/patient/[id] request');
    console.log('Received ID from URL:', patientId);
    console.log('ID type:', typeof patientId);
    console.log('ID length:', patientId?.length);
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('========================================');

    if (!patientId) {
      console.error('❌ No patient ID provided');
      return NextResponse.json({
        success: false,
        message: 'Patient ID is required'
      }, { status: 400 })
    }

    // Construct backend URL
    const backendUrl = `${config.mongodb.backendUrl}/api/patient/${patientId}`;
    console.log('🔗 Calling backend URL:', backendUrl);

    // Send update request to MongoDB backend (backend will validate ID)
    const backendResponse = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const backendResult = await backendResponse.json()
    console.log('📋 Backend response status:', backendResponse.status);
    console.log('📋 Backend response:', JSON.stringify(backendResult, null, 2));

    if (!backendResponse.ok) {
      console.error('❌ Backend returned error');
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to update patient in backend'
      }, { status: backendResponse.status })
    }

    // Map backend response to frontend format
    const updatedPatient = {
      _id: backendResult.patient._id || backendResult.patient.id,
      id: backendResult.patient._id || backendResult.patient.id,
      name: backendResult.patient.name,
      phone: backendResult.patient.phone,
      userId: backendResult.patient.userId,
      nutritionLimits: backendResult.patient.nutritionLimits,
      assignedDoctorId: backendResult.patient.assignedDoctorId,
      medicalCondition: backendResult.patient.medicalCondition,
      createdAt: backendResult.patient.createdAt,
      updatedAt: backendResult.patient.updatedAt
    }

    return NextResponse.json({
      success: true,
      data: updatedPatient,
      message: backendResult.message || 'Patient updated successfully'
    })

  } catch (error) {
    console.error('Error updating patient:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/patient/[id] - Delete a patient
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const patientId = id

    if (!patientId) {
      return NextResponse.json({
        success: false,
        message: 'Patient ID is required'
      }, { status: 400 })
    }

    // Send delete request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/patient/${patientId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const backendResult = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to delete patient from backend'
      }, { status: backendResponse.status })
    }

    return NextResponse.json({
      success: true,
      message: backendResult.message || 'Patient deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting patient:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}