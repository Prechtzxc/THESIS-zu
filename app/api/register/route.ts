import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { isEmailApproved, createScholar } from "@/lib/supabase/db"

/**
 * Student Registration Endpoint
 * 
 * Requires:
 * 1. Email must be in the pre-approved_emails table
 * 2. Password must be at least 6 characters
 * 3. Email must not already exist in the system
 * 4. Required fields: fullName, email, password
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, email, password, address, contactNumber, age, barangay, schoolName, course, yearLevel } = body

    // Step 1: Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details: "fullName, email, and password are required",
        },
        { status: 400 },
      )
    }

    // Step 2: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // Step 3: Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long",
        },
        { status: 400 },
      )
    }

    // Step 4: Check if email is PRE-APPROVED (strict enforcement)
    console.log(`[Register] Checking if email is approved: ${email}`)
    const emailApproved = await isEmailApproved(email.toLowerCase())
    
    if (!emailApproved) {
      console.warn(`[Register] Registration blocked for unapproved email: ${email}`)
      return NextResponse.json(
        {
          success: false,
          error: "Email not authorized for registration",
          details:
            "This email address is not on the approved list. Please contact the BTS administrator (admin@carmona.gov.ph) to request approval.",
          userMessage:
            "This email is not authorized to register. Only pre-approved emails can create accounts. Please contact the administrator for approval.",
        },
        { status: 403 },
      )
    }

    try {
      const supabase = await createServiceRoleClient()

      // Step 5: Check if user already exists
      console.log(`[Register] Checking if user already exists: ${email}`)
      const { data: existingUser, error: existingError } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email.toLowerCase())
        .single()

      if (existingError && existingError.code !== "PGRST116") {
        console.error("[Register] Error checking existing user:", existingError)
        throw new Error("Database error while checking email")
      }

      if (existingUser) {
        console.warn(`[Register] Registration attempted for existing email: ${email}`)
        return NextResponse.json(
          {
            success: false,
            error: "Email already registered",
            details: "This email is already associated with an account",
          },
          { status: 400 },
        )
      }

      // Step 6: Hash password using bcryptjs (10 rounds)
      console.log(`[Register] Hashing password for: ${email}`)
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.default.hash(password, 10)

      // Step 7: Create user in Supabase
      console.log(`[Register] Creating user account: ${email}`)
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert([
          {
            email: email.toLowerCase(),
            full_name: fullName,
            password_hash: hashedPassword,
            role: "student", // Always student for new registrations
            is_active: true,
            email_verified_at: null, // Can be updated later via email verification
          },
        ])
        .select("id, email, full_name, role")
        .single()

      if (userError) {
        console.error("[Register] User creation error:", userError)
        return NextResponse.json(
          {
            success: false,
            error: "User creation failed",
            details: userError.message,
          },
          { status: 400 },
        )
      }

      if (!newUser) {
        console.error("[Register] No user returned after creation")
        return NextResponse.json(
          {
            success: false,
            error: "User creation failed",
            details: "No user data returned",
          },
          { status: 400 },
        )
      }

      // Step 8: Create scholar profile
      console.log(`[Register] Creating scholar profile for: ${newUser.id}`)
      const scholarData = {
        fullName,
        email: newUser.email,
        contactNumber: contactNumber || "",
        address: address || "",
        age: age || null,
        barangay: barangay || "",
        schoolName: schoolName || "",
        course: course || "",
        yearLevel: yearLevel || "",
      }

      await createScholar(newUser.id, scholarData)

      console.log(`[Register] Registration successful for: ${email}`)
      return NextResponse.json(
        {
          success: true,
          message: "Registration successful",
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.full_name,
            role: newUser.role,
          },
        },
        { status: 201 },
      )
    } catch (error: any) {
      console.error("[Register] Error during registration:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Registration failed",
          details: error.message || "An unexpected error occurred",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[Register] Request parsing error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request",
        details: "Could not parse request body",
      },
      { status: 400 },
    )
  }
}
