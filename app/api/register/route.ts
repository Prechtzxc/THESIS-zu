import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { isEmailApproved, createScholar } from "@/lib/supabase/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, password, address, contactNumber, age, barangay, schoolName, course, yearLevel } = body

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email is pre-approved
    const emailApproved = await isEmailApproved(email)
    if (!emailApproved) {
      return NextResponse.json(
        {
          error:
            "This email is not authorized to register. Please contact the administrator to get your email approved.",
        },
        { status: 403 },
      )
    }

    try {
      const supabase = await createServiceRoleClient()

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single()

      if (existingUser) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user in Supabase
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([
          {
            email,
            full_name: fullName,
            password_hash: hashedPassword,
            role: "student",
            is_active: true,
          },
        ])
        .select()
        .single()

      if (userError) {
        console.error("[Register] User creation error:", userError)
        return NextResponse.json({ error: "User creation failed" }, { status: 400 })
      }

      // Create scholar profile
      const scholarData = {
        fullName,
        email,
        contactNumber: contactNumber || "",
        address: address || "",
        age: age || "",
        barangay: barangay || "",
        schoolName: schoolName || "",
        course: course || "",
        yearLevel: yearLevel || "",
      }

      await createScholar(newUser.id, scholarData)

      return NextResponse.json({ success: true, message: "Registration successful" }, { status: 201 })
    } catch (error: any) {
      console.error("[Register] Error:", error)
      return NextResponse.json({ error: error.message || "User creation failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("[Register] Request parsing error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}
