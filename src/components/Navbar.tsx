import React from 'react';
import { ShoppingBag, Sparkles, Store, RotateCcw, ListChecks, Calendar, Users, DollarSign } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm ring-2 ring-indigo-500/20">
              C
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center">
                CymbalMart <span className="font-light text-slate-400 ml-1.5 hidden xs:inline">| Party Planner Agent</span>
              </h1>
              <p className="text-2xs text-slate-500 hidden sm:block">Bento-powered grocery & party supply engine</p>
            </div>
          </div>

          {/* Center Summary Pills (if details populated) */}
          <div className="flex items-center gap-3 text-sm font-medium">
            {partyDetails.partyType ? (
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-slate-400 text-xs">Shopping for:</span>
                <span className="bg-white px-3 py-1 rounded-full border border-slate-200 text-indigo-600 shadow-2xs text-xs font-semibold flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                  {partyDetails.partyType}
                  {partyDetails.guestCount && <span className="text-slate-500 font-normal ml-1">({partyDetails.guestCount} guests)</span>}
                </span>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenPresets}
                className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
                title="Browse popular party templates"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                <span className="hidden xs:inline">Quick</span> Templates
              </button>

              {currentPlan && onToggleInStoreMode && (
                <button
                  onClick={onToggleInStoreMode}
                  className={`inline-flex items-center px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors border ${
                    isInStoreMode
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                      : 'bg-white text-indigo-600 border-slate-200 hover:bg-indigo-50 shadow-2xs'
                  }`}
                  title="Aisle-by-aisle shopping mode"
                >
                  <Store className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  <span>In-Store Mode</span>
                </button>
              )}

              <button
                onClick={onReset}
                className="p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors flex items-center border border-transparent hover:border-slate-200"
                title="Start a new party plan"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">New Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
