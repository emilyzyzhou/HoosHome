import { EventData } from "@/types/dashboard";

interface Props {
  events: EventData[];
}

export default function EventsPreview({ events }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Events</h2>

      {events.length === 0 ? (
        <p className="text-gray-500">No upcoming events.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.event_id}>
              <strong>{e.title}</strong> —{" "}
              {new Date(e.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
