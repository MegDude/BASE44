export default function EventsTab({ onDrawerStateChange }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Upcoming Events</h3>
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg bg-white/65 backdrop-blur border border-white/64">
          <p className="font-medium text-slate-900">Event #{i}</p>
          <p className="text-xs text-slate-600 mt-1">Tomorrow at 6:00 PM</p>
          <button className="mt-3 w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors">
            RSVP
          </button>
        </div>
      ))}
    </div>
  );
}
