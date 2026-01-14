import React, { createContext, useState, useEffect, useMemo, useContext } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"

const ThemeModeContext = createContext({
  mode: "light",
  toggleMode: () => {},
})

export function useThemeMode() {
  return useContext(ThemeModeContext)
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light"
  })

  useEffect(() => {
    const root = document.documentElement
    if (mode === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("theme", mode)
  }, [mode])

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"))
  }

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === "dark" ? {
        background: { paper: "#121212", default: "#121212" },
        text: { primary: "#fff", secondary: "#bbb" },
      } : {}),
    },
  }), [mode])

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
