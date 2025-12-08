"use client"

import { useState, useEffect, useMemo } from 'react';
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Trash2, Plus, Loader2, Repeat, Calendar, AlignLeft, User, CheckCircle, Edit, Search, AlertCircle, RefreshCw, Filter, ArrowUpDown} from "lucide-react";
import { CreateChoreModal } from "@/components/create-chore-modal";

const API_BASE_URL = 'https://hooshome-api-518521047014.us-east4.run.app'; 

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

export function ChorePage({homeId}: ChorePageProps) {
    const [chores, setChores] = useState<Chore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<{user_id: number, name: string}[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
    const [dateSort, setDateSort] = useState<"asc" | "desc">("asc");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingChore, setEditingChore] = useState<Chore | null>(null);
    
    const HOME_ID_TO_USE = homeId;

    useEffect(() => {
        const fetchUsers = async () => {
            if (!HOME_ID_TO_USE) return;
    
            try {
                const res = await fetch(`${API_BASE_URL}/home/users/${HOME_ID_TO_USE}`, {
                    credentials: 'include'
                });
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

    useEffect(() => {
        fetchChores();
    }, [HOME_ID_TO_USE]);

    // delete chore 
    const handleDeleteChore = async (choreId: number) => {
        if(!confirm("Are you sure you want to delete this chore?")) return;

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
            setChores(originalChores); 
        }
    };

    // modal handlers
    const handleEditClick = (chore: Chore) => {
        setEditingChore(chore);
    };

    const handleCreateClick = () => {
        setIsCreateModalOpen(true);
    };

    const handleModalClose = () => {
        setIsCreateModalOpen(false);
        setEditingChore(null);
    };

    const handleModalSuccess = () => {
        handleModalClose();
        fetchChores();
    };

    const processedChores = useMemo(() => {
        let result = [...chores];

        // search filter
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(chore => {
                const titleMatch = chore.title.toLowerCase().includes(lowerCaseSearch);
                const descriptionMatch = chore.description 
                    ? chore.description.toLowerCase().includes(lowerCaseSearch)
                    : false;
                return titleMatch || descriptionMatch;
            });
        }

        // status filter
        if (statusFilter !== "all") {
            result = result.filter(chore => chore.status === statusFilter);
        }

        // assignee filter
        if (assigneeFilter !== "all") {
            if (assigneeFilter === "unassigned") {
                result = result.filter(chore => chore.user_id === null);
            } else {
                result = result.filter(chore => String(chore.user_id) === assigneeFilter);
            }
        }

        // 4. Sort by Due Date
        result.sort((a, b) => {
            const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
            const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;

            if (dateSort === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });

        return result;
    }, [chores, searchTerm, statusFilter, assigneeFilter, dateSort]);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
                        Chores
                    </h1>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            onClick={fetchChores}
                            variant="outline"
                            className="border-orange-200 dark:border-blue-800 flex-1 sm:flex-none"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleCreateClick}
                            className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg flex-1 sm:flex-none"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Chore
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
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-blue-900/20 dark:to-blue-800/20 space-y-4">
                        {/* --- FILTERS TOOLBAR --- */}
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search chores..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-white dark:bg-slate-900 border-orange-200 dark:border-blue-800"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="relative w-full md:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-orange-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Complete">Complete</option>
                                </select>
                            </div>

                            {/* Assignee Filter */}
                            <div className="relative w-full md:w-48">
                                <select
                                    value={assigneeFilter}
                                    onChange={(e) => setAssigneeFilter(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-orange-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">All Roommates</option>
                                    <option value="unassigned">Unassigned</option>
                                    {users.map(u => (
                                        <option key={u.user_id} value={u.user_id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Button */}
                            <Button
                                variant="outline"
                                onClick={() => setDateSort(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="border-orange-200 dark:border-blue-800 bg-white dark:bg-slate-900 whitespace-nowrap"
                            >
                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                Due Date: {dateSort === 'asc' ? 'Oldest' : 'Newest'}
                            </Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <div className="max-h-[600px] overflow-y-auto">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 bg-orange-100 dark:bg-blue-900/30 sticky top-0 z-10 border-b border-orange-100 dark:border-blue-800">
                                <div className="col-span-3 p-4 text-sm font-semibold text-blue-900 dark:text-orange-200">Chore</div>
                                <div className="col-span-2 p-4 text-sm font-semibold text-blue-900 dark:text-orange-200 flex items-center gap-1">
                                    Due Date
                                    {dateSort === 'asc' ? ' ↑' : ' ↓'}
                                </div>
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
                            ) : processedChores.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    {searchTerm || statusFilter !== 'all' || assigneeFilter !== 'all' 
                                        ? "No chores match your filters." 
                                        : "No chores yet! Create one above."}
                                </div>
                            ) : (
                                <ul>
                                    {processedChores.map((chore) => (
                                        <li key={chore.chore_id} className="grid grid-cols-12 items-center border-b border-orange-100 dark:border-blue-800 hover:bg-orange-50 dark:hover:bg-blue-900/10 transition-colors">
                                            
                                            {/* TITLE & DESCRIPTION */}
                                            <div className="col-span-3 p-4 flex flex-col">
                                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                                    {chore.title}
                                                </span>
                                                {chore.description && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate max-w-[90%]">
                                                        <AlignLeft className="w-3 h-3 flex-shrink-0" />
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
                                                ) : chore.status === 'In Progress' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                                        <Loader2 className="w-3 h-3" />
                                                        In Progress
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm italic">No Status</span>
                                                )}
                                            </div>

                                            {/* ACTIONS COLUMN */}
                                            <div className="col-span-1 p-4 flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(chore)}
                                                    className="p-2 hover:bg-orange-200 dark:hover:bg-blue-800 rounded text-blue-900 dark:text-orange-200 transition-colors"
                                                    title="Edit chore"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteChore(chore.chore_id)}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                                                    title="Delete chore"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>

            <Footer />

            {/* Modal Injection */}
            {(isCreateModalOpen || editingChore) && HOME_ID_TO_USE && (
                <CreateChoreModal
                    chore={editingChore}
                    homeId={HOME_ID_TO_USE}
                    users={users}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
}