"use client"

import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Calendar, Edit, RefreshCw, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Lease {
  lease_id: number
  home_id: number
  landlord_name: string
  start_date: string
  end_date: string
  rent_amount: number
  lease_file_url?: string
}

export function LeasePage() {
  const [lease, setLease] = useState<Lease | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Editable fields
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [rentAmount, setRentAmount] = useState("")

  useEffect(() => {
    fetchLease()
  }, [])

  const fetchLease = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/lease`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch lease")
      const data = await res.json()
      setLease(data.lease || null)
    } catch (err) {
      console.error(err)
      setError("Failed to load lease. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = () => {
    if (!lease) return
    setStartDate(lease.start_date)
    setEndDate(lease.end_date)
    setRentAmount(String(lease.rent_amount))
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveChanges = async () => {
    try {
      setError("")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/lease/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          rent_amount: Number(rentAmount),
        }),
      })

      if (!res.ok) throw new Error("Failed to update lease")

      setIsEditing(false)
      fetchLease()
    } catch (err) {
      console.error(err)
      setError("Failed to update lease.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
            Lease
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={fetchLease}
              variant="outline"
              className="border-orange-200 dark:border-blue-800"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            {!isEditing && lease && (
              <Button onClick={startEditing} variant="default">
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <Card className="border-orange-100 dark:border-blue-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardTitle className="text-blue-900 dark:text-orange-200">
              Details
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4">
            {isLoading ? (
              <p>Loading lease information...</p>
            ) : !lease ? (
              <p className="text-gray-500">No lease found for this home.</p>
            ) : isEditing ? (
              /* ---------- EDITING MODE ---------- */
              <div className="space-y-4">
                <div>
                  <label className="font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="font-medium">Monthly Rent</label>
                  <Input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={saveChanges} className="bg-green-600 text-white">
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                  <Button onClick={cancelEditing} variant="outline">
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* ---------- VIEW MODE ---------- */
              <div className="space-y-2">
                <p><strong>Landlord:</strong> {lease.landlord_name}</p>
                <p><strong>Start Date:</strong> {new Date(lease.start_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(lease.end_date).toLocaleDateString()}</p>
                <p><strong>Monthly Rent:</strong> ${Number(lease.rent_amount).toFixed(2)}</p>
                {lease.lease_file_url && (
                  <p>
                    <a
                      href={lease.lease_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 dark:text-amber-200 hover:underline"
                    >
                      View Lease Document
                    </a>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
