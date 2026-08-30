import React from 'react';
import { X, Sparkles, Flame, Shield, Gamepad2, GlassWater, Users, DollarSign, ArrowRight } from 'lucide-react';
import { PARTY_PRESETS } from '../data/presets';
import { QuickTheme, PartyDetails } from '../types';

interface QuickPresetsModalProps {
  onClose: () => void;
  onSelectPreset: (preset: QuickTheme) => void;
}

export const QuickPresetsModal: React.FC<QuickPresetsModalProps> = ({
  onClose,
  onSelectPreset,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Shield': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-purple-500" />;
      case 'GlassWater': return <GlassWater className="w-5 h-5 text-teal-500" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100">Popular Party Templates</h3>
              <p className="text-2xs text-slate-400">Pick a pre-configured template or customize freely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          {PARTY_PRESETS.map((preset) => (
            <div
              key={preset.name}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center shrink-0 border border-slate-200/80 transition-colors">
                    {getIcon(preset.iconName)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-900 transition-colors flex items-center">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {preset.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-2xs">
                      <span className="inline-flex items-center font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                        <Users className="w-3 h-3 mr-1 text-slate-500" />
                        {preset.defaultGuests} Guests
                      </span>
                      <span className="inline-flex items-center font-bold font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        <DollarSign className="w-3 h-3 mr-0.5 text-indigo-600" />
                        ${preset.defaultBudget} Budget
                      </span>
                      {preset.dietarySuggestions.map(d => (
                        <span key={d} className="inline-flex items-center font-medium bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center text-indigo-600 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                  Select <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          Selecting a template automatically loads all 7 party parameters and starts the planner.
        </div>
      </div>
    </div>
  );
};
