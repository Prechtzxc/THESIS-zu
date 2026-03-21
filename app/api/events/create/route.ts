import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createEvent } from "@/lib/supabase/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, eventDate, location } = body

    if (!title || !eventDate) {
      return NextResponse.json({ error: "Title and event date are required" }, { status: 400 })
    }

    const event = await createEvent(title, description || "", eventDate, location || "", session.user.id)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("[API] Create event error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
