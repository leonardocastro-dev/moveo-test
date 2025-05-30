import { NextResponse } from 'next/server'
import { getGoogleCalendarClient } from '@/config/calendar'

async function getUserEvents(email: string) {
  const calendar = await getGoogleCalendarClient()

  // Busca eventos para os próximos 7 dias
  const timeMin = new Date()
  const timeMax = new Date()
  timeMax.setDate(timeMax.getDate() + 7)

  try {
    const response = await calendar.events.list({
      calendarId: email,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    })

    const events =
      response.data.items?.map((event) => ({
        title: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        description: event.description || '',
        location: event.location || ''
      })) || []

    return events
  } catch (error: any) {
    console.error('Error fetching calendar events:', error)
    if (error.code === 404) {
      throw new Error('Calendar not found or not accessible')
    }
    throw new Error('Failed to fetch calendar events')
  }
}

export async function POST(request: Request) {
  try {
    let email: string
    try {
      const body = await request.json()
      const { email: userEmail } = body.context.live_instructions
      email = String(userEmail)
      console.log('Email received:', email)
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json(
        {
          error: 'Invalid request: email must be provided in body.context.user'
        },
        { status: 400 }
      )
    }

    const events = await getUserEvents(email)

    return NextResponse.json({
      output: {
        live_instructions: events
      }
    })
  } catch (error: any) {
    console.error('Error processing calendar request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('not found') ? 404 : 500 }
    )
  }
}
