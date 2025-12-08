import { Lease } from "@/types/dashboard";
import Link from "next/link";

interface Props {
  lease: Lease | null;
  homeId: number;
}

export default function LeasePreview({ lease, homeId }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-orange-200 dark:border-slate-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-2xl font-bold mb-4">
        <Link
          href={`/lease?homeId=${homeId}`}
          className="hover:underline bg-gradient-to-r from-blue-700 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent"
        >
          Lease
        </Link>
      </h2>

      {!lease ? (
        <p className="text-gray-500 dark:text-gray-400">No lease found.</p>
      ) : (
        <div className="space-y-2 text-gray-800 dark:text-gray-200">
          <p><strong>Landlord:</strong> {lease.landlord_name}</p>
          <p><strong>Start:</strong> {lease.start_date}</p>
          <p><strong>End:</strong> {lease.end_date}</p>
          <p><strong>Rent:</strong> ${lease.rent_amount}</p>
        </div>
      )}
    </div>
  );
}
