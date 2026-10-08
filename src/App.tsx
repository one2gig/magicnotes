import { useEffect, useState } from "react";
import { EnvironmentBackdrop } from "./components/EnvironmentBackdrop";
import { PlayStage } from "./components/PlayStage";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { usePreferences } from "./hooks/usePreferences";

export default function App() {
  const preferences = usePreferences();
  const audio = useAudioEngine();
  const { sync } = audio;
  const [screen, setScreen] = useState<"welcome" | "play">("welcome");

  useEffect(() => {
    sync(preferences.prefs.instrument, preferences.prefs.volume, preferences.prefs.muted);
  }, [sync, preferences.prefs.instrument, preferences.prefs.volume, preferences.prefs.muted]);

  return (
    <main className="relative h-svh overflow-hidden">
      <EnvironmentBackdrop id={screen === "welcome" ? "dream" : preferences.prefs.environment} />
      {screen === "welcome" ? (
        <WelcomeScreen
          onStart={() => {
            audio.unlock();
            setScreen("play");
          }}
        />
      ) : (
        <PlayStage preferences={preferences} audio={audio} />
      )}
    </main>
  );
}
