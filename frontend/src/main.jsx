// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import AppRouter from './routers/AppRouters.jsx'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import AuthContextProvider from './auth/AuthProvider.jsx'
// import { ToastContainer, Slide , Bounce , Zoom} from 'react-toastify'


// const queryClient = new QueryClient()
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <AuthContextProvider>
//       <QueryClientProvider client={queryClient}>
//         <AppRouter />
//         <ToastContainer
//           position='top-center'
//           autoClose={2000}
//           // hideProgressBar={false}
//           theme='dark'
//           transition={Zoom} // Effects :- Bouce, Slide, Zoom, Flip
//         />
//       </QueryClientProvider>
//     </AuthContextProvider>
//   </StrictMode>,
// )


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

const queryClient = new QueryClient()

// Helper component to bridge AuthContext to NotificationProvider

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
