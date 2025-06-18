

// // "use client"

// // import { useState } from "react"
// // import { useNavigate } from "react-router-dom"
// // import { useAuth } from "../lib/AuthContext"
// // import CalorieCounter from "../components/CalorieCounter"
// // import UserProfileForm from "../components/UserProfileForm"
// // import RecentMeals from "../components/RecentMeals"
// // import LoadingButton from "../components/LoadingButton"
// // import "./MePage.css"
// // import CalorieCalendar from "../components/CalorieCalendar"

// // export default function MePage() {
// //   const { user, signOut } = useAuth()
// //   const navigate = useNavigate()
// //   const [showProfileForm, setShowProfileForm] = useState(false)
// //   const [refreshKey, setRefreshKey] = useState(0)

// //   const handleSignOut = async () => {
// //     try {
// //       await signOut()
// //       // Navigation will be handled by the auth state change in routes
// //     } catch (error) {
// //       console.error("Error signing out:", error)
// //     }
// //   }

// //   const handleAddFood = () => {
// //     navigate("/chat")
// //   }

// //   const handleProfileUpdate = () => {
// //     // Refresh the calorie counter when profile is updated
// //     setRefreshKey((prev) => prev + 1)
// //     setShowProfileForm(false)
// //   }

// //   const userName = user?.username || user?.email?.split("@")[0] || "User"

// //   const headerActions = (
// //     <div style={styles.headerActions}>
// //       <button onClick={() => setShowProfileForm(!showProfileForm)} style={styles.profileButton}>
// //         ⚙️ Profile
// //       </button>
// //     </div>
// //   )

// //   return (
// //     <div style={styles.container}>
// //       <div style={styles.header}>
// //         <div style={styles.welcomeSection}>
// //           <h1 style={styles.heading}>Welcome back, {userName}!</h1>
// //           <p style={styles.subtitle}>Track your daily calorie intake</p>
// //         </div>
// //         {headerActions}
// //       </div>

// //       {/* Profile Form (collapsible) */}
// //       {showProfileForm && <UserProfileForm onProfileUpdate={handleProfileUpdate} />}

// //       {/* Calorie Calendar */}
// //       <CalorieCalendar />

// //       {/* Calorie Counter */}
// //       <div key={refreshKey}>
// //         <CalorieCounter />
// //       </div>

// //       {/* Add Food Button */}
// //       <div style={styles.addFoodSection}>
// //         <LoadingButton onClick={handleAddFood} style={styles.addFoodButton}>
// //           <span style={styles.addIcon}>🍽️</span>
// //           Add Food
// //         </LoadingButton>
// //       </div>

// //       {/* Recent Meals */}
// //       <RecentMeals />
// //     </div>
// //   )
// // }

// // const styles = {
// //   container: {
// //     padding: "1.5rem",
// //     color: "var(--color-white)",
// //     fontFamily: "var(--font-sans)",
// //     maxWidth: "800px",
// //     margin: "0 auto",
// //   },
// //   header: {
// //     display: "flex",
// //     justifyContent: "space-between",
// //     alignItems: "flex-start",
// //     marginBottom: "2rem",
// //     flexWrap: "wrap",
// //     gap: "1rem",
// //   },
// //   welcomeSection: {
// //     flex: 1,
// //   },
// //   heading: {
// //     margin: "0 0 0.5rem 0",
// //     fontSize: "1.75rem",
// //     fontWeight: "700",
// //   },
// //   subtitle: {
// //     margin: 0,
// //     fontSize: "1rem",
// //     color: "var(--color-gray-400)",
// //   },
// //   headerActions: {
// //     display: "flex",
// //     gap: "0.75rem",
// //     alignItems: "center",
// //   },
// //   profileButton: {
// //     padding: "0.5rem 1rem",
// //     borderRadius: "6px",
// //     border: "1px solid var(--color-gray-600)",
// //     backgroundColor: "var(--color-gray-700)",
// //     color: "var(--color-white)",
// //     cursor: "pointer",
// //     fontSize: "0.875rem",
// //     display: "flex",
// //     alignItems: "center",
// //     gap: "0.5rem",
// //   },
// //   signOutButton: {
// //     padding: "0.5rem 1rem",
// //     borderRadius: "6px",
// //     border: "none",
// //     backgroundColor: "var(--color-gray-600)",
// //     color: "var(--color-white)",
// //     cursor: "pointer",
// //     fontSize: "0.875rem",
// //   },
// //   addFoodSection: {
// //     display: "flex",
// //     justifyContent: "center",
// //     marginBottom: "2rem",
// //   },
// //   addFoodButton: {
// //     padding: "1rem 2rem",
// //     fontSize: "1.125rem",
// //     fontWeight: "600",
// //     borderRadius: "12px",
// //     backgroundColor: "var(--color-primary-orange)",
// //     minWidth: "200px",
// //   },
// //   addIcon: {
// //     fontSize: "1.25rem",
// //   },
// // }

