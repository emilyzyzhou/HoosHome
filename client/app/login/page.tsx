// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // After a successful login, go to /join
    router.push("/join");
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}
