// app/join/page.tsx
"use client";

import { useRouter } from "next/navigation"; 
import JoinPage from "@/components/join-page";

export default function Join() {
  const router = useRouter(); 

  const handleHomeJoined = (homeId: number) => {
    router.push(`/chore?homeId=${homeId}`);
  };

  return <JoinPage onHomeJoined={handleHomeJoined} />;
}