// "use client"

// import { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { useAuth } from "../lib/AuthContext"
// import CalorieCounter from "../components/CalorieCounter"
// import UserProfileForm from "../components/UserProfileForm"
// import RecentMeals from "../components/RecentMeals"
// import LoadingButton from "../components/LoadingButton"
// import CalorieCalendar from "../components/CalorieCalendar"
// import "./MePage.css"

// export default function MePage() {
//   const { user, signOut } = useAuth()
//   const navigate = useNavigate()
//   const [showProfileForm, setShowProfileForm] = useState(false)
//   const [refreshKey, setRefreshKey] = useState(0)

//   const handleSignOut = async () => {
//     try {
//       await signOut()
//       // Navigation will be handled by the auth state change in routes
//     } catch (error) {
//       console.error("Error signing out:", error)
//     }
//   }

//   const handleAddFood = () => {
//     navigate("/chat")
//   }

//   const handleProfileUpdate = () => {
//     // Refresh the calorie counter and calendar when profile is updated
//     setRefreshKey((prev) => prev + 1)
//     setShowProfileForm(false)
//   }

//   const userName = user?.username || user?.email?.split("@")[0] || "User"

//   const headerActions = (
//     <div style={styles.headerActions}>
//       <button onClick={() => setShowProfileForm(!showProfileForm)} style={styles.profileButton}>
//         ⚙️ Profile
//       </button>
//     </div>
//   )

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <div style={styles.welcomeSection}>
//           <h1 style={styles.heading}>Welcome back, {userName}!</h1>
//           <p style={styles.subtitle}>Track your daily calorie intake</p>
//         </div>
//         {headerActions}
//       </div>

//       {/* Profile Form (collapsible) */}
//       {showProfileForm && <UserProfileForm onProfileUpdate={handleProfileUpdate} />}

//       {/* Calorie Calendar - Shows historical progress */}
//       <div key={`calendar-${refreshKey}`}>
//         <CalorieCalendar />
//       </div>

//       {/* Calorie Counter - Shows today's progress */}
//       <div key={`counter-${refreshKey}`}>
//         <CalorieCounter />
//       </div>

//       {/* Add Food Button */}
//       <div style={styles.addFoodSection}>
//         <LoadingButton onClick={handleAddFood} style={styles.addFoodButton}>
//           <span style={styles.addIcon}>🍽️</span>
//           Add Food
//         </LoadingButton>
//       </div>

//       {/* Recent Meals */}
//       <RecentMeals />
//     </div>
//   )
// }

