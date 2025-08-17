import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { recipients, subject, body, format, summary } = await request.json()

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 })
    }

    if (!summary && !body) {
      return NextResponse.json({ error: "Summary or message body is required" }, { status: 400 })
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = recipients.filter((email: string) => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      return NextResponse.json({ error: `Invalid email addresses: ${invalidEmails.join(", ")}` }, { status: 400 })
    }

    // ✅ Configure transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your gmail
        pass: process.env.EMAIL_PASS, // app password (not normal password)
      },
    })

    // ✅ Send mail
    await transporter.sendMail({
      from: `"Meeting Bot" <${process.env.EMAIL_USER}>`,
      to: recipients.join(", "),
      subject: subject || `Meeting Summary - ${new Date().toLocaleDateString()}`,
      text: body || summary,
    })

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${recipients.length} recipient(s)`,
      recipients: recipients.length,
      format,
    })
  } catch (error) {
    console.error("Error in share API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    )
  }
}
