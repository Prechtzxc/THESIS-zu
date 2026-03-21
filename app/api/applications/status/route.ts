import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { updateApplicationStatus } from "@/lib/supabase/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { applicationId, status, feedback } = body

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Application ID and status are required" }, { status: 400 })
    }

    const updated = await updateApplicationStatus(applicationId, status, feedback, session.user.id)
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("[API] Update application status error:", error)
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
  }
}
