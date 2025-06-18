

"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"
import { useAuth } from "../lib/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

export default function MealsCatalog() {
  const { user } = useAuth()
  const [meals, setMeals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })
  const [deletingMealId, setDeletingMealId] = useState(null)

  const fetchMealsForDate = async (date) => {
    if (!user?.id) return

    try {
      setIsLoading(true)

      // Create local date objects to avoid timezone issues
      const selectedDate = new Date(date + "T00:00:00")
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0)
      const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59)

      const { data, error } = await supabase
        .from("calorie_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString())
        .order("created_at", { ascending: false })

      if (!error && data) {
        setMeals(data)
      } else {
        console.error("Error fetching meals:", error)
        setMeals([])
      }
    } catch (error) {
      console.error("Error fetching meals:", error)
      setMeals([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMealsForDate(selectedDate)
  }, [user, selectedDate])

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const handleDeleteMeal = async (mealId) => {
    if (!confirm("Are you sure you want to delete this meal entry?")) {
      return
    }

    try {
      setDeletingMealId(mealId)

      const { error } = await supabase.from("calorie_logs").delete().eq("id", mealId).eq("user_id", user.id) // Extra security check

      if (error) {
        console.error("Error deleting meal:", error)
        alert("Failed to delete meal. Please try again.")
        return
      }

      // Remove the meal from the local state
      setMeals((prevMeals) => prevMeals.filter((meal) => meal.id !== mealId))

      // Add page refresh to update all components
      setTimeout(() => {
        window.location.reload()
      }, 500) // Small delay to show the meal was removed from the list first
    } catch (error) {
      console.error("Error deleting meal:", error)
      alert("Failed to delete meal. Please try again.")
    } finally {
      setDeletingMealId(null)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatSelectedDate = (dateString) => {
    const selectedDate = new Date(dateString + "T12:00:00") // Use noon to avoid timezone issues
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // Compare just the date parts
    const selectedDateStr = selectedDate.toDateString()
    const todayStr = today.toDateString()
    const yesterdayStr = yesterday.toDateString()

    if (selectedDateStr === todayStr) {
      return "Today"
    } else if (selectedDateStr === yesterdayStr) {
      return "Yesterday"
    } else {
      return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  const getTotalCalories = () => {
    return meals.reduce((total, meal) => total + (meal.totalcalories || 0), 0)
  }

  const getQuickDateOptions = () => {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    // Format dates as YYYY-MM-DD in local timezone
    const formatLocalDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    return [
      { label: "Today", value: formatLocalDate(today) },
      { label: "Yesterday", value: formatLocalDate(yesterday) },
      { label: "2 days ago", value: formatLocalDate(twoDaysAgo) },
    ]
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Meal Entries</h3>
        <div style={styles.totalCalories}>{getTotalCalories()} cal total</div>
      </div>

      {/* Date Selection */}
      <div style={styles.dateSection}>
        <div style={styles.quickDates}>
          {getQuickDateOptions().map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedDate(option.value)}
              style={{
                ...styles.quickDateButton,
                ...(selectedDate === option.value ? styles.quickDateButtonActive : {}),
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div style={styles.customDateSection}>
          <label style={styles.dateLabel}>Or select a specific date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            style={styles.dateInput}
            // Removed max attribute to allow today's date
          />
        </div>
      </div>

      {/* Selected Date Display */}
      <div style={styles.selectedDateDisplay}>
        <span style={styles.selectedDateText}>Showing meals for: {formatSelectedDate(selectedDate)}</span>
      </div>

      {/* Meals List */}
      {isLoading ? (
        <div style={styles.loading}>
          <LoadingSpinner size="medium" text="Loading meals..." />
        </div>
      ) : meals.length === 0 ? (
        <div style={styles.empty}>
          <span style={styles.emptyIcon}>🍽️</span>
          <p>No meals logged for this date.</p>
          <p style={styles.emptySubtext}>
            {selectedDate === new Date().toISOString().split("T")[0]
              ? "Start tracking your food today!"
              : "Try selecting a different date."}
          </p>
        </div>
      ) : (
        <div style={styles.mealsList}>
          {meals.map((meal) => (
            <div key={meal.id} style={styles.mealItem}>
              <div style={styles.mealInfo}>
                <div style={styles.foodName}>{meal.food_name}</div>
                <div style={styles.mealMeta}>
                  <span style={styles.time}>{formatTime(meal.created_at)}</span>
                  {meal.quantity > 1 && <span style={styles.quantity}>x{meal.quantity}</span>}
                </div>
              </div>
              <div style={styles.mealActions}>
                <div style={styles.calories}>{meal.totalcalories} cal</div>
                <button
                  onClick={() => handleDeleteMeal(meal.id)}
                  disabled={deletingMealId === meal.id}
                  style={{
                    ...styles.deleteButton,
                    ...(deletingMealId === meal.id ? styles.deleteButtonDisabled : {}),
                  }}
                  title="Delete this meal entry"
                >
                  {deletingMealId === meal.id ? "..." : "🗑️"}
                </button>
              </div>
            </div>
          ))}
        </div>
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
  totalCalories: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "var(--color-primary-orange)",
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
  },
  dateSection: {
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "var(--color-gray-800)",
    borderRadius: "8px",
  },
  quickDates: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  quickDateButton: {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "1px solid var(--color-gray-600)",
    backgroundColor: "var(--color-gray-700)",
    color: "var(--color-white)",
    cursor: "pointer",
    fontSize: "0.875rem",
    transition: "all 0.2s",
  },
  quickDateButtonActive: {
    backgroundColor: "var(--color-primary-orange)",
    borderColor: "var(--color-primary-orange)",
  },
  customDateSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  dateLabel: {
    fontSize: "0.875rem",
    color: "var(--color-gray-400)",
  },
  dateInput: {
    padding: "0.5rem",
    borderRadius: "6px",
    border: "1px solid var(--color-gray-600)",
    backgroundColor: "var(--color-gray-700)",
    color: "var(--color-white)",
    fontSize: "0.875rem",
    maxWidth: "200px",
  },
  selectedDateDisplay: {
    marginBottom: "1rem",
    padding: "0.75rem",
    backgroundColor: "rgba(255, 107, 53, 0.1)",
    borderRadius: "8px",
    borderLeft: "4px solid var(--color-primary-orange)",
  },
  selectedDateText: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "var(--color-white)",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    padding: "2rem",
  },
  empty: {
    textAlign: "center",
    padding: "2rem",
    color: "var(--color-gray-400)",
  },
  emptyIcon: {
    fontSize: "3rem",
    display: "block",
    marginBottom: "1rem",
  },
  emptySubtext: {
    fontSize: "0.875rem",
    color: "var(--color-gray-500)",
    marginTop: "0.5rem",
  },
  mealsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  mealItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem",
    backgroundColor: "var(--color-gray-800)",
    borderRadius: "8px",
    border: "1px solid var(--color-gray-700)",
  },
  mealInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "var(--color-white)",
    marginBottom: "0.25rem",
  },
  mealMeta: {
    display: "flex",
    gap: "0.5rem",
    fontSize: "0.75rem",
    color: "var(--color-gray-400)",
  },
  time: {
    fontWeight: "500",
  },
  quantity: {
    backgroundColor: "var(--color-primary-orange)",
    color: "var(--color-white)",
    padding: "0.125rem 0.375rem",
    borderRadius: "4px",
    fontSize: "0.625rem",
  },
  mealActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  calories: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--color-primary-orange)",
  },
  deleteButton: {
    background: "none",
    border: "none",
    color: "var(--color-gray-400)",
    cursor: "pointer",
    padding: "0.25rem",
    borderRadius: "4px",
    fontSize: "1rem",
    transition: "color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "24px",
    minHeight: "24px",
  },
  deleteButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
}
