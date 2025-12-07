import { EventData } from "@/types/dashboard";

interface Props {
  events: {
    upcoming?: EventData[];
    past?: EventData[];
  } | undefined;
}

export default function EventsPreview({ events }: Props) {
  const upcoming = events?.upcoming ?? [];
  const past = events?.past ?? [];

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Events</h2>

      {/* Upcoming Events */}
      <h3 className="font-semibold underline mt-3">Upcoming Events</h3>
      {upcoming.length === 0 ? (
        <p className="text-gray-500">No upcoming events.</p>
      ) : (
        <ul className="space-y-2 mt-1">
          {upcoming.map((e) => (
            <li key={e.event_id}>
              <span className="font-medium">{e.title}</span> — {e.start_date}
            </li>
          ))}
        </ul>
      )}

      {/* Past Events */}
      <h3 className="font-semibold underline mt-4">Past Events</h3>
      {past.length === 0 ? (
        <p className="text-gray-500">No recent past events.</p>
      ) : (
        <ul className="space-y-2 mt-1">
          {past.map((e) => (
            <li key={e.event_id}>
              <span className="font-medium">{e.title}</span> — {e.start_date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
