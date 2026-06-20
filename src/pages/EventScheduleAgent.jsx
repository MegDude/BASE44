import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import EventScheduleAgentChat from '@/components/agents/EventScheduleAgentChat';

export default function EventScheduleAgent() {
  return (
    <div className="min-h-screen bg-[#f7f6f2] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#111f3d]/12 bg-white px-4 py-2 text-sm text-[#111f3d]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <div className="mt-6 rounded-[28px] bg-[#111f3d] px-6 py-8 text-white md:px-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">Nearby member events</p>
          <h1 className="mt-2 text-[34px] font-canela leading-tight md:text-[48px]">Your live event concierge</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/82 md:text-base">
            Share your phone location and this agent will surface nearby event schedules and help signed-in members manage bookings.
          </p>
        </div>

        <div className="mt-6">
          <EventScheduleAgentChat />
        </div>
      </div>
    </div>
  );
}