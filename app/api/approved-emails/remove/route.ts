import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { removeApprovedEmail } from "@/lib/supabase/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { emailId } = body

    if (!emailId) {
      return NextResponse.json({ error: "Email ID is required" }, { status: 400 })
    }

    await removeApprovedEmail(emailId)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API] Remove approved email error:", error)
    return NextResponse.json({ error: "Failed to remove approved email" }, { status: 500 })
  }
}
