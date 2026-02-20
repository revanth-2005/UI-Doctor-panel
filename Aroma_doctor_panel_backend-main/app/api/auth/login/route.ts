import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    if (role === 'admin') {
      // Mock admin login
      if (email === 'admin@example.com' && password === 'password') {
         return NextResponse.json({
          success: true,
          user: { id: "2", email: "admin@example.com", role: "admin", name: "Admin User" }
        })
      }
      return NextResponse.json({ success: false, message: 'Invalid admin credentials' }, { status: 401 })
    }

    if (role === 'doctor') {
        // Real doctor login
        try {
            const response = await fetch('https://aroma-db-six.vercel.app/api/doctor-login/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                const doctorData = data.data || data.doctor
                return NextResponse.json({
                    success: true,
                    user: {
                        id: doctorData?.doctorId || doctorData?._id || "unknown",
                        email: doctorData?.email || email,
                        role: 'doctor',
                        name: doctorData?.name || "Doctor"
                    }
                })
            } else {
                return NextResponse.json({ 
                    success: false, 
                    message: data.message || 'Invalid email or password' 
                }, { status: 401 })
            }
        } catch (err) {
            console.error('Backend login error:', err)
            return NextResponse.json({ success: false, message: 'Failed to connect to login service' }, { status: 500 })
        }
    }

    return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })

  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
