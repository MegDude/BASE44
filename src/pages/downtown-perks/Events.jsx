import React, { useEffect } from "react";
import ExploreRebuilt from "./ExploreRebuilt";
import { shallow } from "zustand/shallow";
import { useMapStateStore } from "@/store/mapStateStore";

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
    updateFilter("entityTypes", new Set(["event"]));
    setShowResultsList(true);
    setShowMapOnly(false);
  }, [reset, setViewMode, updateFilter, setShowResultsList, setShowMapOnly]);

  return <ExploreRebuilt />;
}
