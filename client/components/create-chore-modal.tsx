"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, AlertCircle, Calendar, Repeat, User } from "lucide-react"

interface Chore {
  chore_id: number
  title: string
  due_date: string | null
  home_id: number
  description: string | null
  recurrence: string | null
  user_id: number | null
  status: string | null
}

interface UserData {
  user_id: number
  name: string
}

interface CreateChoreModalProps {
  chore?: Chore | null
  homeId: number
  users: UserData[]
  onClose: () => void
  onSuccess: () => void
}

export function CreateChoreModal({ 
  chore, 
  homeId, 
  users, 
  onClose, 
  onSuccess 
}: CreateChoreModalProps) {
  const isEditMode = !!chore
  
  // Form State
  const [title, setTitle] = useState(chore?.title || "")
  const [description, setDescription] = useState(chore?.description || "")
  const [dueDate, setDueDate] = useState(chore?.due_date ? new Date(chore.due_date).toISOString().split('T')[0] : "")
  const [recurrence, setRecurrence] = useState(chore?.recurrence || "One-time")
  const [assignedUserId, setAssignedUserId] = useState<string>(chore?.user_id ? String(chore.user_id) : "")
  const [status, setStatus] = useState(chore?.status || "Pending")
  
  // UI State
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Chore title is required")
      return
    }

    setIsLoading(true)

    try {
      let currentChoreId = chore?.chore_id

      // 1. CREATE Logic
      if (!isEditMode) {
        // Create the base chore first (assuming API pattern from previous code)
        const createRes = await fetch(`https://hooshome-api-518521047014.us-east4.run.app/chore/${homeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim() }),
        })

        if (!createRes.ok) {
            const data = await createRes.json()
            throw new Error(data.error || "Failed to create chore")
        }

        const createData = await createRes.json()
        currentChoreId = createData.chore.chore_id
      }

      if (!currentChoreId) throw new Error("Missing chore ID")

      // 2. UPDATE DETAILS Logic (Runs for both Create and Edit to save details)
      const coreUpdate = {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        recurrence: recurrence || null
      }

      const updateRes = await fetch(`https://hooshome-api-518521047014.us-east4.run.app/chore/${currentChoreId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coreUpdate),
      })

      if (!updateRes.ok) throw new Error("Failed to save chore details")

      // 3. ASSIGNMENT Logic
      const newUser_id = assignedUserId ? parseInt(assignedUserId) : null
      const oldUser_id = chore?.user_id || null
      const oldStatus = chore?.status || null

      // Handle Assignment Changes
      if (newUser_id !== oldUser_id) {
        // Remove old assignment if it exists
        if (oldUser_id !== null) {
          await fetch(`https://hooshome-api-518521047014.us-east4.run.app/chore/assignment`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chore_id: currentChoreId, user_id: oldUser_id }),
          })
        }
        // Create new assignment if user selected
        if (newUser_id !== null) {
          await fetch(`https://hooshome-api-518521047014.us-east4.run.app/chore/assignment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chore_id: currentChoreId, user_id: newUser_id, status: status }),
          })
        }
      } 
      // Handle Status Change (Same User)
      else if (newUser_id !== null && status !== oldStatus) {
         await fetch(`https://hooshome-api-518521047014.us-east4.run.app/chore/assignment/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chore_id: currentChoreId, user_id: newUser_id, status: status }),
        })
      }

      onSuccess()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An error occurred while saving")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-orange-100 dark:border-blue-800 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-900 dark:text-orange-200">
              {isEditMode ? "Edit Chore" : "Add New Chore"}
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
                Chore Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Take out trash, Wash dishes"
                className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this task..."
                className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1"/> Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                  <Repeat className="w-4 h-4 inline mr-1"/> Recurrence
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-orange-200 dark:border-blue-800 bg-orange-50 dark:bg-blue-900/30 text-sm"
                >
                  <option value="One-time">One-time</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                  <User className="w-4 h-4 inline mr-1"/> Assign To
                </label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-orange-200 dark:border-blue-800 bg-orange-50 dark:bg-blue-900/30 text-sm"
                >
                  <option value="">-- Unassigned --</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {assignedUserId && (
                <div>
                  <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-orange-200 dark:border-blue-800 bg-orange-50 dark:bg-blue-900/30 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
              )}
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
                {isLoading ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Chore")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}