import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import { Search, User, ChevronDown, Bell, Settings, LogOut, Menu } from "lucide-react";
import { useNewAdminProduct } from "../hooks/admin/useAdminProduct";
import { useLogoutUser } from "../hooks/useLoginUser";
import DarkModeToggle from "../components/darkTheme/DarkModeToggle";

export default function Header() {
  const { user } = useContext(AuthContext); // 🔒 REMOVED logout from here
  const navigate = useNavigate();

  // 🔒 NEW: Use logout hook
  const { mutate: handleLogout, isPending: isLoggingOut } = useLogoutUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 5;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { products } = useNewAdminProduct({ search: searchTerm, pageNumber, pageSize });

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    setPageNumber(1);
    setShowDropdown(true);
  };

  const handleProductClick = (id) => {
    setSearchTerm("");
    setShowDropdown(false);
    navigate(`/admin/products/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate(`/admin/products?search=${searchTerm}`);
      setShowDropdown(false);
    }
  };

  if (!user) return null;

  // 🔒 REMOVED: Old handleLogout function - now using the hook's mutate function

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
      {/* Top gradient accent */}
      <div className="h-1 bg-gradient-to-r from-[#0B2146] via-[#E5BA41] to-[#0B2146]"></div>

      <div className="flex h-20 items-center justify-between px-6 gap-4">
        {/* Left - Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E5BA41] to-[#d4a830] rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0B2146] to-[#1a3a6b] flex items-center justify-center shadow-xl">
              <span className="text-[#E5BA41] font-bold text-xl">S</span>
            </div>
          </div>

          <div className="hidden md:block">
            <h1 className="font-bold text-xl bg-gradient-to-r from-[#0B2146] to-[#1a3a6b] dark:from-[#E5BA41] dark:to-[#d4a830] bg-clip-text text-transparent">
              Servzz Pro
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin Dashboard</p>
          </div>
        </div>

        {/* Center - Enhanced Search */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative group">
            {/* Search icon */}
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#E5BA41] transition-colors" />

            {/* Search input */}
            <input
              type="text"
              placeholder="Search orders, products, customers..."
              value={searchTerm}
              onChange={handleChange}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E5BA41] focus:bg-white dark:focus:bg-gray-700 transition-all shadow-inner"
            />

            {/* Search suggestions dropdown */}
            {showDropdown && searchTerm && products.length > 0 && (
              <div className="absolute mt-2 w-full rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                <div className="p-2 bg-gradient-to-r from-[#0B2146] to-[#1a3a6b] text-white">
                  <p className="text-xs font-semibold px-2">Search Results</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {products.map((product, index) => (
                    <div
                      key={product._id}
                      className={`px-4 py-3 hover:bg-gradient-to-r hover:from-[#E5BA41]/10 hover:to-transparent text-gray-900 dark:text-white cursor-pointer transition-all duration-200 ${index !== products.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                        }`}
                      onClick={() => handleProductClick(product._id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0B2146] to-[#1a3a6b] rounded-xl flex items-center justify-center">
                          <span className="text-[#E5BA41] font-bold text-sm">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Product</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 -rotate-90" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right - Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <div className="hidden sm:block">
            <DarkModeToggle />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all group">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-[#E5BA41] transition-colors" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
          </button>

          {/* Settings */}
          <button className="hidden md:block p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all group">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-[#E5BA41] transition-colors" />
          </button>

          {/* Divider */}
          <div className="hidden md:block h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
            >
              {/* Avatar with gradient border */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E5BA41] to-[#0B2146] rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[#0B2146] to-[#1a3a6b] flex items-center justify-center text-[#E5BA41] font-bold text-lg shadow-lg ring-2 ring-white dark:ring-gray-900">
                  {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>

              {/* User info */}
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user.username || "User"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role || "Role"}
                </span>
              </div>

              <ChevronDown className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-16 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-[#0B2146] to-[#1a3a6b] text-white">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-[#E5BA41] font-bold text-xl">
                      {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="font-semibold">{user.username || "User"}</p>
                      <p className="text-xs text-white/70 capitalize">{user.role || "Role"}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all text-left text-gray-900 dark:text-white">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">My Profile</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">View your profile</p>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all text-left text-gray-900 dark:text-white">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Settings</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manage preferences</p>
                    </div>
                  </button>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleLogout()} // 🔒 UPDATED: Now calls the mutation
                    disabled={isLoggingOut} // 🔒 NEW: Disabled during logout
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all text-left text-red-600 dark:text-red-400 ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      {isLoggingOut ? ( // 🔒 NEW: Show spinner while logging out
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {isLoggingOut ? 'Logging out...' : 'Log out'} {/* 🔒 NEW: Dynamic text */}
                      </p>
                      <p className="text-xs text-red-500/70">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}