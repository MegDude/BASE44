import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

/**
 * VenueBookingForm — Book a table/spot at a venue
 */
export default function VenueBookingForm({ venue, onClose }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    party_size: 2,
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: '19:00',
    special_requests: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await base44.auth.me().catch(() => ({ email: 'resident@downtownperks.local' }));

      const confirmation_code = `VB${Date.now().toString().slice(-8)}`;

      await base44.entities.Booking.create({
        type: 'venue_spot',
        user_email: user?.email || 'resident@downtownperks.local',
        venue_id: venue.id,
        party_size: parseInt(formData.party_size),
        booking_date: new Date(`${formData.booking_date}T${formData.booking_time}`).toISOString(),
        booking_time: formData.booking_time,
        special_requests: formData.special_requests,
        status: 'pending',
        confirmation_code,
      });

      setSubmitted(true);
      setTimeout(() => onClose?.(), 2000);
    } catch (error) {
      alert('Booking failed. Please try again.');
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
        <h3 className="text-[18px] font-bold text-[#0B1F33] mb-1">Booking confirmed!</h3>
        <p className="text-[13px] text-[#0B1F33]/58 mb-3">Check your email for details.</p>
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
      <div>
        <label className="text-[11px] font-bold uppercase tracking-widest text-[#0B1F33]/50 block mb-2">
          Date
        </label>
        <input
          type="date"
          value={formData.booking_date}
          onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[#0B1F33]/8 bg-white text-[13px] focus:outline-none focus:border-[#0B1F33]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[#0B1F33]/50 block mb-2">
            Time
          </label>
          <input
            type="time"
            value={formData.booking_time}
            onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[#0B1F33]/8 bg-white text-[13px] focus:outline-none focus:border-[#0B1F33]"
            required
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[#0B1F33]/50 block mb-2">
            Party size
          </label>
          <select
            value={formData.party_size}
            onChange={(e) => setFormData({ ...formData, party_size: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[#0B1F33]/8 bg-white text-[13px] focus:outline-none focus:border-[#0B1F33]"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase tracking-widest text-[#0B1F33]/50 block mb-2">
          Special requests (optional)
        </label>
        <textarea
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          placeholder="e.g., window seat, high chair needed..."
          className="w-full px-3 py-2 rounded-lg border border-[#0B1F33]/8 bg-white text-[13px] focus:outline-none focus:border-[#0B1F33] resize-none h-20"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 rounded-lg bg-[#0B1F33] text-white font-semibold text-[14px] hover:bg-[#081521] transition-colors disabled:opacity-50"
      >
        {loading ? 'Booking...' : 'Confirm booking'}
      </button>
    </form>
  );
}
