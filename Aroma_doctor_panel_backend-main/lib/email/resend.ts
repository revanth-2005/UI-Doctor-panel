import { Resend } from 'resend'
import { getDoctorWelcomeEmailHtml } from './templates'

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send welcome email to newly created doctor
 */
export async function sendDoctorWelcomeEmail(
  doctorEmail: string,
  doctorName: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate API key exists
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured in .env.local')
      return { success: false, error: 'Email service not configured' }
    }

    console.log('📧 Attempting to send email to:', doctorEmail)
    console.log('📧 Using API key:', process.env.RESEND_API_KEY?.substring(0, 10) + '...')

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Aroma Nutrition <onboarding@resend.dev>',
      to: doctorEmail,
      subject: 'Welcome to Aroma Nutrition Portal - Your Account is Ready',
      html: getDoctorWelcomeEmailHtml(doctorEmail, password),
    })

    if (error) {
      console.error('❌ Failed to send doctor welcome email:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message || 'Failed to send email' }
    }

    console.log('✅ Welcome email sent successfully!')
    console.log('Email ID:', data?.id)
    return { success: true }
    
  } catch (error: any) {
    console.error('❌ Exception while sending email:', error)
    console.error('Stack trace:', error.stack)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}
