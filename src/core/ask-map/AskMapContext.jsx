import { createContext, useContext } from "react";

export const AskMapContext = createContext(null);

export function useAskMap() {
  const context = useContext(AskMapContext);
  if (!context) {
    throw new Error("useAskMap must be used inside AskMapProvider");
  }
  return context;
}
