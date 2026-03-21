import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createDocument, getScholarsByUserId } from "@/lib/supabase/db"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const documentType = formData.get("documentType") as string

    if (!file || !documentType) {
      return NextResponse.json({ error: "File and document type are required" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`documents/${session.user.id}/${Date.now()}-${file.name}`, file, {
      access: "private",
    })

    // Get user's scholar profile
    const scholars = await getScholarsByUserId(session.user.id)
    const scholarId = scholars.length > 0 ? scholars[0].id : null

    // Create document record in Supabase
    const doc = await createDocument(
      session.user.id,
      scholarId,
      documentType,
      file.name,
      blob.url,
      file.size
    )

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error("[API] Document upload error:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}
