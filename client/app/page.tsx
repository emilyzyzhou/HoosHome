"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import JoinPage from "@/components/join-page" 
import { ChorePage } from "@/components/chores-page"

import { useRouter } from "next/navigation"
// import { Dashboard } from "@/components/dashboard"
type AppState = 'login' | 'join' | 'dashboard' | 'chore';

export default function Home() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>('login') 
  const handleLoginSuccess = () => {
    setAppState('chore');
  }
  if (appState === 'login') {
      return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }
  if (appState === 'join') {
      return <JoinPage /> 
  }

  if (appState === 'chore') {
    return <ChorePage /> 
}
  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}