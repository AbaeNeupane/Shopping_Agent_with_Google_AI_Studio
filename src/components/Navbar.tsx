import React from 'react';
import { Sparkles, Store, RotateCcw, PartyPopper, ChevronRight, SlidersHorizontal, BookOpen } from 'lucide-react';
import { PartyDetails, ShoppingPlan } from '../types';

interface NavbarProps {
  partyDetails: PartyDetails;
  currentPlan: ShoppingPlan | null;
  onReset: () => void;
  onOpenPresets: () => void;
  onToggleInStoreMode?: () => void;
  isInStoreMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  partyDetails,
  currentPlan,
  onReset,
  onOpenPresets,
  onToggleInStoreMode,
  isInStoreMode = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/85 backdrop-blur-xl border-b border-stone-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Editorial Title */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 flex items-center justify-center text-amber-300 font-bold text-lg shadow-md ring-1 ring-amber-400/30 transition-transform group-hover:scale-105">
                <PartyPopper className="w-5 h-5 text-amber-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#FAF9F6]" title="AI Concierge Active" />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif-luxury">
                  Cymbal<span className="text-amber-700 italic font-normal">Mart</span>
                </h1>
                <span className="hidden sm:inline-block text-3xs uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/80">
                  Party Concierge
                </span>
              </div>
              <p className="text-2xs text-stone-500 font-medium hidden sm:block">
                Bespoke event planning, guest-scaled math & supermarket logistics
              </p>
            </div>
          </div>

          {/* Center Summary Pills (if details populated) */}
          <div className="flex items-center gap-3">
            {partyDetails.partyType ? (
              <div className="hidden lg:flex items-center space-x-2 bg-stone-100/80 px-3.5 py-1.5 rounded-full border border-stone-200/70 shadow-2xs">
                <span className="text-stone-400 text-2xs font-medium uppercase tracking-wider">Curating:</span>
                <span className="text-stone-900 text-xs font-semibold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                  {partyDetails.partyType}
                  {partyDetails.guestCount && (
                    <span className="text-stone-500 font-normal ml-1.5 pl-1.5 border-l border-stone-300">
                      {partyDetails.guestCount} guests
                    </span>
                  )}
                  {partyDetails.budget && (
                    <span className="text-emerald-700 font-mono-num font-medium ml-1.5 pl-1.5 border-l border-stone-300">
                      ${partyDetails.budget}
                    </span>
                  )}
                </span>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenPresets}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl text-stone-700 bg-white hover:bg-stone-50 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all hover:border-stone-300 active:scale-98"
                title="Browse curated party themes"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                <span>Theme Templates</span>
              </button>

              {currentPlan && onToggleInStoreMode && (
                <button
                  onClick={onToggleInStoreMode}
                  className={`inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl transition-all border shadow-2xs active:scale-98 ${
                    isInStoreMode
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                      : 'bg-white text-stone-800 border-stone-200/90 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                  title="Aisle-by-aisle shopping mode"
                >
                  <Store className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  <span>In-Store Walk</span>
                </button>
              )}

              <button
                onClick={onReset}
                className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors flex items-center border border-transparent hover:border-stone-200 active:scale-98"
                title="Start a fresh party plan"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:mr-1.5 text-stone-400" />
                <span className="hidden sm:inline">New Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
