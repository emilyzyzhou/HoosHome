"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, RefreshCw, Calendar, Trash2, X, Pencil, AlertCircle, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Event {
  event_id: number
  title: string
  description: string
  event_start: string
  event_end: string
  rsvp_status: string
}

export default function EventPage() {
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [invitedToEvents, setInvitedToEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number>(-1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number>(-1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedInvites, setSelectedInvites] = useState<Set<number>>(new Set());
  const [roommates, setRoommates] = useState<Array<{ user_id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/events/user`,
            {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            }
        );
        if (res.ok) {
        const data = await res.json()
        const createdEvents = data.createdEvents || [];
        const invitedToEvents = data.events || [];
        setInvitedToEvents(invitedToEvents);
        setCreatedEvents(createdEvents);
        console.log(invitedToEvents);
        console.log(createdEvents);
        } else {
            setError("Error loading events. You aren't signed in, perhaps?");
        }
    } catch (err) {
      console.error("Request failed, for some resaon :/:", err);
    } finally {
      setLoading(false);
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

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setCurrentUserId(data.user.user_id)
      }
    } catch (err) {
      console.error("Failed to fetch user info", err)
    }
  }

  useEffect(() => {
    fetchEvents();
    fetchUserInfo();
    fetchRoommates();
  }, [])

  const toggleRoommate = (userId: number) => {
    const newSelected = new Set(selectedInvites)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedInvites(newSelected)
  }

  const handleCreate = async () => {
    setCreateError("");
    if (!title || !start) {
      setCreateError("Title and start date/time are required")
      return
    }

    setIsLoading(true)
    const user_ids_to_invite = Array.from(selectedInvites)

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/events/create`,
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, event_start: start, event_end: end, user_ids_to_invite }),
            }
        );

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || "Failed to create event")
        }

        setIsCreateOpen(false)
        setTitle("")
        setDescription("")
        setStart("")
        setEnd("")
        setSelectedInvites(new Set())
        fetchEvents()
        } catch (err) {
        setCreateError("Could not create event.")
        }
    setIsLoading(false)
  }

  const handleDelete = async (eventId: number) => {
    try {
        await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/events/delete`,
            {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_id: eventId }),
            }
        );
      fetchEvents()
    } catch (err) {
      console.error(err)
      setError("Could not delete event")
    }
  }

  const handleUpdate = async () => {
    setCreateError("");
    if (!title || !start) {
      setCreateError("Title and start date/time are required")
      return
    }

    setIsLoading(true)

    try {
        await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/events/update`,
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  event_id: editingEventId,
                  title, 
                  description, 
                  event_start: start, 
                  event_end: end 
                }),
            }
        );

        setIsEditOpen(false);
        setEditingEventId(-1);
        setTitle("")
        setDescription("")
        setStart("")
        setEnd("")
        fetchEvents()
        } catch (err) {
        setCreateError("Could not update event.")
        }
    setIsLoading(false)
  }

  const handleRsvp = async (eventId: number, rsvp: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/events/rsvp`,
        {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, rsvp_status: rsvp }),
        }
        );
      fetchEvents()
    } catch (err) {
        console.error("Something went wrong with RSVP :/ ", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
            Events
          </h1>
          <div className="flex gap-2">
            <Button onClick={fetchEvents} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
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
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-orange-200">
              <Calendar className="w-6 h-6" />
              All Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-orange-100 dark:bg-blue-900/30 sticky top-0">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">Title</th>
                    <th className="text-left p-4 text-sm font-semibold">Date</th>
                    <th className="text-left p-4 text-sm font-semibold">Type</th>
                    <th className="text-left p-4 text-sm font-semibold">Status</th>
                    <th className="text-center p-4 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        Loading events...
                      </td>
                    </tr>
                  )}
                  {!loading && createdEvents.length === 0 && invitedToEvents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        No events
                      </td>
                    </tr>
                  )}
                  
                  {!loading && invitedToEvents.map(evt => (
                    <tr key={evt.event_id} className="border-b border-orange-100 dark:border-blue-800 hover:bg-orange-50 dark:hover:bg-blue-900/10">
                      <td className="p-4">
                        <div className="font-medium">{evt.title}</div>
                        {evt.description && <div className="text-xs text-muted-foreground mt-1">{evt.description}</div>}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(evt.event_start).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4 text-sm">Invited</td>
                      <td className="p-4 text-sm">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {evt.rsvp_status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-3 justify-center text-sm">
                          <button
                            onClick={() => handleRsvp(evt.event_id, 'Accepted')}
                            className="text-green-700 hover:underline"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRsvp(evt.event_id, 'Tentative')}
                            className="text-blue-700 hover:underline"
                          >
                            Not Yet
                          </button>
                          <button
                            onClick={() => handleRsvp(evt.event_id, 'Declined')}
                            className="text-red-600 hover:underline"
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {!loading && createdEvents.map(evt => (
                    <tr key={evt.event_id} className="border-b border-orange-100 dark:border-blue-800 hover:bg-orange-50 dark:hover:bg-blue-900/10">
                      <td className="p-4">
                        <div className="font-medium">{evt.title}</div>
                        {evt.description && <div className="text-xs text-muted-foreground mt-1">{evt.description}</div>}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(evt.event_start).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4 text-sm">Created</td>
                      <td className="p-4 text-sm">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Organizer
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingEventId(evt.event_id);
                              setTitle(evt.title);
                              setDescription(evt.description || "");
                              setStart(evt.event_start ? new Date(evt.event_start).toISOString().slice(0, 16) : "");
                              setEnd(evt.event_end ? new Date(evt.event_end).toISOString().slice(0, 16) : "");
                              setIsEditOpen(true);
                            }}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400 transition-colors"
                            title="Edit event"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(evt.event_id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {isCreateOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-orange-100 dark:border-blue-800 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-orange-200">Create Event</CardTitle>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="p-2 hover:bg-orange-200 dark:hover:bg-blue-800 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="space-y-4">
                  {createError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                      Event Title
                    </label>
                    <Input
                      placeholder="e.g., House Party, Game Night"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                      Description
                    </label>
                    <Textarea
                      placeholder="Add details about this event..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                        Start Date & Time
                      </label>
                      <Input
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                        End Date & Time
                      </label>
                      <Input
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Invite Roommates
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-orange-200 dark:border-blue-800 rounded-md p-3 bg-orange-50 dark:bg-blue-900/30">
                      {currentUserId ? roommates.filter(roommate => roommate.user_id !== currentUserId).map((roommate) => (
                        <div key={roommate.user_id} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`invite-${roommate.user_id}`}
                            checked={selectedInvites.has(roommate.user_id)}
                            onChange={() => toggleRoommate(roommate.user_id)}
                            className="w-4 h-4"
                          />
                          <label htmlFor={`invite-${roommate.user_id}`} className="flex-1 cursor-pointer">
                            {roommate.name}
                          </label>
                        </div>
                      )) : (
                        <div className="text-sm text-muted-foreground p-2">No roommates to invite.</div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      variant="outline"
                      className="border-orange-200 dark:border-blue-800"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleCreate}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg"
                    >
                      {isLoading ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {isEditOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-orange-100 dark:border-blue-800 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-orange-200">Edit Event</CardTitle>
                  <button
                    onClick={() => {
                      setIsEditOpen(false);
                      setEditingEventId(-1);
                      setTitle("");
                      setDescription("");
                      setStart("");
                      setEnd("");
                    }}
                    className="p-2 hover:bg-orange-200 dark:hover:bg-blue-800 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleUpdate() }} className="space-y-4">
                  {createError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                      Event Title
                    </label>
                    <Input
                      placeholder="e.g., House Party, Game Night"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                      Description
                    </label>
                    <Textarea
                      placeholder="Add details about this event..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                        Start Date & Time
                      </label>
                      <Input
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-900 dark:text-orange-200 mb-2">
                        End Date & Time
                      </label>
                      <Input
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditOpen(false);
                        setEditingEventId(-1);
                        setTitle("");
                        setDescription("");
                        setStart("");
                        setEnd("");
                      }}
                      variant="outline"
                      className="border-orange-200 dark:border-blue-800"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleUpdate}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg"
                    >
                      {isLoading ? "Updating..." : "Update Event"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
