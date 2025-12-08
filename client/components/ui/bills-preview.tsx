interface Bill {
  bill_id: number;
  description: string;
  amount_due: number;
  status: string;
}

interface BillsPreviewProps {
  bills: Bill[];
}

export default function BillsPreview({ bills }: BillsPreviewProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Bills</h2>

      {bills.length === 0 ? (
        <p className="text-gray-500">No bills assigned.</p>
      ) : (
        <ul className="space-y-2">
          {bills.map((b) => (
            <li key={b.bill_id} className="text-gray-800">
              <strong>{b.description}</strong> — ${b.amount_due}  
              <span className="text-sm text-gray-600 ml-2">({b.status})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
