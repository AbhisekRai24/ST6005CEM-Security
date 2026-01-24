

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../auth/AuthProvider"
import { useCurrentUser, useUpdateUser } from "../../hooks/useLoginUser" // ✅ UPDATED
import { getBackendImageUrl } from "../../utils/backend-image"
import { User, Mail, Save, Camera, Loader2, AlertCircle } from "lucide-react"

export default function UserProfile() {
  const { user: contextUser, setUser } = useContext(AuthContext)

  // ✅ FIXED: Use useCurrentUser instead of useUser(userId)
  const { data: currentUser, isLoading, error } = useCurrentUser()

  // ✅ FIXED: Get userId from the fetched currentUser data
  const userId = currentUser?._id || contextUser?._id
  const { mutateAsync: updateUser, isPending } = useUpdateUser(userId)

  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    profileImage: null,
  })

  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (currentUser) {
      setForm({
        username: currentUser.username || "",
        email: currentUser.email || "",
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        profileImage: currentUser.profileImage || null,
      })
    }
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm((prev) => ({ ...prev, profileImage: file }))
      // Create preview URL for new image
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Prepare FormData for multipart upload
      const formData = new FormData()
      formData.append("username", form.username)
      formData.append("email", form.email)
      formData.append("firstName", form.firstName)
      formData.append("lastName", form.lastName)
      if (form.profileImage instanceof File) {
        formData.append("profileImage", form.profileImage)
      }

      const response = await updateUser(formData)

      // ✅ Update context with new data
      if (response?.data) {
        setUser(response.data)
      }

      setPreviewUrl(null) // Clear preview after successful update
      alert("Profile updated successfully!")
    } catch (err) {
      alert(err.message || "Update failed")
    }
  }

  // Get the image URL to display
  const displayImageUrl = previewUrl ||
    (typeof form.profileImage === "string" ? getBackendImageUrl(form.profileImage) : null)

  // ✅ ADDED: Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // ✅ ADDED: Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-sm">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Failed to load profile
              </h3>
              <p className="text-sm text-red-600 mb-4">
                {error?.message || "An error occurred while loading your profile"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ✅ ADDED: Check if user data exists
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-sm">
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
        <p className="text-gray-600 text-sm mt-1">Update your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
            <label
              htmlFor="profileImage"
              className="absolute bottom-0 right-0 bg-blue-400 hover:bg-blue-500 text-white p-2.5 rounded-full cursor-pointer shadow-lg transition-colors"
            >
              <Camera className="h-5 w-5" />
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-3">Click the camera icon to upload a new photo</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-[#0B2146] text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}