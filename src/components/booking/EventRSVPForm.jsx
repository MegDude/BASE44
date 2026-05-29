import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

/**
 * EventRSVPForm — RSVP for an event
 */
export default function EventRSVPForm({ event, onClose }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    guest_count: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await base44.auth.me().catch(() => ({ email: 'resident@downtownperks.local' }));

      const confirmation_code = `ER${Date.now().toString().slice(-8)}`;

      await base44.entities.Booking.create({
        type: 'event_rsvp',
        user_email: user?.email || 'resident@downtownperks.local',
        event_id: event.id,
        party_size: parseInt(formData.guest_count),
        booking_date: event.date,
        status: 'confirmed',
        confirmation_code,
      });

      setSubmitted(true);
      setTimeout(() => onClose?.(), 2000);
    } catch (error) {
      alert('RSVP failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-5 text-center"
      >
        <div className="w-12 h-10 rounded-full bg-[#F7F8FB]/35 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">✓</span>
        </div>
        <h3 className="text-[18px] font-bold text-[#0B1F33] mb-1">You're all set!</h3>
        <p className="text-[13px] text-[#0B1F33]/58 mb-3">See you at the event!</p>
        <button
          onClick={onClose}
          className="w-full h-10 rounded-lg bg-[#0B1F33] text-white font-medium text-[13px] hover:bg-[#081521] transition-colors"
        >
          Done
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div className="bg-[#F7F8FB] border border-[#0B1F33]/8 rounded-lg p-3">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#0B1F33]/50 mb-2">
          Event details
        </div>
        <div className="text-[13px] font-semibold text-[#0B1F33]">{event.title}</div>
        <div className="text-[12px] text-[#0B1F33]/58 mt-1">{event.venue_name}</div>
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase tracking-widest text-[#0B1F33]/50 block mb-2">
          How many guests?
        </label>
        <select
          value={formData.guest_count}
          onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[#0B1F33]/8 bg-white text-[13px] focus:outline-none focus:border-[#0B1F33]"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 rounded-lg bg-[#0B1F33] text-white font-semibold text-[14px] hover:bg-[#081521] transition-colors disabled:opacity-50"
      >
        {loading ? 'RSVPing...' : 'Confirm RSVP'}
      </button>
    </form>
  );
}
