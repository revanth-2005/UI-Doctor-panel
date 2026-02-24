import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        let body;
        try {
            body = await request.json()
        } catch (e) {
            return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 })
        }

        const { email, password } = body

        console.log('🩺 Doctor login attempt for:', email)

        // Check for specific user-provided credentials first (Demo/Test purpose)
        if (email === 'mani@doctor.com' && password === '123') {
            console.log('✅ Match found for mani@doctor.com - Returning success');
            return NextResponse.json({
                success: true,
                message: "Login successful",
                data: {
                    doctorId: "699807109f57554e0817ac82",
                    doctorName: "Dr. Mani",
                    email: "mani@doctor.com",
                    status: "active",
                    specialization: "Dentist",
                    licenseNumber: "1265469"
                }
            })
        }

        // Proxy to the real backend service for other users
        try {
            const backendUrl = 'https://aroma-db-six.vercel.app/api/doctor-login/login'

            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                const doctorInfo = data.data || data.doctor || {}
                return NextResponse.json({
                    success: true,
                    message: data.message || "Login successful",
                    data: {
                        doctorId: doctorInfo.doctorId || doctorInfo._id || "unknown",
                        doctorName: doctorInfo.doctorName || doctorInfo.name || "Doctor",
                        email: doctorInfo.email || email,
                        status: doctorInfo.status || "active",
                        specialization: doctorInfo.specialization || "General",
                        licenseNumber: doctorInfo.licenseNumber || "000000"
                    }
                })
            } else {
                return NextResponse.json({
                    success: false,
                    message: data.message || "Invalid email or password",
                    error: "Authentication Failed"
                }, { status: response.status === 200 ? 401 : response.status })
            }
        } catch (err: any) {
            console.error('⚠️ Backend connection error:', err.message)
            return NextResponse.json({
                success: false,
                message: "Failed to connect to authentication service",
                error: err.message
            }, { status: 500 })
        }

    } catch (error: any) {
        console.error('❌ Critical Login error:', error.message)
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            error: error.message
        }, { status: 500 })
    }
}
