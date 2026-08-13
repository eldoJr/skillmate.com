import 'dotenv/config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
})

const FROM = `${process.env.EMAILS_FROM_NAME ?? 'Skillmate'} <${process.env.EMAILS_FROM ?? 'noreply@skillmate.com'}>`

async function send(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST) {
    console.warn(`SMTP not configured — email not sent to ${to}`)
    return
  }
  await transporter.sendMail({ from: FROM, to, subject, html })
}

export async function sendVerificationEmail(to: string, firstName: string, token: string) {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
  await send(to, 'Verify your Skillmate email', `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2>Verify your Skillmate account</h2>
      <p>Hi ${firstName}, thanks for joining Skillmate.</p>
      <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#0969da;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
      <p style="font-size:12px">This link expires in 24 hours.</p>
    </div>`)
}

export async function sendPasswordResetEmail(to: string, firstName: string, token: string) {
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
  await send(to, 'Reset your Skillmate password', `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h2>Reset your password</h2>
      <p>Hi ${firstName}, we received a request to reset your Skillmate password.</p>
      <a href="${link}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#0969da;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
      <p style="font-size:12px">This link expires in 2 hours.</p>
    </div>`)
}
