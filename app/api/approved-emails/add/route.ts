import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { addApprovedEmail } from "@/lib/supabase/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const approvedEmail = await addApprovedEmail(email, session.user.id)
    return NextResponse.json(approvedEmail, { status: 201 })
  } catch (error) {
    console.error("[API] Add approved email error:", error)
    return NextResponse.json({ error: "Failed to add approved email" }, { status: 500 })
  }
}
