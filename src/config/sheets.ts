import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

// Configuração do Google Sheets
export const SPREADSHEET_ID = '17CKh2i5E9bDz7p4ipXOZJyUShbzhvWH0QynsQBWfKmA'
export const SHEET_NAME = 'users'

// Função para inicializar a autenticação
export async function getGoogleSheetsClient() {
  const client = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })

  const sheets = google.sheets({ version: 'v4', auth: client })
  return sheets
}
