
"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import { useAuth } from "../lib/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

export default function CalorieCounter() {
  const { user } = useAuth()
  const [caloriesConsumed, setCaloriesConsumed] = useState(0)
  const [targetCalories, setTargetCalories] = useState(2000)
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  // Today's date
  const today = new Date().toISOString().split("T")[0]

  // Calculate target calories based on user profile
  const calculateTargetCalories = (height, weight, activeness, age = 25, gender = "male") => {
    // Using Mifflin-St Jeor Equation
    let bmr
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    // Activity multipliers
    const activityMultipliers = {
      low: 1.375, // 1-2 exercises per week
      moderate: 1.55, // 2-3 exercises per week
      high: 1.725, // 4+ exercises per week
    }

    return Math.round(bmr * activityMultipliers[activeness])
  }

  // Fetch user profile and today's calories
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_user_id", user.id)
          .single()

        if (!profileError && profile) {
          setUserProfile(profile)

          // Calculate target calories if profile has required data
          if (profile.height && profile.weight && profile.activeness) {
            const target = calculateTargetCalories(
              profile.height,
              profile.weight,
              profile.activeness,
              profile.age || 25,
              profile.gender || "male",
            )
            setTargetCalories(target)
          }
        }

        // Fetch today's total calories
        const todayDate = new Date()
        const startOfDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0)
        const nextDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 1, 0, 0, 0)

        const { data: calorieData, error: calorieError } = await supabase
          .from("calorie_logs")
          .select("totalcalories")
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString())
          .lt("created_at", nextDay.toISOString())

        if (!calorieError && calorieData) {
          const total = calorieData.reduce((sum, log) => sum + (log.totalcalories || 0), 0)
          setCaloriesConsumed(total)
        }
      } catch (error) {
        console.error("Error fetching calorie data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, today])

  const percentage = targetCalories > 0 ? Math.min((caloriesConsumed / targetCalories) * 100, 100) : 0
  const remaining = Math.max(targetCalories - caloriesConsumed, 0)
  const isOverTarget = caloriesConsumed > targetCalories * 1.1

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <LoadingSpinner size="medium" text="Loading calorie data..." />
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Today's Calories</h3>
        <div style={styles.date}>{new Date().toLocaleDateString()}</div>
      </div>

      {/* Circular Progress */}
      <div style={styles.circularProgress}>
        <svg width="200" height="200" style={styles.svg}>
          {/* Background circle */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-gray-700)" strokeWidth="12" />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={isOverTarget ? "#ff6b6b" : remaining === 0 ? "#51cf66" : "var(--color-primary-orange)"}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={`${2 * Math.PI * 80 * (1 - percentage / 100)}`}
            style={styles.progressCircle}
          />
        </svg>
        <div style={styles.centerText}>
          <div style={styles.consumedCalories}>{caloriesConsumed}</div>
          <div style={styles.targetCalories}>/ {targetCalories} cal</div>
          <div style={styles.percentage}>{Math.round(percentage)}%</div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{remaining}</div>
          <div style={styles.statLabel}>Remaining</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{targetCalories}</div>
          <div style={styles.statLabel}>Target</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{caloriesConsumed}</div>
          <div style={styles.statLabel}>Consumed</div>
        </div>
      </div>

      {/* Status message */}
      <div style={styles.statusMessage}>
        {isOverTarget ? (
          <span style={styles.overTarget}>
            ⚠️ You've exceeded your target by {caloriesConsumed - targetCalories} calories
          </span>
        ) : remaining === 0 ? (
          <span style={styles.onTarget}>🎯 Perfect! You've reached your target</span>
        ) : (
          <span style={styles.underTarget}>💪 {remaining} calories left to reach your goal</span>
        )}
      </div>

      {/* Profile reminder */}
      {(!userProfile?.height || !userProfile?.weight || !userProfile?.activeness) && (
        <div style={styles.profileReminder}>📝 Complete your profile to get accurate calorie targets</div>
      )}
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
  loadingContainer: {
    backgroundColor: "var(--color-card-bg)",
    borderRadius: "12px",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "600",
  },
  date: {
    fontSize: "0.875rem",
    color: "var(--color-gray-400)",
  },
  circularProgress: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  svg: {
    transform: "rotate(-90deg)",
  },
  progressCircle: {
    transition: "stroke-dashoffset 0.5s ease",
  },
  centerText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
  },
  consumedCalories: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "var(--color-white)",
  },
  targetCalories: {
    fontSize: "1rem",
    color: "var(--color-gray-400)",
    marginBottom: "0.25rem",
  },
  percentage: {
    fontSize: "0.875rem",
    color: "var(--color-primary-orange)",
    fontWeight: "500",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  statItem: {
    textAlign: "center",
    padding: "0.75rem",
    backgroundColor: "var(--color-gray-800)",
    borderRadius: "8px",
  },
  statValue: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "var(--color-white)",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "var(--color-gray-400)",
    marginTop: "0.25rem",
  },
  statusMessage: {
    textAlign: "center",
    padding: "0.75rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    marginBottom: "1rem",
  },
  overTarget: {
    color: "#ff6b6b",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    padding: "0.5rem",
    borderRadius: "6px",
  },
  onTarget: {
    color: "#51cf66",
    backgroundColor: "rgba(81, 207, 102, 0.1)",
    padding: "0.5rem",
    borderRadius: "6px",
  },
  underTarget: {
    color: "var(--color-primary-orange)",
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    padding: "0.5rem",
    borderRadius: "6px",
  },
  profileReminder: {
    textAlign: "center",
    padding: "0.75rem",
    backgroundColor: "var(--color-gray-700)",
    borderRadius: "8px",
    fontSize: "0.875rem",
    color: "var(--color-gray-300)",
  },
}
