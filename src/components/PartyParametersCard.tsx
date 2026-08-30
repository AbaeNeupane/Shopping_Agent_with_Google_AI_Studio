import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Palette, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Check, 
  X,
  Plus
} from 'lucide-react';
import { PartyDetails } from '../types';
import { COMMON_DIETARY_OPTIONS, COMMON_THEMES } from '../data/presets';

interface PartyParametersCardProps {
  partyDetails: PartyDetails;
  onUpdatePartyDetails: (updated: Partial<PartyDetails>) => void;
  onTriggerGenerate: () => void;
  isGenerating?: boolean;
}

export const PartyParametersCard: React.FC<PartyParametersCardProps> = ({
  partyDetails,
  onUpdatePartyDetails,
  onTriggerGenerate,
  isGenerating = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<PartyDetails>(partyDetails);
  const [customDiet, setCustomDiet] = useState('');

  // Keep form in sync when parent state changes and not currently editing
  React.useEffect(() => {
    if (!isEditing) {
      setEditForm(partyDetails);
    }
  }, [partyDetails, isEditing]);

  const handleSave = () => {
    onUpdatePartyDetails(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(partyDetails);
    setIsEditing(false);
  };

  const toggleDietary = (item: string) => {
    const current = editForm.dietaryRestrictions || [];
    if (current.includes(item)) {
      setEditForm({
        ...editForm,
        dietaryRestrictions: current.filter(d => d !== item)
      });
    } else {
      setEditForm({
        ...editForm,
        dietaryRestrictions: [...current.filter(d => d !== "None"), item]
      });
    }
  };

  const addCustomDiet = () => {
    if (!customDiet.trim()) return;
    const current = editForm.dietaryRestrictions || [];
    if (!current.includes(customDiet.trim())) {
      setEditForm({
        ...editForm,
        dietaryRestrictions: [...current.filter(d => d !== "None"), customDiet.trim()]
      });
    }
    setCustomDiet('');
  };

  // Count filled parameters
  const fields = [
    { key: 'partyType', label: 'Party Type', val: partyDetails.partyType },
    { key: 'guestCount', label: 'Guests', val: partyDetails.guestCount },
    { key: 'date', label: 'Date', val: partyDetails.date },
    { key: 'theme', label: 'Theme', val: partyDetails.theme },
    { key: 'budget', label: 'Budget', val: partyDetails.budget },
    { key: 'dietaryRestrictions', label: 'Dietary', val: partyDetails.dietaryRestrictions?.length ? partyDetails.dietaryRestrictions.join(', ') : null },
    { key: 'specialRequests', label: 'Requests', val: partyDetails.specialRequests },
  ];

  const filledCount = fields.filter(f => f.val !== null && f.val !== '' && f.val !== undefined).length;
  const isReady = filledCount >= 4;

  return (
    <div className="space-y-4">
      {/* Parameters Header / Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Party Planning Specs</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            filledCount === 7 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : filledCount >= 4 
              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            {filledCount}/7 Details Set
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Edit Specs
            </button>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-2xs transition-colors"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Done
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid layout for specs & restrictions */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Bento Card 1: Party Specs */}
          <section className="md:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Party Specs</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              </h2>
              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 text-sm">Theme</span>
                  <span className="text-slate-800 text-sm font-semibold truncate max-w-[200px]">
                    {partyDetails.theme || <span className="text-slate-400 font-normal italic">Awaiting theme</span>}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 text-sm">Guests</span>
                  <span className="text-slate-800 text-sm font-semibold">
                    {partyDetails.guestCount ? `${partyDetails.guestCount} Guests` : <span className="text-slate-400 font-normal italic">Awaiting count</span>}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 text-sm">Target Budget</span>
                  <span className="text-slate-800 text-sm font-semibold font-mono text-indigo-600">
                    {partyDetails.budget ? `$${partyDetails.budget} USD` : <span className="text-slate-400 font-normal italic">Awaiting budget</span>}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 text-sm">Date</span>
                  <span className="text-slate-800 text-sm font-semibold">
                    {partyDetails.date || <span className="text-slate-400 font-normal italic">Awaiting date</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Party Type</span>
                  <span className="text-slate-800 text-sm font-semibold">
                    {partyDetails.partyType || <span className="text-slate-400 font-normal italic">Awaiting input</span>}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Bento Card 2: Restrictions & Requests */}
          <section className="md:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Restrictions & Requests</span>
                <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-2xs font-semibold text-slate-400 uppercase mb-1.5">Dietary Accommodations</div>
                  <div className="flex flex-wrap gap-2">
                    {partyDetails.dietaryRestrictions && partyDetails.dietaryRestrictions.length > 0 ? (
                      partyDetails.dietaryRestrictions.map((d, i) => {
                        const isNut = d.toLowerCase().includes('nut') || d.toLowerCase().includes('peanut');
                        const isGluten = d.toLowerCase().includes('gluten') || d.toLowerCase().includes('gf') || d.toLowerCase().includes('celiac');
                        const isVegan = d.toLowerCase().includes('vegan') || d.toLowerCase().includes('veg');
                        const isDairy = d.toLowerCase().includes('dairy') || d.toLowerCase().includes('lactose');

                        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                        if (isNut) badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
                        else if (isGluten) badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        else if (isVegan) badgeColor = 'bg-green-50 text-green-700 border-green-200';
                        else if (isDairy) badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';

                        return (
                          <span key={i} className={`text-xs px-2.5 py-1 rounded-md font-medium border ${badgeColor}`}>
                            {d}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">No dietary restrictions noted</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="text-2xs font-semibold text-slate-400 uppercase mb-1">Host Special Notes</div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic leading-relaxed">
                    {partyDetails.specialRequests || "+ Request: Standard party setup (drinks, finger food, tableware)"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-2xs text-slate-400">
                {filledCount >= 4 ? "✓ Sizing algorithms ready" : "Awaiting key specs"}
              </div>
              <button
                onClick={onTriggerGenerate}
                disabled={isGenerating}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs flex items-center disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 mr-1 text-indigo-200" />
                {isGenerating ? "Calculating..." : "Sync Shopping List"}
              </button>
            </div>
          </section>
        </div>
      ) : (
        /* Edit Form Bento Box */
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Edit Party Parameters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Party Type</label>
              <input
                type="text"
                value={editForm.partyType}
                onChange={(e) => setEditForm({ ...editForm, partyType: e.target.value })}
                placeholder="e.g. Birthday Party, BBQ, Cocktail Night"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Guests</label>
              <input
                type="number"
                min="1"
                max="500"
                value={editForm.guestCount || ''}
                onChange={(e) => setEditForm({ ...editForm, guestCount: e.target.value ? parseInt(e.target.value, 10) : null })}
                placeholder="e.g. 15"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Budget ($ USD)</label>
              <input
                type="number"
                min="10"
                step="5"
                value={editForm.budget || ''}
                onChange={(e) => setEditForm({ ...editForm, budget: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 150"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="text"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                placeholder="e.g. This Saturday, Oct 15"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Party Theme</label>
              <input
                type="text"
                value={editForm.theme}
                onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })}
                placeholder="e.g. Outer Space, Tropical Luau, Backyard BBQ"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dietary Restrictions</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_DIETARY_OPTIONS.map((item) => {
                const active = editForm.dietaryRestrictions?.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleDietary(item)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{item}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2 max-w-sm">
              <input
                type="text"
                value={customDiet}
                onChange={(e) => setCustomDiet(e.target.value)}
                placeholder="Add custom restriction..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomDiet();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomDiet}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requests</label>
            <textarea
              rows={2}
              value={editForm.specialRequests}
              onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
              placeholder="e.g. Bio-degradable plates, glowing decor, signature mocktail"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
        </div>
      )}
    </div>
  );
};
