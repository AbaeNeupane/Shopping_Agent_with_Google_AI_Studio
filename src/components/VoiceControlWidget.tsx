import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Radio, HelpCircle, ChevronUp, ChevronDown, Check } from 'lucide-react';

interface VoiceControlWidgetProps {
  isSupported: boolean;
  isListening: boolean;
  isHandsFree: boolean;
  isSpeaking: boolean;
  isTtsEnabled: boolean;
  transcript: string;
  interimTranscript: string;
  voiceStatus: string;
  onToggleListening: () => void;
  onToggleHandsFree: () => void;
  onToggleTts: () => void;
  onStopSpeaking: () => void;
}

export const VoiceControlWidget: React.FC<VoiceControlWidgetProps> = ({
  isSupported,
  isListening,
  isHandsFree,
  isSpeaking,
  isTtsEnabled,
  transcript,
  interimTranscript,
  voiceStatus,
  onToggleListening,
  onToggleHandsFree,
  onToggleTts,
  onStopSpeaking,
}) => {
  const [showCommands, setShowCommands] = React.useState<boolean>(false);

  if (!isSupported) {
    return null;
  }

  const activeTranscript = interimTranscript || transcript;

  return (
    <div className="bg-stone-900 border border-amber-500/20 rounded-2xl p-3.5 shadow-lg text-stone-100 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Status & Voice wave animation */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleListening}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 ${
              isListening
                ? 'bg-red-500 text-white ring-4 ring-red-500/30 animate-pulse'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700'
            }`}
            title={isListening ? "Microphone active - Click to pause" : "Click to speak with Party Concierge"}
          >
            {isListening ? (
              <Radio className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Mic className="w-5 h-5 text-amber-300" />
            )}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full ring-2 ring-stone-900 animate-ping" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-stone-100 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Hands-Free Voice Control
              </span>
              {isListening && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1 animate-pulse" />
                  Live Mic Active
                </span>
              )}
              {isSpeaking && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Volume2 className="w-3 h-3 mr-1 animate-bounce" />
                  Speaking...
                </span>
              )}
            </div>

            {/* Audio Wave Visualizer Bars when listening */}
            {isListening ? (
              <div className="flex items-center space-x-1 mt-1">
                <div className="flex items-center space-x-0.5 h-3">
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out_0.1s] h-3" />
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out_0.2s] h-4" />
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out_0.3s] h-2" />
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out_0.15s] h-4" />
                  <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out_0.25s] h-2.5" />
                </div>
                <p className="text-2xs text-amber-300/90 font-medium truncate ml-1.5">
                  {activeTranscript ? `"${activeTranscript}"` : "Listening for party details or commands..."}
                </p>
              </div>
            ) : (
              <p className="text-2xs text-stone-400 truncate">
                {activeTranscript ? `Last heard: "${activeTranscript}"` : "Click mic or toggle Continuous Hands-Free to talk"}
              </p>
            )}
          </div>
        </div>

        {/* Right: Controls (Continuous toggle, TTS readout toggle, Commands cheat sheet) */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Continuous Hands-Free Toggle */}
          <button
            onClick={onToggleHandsFree}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center transition-all shadow-2xs active:scale-95 ${
              isHandsFree
                ? 'bg-amber-400 text-stone-950 font-bold border border-amber-300'
                : 'bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700'
            }`}
            title="Continuous voice recognition that stays on hands-free"
          >
            <Radio className={`w-3.5 h-3.5 mr-1.5 ${isHandsFree ? 'text-stone-950 animate-pulse' : 'text-stone-400'}`} />
            <span>Continuous Hands-Free</span>
            {isHandsFree && <Check className="w-3.5 h-3.5 ml-1 text-stone-950 stroke-[3]" />}
          </button>

          {/* Text-To-Speech Agent Voice Toggle */}
          <button
            onClick={isSpeaking ? onStopSpeaking : onToggleTts}
            className={`p-2 rounded-xl text-xs font-medium border transition-all active:scale-95 ${
              isSpeaking
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                : isTtsEnabled
                ? 'bg-stone-800 text-amber-300 border-stone-700 hover:bg-stone-700'
                : 'bg-stone-800/60 text-stone-500 border-stone-800 hover:text-stone-400'
            }`}
            title={isSpeaking ? "Click to stop agent voice" : isTtsEnabled ? "Voice responses ON (Click to mute)" : "Voice responses MUTED (Click to unmute)"}
          >
            {isSpeaking ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : isTtsEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {/* Voice Commands Cheat Sheet Toggle */}
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="p-2 rounded-xl text-xs font-medium bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700 hover:bg-stone-700 transition-all"
            title="View Hands-Free Voice Commands"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Voice Commands Guide */}
      {showCommands && (
        <div className="mt-3 pt-3 border-t border-stone-800 text-2xs space-y-2 text-stone-300 animate-fadeIn">
          <div className="font-bold text-amber-300 uppercase tracking-wider text-3xs">
            Hands-Free Voice Phrases & Shortcuts:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-stone-800/70 border border-stone-700/60">
              <span className="font-bold text-amber-200 block">"Plan a Kids Superhero Party for 15 guests with $150 budget"</span>
              <span className="text-stone-400 text-3xs">Gathers parameters and auto-generates age-appropriate supplies</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-800/70 border border-stone-700/60">
              <span className="font-bold text-amber-200 block">"Generate plan" or "Create shopping list"</span>
              <span className="text-stone-400 text-3xs">Instantly calculates portions and builds CymbalMart cart</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-800/70 border border-stone-700/60">
              <span className="font-bold text-amber-200 block">"Show shopping list" / "Show chat"</span>
              <span className="text-stone-400 text-3xs">Switches between full interactive list and concierge chat</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-800/70 border border-stone-700/60">
              <span className="font-bold text-amber-200 block">"In-store mode" / "Walk the aisles"</span>
              <span className="text-stone-400 text-3xs">Launches sequential aisle-by-aisle shopping checklist</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-800/70 border border-stone-700/60">
              <span className="font-bold text-amber-200 block">"Add more finger foods" or "Make it cheaper"</span>
              <span className="text-stone-400 text-3xs">Asks concierge to refine items and re-balance budget</span>
            </div>
            <div className="p-2 rounded-lg bg-stone-800/70 border border-stone-700/60">
              <span className="font-bold text-amber-200 block">"Stop listening" or "Mute microphone"</span>
              <span className="text-stone-400 text-3xs">Pauses continuous voice recognition</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
