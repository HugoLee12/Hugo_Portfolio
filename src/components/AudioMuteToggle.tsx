import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { audioManager } from "../lib/audio";

export function AudioMuteToggle() {
  const [isMuted, setIsMuted] = useState(() => audioManager.isMuted());
  const Icon = isMuted ? VolumeX : Volume2;

  useEffect(() => audioManager.subscribeMuted(setIsMuted), []);

  return (
    <button
      type="button"
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      aria-pressed={isMuted}
      onClick={() => {
        setIsMuted(audioManager.toggleMuted());
      }}
      className="fixed bottom-4 right-4 z-[130] flex h-10 items-center gap-2 rounded-md border border-[#76D6CB]/25 bg-[#050816]/75 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#D7DAE2] shadow-[0_0_24px_rgba(118,214,203,0.12)] backdrop-blur-md transition-colors hover:border-[#76D6CB]/50 hover:bg-[#080b14]/90"
    >
      <Icon className="h-4 w-4 text-[#76D6CB]" aria-hidden="true" />
      <span>{isMuted ? "Audio Off" : "Audio On"}</span>
    </button>
  );
}
