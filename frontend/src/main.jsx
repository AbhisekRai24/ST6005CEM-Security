// 🔐 MAIN.JSX WITH CSRF INITIALIZATION
// Location: frontend/src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useContext } from "react";

import './index.css'
import App from './App.jsx'
import AppRouter from './routers/AppRouters.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthContextProvider from './auth/AuthProvider.jsx'
import { ToastContainer, Zoom } from 'react-toastify'
import { ThemeModeProvider } from './components/darkTheme/ThemeContext.jsx'
import { NotificationProvider } from './notification/NotifiacationContext.jsx'
import { AuthContext } from './auth/AuthProvider.jsx';
import { initializeCsrfToken } from './api/api'; // ✅ NEW IMPORT

const queryClient = new QueryClient()

function AppWithNotifications() {
  const { user } = useContext(AuthContext)

  return (
    <NotificationProvider userId={user?._id}>
      <AppRouter />
      <ToastContainer
        position='top-center'
        autoClose={2000}
        theme='dark'
        transition={Zoom}
      />
    </NotificationProvider>
  )
}

// ✅ NEW: Initialize CSRF token before rendering
initializeCsrfToken().then(() => {
  console.log("🔒 CSRF token initialized, rendering app...");

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeModeProvider>
            <AppWithNotifications />
          </ThemeModeProvider>
        </QueryClientProvider>
      </AuthContextProvider>
    </StrictMode>
  )
}).catch((err) => {
  console.error("❌ Failed to initialize CSRF token:", err);

  // Still render app even if CSRF init fails
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeModeProvider>
            <AppWithNotifications />
          </ThemeModeProvider>
        </QueryClientProvider>
      </AuthContextProvider>
    </StrictMode>
  )
});