// const styles = {
//   container: {
//     padding: "1.5rem",
//     color: "var(--color-white)",
//     fontFamily: "var(--font-sans)",
//     maxWidth: "800px",
//     margin: "0 auto",
//   },
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: "2rem",
//     flexWrap: "wrap",
//     gap: "1rem",
//   },
//   welcomeSection: {
//     flex: 1,
//   },
//   heading: {
//     margin: "0 0 0.5rem 0",
//     fontSize: "1.75rem",
//     fontWeight: "700",
//   },
//   subtitle: {
//     margin: 0,
//     fontSize: "1rem",
//     color: "var(--color-gray-400)",
//   },
//   headerActions: {
//     display: "flex",
//     gap: "0.75rem",
//     alignItems: "center",
//   },
//   profileButton: {
//     padding: "0.5rem 1rem",
//     borderRadius: "6px",
//     border: "1px solid var(--color-gray-600)",
//     backgroundColor: "var(--color-gray-700)",
//     color: "var(--color-white)",
//     cursor: "pointer",
//     fontSize: "0.875rem",
//     display: "flex",
//     alignItems: "center",
//     gap: "0.5rem",
//   },
//   addFoodSection: {
//     display: "flex",
//     justifyContent: "center",
//     marginBottom: "2rem",
//   },
//   addFoodButton: {
//     padding: "1rem 2rem",
//     fontSize: "1.125rem",
//     fontWeight: "600",
//     borderRadius: "12px",
//     backgroundColor: "var(--color-primary-orange)",
//     minWidth: "200px",
//   },
//   addIcon: {
//     fontSize: "1.25rem",
//   },
// }

"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../lib/AuthContext"
import CalorieCounter from "../components/CalorieCounter"
import UserProfileForm from "../components/UserProfileForm"
import LoadingButton from "../components/LoadingButton"
import CalorieCalendar from "../components/CalorieCalendar"
import "./MePage.css"
import MealsCatalog from "../components/MealsCatalog"

export default function MePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSignOut = async () => {
    try {
      await signOut()
      // Navigation will be handled by the auth state change in routes
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleAddFood = () => {
    navigate("/chat")
  }

  const handleProfileUpdate = () => {
    // Refresh the calorie counter and calendar when profile is updated
    setRefreshKey((prev) => prev + 1)
    setShowProfileForm(false)
  }

  const userName = user?.username || user?.email?.split("@")[0] || "User"

  const headerActions = (
    <div style={styles.headerActions}>
      <button onClick={() => setShowProfileForm(!showProfileForm)} style={styles.profileButton}>
        ⚙️ Profile
      </button>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.heading}>Welcome back, {userName}!</h1>
          <p style={styles.subtitle}>Track your daily calorie intake</p>
        </div>
        {headerActions}
      </div>

      {/* Profile Form (collapsible) */}
      {showProfileForm && <UserProfileForm onProfileUpdate={handleProfileUpdate} />}

      {/* Calorie Calendar - Shows historical progress */}
      <div key={`calendar-${refreshKey}`}>
        <CalorieCalendar />
      </div>

      {/* Calorie Counter - Shows today's progress */}
      <div key={`counter-${refreshKey}`}>
        <CalorieCounter />
      </div>

      {/* Add Food Button */}
      <div style={styles.addFoodSection}>
        <LoadingButton onClick={handleAddFood} style={styles.addFoodButton}>
          <span style={styles.addIcon}>🍽️</span>
          Add Food
        </LoadingButton>
      </div>

      {/* Meal Entries */}
      <div key={`meals-${refreshKey}`}>
        <MealsCatalog />
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: "1.5rem",
    color: "var(--color-white)",
    fontFamily: "var(--font-sans)",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  welcomeSection: {
    flex: 1,
  },
  heading: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.75rem",
    fontWeight: "700",
  },
  subtitle: {
    margin: 0,
    fontSize: "1rem",
    color: "var(--color-gray-400)",
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },
  profileButton: {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "1px solid var(--color-gray-600)",
    backgroundColor: "var(--color-gray-700)",
    color: "var(--color-white)",
    cursor: "pointer",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  addFoodSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "2rem",
  },
  addFoodButton: {
    padding: "1rem 2rem",
    fontSize: "1.125rem",
    fontWeight: "600",
    borderRadius: "12px",
    backgroundColor: "var(--color-primary-orange)",
    minWidth: "200px",
  },
  addIcon: {
    fontSize: "1.25rem",
  },
}
