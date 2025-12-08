// app/join/page.tsx
"use client";

import { useRouter } from "next/navigation"; 
import JoinPage from "@/components/join-page";

export default function Join() {
  const router = useRouter(); 

  const handleHomeJoined = (homeId: number) => {
    router.push("/home");
  };

  return <JoinPage onHomeJoined={handleHomeJoined} />;
}
