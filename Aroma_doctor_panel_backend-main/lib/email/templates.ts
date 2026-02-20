/**
 * Email template for doctor account creation
 */
export function getDoctorWelcomeEmailHtml(email: string, password: string): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2b7a78;">Aroma Nutrition Portal – Login Created</h2>

      <p>Hello Doctor,</p>

      <p>Your login access for the <strong>Aroma Nutrition Portal</strong> has been created.</p>

      <p>
        <strong>Email:</strong> ${email} <br/>
        <strong>Password:</strong> ${password}
      </p>

      <p style="margin-top: 10px;">
        <strong>Important:</strong> Please log in and update your password immediately.
      </p>

      <p>
        <a href="https://arom-backend-web.vercel.app" 
           style="background:#2b7a78; color:#fff; padding:10px 15px; text-decoration:none; border-radius:4px; display:inline-block;">
          Login to Portal
        </a>
      </p>

      <p>If you did not request this account, please contact the admin team.</p>

      <p>Regards,<br/>Aroma Nutrition Admin Team</p>
    </div>
  `
}
