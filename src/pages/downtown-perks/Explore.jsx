import React, { useEffect } from "react";
import ExploreRebuilt from "./ExploreRebuilt";
import { shallow } from "zustand/shallow";
import { useMapStateStore } from "@/store/mapStateStore";

export default function Explore() {
  const [reset, setViewMode, setShowResultsList, setShowMapOnly] = useMapStateStore(
    (state) => [
      state.reset,
      state.setViewMode,
      state.setShowResultsList,
      state.setShowMapOnly,
    ],
    shallow
  );

  useEffect(() => {
    reset();
    setViewMode("explore");
    setShowResultsList(true);
    setShowMapOnly(false);
  }, [reset, setViewMode, setShowResultsList, setShowMapOnly]);

  return <ExploreRebuilt />;
}
