import { NextResponse } from 'next/server'
import {
  getGoogleSheetsClient,
  SPREADSHEET_ID,
  SHEET_NAME
} from '@/config/sheets'

async function getUserData(phone: string) {
  const sheets = await getGoogleSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME
  })

  const rows = response.data.values

  if (!rows || rows.length < 2) {
    throw new Error('No data found in spreadsheet')
  }

  const headers = rows[0]
  const phoneIndex = headers.findIndex(
    (header: string) => header.toLowerCase() === 'phone'
  )

  if (phoneIndex === -1) {
    throw new Error('Phone column not found')
  }

  const userRow = rows
    .slice(1)
    .find((row: string[]) => row[phoneIndex] === phone)

  if (!userRow) {
    throw new Error('User not found')
  }

  const userData = headers.reduce((acc: any, header: string, index: number) => {
    acc[header.toLowerCase()] = userRow[index]
    return acc
  }, {})

  return userData
}

export async function POST(request: Request) {
  try {
    let phone: string
    try {
      const body = await request.json()
      const { phone: userPhone } = body.context.user
      phone = String(userPhone)
      console.log('Phone received (converted to string):', phone)
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json(
        { error: 'Invalid request: phone number must be provided in body.context.user' },
        { status: 400 }
      )
    }

    const userData = await getUserData(phone)

    return NextResponse.json({
      output: {
        live_instructions: userData
      }
    })
  } catch (error: any) {
    console.error('Error processing POST request:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 404 : 500 }
    )
  }
}
