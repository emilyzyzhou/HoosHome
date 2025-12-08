import { Lease } from "@/types/dashboard";
import Link from "next/link";

interface Props {
  lease: Lease | null;
}

export default function LeasePreview({ lease }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">
        <Link
          href="/lease"
          className="hover:underline text-blue-700 dark:text-amber-200"
        >
          Lease
        </Link>
      </h2>

      {!lease ? (
        <p className="text-gray-500">No lease found.</p>
      ) : (
        <>
          <p><strong>Landlord:</strong> {lease.landlord_name}</p>
          <p><strong>Start:</strong> {lease.start_date}</p>
          <p><strong>End:</strong> {lease.end_date}</p>
          <p><strong>Rent:</strong> ${lease.rent_amount}</p>
        </>
      )}
    </div>
  );
}
