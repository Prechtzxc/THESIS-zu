import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createDocument, getScholarsByUserId } from '@/lib/supabase/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 })
    }

    // Create a unique filename with timestamp and user context
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const pathname = `documents/${session.user.id}/${timestamp}-${sanitizedName}`

    // Upload to Vercel Blob (private access)
    const blob = await put(pathname, file, {
      access: 'private',
    })

    // Get user's scholar profile
    const scholars = await getScholarsByUserId(session.user.id)
    const scholarId = scholars.length > 0 ? scholars[0].id : null

    // Create document record in Supabase
    await createDocument(
      session.user.id,
      scholarId,
      documentType,
      file.name,
      blob.url,
      file.size
    )

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('[API] Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
