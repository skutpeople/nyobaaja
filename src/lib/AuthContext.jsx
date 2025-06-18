

"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch additional user data from custom users table
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile from custom users table
  async function fetchUserProfile(userId) {
    try {
      const { data: profile, error } = await supabase.from("users").select("*").eq("auth_user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile:", error)
        setLoading(false)
        return
      }

      // Get auth user data
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      // Combine auth user data with profile data, prioritize username from profile
      const userData = {
        id: userId,
        email: authUser?.email,
        username: profile?.username || authUser?.user_metadata?.username,
        created_at: profile?.created_at || authUser?.created_at,
      }

      setUser(userData)
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
    } finally {
      setLoading(false)
    }
  }

  // Create user profile manually
  async function createUserProfile(userId, email, username) {
    try {
      console.log("Creating user profile with:", { userId, email, username })

      const { data, error } = await supabase.rpc("create_user_profile", {
        user_id: userId,
        user_email: email,
        user_username: username,
      })

      if (error) {
        console.error("Error creating user profile:", error)
        throw error
      }

      console.log("User profile creation result:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to create user profile")
      }

      return data
    } catch (error) {
      console.error("Error in createUserProfile:", error)
      throw error
    }
  }

  // Sign Up function with email, username, and password
  async function signUp(email, username, password, passwordConfirm) {
    try {
      console.log("Starting signup process with:", { email, username })

      // 1) Validate inputs
      if (!email || !email.includes("@")) {
        throw new Error("Email tidak valid")
      }

      if (!username || username.length < 3) {
        throw new Error("Username minimal 3 karakter")
      }

      if (!password || password.length < 8) {
        throw new Error("Password minimal 8 karakter")
      }

      if (password !== passwordConfirm) {
        throw new Error("Password tidak sama")
      }

      // 2) Check if username is already taken FIRST
      console.log("Checking username availability...")
      const { data: existingUser, error: usernameError } = await supabase
        .from("users")
        .select("username")
        .eq("username", username)
        .single()

      if (usernameError && usernameError.code !== "PGRST116") {
        throw new Error("Gagal mengecek keberadaan username")
      }

      if (existingUser) {
        throw new Error("Username sudah digunakan, silakan pilih yang lain")
      }

      // 3) Create auth user with Supabase Auth
      console.log("Creating auth user...")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Store in metadata as backup
          },
        },
      })

      if (authError) {
        console.error("Supabase auth error:", authError)

        if (authError.message.includes("User already registered")) {
          throw new Error("Email sudah terdaftar. Silakan gunakan email lain atau sign in.")
        }

        if (authError.message.includes("Database error")) {
          throw new Error("Terjadi kesalahan database. Silakan coba lagi.")
        }

        throw new Error(authError.message || "Gagal membuat akun")
      }

      if (!authData.user) {
        throw new Error("Gagal membuat akun")
      }

      console.log("Auth user created successfully:", authData.user.id)

      // 4) Create user profile manually with the EXACT username from the form
      try {
        console.log("Creating profile for user:", authData.user.id, "with username:", username)
        const profileResult = await createUserProfile(authData.user.id, email, username)
        console.log("Profile creation result:", profileResult)

        if (!profileResult.success) {
          throw new Error(profileResult.error || "Failed to create user profile")
        }
      } catch (profileError) {
        console.error("Failed to create user profile:", profileError)
        throw new Error("Gagal membuat profil pengguna: " + profileError.message)
      }

      // 5) If user is not confirmed yet, show appropriate message
      if (!authData.user.email_confirmed_at) {
        throw new Error("Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi.")
      }

      // 6) Fetch the user profile to update state
      await fetchUserProfile(authData.user.id)

      return authData.user
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  // Enhanced Sign In function with better username handling
  async function signIn(emailOrUsername, password) {
    try {
      console.log("Starting signin with:", emailOrUsername)

      if (!emailOrUsername || !password) {
        throw new Error("Email/Username dan password harus diisi")
      }

      let email = emailOrUsername
      let foundUser = null

      // If input doesn't contain @, treat it as username and get email
      if (!emailOrUsername.includes("@")) {
        console.log("Looking up username:", emailOrUsername)

        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("email,username,auth_user_id")
          .eq("username", emailOrUsername)
          .single()

        console.log("Username lookup result:", { userProfile, profileError })

        if (profileError) {
          if (profileError.code === "PGRST116") {
            throw new Error("Username tidak ditemukan")
          } else {
            console.error("Database error looking up username:", profileError)
            throw new Error("Gagal mencari username: " + profileError.message)
          }
        }

        if (!userProfile) {
          throw new Error("Username tidak ditemukan")
        }

        email = userProfile.email
        foundUser = userProfile
        console.log("Found user profile:", foundUser)
      } else {
        // If it's an email, check if user profile exists
        console.log("Looking up email:", emailOrUsername)

        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("email, username, auth_user_id")
          .eq("email", emailOrUsername)
          .single()

        if (!profileError && userProfile) {
          foundUser = userProfile
          console.log("Found user profile by email:", foundUser)
        }
      }

      // Sign in with Supabase Auth
      console.log("Attempting signin with email:", email)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("Auth signin error:", authError)
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("Email/Username atau password salah")
        }
        throw new Error("Gagal sign in: " + authError.message)
      }

      console.log("Auth signin successful:", authData.user.id)

      // Check if user profile exists for this auth user
      if (!foundUser) {
        console.log("No profile found during signin, checking by auth_user_id...")
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", authData.user.id)
          .single()

        if (profileCheckError && profileCheckError.code !== "PGRST116") {
          console.error("Error checking for existing profile:", profileCheckError)
        }

        if (!existingProfile) {
          console.log("No profile found, this shouldn't happen with new signup flow")
          throw new Error("Profil pengguna tidak ditemukan. Silakan hubungi support.")
        }

        foundUser = existingProfile
      }

      console.log("Signin completed successfully for user:", foundUser.username)

      // User data will be set automatically by the auth state change listener
      return authData.user
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  // Sign Out function
  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      // User state will be cleared by the auth state change listener
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

