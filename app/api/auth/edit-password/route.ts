import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'https://admin-crm.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = request.headers.get('authorization')

    if (!token) {
      return NextResponse.json(
        { message: 'Token topilmadi' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/api/auth/edit-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Parol o\'zgartirishda xatolik:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
