"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import JoinPage from "@/components/join-page" 
import { useRouter } from "next/navigation"
// import { Dashboard } from "@/components/dashboard"
type AppState = 'login' | 'join' | 'dashboard';

export default function Home() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>('login') 
  const handleLoginSuccess = () => {
    setAppState('join');
  }
  if (appState === 'login') {
      return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }
  if (appState === 'join') {
      return <JoinPage /> 
  }
  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}