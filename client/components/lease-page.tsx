"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, DollarSign, User, Phone, Edit, FileText, AlertCircle, X } from "lucide-react"

interface LeaseData {
  lease_id?: number
  home_id: number
  start_date: string
  end_date: string
  monthly_rent: string
  landlord_name: string
  landlord_contact: string
}

interface LeasePageProps {
  homeId: number
}

export function LeasePageComponent({ homeId }: LeasePageProps) {
  const [lease, setLease] = useState<LeaseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState("")

  // Form State
  const [formData, setFormData] = useState({
    monthly_rent: "",
    start_date: "",
    end_date: "",
    landlord_name: "",
    landlord_contact: ""
  })

  const fetchLease = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/lease/${homeId}`)
      const data = await res.json()
      
      if (res.ok && data.success) {
        if (data.lease) {
          setLease(data.lease)
          // Pre-fill form
          setFormData({
            monthly_rent: data.lease.monthly_rent,
            start_date: data.lease.start_date.split('T')[0], 
            end_date: data.lease.end_date.split('T')[0],
            landlord_name: data.lease.landlord_name,
            landlord_contact: data.lease.landlord_contact
          })
        } else {
            setLease(null);
        }
      }
    } catch (err) {
      console.error(err)
      setError("Failed to load lease information.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (homeId) fetchLease()
  }, [homeId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/lease/${homeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setIsModalOpen(false)
        fetchLease()
      } else {
        alert("Failed to save lease details.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const formatMoney = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount))
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent mb-8">
          Lease
        </h1>

        {isLoading ? (
             <div className="text-blue-900 dark:text-orange-200">Loading lease details...</div>
        ) : (
          <Card className="w-full max-w-2xl border-orange-100 dark:border-blue-800 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-orange-100 dark:border-blue-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-blue-900 dark:text-orange-200 flex items-center gap-2">
                  <FileText className="w-6 h-6" /> 
                  Current Lease
                </CardTitle>
                <CardDescription>Manage your rent terms and contact info</CardDescription>
              </div>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md hover:from-blue-800 hover:to-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                {lease ? "Edit Details" : "Add Lease"}
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {lease ? (
                <>
                  {/* Rent Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold mb-1">
                        <DollarSign className="w-5 h-5" /> Monthly Rent
                      </div>
                      <div className="text-3xl font-bold text-green-800 dark:text-green-300">
                        {formatMoney(lease.monthly_rent)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</p>
                          <p className="font-medium">{formatDate(lease.start_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">End Date</p>
                          <p className="font-medium">{formatDate(lease.end_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-orange-100 dark:border-blue-800" />

                  {/* Landlord Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-orange-200 mb-4">Landlord Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-blue-900/20">
                        <User className="w-5 h-5 text-blue-600 dark:text-orange-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{lease.landlord_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-blue-900/20">
                        <Phone className="w-5 h-5 text-blue-600 dark:text-orange-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Contact</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{lease.landlord_contact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 mb-3 text-orange-300" />
                  <p>No lease information found.</p>
                  <p className="text-sm">Click "Add Lease" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md border-orange-100 dark:border-blue-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20 flex flex-row items-center justify-between">
              <CardTitle className="text-blue-900 dark:text-orange-200">
                {lease ? "Edit Lease Details" : "Add New Lease"}
              </CardTitle>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Rent ($)</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={formData.monthly_rent}
                    onChange={(e) => setFormData({...formData, monthly_rent: e.target.value})}
                    required
                    className="bg-orange-50/50 dark:bg-blue-900/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input 
                      type="date" 
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                      className="bg-orange-50/50 dark:bg-blue-900/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input 
                      type="date" 
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      required
                      className="bg-orange-50/50 dark:bg-blue-900/20"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <label className="block text-sm font-medium mb-1">Landlord Name</label>
                  <Input 
                    type="text" 
                    value={formData.landlord_name}
                    onChange={(e) => setFormData({...formData, landlord_name: e.target.value})}
                    required
                    className="bg-orange-50/50 dark:bg-blue-900/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Landlord Contact (Phone/Email)</label>
                  <Input 
                    type="text" 
                    value={formData.landlord_contact}
                    onChange={(e) => setFormData({...formData, landlord_contact: e.target.value})}
                    required
                    className="bg-orange-50/50 dark:bg-blue-900/20"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-4 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold"
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
