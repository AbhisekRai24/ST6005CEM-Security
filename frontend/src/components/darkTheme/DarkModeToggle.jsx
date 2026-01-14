// // src/components/DarkModeToggle.jsx
// import { useEffect, useState } from "react"
// import { Moon, Sun } from "lucide-react"

// export default function DarkModeToggle() {
//   const [isDark, setIsDark] = useState(() => {
//     return localStorage.getItem("theme") === "dark"
//   })

//   useEffect(() => {
//     const root = document.documentElement
//     if (isDark) {
//       root.classList.add("dark")
//       localStorage.setItem("theme", "dark")
//     } else {
//       root.classList.remove("dark")
//       localStorage.setItem("theme", "light")
//     }
//   }, [isDark])

//   return (
//     <button
//       onClick={() => setIsDark((prev) => !prev)}
//       className="flex items-center gap-2 px-3 py-1 text-sm rounded-md bg-white text-[#A62123] hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition"
//     >
//       {isDark ? (
//         <>
//           <Sun className="w-4 h-4" /> Light
//         </>
//       ) : (
//         <>
//           <Moon className="w-4 h-4" /> Dark
//         </>
//       )}
//     </button>
//   )
// }

import { Moon, Sun } from "lucide-react"
import { useThemeMode } from "./ThemeContext"

export default function DarkModeToggle() {
  const { mode, toggleMode } = useThemeMode()

  return (
    <button
      onClick={toggleMode}
      className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition
        ${mode === "dark"
          ? "bg-gray-800 text-white hover:bg-gray-700"
          : "bg-white text-[#A62123] hover:bg-gray-200"
        }`}
    >
      {mode === "dark" ? (
        <>
          <Sun className="w-4 h-4" /> Light
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" /> Dark
        </>
      )}
    </button>
  )
}

