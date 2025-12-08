import { EventData } from "@/types/dashboard";
import Link from "next/link";

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
    <div className="bg-white dark:bg-slate-800 border-2 border-orange-200 dark:border-slate-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-2xl font-bold mb-4">
        <Link
          href="/events"
          className="hover:underline bg-gradient-to-r from-blue-700 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent"
        >
          Events
        </Link>
      </h2>

      {/* Upcoming Events */}
      <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mt-3 mb-2">Upcoming Events</h3>
      {upcoming.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 mb-4">No upcoming events.</p>
      ) : (
        <ul className="space-y-2 mt-1 mb-4">
          {upcoming.map((e) => (
            <li key={e.event_id} className="text-gray-800 dark:text-gray-200">
              <span className="font-medium">{e.title}</span> <span className="text-gray-500 dark:text-gray-400">— {e.start_date}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Past Events */}
      <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mt-4 mb-2">Past Events</h3>
      {past.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No recent past events.</p>
      ) : (
        <ul className="space-y-2 mt-1">
          {past.map((e) => (
            <li key={e.event_id} className="text-gray-800 dark:text-gray-200">
              <span className="font-medium">{e.title}</span> <span className="text-gray-500 dark:text-gray-400">— {e.start_date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
