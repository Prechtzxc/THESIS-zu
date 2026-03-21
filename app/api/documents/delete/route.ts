import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { deleteDocument } from "@/lib/supabase/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { documentId } = body

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    await deleteDocument(documentId)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API] Document deletion error:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
