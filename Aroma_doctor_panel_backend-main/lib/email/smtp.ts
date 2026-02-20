import nodemailer from 'nodemailer';
import { getDoctorWelcomeEmailHtml } from './templates';

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send welcome email to newly created doctor using SMTP
 */
export async function sendDoctorWelcomeEmail(
  doctorEmail: string,
  doctorName: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials are not configured in .env.local');
      return { success: false, error: 'Email service not configured' };
    }

    console.log('📧 Attempting to send email to:', doctorEmail);

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER, // sender address
      to: doctorEmail, // list of receivers
      subject: 'Welcome to Aroma Nutrition Portal - Your Account is Ready', // Subject line
      html: getDoctorWelcomeEmailHtml(doctorEmail, password), // html body
    });

    console.log('✅ Welcome email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Exception while sending email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}
