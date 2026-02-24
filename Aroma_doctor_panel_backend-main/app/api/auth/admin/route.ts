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

        console.log('👑 Admin login attempt for:', email)

        // Check for specific user-provided credentials (admin1@example.com / 123)
        if (email === 'admin1@example.com' && password === '123') {
            console.log('✅ Match found for admin1@example.com - Returning success');
            return NextResponse.json({
                success: true,
                message: "Admin login successful",
                data: {
                    id: "699bdd9b95797a5241152b77",
                    name: "Admin User 1",
                    email: "admin1@example.com",
                    role: "admin"
                }
            })
        }

        // Fallback for other admin accounts or proxy to backend if needed
        // For now, we follow the user's specific demo requirements
        if (email === 'admin@example.com' && password === 'password') {
            return NextResponse.json({
                success: true,
                message: "Admin login successful",
                data: {
                    id: "admin-default-id",
                    name: "System Admin",
                    email: "admin@example.com",
                    role: "admin"
                }
            })
        }

        return NextResponse.json({
            success: false,
            message: "Invalid admin credentials",
            error: "Authentication Failed"
        }, { status: 401 })

    } catch (error: any) {
        console.error('❌ Critical Admin Login error:', error.message)
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            error: error.message
        }, { status: 500 })
    }
}
