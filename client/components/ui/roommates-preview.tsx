import { Roommate } from "@/types/dashboard";

interface Props {
  roommates: Roommate[];
}

export default function RoommatesPreview({ roommates }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Roommates</h2>

      {roommates.length === 0 ? (
        <p className="text-gray-500">No roommates found.</p>
      ) : (
        <ul className="space-y-1">
          {roommates.map((r) => (
            <li key={r.user_id} className="text-gray-800">
              {r.name} ({r.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
