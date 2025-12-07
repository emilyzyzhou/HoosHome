import { Lease } from "@/types/dashboard";

interface Props {
  lease: Lease | null;
}

export default function LeasePreview({ lease }: Props) {
  if (!lease) {
    return (
      <div className="border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-bold mb-2">Lease</h2>
        <p className="text-gray-500">No lease found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Lease</h2>
      <p><strong>Landlord:</strong> {lease.landlord_name}</p>
      <p><strong>Start:</strong> {lease.start_date}</p>
      <p><strong>End:</strong> {lease.end_date}</p>
      <p><strong>Rent:</strong> ${lease.rent_amount}</p>
    </div>
  );
}
