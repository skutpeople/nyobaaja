
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/AuthContext"
import CalorieCounter from "../components/CalorieCounter"
import UserProfileForm from "../components/UserProfileForm"
import LoadingButton from "../components/LoadingButton"
import CalorieCalendar from "../components/CalorieCalendar"
import MealsCatalog from "../components/MealsCatalog"
import TexturedLayout from "../components/TexturedLayout"
import "./MePage.css"

export default function MePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfileForm, setShowProfileForm] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleAddFood = () => {
    navigate("/chat")
  }

  const handleProfileUpdate = () => {
    setShowProfileForm(false)
    setTimeout(() => {
        window.location.reload()
      }, 100)
  }

  const userName = user?.username || user?.email?.split("@")[0] || "User"

  return (
    <TexturedLayout>
      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.welcomeSection}>
            <h1 style={styles.heading}>Welcome back, {userName}!</h1>
            <p style={styles.subtitle}>Track your daily calorie intake</p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={() => setShowProfileForm(!showProfileForm)} style={styles.profileButton}>
              ⚙️ Profile
            </button>
          </div>
        </div>

        {/* Profile Form */}
        {showProfileForm && (
          <div style={styles.profileFormContainer}>
            <UserProfileForm onProfileUpdate={handleProfileUpdate} />
          </div>
        )}

        {/* Main Content Grid */}
        <div style={styles.contentGrid}>
          {/* Calorie Calendar */}
          <div style={styles.calendarSection}>
            <CalorieCalendar />
          </div>

          {/* Calorie Counter */}
          <div style={styles.counterSection}>
            <CalorieCounter />
          </div>
        </div>

        {/* Add Food Button */}
        <div style={styles.addFoodSection}>
          <LoadingButton onClick={handleAddFood} style={styles.addFoodButton}>
            <span style={styles.addIcon}>🍽️</span>
            Add Food
          </LoadingButton>
        </div>

        {/* Meals Catalog */}
        <div style={styles.mealsSection}>
          <MealsCatalog />
        </div>
      </div>
    </TexturedLayout>
  )
}

const styles = {
  container: {
    color: "var(--color-white, #ffffff)",
    fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
    padding: "0 0.5rem",
  },
  welcomeSection: {
    flex: 1,
  },
  heading: {
    margin: "0 0 0.5rem 0",
    fontSize: "2rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    margin: 0,
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.7)",
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },
  profileButton: {
    padding: "0.75rem 1.25rem",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  profileFormContainer: {
    marginBottom: "2rem",
    animation: "slideDown 0.3s ease-out",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  calendarSection: {
    gridColumn: "1 / -1",
  },
  counterSection: {
    gridColumn: "1 / -1",
  },
  addFoodSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "2rem",
    padding: "1rem 0",
  },
  addFoodButton: {
    padding: "1.25rem 2.5rem",
    fontSize: "1.2rem",
    fontWeight: "600",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
    border: "none",
    color: "#ffffff",
    minWidth: "220px",
    boxShadow: `
      0 8px 24px rgba(255, 107, 53, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.2)
    `,
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  addIcon: {
    fontSize: "1.4rem",
    marginRight: "0.5rem",
  },
  mealsSection: {
    marginTop: "1rem",
  },
}
