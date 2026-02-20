import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

/**
 * PUT /api/doctor/profile - Update doctor password
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { doctorId, currentPassword, newPassword } = body
    
    // Validate required fields
    if (!doctorId || !currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Doctor ID, current password, and new password are required'
      }, { status: 400 })
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'New password must be at least 6 characters long'
      }, { status: 400 })
    }

    // Try to update password in MongoDB backend
    try {
      console.log('🔐 Updating password for doctor:', doctorId);
      console.log('📧 Doctor email:', body.email);
      
      // Update password through doctor-login update endpoint
      const updateResponse = await fetch(`${config.mongodb.backendUrl}/api/doctor-login/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email,
          oldPassword: currentPassword,
          newPassword: newPassword
        }),
      })

      const updateResult = await updateResponse.json()
      console.log('📝 Password update response:', updateResult);

      if (updateResponse.ok && updateResult.success) {
        console.log('✅ Password updated successfully');
        
        return NextResponse.json({
          success: true,
          message: 'Password updated successfully'
        }, { status: 200 })
      } else {
        console.error('❌ Password update failed:', updateResult);
        return NextResponse.json({
          success: false,
          message: updateResult.message || 'Failed to update password'
        }, { status: updateResponse.status || 400 })
      }
    } catch (error) {
      console.error('❌ Backend password update error:', error)
      
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to backend server'
      }, { status: 503 })
    }
    
  } catch (error) {
    console.error('Error updating doctor password:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
