"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
// import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
  }

  // return <Dashboard onLogout={() => setIsLoggedIn(false)} />
}
