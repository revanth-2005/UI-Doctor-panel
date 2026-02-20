import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

/**
 * GET /api/patient - Fetch all patients
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search')
    const doctorId = searchParams.get('doctorId')

    // Build query parameters for backend
    const backendParams = new URLSearchParams()
    backendParams.append('page', page)
    backendParams.append('limit', limit)
    backendParams.append('sortBy', sortBy)
    backendParams.append('sortOrder', sortOrder)
    if (search) backendParams.append('search', search)
    if (doctorId) backendParams.append('doctorId', doctorId)

    // Send request to MongoDB backend
    const backendUrl = `${config.mongodb.backendUrl}/api/patient?${backendParams.toString()}`
    console.log('🔗 Fetching patients from backend:', backendUrl)
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status ${backendResponse.status}`)
    }

    const backendResult = await backendResponse.json()
    console.log('📋 Backend patients response:', backendResult)

    if (!backendResult.success) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to fetch patients from backend'
      })
    }

    // Map backend patients to frontend format
    const patients = (backendResult.patients || backendResult.data || []).map((patient: any) => ({
      _id: patient._id || patient.id,
      id: patient._id || patient.id,
      name: patient.name,
      phone: patient.phone,
      userId: patient.userId,
      nutritionLimits: patient.nutritionLimits,
      assignedDoctorId: patient.assignedDoctorId,
      medicalCondition: patient.medicalCondition,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: {
        patients: patients,
        pagination: backendResult.pagination || {
          currentPage: parseInt(page),
          totalPages: Math.ceil(patients.length / parseInt(limit)),
          totalCount: patients.length,
          hasNext: false,
          hasPrev: false
        }
      },
      message: backendResult.message || `Found ${patients.length} patient(s)`,
      totalCount: patients.length
    })

  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * POST /api/patient - Create a new patient
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    console.log('📝 Creating patient with data:', body)

    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json({
        success: false,
        message: 'Patient name and phone are required'
      }, { status: 400 })
    }

    // Check if patient with same phone already exists
    try {
      const checkResponse = await fetch(`${config.mongodb.backendUrl}/api/patient?search=${encodeURIComponent(body.phone.trim())}`)
      if (checkResponse.ok) {
        const checkResult = await checkResponse.json()
        if (checkResult.success && checkResult.patients) {
          const existingPatient = checkResult.patients.find((p: any) => p.phone === body.phone.trim())
          if (existingPatient) {
            return NextResponse.json({
              success: false,
              message: 'Patient with this phone number already exists'
            }, { status: 409 })
          }
        }
      }
    } catch (checkError) {
      console.warn('Failed to check for existing patient:', checkError)
    }

    // Send request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name.trim(),
        phone: body.phone.trim(),
        userId: body.userId || `user_${Date.now()}`,
        nutritionLimits: body.nutritionLimits || {},
        assignedDoctorId: body.assignedDoctorId,
        medicalCondition: body.medicalCondition
      })
    })

    const backendResult = await backendResponse.json()
    console.log('📋 Backend create patient response:', backendResult)

    if (!backendResponse.ok) {
      // Workaround for backend bug: "savedPatient.populate(...).populate is not a function"
      // This error happens AFTER the patient is saved, so we can treat it as a success
      // and try to fetch the saved patient.
      const errorMessage = backendResult.message || '';
      if (errorMessage.includes('populate') || errorMessage.includes('is not a function')) {
        console.warn('⚠️ Backend bug detected: Patient saved but response failed. Attempting recovery...');
        
        try {
          // Try to fetch the patient we just created
          const recoveryResponse = await fetch(`${config.mongodb.backendUrl}/api/patient?search=${encodeURIComponent(body.phone.trim())}`);
          if (recoveryResponse.ok) {
            const recoveryResult = await recoveryResponse.json();
            if (recoveryResult.success && recoveryResult.patients) {
              const savedPatient = recoveryResult.patients.find((p: any) => p.phone === body.phone.trim());
              
              if (savedPatient) {
                console.log('✅ Recovered patient data after backend error');
                
                // Map to frontend format
                const newPatient = {
                  _id: savedPatient._id || savedPatient.id,
                  id: savedPatient._id || savedPatient.id,
                  name: savedPatient.name,
                  phone: savedPatient.phone,
                  userId: savedPatient.userId,
                  nutritionLimits: savedPatient.nutritionLimits,
                  assignedDoctorId: savedPatient.assignedDoctorId,
                  medicalCondition: savedPatient.medicalCondition,
                  createdAt: savedPatient.createdAt,
                  updatedAt: savedPatient.updatedAt
                };

                return NextResponse.json({
                  success: true,
                  data: newPatient,
                  message: 'Patient created successfully'
                }, { status: 201 });
              }
            }
          }
        } catch (recoveryError) {
          console.error('Recovery failed:', recoveryError);
        }
      }

      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to create patient in backend'
      }, { status: backendResponse.status })
    }

    // Map backend response to frontend format
    const newPatient = {
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
      data: newPatient,
      message: backendResult.message || 'Patient created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}