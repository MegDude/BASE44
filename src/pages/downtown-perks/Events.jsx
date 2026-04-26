/**
 * Events Page - Redirects to map with events filter
 * No separate events list page - map is the product
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { shallow } from "zustand/shallow";
import { useMapStateStore } from "@/store/mapStateStore";
import ExploreRebuilt from "./ExploreRebuilt";

export default function Events() {
  const navigate = useNavigate();
  const [
    reset,
    setViewMode,
    updateFilter,
    setShowResultsList,
  ] = useMapStateStore(
    (state) => [
      state.reset,
      state.setViewMode,
      state.updateFilter,
      state.setShowResultsList,
    ],
    shallow
  );

  useEffect(() => {
    // Set up for events-focused view
    reset();
    setViewMode("events");
    updateFilter("entityTypes", new Set(["event"]));
    // Keep results collapsed - user taps pins to see events
    setShowResultsList(false);
  }, [reset, setViewMode, updateFilter, setShowResultsList]);

  return <ExploreRebuilt />;
}
