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
  const [homeId, setHomeId] = useState<number |null>(null);
  const [appState, setAppState] = useState<AppState>('login') 

  const handleLoginSuccess = () => {
    setAppState('join');
  }

  const handleHomeJoined = (id: number) => {
    setHomeId(id);
    setAppState('chore');
  }

  if (appState === 'login') {
      return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }
  if (appState === 'join') {
      return <JoinPage onHomeJoined={handleHomeJoined} /> 
  }

  if (appState === 'chore') {
    return <ChorePage homeId={homeId}/> 
}
  return <LoginForm onLoginSuccess={handleLoginSuccess} />
}