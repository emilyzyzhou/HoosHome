"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Home, LogOut} from "lucide-react"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [homeId, setHomeId] = useState<number | null>(null)

  useEffect(() => {
    // Check if user is authenticated by calling /auth/me endpoint
    const checkAuthAndHome = async () => {
      try {
        const authRes = await fetch(`https://hooshome-api-518521047014.us-east4.run.app/auth/me`, {
          credentials: "include",
        })

        if (authRes.ok) {
          setIsLoggedIn(true)

          // fetch Home ID via roommates endpoint
          try {
            const homeRes = await fetch(`https://hooshome-api-518521047014.us-east4.run.app/home/roommates`, {
              credentials: "include",
            })
            
            if (homeRes.ok) {
              const homeData = await homeRes.json()
              if (homeData.homeId) {
                console.log("Setting Home ID:", homeData.homeId)
                setHomeId(homeData.homeId)
              } else {
                setHomeId(null)
              }
            }
          } catch (err) {
            console.error("Failed to fetch home info", err)
          }
        } else {
          setIsLoggedIn(false)
        }
      } catch (e) {
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndHome()
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch(`https://hooshome-api-518521047014.us-east4.run.app/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
      setIsLoggedIn(false)
      router.push("/")
      router.refresh()
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
              <>
                <Link
                  href="/home"
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg h-9 px-4"
                >
                  My Home
                </Link>
                <Link
                  href="/join"
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg h-9 px-4"
                >
                  Join
                </Link>
                <Link
                  href={`/chore?homeId=${homeId}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg h-9 px-4"
                >
                  Chores
                </Link>
                {/* NEW LEASE LINK */}
                <Link
                      href={`/lease?homeId=${homeId}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg h-9 px-4"
                    >
                    Lease 
                  </Link>
                <Link
                  href="/bills"
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg h-9 px-4"
                >
                  Bills
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