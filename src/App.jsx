import React, { useState, useRef } from "react";

const audioFiles = import.meta.glob("./assets/sounds/*.mp3", { eager: true });
const sounds = Object.entries(audioFiles).map(([path, module]) => ({
  name: path.split("/").pop().replace(".mp3", "").replace(/-/g, " "),
  url: module.default,
}));

/**
 * A component that renders a row of wave bars.
 * The wave bars are styled to represent sound waves.
 * The `active` prop determines whether the wave bars are animated or not.
 * If `active` is `true`, the wave bars will pulse up and down.
 * If `active` is `false`, the wave bars will be static.
 *
 * @param {Object} props
 * @param {boolean} props.active - Whether the wave bars should be animated or not.
 */
function WaveBars({ active }) {
  return (
    <div className="flex items-end gap-0.75 h-5">
      {[0.5, 0.9, 0.6, 1, 0.7, 0.85, 0.4].map((h, i) => (
        <div
          key={i}
          className={`w-0.75 rounded-full transition-all duration-300 ${active ? "bg-white" : "bg-white/20"}`}
          style={{
            height: active ? `${h * 100}%` : "30%",
            animation: active
              ? `wavePulse 0.8s ease-in-out infinite alternate`
              : "none",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * A hook that returns an array of ripple objects and a trigger function.
 * The ripple objects represent the position and ID of a ripple.
 * The trigger function is used to create a new ripple object when called.
 * The ripple objects are automatically removed from the array after 600ms.
 *
 * @returns {[Object[], Function]} An array of ripple objects and a trigger function.
 */
function useRipple() {
  const [ripples, setRipples] = useState([]);
  /**
   * Trigger a new ripple object to be added to the array.
   * The ripple object will be automatically removed from the array after 600ms.
   * @param {MouseEvent} e - The event that triggered the ripple.
   */
  const trigger = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { x, y, id }]);
    setTimeout(() => setRipples((r) => r.filter((rip) => rip.id !== id)), 600);
  };
  return [ripples, trigger];
}

/**
 * A SoundCard component that represents an individual sound.
 * It can be clicked to play the associated sound and trigger a ripple effect.
 * The component also displays a wave bar animation when active.
 * @param {Object} sound - An object that contains the name and URL of the sound.
 * @param {boolean} isActive - A boolean that determines if the sound card is active.
 * @param {function} onPlay - A function that is called when the sound card is clicked.
 */
function SoundCard({ sound, isActive, onPlay }) {
  const [ripples, triggerRipple] = useRipple();

  /**
   * Handles a click event on the sound card.
   * Triggers a ripple effect and plays the associated sound.
   * @param {MouseEvent} e - The event that triggered the click.
   */
  const handleClick = (e) => {
    triggerRipple(e);
    onPlay(sound.name, sound.url);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative group overflow-hidden rounded-2xl text-left w-full
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
        ${isActive ? "scale-[1.02]" : "hover:scale-[1.02]"}
      `}
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(99,102,241,0.6) 0%, rgba(139,92,246,0.5) 100%)"
          : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: isActive
          ? "1px solid rgba(165,180,252,0.4)"
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: isActive
          ? "0 8px 32px rgba(99,102,241,0.45)"
          : "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {ripples.map((rip) => (
        <span
          key={rip.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{
            left: rip.x - 20,
            top: rip.y - 20,
            width: 40,
            height: 40,
            animation: "rippleOut 0.6s ease-out forwards",
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
        }}
      />

      {isActive && (
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-indigo-400/30 blur-2xl pointer-events-none" />
      )}

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
            }`}
            style={
              isActive ? { boxShadow: "0 0 12px rgba(255,255,255,0.2)" } : {}
            }
          >
            {isActive ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="3" height="10" rx="1" fill="white" />
                <rect x="9" y="2" width="3" height="10" rx="1" fill="white" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 2l9 5-9 5V2z" fill="rgba(255,255,255,0.7)" />
              </svg>
            )}
          </div>
          <WaveBars active={isActive} />
        </div>

        <div
          className={`text-sm font-semibold capitalize leading-tight transition-colors truncate ${
            isActive ? "text-white" : "text-white/70 group-hover:text-white"
          }`}
          title={sound.name}
        >
          {sound.name}
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-indigo-300 transition-all duration-300 ${
          isActive ? "w-1/2 opacity-100" : "w-0 opacity-0"
        }`}
      />
    </button>
  );
}

/**
 * The main App component.
 * Renders the entire application, including the nav bar, search input, volume slider, stop all button, and grid of sound cards.
 * @constructor
 * @returns {JSX.Element} The rendered App component
 */
export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [volume, setVolume] = useState(1);
  const [playingSounds, setPlayingSounds] = useState(new Set());
  const audioRefs = useRef(new Map());

  const activeCount = playingSounds.size;

  /**
   * Plays a sound with the given name and url.
   * If a sound with the same name is already playing, it will be paused and removed from the set of playing sounds.
   * If not already playing, a new Audio object will be created with the given url and volume, and will be played.
   * When the sound has finished playing, it will be removed from the set of playing sounds.
   * @param {string} name - The name of the sound to play
   * @param {string} url - The url of the sound to play
   */
  const playSound = (name, url) => {
    if (audioRefs.current.has(name)) {
      audioRefs.current.get(name).pause();
      audioRefs.current.delete(name);
      setPlayingSounds((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      return;
    }

    const audio = new Audio(url);
    audio.volume = volume;
    audioRefs.current.set(name, audio);
    setPlayingSounds((prev) => new Set(prev).add(name));
    audio.play();

    /**
     * Event handler for when a sound has finished playing.
     * Removes the sound from the set of playing sounds and from the map of audio references.
     */
    audio.onended = () => {
      setPlayingSounds((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      audioRefs.current.delete(name);
    };
  };

  /**
   * Stops all currently playing sounds and removes them from the set of playing sounds and from the map of audio references.
   */
  const stopAll = () => {
    audioRefs.current.forEach((a) => a.pause());
    audioRefs.current.clear();
    setPlayingSounds(new Set());
  };

  const filteredSounds = sounds.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #060611; margin: 0; }
        .font-display { font-family: 'Syne', sans-serif; }

        @keyframes wavePulse {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rippleOut {
          to { transform: scale(6); opacity: 0; }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(40px,-30px) scale(1.1); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-30px,40px) scale(0.9); }
        }
        .card-enter { animation: fadeUp 0.4s ease both; }

        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .glass-input {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 0.2s, box-shadow 0.2s;
          color: rgba(255,255,255,0.8);
        }
        .glass-input::placeholder { color: rgba(255,255,255,0.2); }
        .glass-input:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          outline: none;
        }
        .vol-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 999px;
          cursor: pointer;
        }
        .vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 10px rgba(99,102,241,0.7);
          cursor: pointer;
          transition: transform 0.15s;
        }
        .vol-slider::-webkit-slider-thumb:hover { transform: scale(1.25); }
        .vol-slider::-moz-range-thumb {
          width: 16px; height: 16px; border: none;
          border-radius: 50%; background: white;
          box-shadow: 0 0 10px rgba(99,102,241,0.7);
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
      `}</style>

      <div className="min-h-screen relative" style={{ background: "#060611" }}>
        {/* Ambient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
              filter: "blur(80px)",
              animation: "orb1 12s ease-in-out infinite",
            }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
              filter: "blur(80px)",
              animation: "orb2 15s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full opacity-8"
            style={{
              background:
                "radial-gradient(circle, #0ea5e9 0%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* NAV */}
          <nav className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Brand */}
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    boxShadow:
                      "0 0 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18V5l12-2v13"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="6"
                      cy="18"
                      r="3"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="16"
                      r="3"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-white leading-none tracking-tight">
                    My<span style={{ color: "#818cf8" }}>SB</span>
                  </h1>
                  <div
                    className="text-[10px] mt-0.5 font-medium transition-all"
                    style={{
                      color:
                        activeCount > 0 ? "#a5b4fc" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {activeCount > 0
                      ? `${activeCount} playing`
                      : `${sounds.length} sounds`}
                  </div>
                </div>
              </div>

              <div
                className="hidden sm:block w-px h-8 shrink-0"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />

              {/* Controls row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="m21 21-4.35-4.35"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search sounds..."
                    className="glass-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Volume */}
                <div className="glass-input flex items-center gap-3 rounded-xl px-4 py-2.5 shrink-0">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
                  >
                    <polygon
                      points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15.54 8.46a5 5 0 0 1 0 7.07"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19.07 4.93a10 10 0 0 1 0 14.14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="vol-slider w-24 sm:w-28"
                    style={{
                      backgroundImage: `linear-gradient(to right, #6366f1 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                    }}
                  />
                  <span
                    className="text-[11px] font-semibold tabular-nums shrink-0 w-7 text-right"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {Math.round(volume * 100)}
                  </span>
                </div>

                {/* Stop all */}
                <button
                  onClick={stopAll}
                  className="relative overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 shrink-0"
                  style={{
                    background:
                      activeCount > 0
                        ? "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(220,38,38,0.2))"
                        : "rgba(255,255,255,0.06)",
                    border:
                      activeCount > 0
                        ? "1px solid rgba(248,113,113,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                    color:
                      activeCount > 0 ? "#fca5a5" : "rgba(255,255,255,0.3)",
                    cursor: activeCount > 0 ? "pointer" : "default",
                  }}
                >
                  {activeCount > 0 ? `Stop all (${activeCount})` : "Stop all"}
                </button>
              </div>
            </div>
          </nav>

          {/* Count strip */}
          {filteredSounds.length > 0 && (
            <div className="flex items-center gap-3 mb-5 px-1">
              <span
                className="text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {filteredSounds.length} sound
                {filteredSounds.length !== 1 ? "s" : ""}
                {searchTerm && ` for "${searchTerm}"`}
              </span>
              {activeCount > 0 && (
                <>
                  <div
                    className="w-px h-3"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: "#a5b4fc" }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#818cf8",
                        boxShadow: "0 0 6px #6366f1",
                        animation:
                          "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                      }}
                    />
                    {activeCount} active
                  </div>
                </>
              )}
            </div>
          )}

          {/* GRID */}
          {filteredSounds.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
              {filteredSounds.map((sound, i) => (
                <div
                  key={sound.name}
                  className="card-enter"
                  style={{ animationDelay: `${Math.min(i * 0.035, 0.5)}s` }}
                >
                  <SoundCard
                    sound={sound}
                    isActive={playingSounds.has(sound.name)}
                    onPlay={playSound}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div
                className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ color: "rgba(255,255,255,0.2)" }}
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="m21 21-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p
                className="font-display text-lg font-semibold mb-1"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                No sounds found
              </p>
              <p
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.12)" }}
              >
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
