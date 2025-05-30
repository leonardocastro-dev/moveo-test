import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

export async function getGoogleCalendarClient() {
  const client = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar.readonly']
  })

  const calendar = google.calendar({ version: 'v3', auth: client })
  return calendar
}
