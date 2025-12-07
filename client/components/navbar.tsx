"use client"

import Link from "next/link"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
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
          <Link 
            href="/login"
            className="text-sm font-medium text-blue-900 dark:text-orange-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            Login
          </Link>
          <Button className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg">
            <Link href="/join">Get Started</Link>
          </Button>

        </div>
      </div>
    </nav>
  )
}