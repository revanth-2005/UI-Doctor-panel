import { NextRequest, NextResponse } from 'next/server'
import { sendDoctorWelcomeEmail } from '@/lib/email/smtp'

/**
 * POST /api/test/email - Test email sending
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email address is required'
      }, { status: 400 })
    }

    console.log('🧪 Testing email send to:', email)
    
    const result = await sendDoctorWelcomeEmail(email, 'Test Doctor', 'TestPassword123!')
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || 'Failed to send test email',
        details: result.error
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Error in test email endpoint:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

/**
 * GET /api/test/email - Check email configuration
 */
export async function GET() {
  const hasApiKey = !!process.env.RESEND_API_KEY
  const apiKeyPreview = process.env.RESEND_API_KEY 
    ? process.env.RESEND_API_KEY.substring(0, 10) + '...' 
    : 'Not configured'
  
  return NextResponse.json({
    configured: hasApiKey,
    apiKeyPreview,
    message: hasApiKey 
      ? 'Email service is configured' 
      : 'RESEND_API_KEY is missing in .env.local'
  })
}
