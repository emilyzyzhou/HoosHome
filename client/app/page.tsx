"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { useRouter } from "next/navigation"
// import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const router = useRouter()

  const handleLogin = () => {
    router.push("/join")
  }

  //const [isLoggedIn, setIsLoggedIn] = useState(false)

  //if (!isLoggedIn) {
    //return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
  //}
  return <LoginForm onLoginSuccess={handleLogin} />

  // return <Dashboard onLogout={() => setIsLoggedIn(false)} />
}
