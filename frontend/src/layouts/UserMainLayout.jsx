// src/components/user/UserMainLayout.jsx
import React from 'react'
import Header from './UserHeader'
import Footer from '../components/User/Footer'
import { Outlet } from 'react-router-dom'
import Sidebar from './MenuSideBar'

export default function UserMainLayout() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}