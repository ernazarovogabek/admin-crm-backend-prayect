import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const path = params.path.join('/')
    const token = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)

    const url = new URL(`https://admin-crm.onrender.com/api/student/${path}`)
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url, {
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

export async function POST(request, { params }) {
  try {
    const path = params.path.join('/')
    const token = request.headers.get('authorization')
    const body = await request.json()

    const response = await fetch(`https://admin-crm.onrender.com/api/student/${path}`, {
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

export async function DELETE(request, { params }) {
  try {
    const path = params.path.join('/')
    const token = request.headers.get('authorization')

    const response = await fetch(`https://admin-crm.onrender.com/api/student/${path}`, {
      method: 'DELETE',
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
