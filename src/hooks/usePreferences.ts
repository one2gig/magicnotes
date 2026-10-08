import { useCallback, useEffect, useState } from "react";
import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
  type Preferences,
} from "../config/preferences";

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(() => loadPreferences());

  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((current) => ({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setPrefs(defaultPreferences);
  }, []);

  return { prefs, update, reset };
}
