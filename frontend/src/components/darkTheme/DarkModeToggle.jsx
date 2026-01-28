

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

