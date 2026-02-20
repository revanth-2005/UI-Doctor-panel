import { NextRequest, NextResponse } from 'next/server'
import { CreateDoctorRequest, CreateDoctorResponse, Doctor } from '@/lib/types/admin'
import { config } from '@/lib/config'
import { sendDoctorWelcomeEmail } from '@/lib/email/smtp'

/**
 * POST /api/admin/doctors - Add a new doctor
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateDoctorResponse>> {
  try {
    const body: CreateDoctorRequest = await request.json()
    
    // Validate required fields
    if (!body.doctorName || !body.email) {
      return NextResponse.json({
        success: false,
        message: 'Doctor name and email are required'
      }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        success: false,
        message: 'Please provide a valid email address'
      }, { status: 400 })
    }

    // Check if doctor with same email or phone already exists
    try {
      const checkResponse = await fetch(`${config.mongodb.backendUrl}/api/admin/doctors`)
      if (checkResponse.ok) {
        const checkResult = await checkResponse.json()
        if (checkResult.success && checkResult.doctors) {
          const existingDoctor = checkResult.doctors.find((d: any) => 
            (d.email && d.email.toLowerCase() === body.email.trim().toLowerCase()) || 
            (body.phone && d.phone && d.phone === body.phone.trim())
          )
          
          if (existingDoctor) {
            return NextResponse.json({
              success: false,
              message: existingDoctor.email.toLowerCase() === body.email.trim().toLowerCase() 
                ? 'Doctor with this email already exists' 
                : 'Doctor with this phone number already exists'
            }, { status: 409 })
          }
        }
      }
    } catch (checkError) {
      console.warn('Failed to check for existing doctor:', checkError)
      // Continue with creation if check fails, backend might catch it
    }
    
    // Send request to MongoDB backend
    const backendResponse = await fetch(`${config.mongodb.backendUrl}/api/admin/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.doctorName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim(),
        specialization: body.specialization?.trim(),
        licenseNumber: body.licenseNumber?.trim(),
        status: body.status || 'active'
      })
    })
    
    const backendResult = await backendResponse.json()
    
    if (!backendResponse.ok) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to create doctor in backend'
      }, { status: backendResponse.status })
    }

    const doctorId = backendResult.doctor._id || backendResult.doctor.id

    // Create login credentials for the doctor (backend will auto-generate password)
    try {
      console.log('Creating login for doctor:', body.email)
      const loginResponse = await fetch('https://aroma-db-six.vercel.app/api/doctor-login/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email.trim().toLowerCase(),
          name: body.doctorName.trim(),
          role: 'doctor',
          doctorId: doctorId
        })
      })

      const loginResult = await loginResponse.json()

      if (!loginResponse.ok) {
        console.error('Failed to create doctor login:', loginResult)
      } else {
        console.log('Doctor login created successfully')
      }
    } catch (loginError) {
      console.error('Error creating doctor login:', loginError)
    }

    // Fetch the auto-generated password from DB using the credentials API
    let generatedPassword = ''
    try {
      console.log('🔍 Fetching auto-generated password from DB for doctor:', doctorId)
      const credentialsResponse = await fetch(`https://aroma-db-six.vercel.app/api/admin/doctors/${doctorId}/credentials`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (credentialsResponse.ok) {
        const credentialsData = await credentialsResponse.json()
        generatedPassword = credentialsData.credentials?.password || ''
        console.log('🔐 Retrieved auto-generated password from DB')
      } else {
        console.error('Failed to fetch credentials from DB:', await credentialsResponse.text())
      }
    } catch (credentialsError) {
      console.error('Error fetching credentials from DB:', credentialsError)
    }

    // Send welcome email to the doctor with the DB-generated password
    if (generatedPassword) {
      try {
        console.log('📧 Sending welcome email to:', body.email)
        const emailResult = await sendDoctorWelcomeEmail(
          body.email.trim().toLowerCase(),
          body.doctorName.trim(),
          generatedPassword
        )
        
        if (emailResult.success) {
          console.log('✅ Welcome email sent successfully with DB password')
        } else {
          console.warn('⚠️ Failed to send welcome email:', emailResult.error)
          // Don't fail the doctor creation if email fails
        }
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError)
        // Don't fail the doctor creation if email fails
      }
    } else {
      console.warn('⚠️ No password retrieved from DB, skipping welcome email')
    }
    
    // Map backend response to frontend format
    const newDoctor: Doctor = {
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
      data: newDoctor,
      message: backendResult.message || 'Doctor added successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error adding doctor:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/doctors - Fetch all doctors
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    // Build query parameters for backend
    const backendParams = new URLSearchParams()
    if (status) backendParams.append('status', status)
    if (search) backendParams.append('search', search)
    
    // Send request to MongoDB backend
    const backendUrl = `${config.mongodb.backendUrl}/api/admin/doctors${backendParams.toString() ? `?${backendParams.toString()}` : ''}`
    const backendResponse = await fetch(backendUrl)
    
    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status ${backendResponse.status}`)
    }
    
    const backendResult = await backendResponse.json()
    
    if (!backendResult.success) {
      return NextResponse.json({
        success: false,
        message: backendResult.message || 'Failed to fetch doctors from backend'
      })
    }
    
    // Map backend doctors to frontend format
    const doctors: Doctor[] = (backendResult.doctors || []).map((doctor: any) => ({
      id: doctor._id || doctor.id,
      doctorName: doctor.name || '',
      email: doctor.email || '',
      phone: doctor.phone || undefined,
      specialization: doctor.specialization || undefined,
      licenseNumber: doctor.licenseNumber || undefined,
      status: doctor.status || 'pending',
      assignedRecipesCount: doctor.assignmentStats?.total || doctor.assignedRecipesCount || 0,
      createdAt: new Date(doctor.createdAt || Date.now()),
      updatedAt: new Date(doctor.updatedAt || doctor.createdAt || Date.now())
    }))
    
    return NextResponse.json({
      success: true,
      data: doctors,
      message: backendResult.message || `Found ${doctors.length} doctor(s)`,
      totalCount: doctors.length
    })
    
  } catch (error) {
    console.error('Error fetching doctors:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}