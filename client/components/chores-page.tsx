"use client"

import { useState, useEffect, useMemo} from 'react';
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Trash2, PlusCircle, Loader2, Repeat, Calendar, AlignLeft, User, CheckCircle, Edit, X , AlertCircle, Search} from "lucide-react";
import { EditChoreForm } from './ui/EditChoreForm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''; 

interface Chore {
    chore_id: number;
    title: string;
    due_date: string | null;
    home_id: number;
    description: string | null;
    recurrence: string | null;
    user_id: number | null;
    status: string | null ;
}

interface ChorePageProps {
    homeId: number | null;
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    } catch {
        return dateString; 
    }
};
interface ChoreFormData {
    title: string;
    description: string;
    due_date: string;
    recurrence: string;
    user_id: string;
    status: string;
}

export function ChorePage({homeId}: ChorePageProps) {
    const [chores, setChores] = useState<Chore[]>([]);
    const [newChoreTitle, setnewChoreTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<{user_id: number, name: string}[]>([]);

    const [editingChoreId, setEditingChoreId] = useState<number | null>(null);
    const [formData, setFormData] = useState<ChoreFormData>({ 
        title: '', 
        description: '', 
        due_date: '', 
        recurrence: '',
        user_id: '',
        status: 'Pending'
    });
    const [isUpdating, setIsUpdating] = useState(false);
    

    const HOME_ID_TO_USE = homeId;
    useEffect(() => {
        const fetchUsers = async () => {
            if (!HOME_ID_TO_USE) return;
    
            try {
                const res = await fetch(`${API_BASE_URL}/home/${HOME_ID_TO_USE}/users`);
                const data = await res.json();
    
                if (res.ok && data.success) {
                    setUsers(data.users);
                } else {
                    console.error("Failed to fetch users:", data.message);
                    setUsers([]); 
                }
            } catch (err) {
                console.error("Fetch Users Error:", err);
                setUsers([]);
            }
        };
    
        fetchUsers();
    }, [HOME_ID_TO_USE]);

    useEffect(() => {
        const fetchChores = async () => {
            if (!HOME_ID_TO_USE) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/chore/${HOME_ID_TO_USE}`);
                const data = await res.json();

                if (res.ok && data.success) {
                    setChores(data.chores);
                } else {
                    throw new Error(data.error || "Failed to fetch chores.");
                }
            } catch (err) {
                console.error(err);
                setError("Could not load chore list. Check API server connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchChores();
    }, [HOME_ID_TO_USE]);

    // Add Chore Handler
    const handleAddChore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChoreTitle.trim() || !HOME_ID_TO_USE) return;
        setAdding(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/chore/${HOME_ID_TO_USE}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newChoreTitle.trim() }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setChores(prev => [
                    ...prev, 
                    { 
                        ...data.chore, 
                        description: null,
                        due_date: '2025-10-28',
                        recurrence: 'Weekly'
                    }
                ]);
                setnewChoreTitle('');
            } else {
                throw new Error(data.error || "Failed to add chore.");
            }
        } catch (err) {
            console.error(err);
            setError("Error adding chore.");
        } finally {
            setAdding(false);
        }
    };

    // Delete Chore Handler
    const handleDeleteChore = async (choreId: number) => {
        setError(null);
        
        const originalChores = chores;
        setChores(prev => prev.filter(c => c.chore_id !== choreId));

        try {
            const res = await fetch(`${API_BASE_URL}/chore/${choreId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                setChores(originalChores);
                const data = await res.json();
                throw new Error(data.message || "Failed to delete chore.");
            }
        } catch (err) {
            console.error(err);
            setError("Error deleting chore. Reverted change.");
            setChores(originalChores); // Revert on error
        }
    };

    // update chore handlers
    const startEditing = (chore: Chore) => {
        setEditingChoreId(chore.chore_id);
        setFormData({
            title: chore.title || '',
            description: chore.description || '',
            // yyyy-mm-dd
            due_date: chore.due_date ? new Date(chore.due_date).toISOString().split('T')[0] : '', 
            recurrence: chore.recurrence || 'One-time',
            user_id: chore.user_id ? String(chore.user_id) : '',
            status: chore.status || 'Pending',
        });
        setError(null);
    };
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignmentAction = async (method: 'DELETE' | 'POST' | 'PUT', path: string, body: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}${path}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            
            if (method === 'DELETE' && (res.status === 404 || res.status === 409)) {
                return res;
            }

            if (!res.ok) {
                
                let errorMessage = `API call failed with status ${res.status} on ${method} ${path}`;

                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const data = await res.json();
                        errorMessage = data.message || errorMessage;
                    } catch (e) {
                        errorMessage += " (Response body was not valid JSON)";
                    }
                } else {
                    // if it's not JSON, maybe capture plain text if available
                    // const text = await res.text();
                    // errorMessage += ` (Body: ${text.substring(0, 50)}...)`;
                }
                throw new Error(errorMessage);
            }
            return res;
        } catch (error) {
            throw error;
        }
    };
    const handleUpdateChore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingChoreId || !formData.title.trim()) return;

        setIsUpdating(true);
        setError(null);

        const choreId = editingChoreId;
        const currentChore = chores.find(c => c.chore_id === choreId);

        const coreChoreUpdate = {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            due_date: formData.due_date || null,
            recurrence: formData.recurrence || null,
        };

        const newUser_id_parsed = parseInt(formData.user_id, 10);
        const newUser_id = (formData.user_id && !isNaN(newUser_id_parsed) && newUser_id_parsed > 0) 
            ? newUser_id_parsed 
            : null;
        const oldUser_id = currentChore?.user_id || null;

        const newStatus = newUser_id ? formData.status : null; 
        const oldStatus = currentChore?.status;

        let success = true;

        try {

            const resChore = await fetch(`${API_BASE_URL}/chore/${choreId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(coreChoreUpdate),
            });
            if (!resChore.ok) throw new Error("Failed to update core chore details.");
            if (newUser_id !== oldUser_id) {
                if (oldUser_id !== null) {
                    await handleAssignmentAction('DELETE', '/chore/assignment', { chore_id: choreId, user_id: oldUser_id });
                }

                if (newUser_id !== null) {
                    console.log("Attempting POST /chore/assignment with:", { 
                        chore_id: choreId, 
                        user_id: newUser_id, 
                        status: newStatus 
                    });
                    
                    await handleAssignmentAction('POST', '/chore/assignment', { chore_id: choreId, user_id: newUser_id, status: newStatus });
                }
            } 
            else if (newUser_id !== null && newStatus !== oldStatus) {
                await handleAssignmentAction('PUT', '/chore/assignment/status', { chore_id: choreId, user_id: newUser_id, status: newStatus });
            }

            setChores(prev => prev.map(c =>
                c.chore_id === choreId
                    ? { 
                        ...c, 
                        ...coreChoreUpdate, 
                        user_id: newUser_id, 
                        status: newStatus 
                      } as Chore 
                    : c
            ));
            setEditingChoreId(null);
            
        } catch (err) {
            console.error("Update Chore failed:", err);
            setError("Error updating chore or assignment.");
            success = false;
        } finally {
            setIsUpdating(false);
            if (!success) {

            }
        }
    };
    const cancelEditing = () => {
        setEditingChoreId(null);
        setIsUpdating(false);
    };
    // search 
    const searchChores = useMemo(() => {
        if (!searchTerm) {
            return chores;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();

        return chores.filter(chore => {
            const titleMatch = chore.title.toLowerCase().includes(lowerCaseSearch);
            
            const descriptionMatch = chore.description 
                ? chore.description.toLowerCase().includes(lowerCaseSearch)
                : false;
            
            return titleMatch || descriptionMatch;
        });
    }, [chores, searchTerm]);


    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
                        Chores & Tasks
                    </h1>
                    {/*{HOME_ID_TO_USE && (
                        <div className="text-sm font-medium text-blue-900 dark:text-orange-200 bg-white/50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-orange-100 dark:border-blue-800">
                            Home ID: {HOME_ID_TO_USE}
                        </div>
                    )} */}
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                <Card className="border-orange-100 dark:border-blue-800 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-orange-200">
                                <ListChecks className="w-6 h-6" />
                                Household Chores
                            </CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search chores..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-64 bg-white dark:bg-slate-900"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        {/* Quick Add Section styled to fit the card flow */}
                        <div className="p-4 bg-orange-50/50 dark:bg-blue-900/10 border-b border-orange-100 dark:border-blue-800">
                            <form onSubmit={handleAddChore} className="flex gap-2">
                                <Input
                                    placeholder="Add a new chore (e.g., Take out trash)"
                                    value={newChoreTitle}
                                    onChange={(e) => setnewChoreTitle(e.target.value)}
                                    disabled={adding}
                                    className="flex-grow bg-white dark:bg-slate-900"
                                />
                                <Button 
                                    type="submit" 
                                    disabled={adding || !newChoreTitle.trim()}
                                    className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-md whitespace-nowrap"
                                >
                                    {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2"/>}
                                    Add Chore
                                </Button>
                            </form>
                        </div>

                        {/* List Headers */}
                        <div className="max-h-[600px] overflow-y-auto">
                            <div className="grid grid-cols-12 bg-orange-100 dark:bg-blue-900/30 sticky top-0 z-10 border-b border-orange-100 dark:border-blue-800">
                                <div className="col-span-3 p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Chore</div>
                                <div className="col-span-2 p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Due Date</div>
                                <div className="col-span-2 p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Recurrence</div>
                                <div className="col-span-2 p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Assigned To</div>
                                <div className="col-span-2 p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Status</div>
                                <div className="col-span-1 p-4 text-sm font-semibold text-blue-900 dark:text-orange-200 text-right">Actions</div>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                                    Loading chores...
                                </div>
                            ) : searchChores.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    {searchTerm ? `No chores found matching "${searchTerm}".` : "No chores yet! Add your first task above."}
                                </div>
                            ) : (
                                <ul>
                                    {searchChores.map((chore) => (
                                        chore.chore_id === editingChoreId ? (
                                            <ul key={chore.chore_id} className="border-b border-orange-100 dark:border-blue-800 bg-orange-50/50 dark:bg-blue-900/10 p-4">
                                                <EditChoreForm
                                                    formData={formData}
                                                    isUpdating={isUpdating}
                                                    handleFormChange={handleFormChange}
                                                    handleUpdateChore={handleUpdateChore}
                                                    cancelEditing={cancelEditing}
                                                    users={users}
                                                />
                                            </ul>
                                        ) : (
                                            <li key={chore.chore_id} className="grid grid-cols-12 items-center border-b border-orange-100 dark:border-blue-800 hover:bg-orange-50 dark:hover:bg-blue-900/10 transition-colors">
                                                
                                                {/* TITLE & DESCRIPTION */}
                                                <div className="col-span-3 p-4 flex flex-col">
                                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                                        {chore.title}
                                                    </span>
                                                    {chore.description && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                            <AlignLeft className="w-3 h-3" />
                                                            {chore.description}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* DUE DATE */}
                                                <div className="col-span-2 p-4 text-sm flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    {formatDate(chore.due_date)}
                                                </div>

                                                {/* RECURRENCE */}
                                                <div className="col-span-2 p-4 text-sm flex items-center gap-2">
                                                    <Repeat className="w-4 h-4 text-muted-foreground" />
                                                    {chore.recurrence || "One-time"}
                                                </div>

                                                {/* ASSIGNED TO */}
                                                <div className="col-span-2 p-4 text-sm flex items-center gap-2">
                                                    <User className={`w-4 h-4 ${chore.user_id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                                                    <span className={chore.user_id ? 'font-medium' : 'text-muted-foreground italic'}>
                                                        {users.find(u => u.user_id === chore.user_id)?.name || 'Unassigned'}
                                                    </span>
                                                </div>

                                                {/* STATUS */}
                                                <div className="col-span-2 p-4">
                                                    {chore.status === 'Complete' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Complete
                                                        </span>
                                                    ) : chore.status === 'Pending' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            Pending
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm italic">No Status</span>
                                                    )}
                                                </div>

                                                {/* ACTIONS COLUMN */}
                                                <div className="col-span-1 p-4 flex justify-end gap-2">
                                                    <button
                                                        onClick={() => startEditing(chore)}
                                                        className="p-2 hover:bg-orange-200 dark:hover:bg-blue-800 rounded text-blue-900 dark:text-orange-200 transition-colors"
                                                        disabled={isUpdating}
                                                        title="Edit chore"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteChore(chore.chore_id)}
                                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                                                        disabled={isUpdating}
                                                        title="Delete chore"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>

            <Footer />
        </div>
    );
}