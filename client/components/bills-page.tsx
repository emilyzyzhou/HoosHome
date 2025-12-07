"use client"

import React, { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Search, Filter, Plus, ChevronDown, ChevronRight, Pencil, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { CreateBillModal } from "@/components/create-bill-modal"

interface BillShare {
  bill_id: number
  user_id: number
  user_name: string
  amount_due: number
  status: "unpaid" | "paid"
}

interface Bill {
  bill_id: number
  home_id: number
  description: string
  bill_type: string
  total_amount: number
  due_date: string
  payer_user_id: number
  split_rule: string
  amount_owed?: number
  payment_status?: string
  shares?: BillShare[]
}

export function BillsPage() {
  const [outstandingBills, setOutstandingBills] = useState<Bill[]>([])
  const [createdBills, setCreatedBills] = useState<Bill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  const [outstandingSearch, setOutstandingSearch] = useState("")
  const [createdSearch, setCreatedSearch] = useState("")
  const [outstandingFilter, setOutstandingFilter] = useState<"outstanding" | "all">("outstanding")
  const [expandedBills, setExpandedBills] = useState<Set<number>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)

  useEffect(() => {
    fetchBills()
  }, [outstandingFilter])

  const fetchBills = async () => {
    try {
      setIsLoading(true)
      setError("")

      const [outstandingRes, createdRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bills/outstanding?filter=${outstandingFilter}`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bills/created`, {
          credentials: "include",
        }),
      ])

      if (!outstandingRes.ok || !createdRes.ok) {
        throw new Error("Failed to fetch bills")
      }

      const outstandingData = await outstandingRes.json()
      const createdData = await createdRes.json()

      setOutstandingBills(outstandingData.bills || [])
      setCreatedBills(createdData.bills || [])
    } catch (err) {
      console.error(err)
      setError("Failed to load bills. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBillExpansion = async (billId: number) => {
    const newExpanded = new Set(expandedBills)
    if (newExpanded.has(billId)) {
      newExpanded.delete(billId)
    } else {
      newExpanded.add(billId)
      // Fetch bill shares if not already loaded
      const bill = createdBills.find(b => b.bill_id === billId)
      if (bill && !bill.shares) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bills/${billId}/shares`, {
            credentials: "include",
          })
          if (res.ok) {
            const data = await res.json()
            setCreatedBills(prev =>
              prev.map(b =>
                b.bill_id === billId ? { ...b, shares: data.shares } : b
              )
            )
          }
        } catch (err) {
          console.error("Failed to fetch bill shares", err)
        }
      }
    }
    setExpandedBills(newExpanded)
  }

  const handleEditBill = async (billId: number) => {
    const bill = createdBills.find(b => b.bill_id === billId)
    if (!bill) return

    // Fetch shares if not already loaded
    if (!bill.shares) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bills/${billId}/shares`, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          const billWithShares = { ...bill, shares: data.shares }
          setEditingBill(billWithShares)
        }
      } catch (err) {
        console.error("Failed to fetch bill shares", err)
      }
    } else {
      setEditingBill(bill)
    }
  }

  const handleDeleteBill = async (billId: number) => {
    if (!confirm("Are you sure you want to delete this bill?")) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bills/${billId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (res.ok) {
        fetchBills() // Reload bills after deletion
      } else {
        alert("Failed to delete bill")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to delete bill")
    }
  }

  const filterBills = (bills: Bill[], search: string) => {
    return bills.filter(bill =>
      bill.description.toLowerCase().includes(search.toLowerCase()) ||
      bill.bill_type?.toLowerCase().includes(search.toLowerCase())
    )
  }

  const filteredOutstanding = filterBills(outstandingBills, outstandingSearch)
  const filteredCreated = filterBills(createdBills, createdSearch)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
            Bills & Expenses
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={fetchBills}
              variant="outline"
              className="border-orange-200 dark:border-blue-800"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Bill
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Outstanding Bills Section */}
        <Card className="mb-8 border-orange-100 dark:border-blue-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-orange-200">
                <DollarSign className="w-6 h-6" />
                Your Outstanding Bills
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bills..."
                    value={outstandingSearch}
                    onChange={(e) => setOutstandingSearch(e.target.value)}
                    className="pl-10 w-64 bg-white dark:bg-slate-900"
                  />
                </div>
                <select
                  value={outstandingFilter}
                  onChange={(e) => setOutstandingFilter(e.target.value as "outstanding" | "all")}
                  className="px-4 py-2 rounded-md border border-orange-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-sm font-medium"
                >
                  <option value="outstanding">Outstanding Only</option>
                  <option value="all">All Bills</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-orange-100 dark:bg-blue-900/30 sticky top-0">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Description</th>
                    <th className="text-left p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Type</th>
                    <th className="text-left p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Due Date</th>
                    <th className="text-right p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Total Amount</th>
                    <th className="text-right p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">You Owe</th>
                    <th className="text-center p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        Loading bills...
                      </td>
                    </tr>
                  ) : filteredOutstanding.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    filteredOutstanding.map((bill) => (
                      <tr key={bill.bill_id} className="border-b border-orange-100 dark:border-blue-800 hover:bg-orange-50 dark:hover:bg-blue-900/10">
                        <td className="p-4">{bill.description}</td>
                        <td className="p-4">{bill.bill_type || "N/A"}</td>
                        <td className="p-4">{new Date(bill.due_date).toLocaleDateString()}</td>
                        <td className="text-right p-4">${Number(bill.total_amount).toFixed(2)}</td>
                        <td className="text-right p-4 font-semibold">${Number(bill.amount_owed)?.toFixed(2) || "0.00"}</td>
                        <td className="text-center p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              bill.payment_status === "paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {bill.payment_status || " "}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bills You Created Section */}
        <Card className="border-orange-100 dark:border-blue-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-orange-200">
                <DollarSign className="w-6 h-6" />
                Bills You Created (Payments Owed to You)
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bills..."
                  value={createdSearch}
                  onChange={(e) => setCreatedSearch(e.target.value)}
                  className="pl-10 w-64 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-orange-100 dark:bg-blue-900/30 sticky top-0">
                  <tr>
                    <th className="w-12 p-4"></th>
                    <th className="text-left p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Description</th>
                    <th className="text-left p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Type</th>
                    <th className="text-left p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Due Date</th>
                    <th className="text-right p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Total Amount</th>
                    <th className="text-center p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        Loading bills...
                      </td>
                    </tr>
                  ) : filteredCreated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    filteredCreated.map((bill) => (
                      <React.Fragment key={bill.bill_id}>
                        <tr className="border-b border-orange-100 dark:border-blue-800 hover:bg-orange-50 dark:hover:bg-blue-900/10">
                          <td className="p-4">
                            <button
                              onClick={() => toggleBillExpansion(bill.bill_id)}
                              className="hover:bg-orange-200 dark:hover:bg-blue-800 p-1 rounded"
                            >
                              {expandedBills.has(bill.bill_id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="p-4">{bill.description}</td>
                          <td className="p-4">{bill.bill_type || "N/A"}</td>
                          <td className="p-4">{new Date(bill.due_date).toLocaleDateString()}</td>
                          <td className="text-right p-4 font-semibold">${Number(bill.total_amount).toFixed(2)}</td>
                          <td className="text-center p-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEditBill(bill.bill_id)}
                                className="p-2 hover:bg-orange-200 dark:hover:bg-blue-800 rounded text-blue-900 dark:text-orange-200"
                                title="Edit bill"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBill(bill.bill_id)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                                title="Delete bill"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedBills.has(bill.bill_id) && bill.shares && (
                          <tr>
                            <td colSpan={6} className="p-0 bg-orange-50 dark:bg-blue-900/10">
                              <div className="p-4">
                                <h4 className="font-semibold text-sm text-blue-900 dark:text-orange-200 mb-2">
                                  Roommate Shares:
                                </h4>
                                <table className="w-full">
                                  <thead>
                                    <tr className="text-xs">
                                      <th className="text-left pb-2 text-muted-foreground">Roommate</th>
                                      <th className="text-right pb-2 text-muted-foreground">Amount Owed</th>
                                      <th className="text-center pb-2 text-muted-foreground">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {bill.shares.map((share) => (
                                      <tr key={share.user_id} className="text-sm">
                                        <td className="py-2">{share.user_name}</td>
                                        <td className="text-right py-2">${Number(share.amount_due).toFixed(2)}</td>
                                        <td className="text-center py-2">
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                              share.status === "paid"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                            }`}
                                          >
                                            {share.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Create/Edit Bill Modal */}
      {(isCreateModalOpen || editingBill) && (
        <CreateBillModal
          bill={editingBill}
          onClose={() => {
            setIsCreateModalOpen(false)
            setEditingBill(null)
          }}
          onSuccess={() => {
            setIsCreateModalOpen(false)
            setEditingBill(null)
            fetchBills()
          }}
        />
      )}
    </div>
  )
}
