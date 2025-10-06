import React, { createContext, useContext, useState } from "react";

export type Vibe = "instagrammable" | "nature" | "city" | "foodie" | "art" | "nightlife";

export type Prefs = {
  vibe: Vibe;
  travelMode: "drive" | "fly";
  outOfState: boolean;
  driveMinutes?: number;  // e.g., 30–240
  flyHours?: number;      // e.g., 1–6
};

type Ctx = { prefs?: Prefs; setPrefs: (p: Prefs) => void };
const PrefsCtx = createContext<Ctx>({ setPrefs: () => {} });

export const PrefsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [prefs, setPrefs] = useState<Prefs>();
  return <PrefsCtx.Provider value={{ prefs, setPrefs }}>{children}</PrefsCtx.Provider>;
};

export const usePrefs = () => useContext(PrefsCtx);
