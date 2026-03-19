import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { rejectScholar } from "@/lib/supabase/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { scholarId, notes } = body

    if (!scholarId) {
      return NextResponse.json({ error: "Scholar ID is required" }, { status: 400 })
    }

    const updatedScholar = await rejectScholar(scholarId, session.user.id, notes)
    return NextResponse.json(updatedScholar, { status: 200 })
  } catch (error) {
    console.error("[API] Scholar rejection error:", error)
    return NextResponse.json({ error: "Failed to reject scholar" }, { status: 500 })
  }
}
