"use client"

import { useState } from "react"
// import { DashboardHeader } from "./dashboard-header"
// import { ExpensesSummary } from "./expenses-summary"
// import { ChoresBoard } from "./chores-board"
// import { UpcomingEvents } from "./upcoming-events"
// import { RoommatesList } from "./roommates-list"

interface DashboardProps {
  onLogout: () => void
}

// export function Dashboard({ onLogout }: DashboardProps) {
//   const [activeTab, setActiveTab] = useState("overview")

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 dark:from-slate-950 dark:to-blue-950">
//       <DashboardHeader onLogout={onLogout} />

//       <main className="max-w-7xl mx-auto px-4 py-8">
//         <div className="grid gap-6">
//           <div className="flex gap-2 border-b-2 border-orange-200 dark:border-blue-800 overflow-x-auto">
//             <button
//               onClick={() => setActiveTab("overview")}
//               className={`px-4 py-3 font-semibold border-b-4 transition-all whitespace-nowrap ${
//                 activeTab === "overview"
//                   ? "border-orange-500 dark:border-orange-400 text-blue-900 dark:text-orange-300"
//                   : "border-transparent text-muted-foreground hover:text-blue-700 dark:hover:text-orange-300"
//               }`}
//             >
//               Overview
//             </button>
//             <button
//               onClick={() => setActiveTab("expenses")}
//               className={`px-4 py-3 font-semibold border-b-4 transition-all whitespace-nowrap ${
//                 activeTab === "expenses"
//                   ? "border-orange-500 dark:border-orange-400 text-blue-900 dark:text-orange-300"
//                   : "border-transparent text-muted-foreground hover:text-blue-700 dark:hover:text-orange-300"
//               }`}
//             >
//               Expenses
//             </button>
//             <button
//               onClick={() => setActiveTab("chores")}
//               className={`px-4 py-3 font-semibold border-b-4 transition-all whitespace-nowrap ${
//                 activeTab === "chores"
//                   ? "border-orange-500 dark:border-orange-400 text-blue-900 dark:text-orange-300"
//                   : "border-transparent text-muted-foreground hover:text-blue-700 dark:hover:text-orange-300"
//               }`}
//             >
//               Chores
//             </button>
//           </div>

//           {/* Overview Tab */}
//           {activeTab === "overview" && (
//             <div className="grid gap-6">
//               <div className="grid md:grid-cols-2 gap-6">
//                 <ExpensesSummary />
//                 <RoommatesList />
//               </div>
//               <div className="grid md:grid-cols-2 gap-6">
//                 <ChoresBoard />
//                 <UpcomingEvents />
//               </div>
//             </div>
//           )}

//           {/* Expenses Tab */}
//           {activeTab === "expenses" && (
//             <div>
//               <ExpensesSummary expanded />
//             </div>
//           )}

//           {/* Chores Tab */}
//           {activeTab === "chores" && (
//             <div>
//               <ChoresBoard expanded />
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   )
// }
