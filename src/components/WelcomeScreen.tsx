import { Bell, Camera, Cloud, Music, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
}

const assurances = [
  { icon: Sparkles, text: "No account needed" },
  { icon: Music, text: "Works in your browser" },
  { icon: Camera, text: "Your camera stays on your device" },
];

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative z-10 flex min-h-svh items-center justify-center p-5">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass w-full max-w-md rounded-[32px] px-8 py-9 text-center"
      >
        <h1 className="font-display text-4xl text-ink sm:text-5xl">
          Little Melodies <Sparkles className="mb-1 inline size-6 text-lavender-deep" />
        </h1>
        <p className="mt-2 text-lg text-lavender-deep">Music at your fingertips</p>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-ink/80">
          Lower a finger to play its note, then lift it to play again. No experience needed. Just your hands and a little creativity.
        </p>
        <Button className="mt-7 w-full" size="lg" onClick={onStart}>
          <Camera className="size-4" />
          Start Playing
        </Button>
        <ul className="mt-6 space-y-2 text-left text-sm text-ink/75">
          {assurances.map((item) => (
            <li key={item.text} className="flex items-center gap-2">
              <item.icon className="size-4 text-lavender-deep" />
              {item.text}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-center gap-4 text-lavender-deep/70" aria-hidden="true">
          <Bell className="size-4" />
          <Cloud className="size-4" />
          <Music className="size-4" />
        </div>
      </motion.section>
    </div>
  );
}
