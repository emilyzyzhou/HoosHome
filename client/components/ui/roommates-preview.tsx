import { Roommate } from "@/types/dashboard";

interface Props {
  roommates: Roommate[];
}

export default function RoommatesPreview({ roommates }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-orange-200 dark:border-slate-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
        Roommates
      </h2>

      {roommates.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No roommates found.</p>
      ) : (
        <ul className="space-y-2">
          {roommates.map((r) => (
            <li key={r.user_id} className="text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
              <span className="font-medium">{r.name}</span>
              <br />
              <span className="text-sm text-gray-500 dark:text-gray-400">{r.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
