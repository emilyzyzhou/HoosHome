"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/ui/dashboard";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

    fetch(`${API_BASE}/home/dashboard`, {
      method: "GET",
      // cache: "no-store",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          setError(true);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Failed to load dashboard data.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Home</h1>
      <Dashboard data={data} />
    </div>
  );
}
