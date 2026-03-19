import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { createServiceRoleClient } from "@/lib/supabase/server"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[Auth] Missing credentials")
            return null
          }

          // Query Supabase for user
          const supabase = await createServiceRoleClient()
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single()

          if (error || !user) {
            console.error("[Auth] User not found:", error)
            return null
          }

          // Check if user is active
          if (!user.is_active) {
            console.error("[Auth] User is inactive")
            return null
          }

          // Verify password using bcrypt
          // Note: This assumes passwords are hashed in the database
          // For initial migration, you may need to handle both hashed and plain passwords
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash || "")

          if (!isValidPassword) {
            console.error("[Auth] Invalid password")
            return null
          }

          // Update last login
          await supabase
            .from("users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", user.id)

          return {
            id: user.id,
            name: user.full_name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("[Auth] Authorization error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
