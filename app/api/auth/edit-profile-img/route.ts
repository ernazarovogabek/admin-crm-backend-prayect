import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'https://admin-crm.onrender.com'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = request.headers.get('authorization')

    if (!token) {
      return NextResponse.json(
        { message: 'Token topilmadi' },
        { status: 401 }
      )
    }

    const response = await fetch(`${API_URL}/api/auth/edit-profile-img`, {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Rasm yuklashda xatolik:', error)
    return NextResponse.json(
      { message: 'Server xatosi' },
      { status: 500 }
    )
  }
}
