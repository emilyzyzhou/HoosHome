"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, AlertCircle, Users } from "lucide-react"

interface Roommate {
  user_id: number
  name: string
}

interface BillShare {
  user_id: number
  amount_due: number
  status?: string
}

interface Bill {
  bill_id: number
  description: string
  bill_type: string
  total_amount: number
  due_date: string
  split_rule: string
  shares?: Array<{ user_id: number; amount_due: number; status: string }>
}

export function CreateBillModal({ 
  bill, 
  onClose, 
  onSuccess 
}: { 
  bill?: Bill | null
  onClose: () => void
  onSuccess: () => void 
}) {
  const isEditMode = !!bill
  const [description, setDescription] = useState(bill?.description || "")
  const [billType, setBillType] = useState(bill?.bill_type || "")
  const [totalAmount, setTotalAmount] = useState(bill ? String(bill.total_amount) : "")
  const [dueDate, setDueDate] = useState(bill ? new Date(bill.due_date).toISOString().split('T')[0] : "")
  const [splitRule, setSplitRule] = useState(bill?.split_rule || "equal")
  const [roommates, setRoommates] = useState<Roommate[]>([])
  const [selectedRoommates, setSelectedRoommates] = useState<Set<number>>(new Set())
  const [customShares, setCustomShares] = useState<Map<number, string>>(new Map())
  const [shareStatuses, setShareStatuses] = useState<Map<number, string>>(new Map())
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRoommates()
    if (bill?.bill_id) {
      loadBillShares()
    }
  }, [])

  const loadBillShares = async () => {
    if (!bill?.bill_id) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bills/${bill.bill_id}/shares`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        const selected = new Set<number>()
        const custom = new Map<number, string>()
        const statuses = new Map<number, string>()
        
        data.shares.forEach((share: any) => {
          selected.add(share.user_id)
          statuses.set(share.user_id, share.status)
          if (bill.split_rule === "custom") {
            custom.set(share.user_id, String(share.amount_due))
          }
        })
        
        setSelectedRoommates(selected)
        setCustomShares(custom)
        setShareStatuses(statuses)
      }
    } catch (err) {
      console.error("Failed to load bill shares", err)
    }
  }

  const fetchRoommates = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/home/roommates`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setRoommates(data.roommates || [])
      }
    } catch (err) {
      console.error("Failed to fetch roommates", err)
    }
  }

  const toggleRoommate = (userId: number) => {
    const newSelected = new Set(selectedRoommates)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
      const newCustom = new Map(customShares)
      newCustom.delete(userId)
      setCustomShares(newCustom)
    } else {
      newSelected.add(userId)
    }
    setSelectedRoommates(newSelected)
  }

  const updateCustomShare = (userId: number, amount: string) => {
    const newCustom = new Map(customShares)
    newCustom.set(userId, amount)
    setCustomShares(newCustom)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!description || !totalAmount || !dueDate) {
      setError("Please fill in all required fields")
      return
    }

    if (selectedRoommates.size === 0) {
      setError("Please select at least one roommate")
      return
    }

    const total = parseFloat(totalAmount)
    if (isNaN(total) || total <= 0) {
      setError("Please enter a valid amount")
      return
    }

    // Calculate bill shares
    let shares: BillShare[] = []
    if (splitRule === "equal") {
      const shareAmount = total / selectedRoommates.size
      shares = Array.from(selectedRoommates).map(userId => ({
        user_id: userId,
        amount_due: shareAmount,
        status: shareStatuses.get(userId) || "unpaid",
      }))
    } else {
      // Custom split
      shares = Array.from(selectedRoommates).map(userId => {
        const amount = parseFloat(customShares.get(userId) || "0")
        return { 
          user_id: userId, 
          amount_due: amount,
          status: shareStatuses.get(userId) || "unpaid",
        }
      })

      const totalShares = shares.reduce((sum, s) => sum + s.amount_due, 0)
      if (Math.abs(totalShares - total) > 0.01) {
        setError(`Custom shares (${totalShares.toFixed(2)}) must equal total amount (${total.toFixed(2)})`)
        return
      }
    }

    try {
      setIsLoading(true)
      const url = isEditMode && bill
        ? `${process.env.NEXT_PUBLIC_API_BASE}/bills/${bill.bill_id}`
        : `${process.env.NEXT_PUBLIC_API_BASE}/bills`
      
      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          bill_type: billType,
          total_amount: total,
          due_date: dueDate,
          split_rule: splitRule,
          shares,
        }),
      })

      if (!res.ok) {
        let message = "Failed to create bill";

        try {
            const contentType = res.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
            const data = await res.json();
            message = data.error || message;
            } else {
            const text = await res.text();
            console.error("Non-JSON error response from /bills:", {
                status: res.status,
                contentType,
                bodyStart: text.slice(0, 300),
            });
            // keep generic message for the user
            }
        } catch (parseErr) {
            console.error("Error parsing /bills error response:", parseErr);
        }

        throw new Error(message);
        }
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Failed to create bill")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-orange-100 dark:border-blue-800 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-900 dark:text-orange-200">
              {isEditMode ? "Edit Bill" : "Create New Bill"}
            </CardTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-orange-200 dark:hover:bg-blue-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                Description *
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., October Rent, Groceries, Utilities"
                className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                  Type
                </label>
                <Input
                  value={billType}
                  onChange={(e) => setBillType(e.target.value)}
                  placeholder="e.g., Rent, Utility, Groceries"
                  className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                  Total Amount *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                Due Date *
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                Split Rule
              </label>
              <select
                value={splitRule}
                onChange={(e) => setSplitRule(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-orange-200 dark:border-blue-800 bg-orange-50 dark:bg-blue-900/30"
              >
                <option value="equal">Split Equally</option>
                <option value="custom">Custom Split</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Select Roommates *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-orange-200 dark:border-blue-800 rounded-md p-3 bg-orange-50 dark:bg-blue-900/30">
                {roommates.map((roommate) => (
                  <div key={roommate.user_id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`roommate-${roommate.user_id}`}
                      checked={selectedRoommates.has(roommate.user_id)}
                      onChange={() => toggleRoommate(roommate.user_id)}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`roommate-${roommate.user_id}`} className="flex-1">
                      {roommate.name}
                    </label>
                    {splitRule === "custom" && selectedRoommates.has(roommate.user_id) && (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customShares.get(roommate.user_id) || ""}
                        onChange={(e) => updateCustomShare(roommate.user_id, e.target.value)}
                        placeholder="Amount"
                        className="w-24 h-8 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-orange-200 dark:border-blue-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg"
              >
                {isLoading ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Bill")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
