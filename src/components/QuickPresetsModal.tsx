import React from 'react';
import { X, Sparkles, Flame, Shield, Gamepad2, GlassWater, Users, DollarSign, ArrowRight } from 'lucide-react';
import { PARTY_PRESETS } from '../data/presets';
import { QuickTheme } from '../types';

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
      default: return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white p-5 sm:px-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-100 font-serif-luxury">Curated Event Blueprints</h3>
              <p className="text-2xs text-stone-300">Select an atelier theme to instantly configure the 7 parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 bg-[#FAF9F6] custom-scrollbar">
          {PARTY_PRESETS.map((preset) => (
            <div
              key={preset.name}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-500/80 hover:shadow-md transition-all cursor-pointer group active:scale-99"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-stone-50 group-hover:bg-amber-50 flex items-center justify-center shrink-0 border border-stone-200/70 transition-colors">
                    {getIcon(preset.iconName)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-900 transition-colors flex items-center font-serif-luxury">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      {preset.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5 text-2xs">
                      <span className="inline-flex items-center font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md">
                        <Users className="w-3 h-3 mr-1 text-stone-400" />
                        {preset.defaultGuests} Guests
                      </span>
                      <span className="inline-flex items-center font-bold font-mono-num bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        <DollarSign className="w-3 h-3 mr-0.5 text-emerald-600" />
                        ${preset.defaultBudget} Budget
                      </span>
                      {preset.dietarySuggestions.map(d => (
                        <span key={d} className="inline-flex items-center font-medium bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/70">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center text-amber-700 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                  Launch <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-stone-200 text-center text-2xs text-stone-500 font-medium">
          Selecting a blueprint pre-populates the 7 parameters and automatically calculates scaled quantities.
        </div>
      </div>
    </div>
  );
};
