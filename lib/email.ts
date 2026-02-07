// lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendPageViewNotification({
  path,
  city,
  country,
  countryRegion,
  postTitle,
}: {
  path: string
  city: string | null
  country: string | null
  countryRegion: string | null
  postTitle?: string | null
}) {
  const location = [city, countryRegion, country].filter(Boolean).join(', ') || 'Unknown'
  const countryFlag = country ? getCountryFlag(country) : ''
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
    subject: `🔔 New Visitor: ${postTitle || path}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .card {
              background: white;
              border-radius: 8px;
              padding: 24px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .header {
              color: #4f46e5;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .info-row {
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: 600;
              color: #6b7280;
              font-size: 14px;
            }
            .value {
              color: #111827;
              font-size: 16px;
              margin-top: 4px;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">📊 New Page View Alert</div>
              
              <div class="info-row">
                <div class="label">Page</div>
                <div class="value">${postTitle ? `📝 ${postTitle}` : `🔗 ${path}`}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Location</div>
                <div class="value">${countryFlag} ${location}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Details</div>
                <div class="value">
                  ${city ? `🏙️ City: ${city}<br>` : ''}
                  ${countryRegion ? `📍 Region: ${countryRegion}<br>` : ''}
                  ${country ? `🌍 Country: ${country}` : ''}
                </div>
              </div>
              
              <div class="info-row">
                <div class="label">Time</div>
                <div class="value">🕐 ${new Date().toLocaleString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}</div>
              </div>
              
              <div class="footer">
                しらないみちへ - Unknown Roads<br>
                Analytics Notification
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email notification sent successfully')
  } catch (error) {
    console.error('Failed to send email notification:', error)
    throw error
  }
}

// Helper function to get country flag emoji
function getCountryFlag(code: string) {
  try {
    return code
      .toUpperCase()
      .split('')
      .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
      .join('')
  } catch {
    return ''
  }
}