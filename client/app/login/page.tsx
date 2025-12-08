// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // After a successful login, go to home page
    router.push("/home");
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}
