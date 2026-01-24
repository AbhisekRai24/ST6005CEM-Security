import React from "react"
import UserProfile from "../components/User/UserProfileEdit"
import TwoFASettings from "./Settings/twoFASettings"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center ">
        Your Profile
      </h1>
      <UserProfile />
      <TwoFASettings />
    </div>
  )
}
