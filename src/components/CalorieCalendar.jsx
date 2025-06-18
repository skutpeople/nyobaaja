
"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import { useAuth } from "../lib/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

export default function CalorieCalendar() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calorieData, setCalorieData] = useState({})
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate target calories based on user profile
  const calculateTargetCalories = (height, weight, activeness, age = 25, gender = "male") => {
    let bmr
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    const activityMultipliers = {
      low: 1.375,
      moderate: 1.55,
      high: 1.725,
    }

    return Math.round(bmr * activityMultipliers[activeness])
  }

  // Fetch user profile and calorie data for the current month
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
        }

        // Get start and end of current month
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const startOfMonth = new Date(year, month, 1)
        const endOfMonth = new Date(year, month + 1, 0)

        // Fetch calorie data for the month using correct field name
        const { data: monthlyData, error: calorieError } = await supabase
          .from("calorie_logs")
          .select("totalcalories, created_at")
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString())

        if (!calorieError && monthlyData) {
          // Group calories by date
          const groupedData = {}
          monthlyData.forEach((log) => {
            const date = new Date(log.created_at).toDateString()
            if (!groupedData[date]) {
              groupedData[date] = 0
            }
            groupedData[date] += log.totalcalories || 0
          })
          setCalorieData(groupedData)
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, currentDate])

  // Get target calories for the user
  const getTargetCalories = () => {
    if (userProfile?.height && userProfile?.weight && userProfile?.activeness) {
      return calculateTargetCalories(
        userProfile.height,
        userProfile.weight,
        userProfile.activeness,
        userProfile.age || 25,
        userProfile.gender || "male",
      )
    }
    return 2000 // Default target
  }

  // Get dot color for historical days (not today)
  const getDayDotColor = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString = date.toDateString()
    const calories = calorieData[dateString] || 0
    const target = getTargetCalories()
    const today = new Date()

    // Don't show dots for future dates or today
    if (date > today || date.toDateString() === today.toDateString()) {
      return null
    }

    // No data for this day
    if (calories === 0) {
      return null
    }

    // Color based on target achievement for historical days
    if (calories > target * 1.1) {
      return "#ff6b6b" // Red for significantly over target (>110%)
    } else if (calories >= target * 0.9 && calories <= target * 1.1) {
      return "#51cf66" // Green for on target (90-110% of target)
    } else {
      return "#ffd43b" // Yellow for under target (<90%)
    }
  }

  // Get background color for today's progress
  const getTodayBackgroundColor = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateString = date.toDateString()
    const calories = calorieData[dateString] || 0
    const target = getTargetCalories()
    const today = new Date()

    // Only apply background color to today
    if (date.toDateString() !== today.toDateString()) {
      return "transparent"
    }

    // No data for today yet
    if (calories === 0) {
      return "rgba(255, 107, 53, 0.2)" // Light orange for today with no data
    }

    // Background color based on today's progress
    if (calories > target * 1.1) {
      return "#ff6b6b" // Red for over target
    } else if (calories >= target * 0.9 && calories <= target * 1.1) {
      return "#51cf66" // Green for on target
    } else {
      return "#ffd43b" // Yellow for under target
    }
  }

  // Check if day is today
  const isToday = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Get days in current month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <LoadingSpinner size="medium" text="Loading calendar..." />
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={goToPreviousMonth} style={styles.navButton}>
          ‹
        </button>
        <h3 style={styles.monthYear}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={goToNextMonth} style={styles.navButton}>
          ›
        </button>
      </div>

      <div style={styles.calendar}>
        {/* Day headers */}
        <div style={styles.dayHeaders}>
          {dayNames.map((day, index) => (
            <div key={index} style={styles.dayHeader}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={styles.daysGrid}>
          {getDaysInMonth().map((day, index) => {
            const dotColor = day ? getDayDotColor(day) : null
            const todayBgColor = day ? getTodayBackgroundColor(day) : "transparent"
            const isTodayDate = day ? isToday(day) : false

            return (
              <div key={index} style={styles.dayCell}>
                {day && (
                  <div
                    style={{
                      ...styles.dayContent,
                      backgroundColor: todayBgColor,
                      borderRadius: isTodayDate ? "50%" : "0",
                    }}
                  >
                    <span
                      style={{
                        ...styles.dayNumber,
                        ...(isTodayDate ? styles.todayNumber : {}),
                        color:
                          todayBgColor !== "transparent" && todayBgColor !== "rgba(255, 107, 53, 0.2)"
                            ? "#fff"
                            : "var(--color-white)",
                      }}
                    >
                      {day}
                    </span>
                    {dotColor && (
                      <div
                        style={{
                          ...styles.progressDot,
                          backgroundColor: dotColor,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: "#51cf66" }}></div>
          <span>On target</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: "#ffd43b" }}></div>
          <span>Under target</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, backgroundColor: "#ff6b6b" }}></div>
          <span>Over target</span>
        </div>
      </div>
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  navButton: {
    background: "none",
    border: "none",
    color: "var(--color-white)",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  monthYear: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "var(--color-primary-orange)",
  },
  calendar: {
    width: "100%",
  },
  dayHeaders: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.25rem",
    marginBottom: "0.5rem",
  },
  dayHeader: {
    textAlign: "center",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "var(--color-gray-400)",
    padding: "0.5rem",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.25rem",
  },
  dayCell: {
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40px",
    position: "relative",
  },
  dayContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    width: "100%",
    height: "100%",
  },
  dayNumber: {
    fontSize: "0.875rem",
    color: "var(--color-white)",
    fontWeight: "400",
    marginBottom: "2px",
  },
  todayNumber: {
    fontWeight: "600",
    color: "var(--color-primary-orange)",
  },
  progressDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    position: "absolute",
    bottom: "4px",
  },
  legend: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "1rem",
    flexWrap: "wrap",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.75rem",
    color: "var(--color-gray-400)",
  },
  legendColor: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  legendSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
  },
  legendTitle: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--color-white)",
    margin: 0,
  },
  legendRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
}

