"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import { useAuth } from "../lib/AuthContext"
import LoadingButton from "./LoadingButton"

export default function UserProfileForm({ onProfileUpdate }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "male",
    activeness: "moderate",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("users")
          .select("height, weight, age, gender, activeness")
          .eq("auth_user_id", user.id)
          .single()

        if (!error && data) {
          setFormData({
            height: data.height || "",
            weight: data.weight || "",
            age: data.age || "",
            gender: data.gender || "male",
            activeness: data.activeness || "moderate",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage("")

    try {
      // Convert form data to proper types
      const updateData = {
        height: formData.height ? Number.parseFloat(formData.height) : null,
        weight: formData.weight ? Number.parseFloat(formData.weight) : null,
        age: formData.age ? Number.parseInt(formData.age) : null,
        gender: formData.gender,
        activeness: formData.activeness,
      }

      console.log("Updating profile with data:", updateData)

      const { data, error } = await supabase.from("users").update(updateData).eq("auth_user_id", user.id).select()

      if (error) {
        console.error("Profile update error:", error)
        throw error
      }

      console.log("Profile updated successfully:", data)
      setMessage("Profile updated successfully!")

      // Call the callback to refresh parent components
      if (onProfileUpdate) {
        onProfileUpdate()
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage(`Failed to update profile: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading profile...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Profile Settings</h3>
      <p style={styles.description}>
        Complete your profile to get accurate calorie targets based on your body metrics and activity level.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Height (cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="170"
              style={styles.input}
              min="100"
              max="250"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="70"
              style={styles.input}
              min="30"
              max="200"
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="25"
              style={styles.input}
              min="13"
              max="100"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} style={styles.select}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Activity Level</label>
          <select name="activeness" value={formData.activeness} onChange={handleChange} style={styles.select}>
            <option value="low">Low (1-2 exercises per week)</option>
            <option value="moderate">Moderate (2-3 exercises per week)</option>
            <option value="high">High (4+ exercises per week)</option>
          </select>
        </div>

        <LoadingButton type="submit" loading={isSaving} loadingText="Saving..." style={styles.submitButton}>
          Save Profile
        </LoadingButton>

        {message && (
          <div
            style={{
              ...styles.message,
              color: message.includes("success") ? "#51cf66" : "#ff6b6b",
            }}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: "var(--color-card-bg)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    color: "var(--color-white)",
  },
  loading: {
    textAlign: "center",
    padding: "2rem",
    color: "var(--color-gray-400)",
  },
  title: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.25rem",
    fontWeight: "600",
  },
  description: {
    margin: "0 0 1.5rem 0",
    fontSize: "0.875rem",
    color: "var(--color-gray-400)",
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "var(--color-white)",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid var(--color-gray-600)",
    backgroundColor: "var(--color-gray-700)",
    color: "var(--color-white)",
    fontSize: "0.875rem",
  },
  select: {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid var(--color-gray-600)",
    backgroundColor: "var(--color-gray-700)",
    color: "var(--color-white)",
    fontSize: "0.875rem",
  },
  submitButton: {
    marginTop: "0.5rem",
  },
  message: {
    textAlign: "center",
    padding: "0.75rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
}
