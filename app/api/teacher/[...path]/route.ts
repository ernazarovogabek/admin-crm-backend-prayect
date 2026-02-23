import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin-crm.onrender.com'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const pathStr = path.join('/')
    const token = request.headers.get('authorization')

    const response = await fetch(`${API_URL}/api/teacher/${pathStr}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const pathStr = path.join('/')
    const token = request.headers.get('authorization')
    const body = await request.json()

    const response = await fetch(`${API_URL}/api/teacher/${pathStr}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const pathStr = path.join('/')
    const token = request.headers.get('authorization')
    
    let body = null
    try {
      body = await request.json()
    } catch (e) {
      // Body bo'lmasa, davom etamiz
    }

    const response = await fetch(`${API_URL}/api/teacher/${pathStr}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      ...(body && { body: JSON.stringify(body) }),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const pathStr = path.join('/')
    const token = request.headers.get('authorization')
    const body = await request.json()

    const response = await fetch(`${API_URL}/api/teacher/${pathStr}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ message: 'Server xatosi' }, { status: 500 })
  }
}
