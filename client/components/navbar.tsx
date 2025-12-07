"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, LogOut } from "lucide-react"

export function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated by calling /auth/me endpoint
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
          credentials: "include",
        })
        setIsLoggedIn(res.ok)
      } catch {
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
      setIsLoggedIn(false)
      router.push("/")
    } catch (e) {
      console.error("Logout failed", e)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-orange-100 dark:border-blue-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
            HoosHome?
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          {!isLoading && (
            isLoggedIn ? (
              // Logged in: show join and logout
              <>
                <Link
                  href="/home"
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg h-9 px-4"
                >
                  My Home
                </Link>
                <Link
                  href="/profile-settings"
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg h-9 px-4"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-blue-900 dark:text-orange-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              // Not logged in: show login and get started
              <>
                <Link 
                  href="/login"
                  className="text-sm font-medium text-blue-900 dark:text-orange-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg h-9 px-4"
                >
                  Get Started
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  )
}