import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/admin/doctors - Fetch all doctors from the backend
 * Proxies to your separate backend API: http://172.16.0.112:3000/api/doctor/read
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.MONGODB_BACKEND_URL || 'http://172.16.0.112:3000'
    const backendUrl = `${baseUrl}/api/doctor/read`

    console.log(`📡 Fetching Doctors List from Backend: ${backendUrl}`)

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`)
    }

    const data = await response.json()

    // Map backend format to frontend Doctor type
    // Backend uses _id, name, specialization, phone, etc.
    const mappedData = (data.data || []).map((doctor: any) => ({
      id: doctor._id,
      doctorName: doctor.name || 'Unknown Doctor',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialization: doctor.specialization || '',
      licenseNumber: doctor.licenseNumber || '',
      status: doctor.status || 'active',
      createdAt: doctor.createdAt || new Date().toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: mappedData,
      totalCount: data.count || mappedData.length
    })

  } catch (error: any) {
    console.error('❌ Fetch Doctors Proxy Error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch doctors from backend',
      error: error.message
    }, { status: 502 })
  }
}