import React, { useEffect } from "react";
import ExploreRebuilt from "./ExploreRebuilt";
import { shallow } from "zustand/shallow";
import { useMapStateStore } from "@/store/mapStateStore";
import EventsCalendarOverlay from "@/components/events/EventsCalendarOverlay";
import VenueIntelCaptureForm from "@/components/events/VenueIntelCaptureForm";

export default function Events() {
  const [
    reset,
    setViewMode,
    updateFilter,
    setShowResultsList,
    setShowMapOnly,
  ] = useMapStateStore(
    (state) => [
      state.reset,
      state.setViewMode,
      state.updateFilter,
      state.setShowResultsList,
      state.setShowMapOnly,
    ],
    shallow
  );

  useEffect(() => {
    reset();
    setViewMode("events");
    updateFilter("entityTypes", new Set(["event", "venue", "perk", "building", "property", "hotel"]));
    setShowResultsList(true);
    setShowMapOnly(false);
  }, [reset, setViewMode, updateFilter, setShowResultsList, setShowMapOnly]);

  return (
    <>
      <ExploreRebuilt />
      <EventsCalendarOverlay />
      <div className="pointer-events-auto fixed bottom-4 right-4 z-[35] hidden w-[440px] xl:block">
        <VenueIntelCaptureForm />
      </div>
    </>
  );
}
