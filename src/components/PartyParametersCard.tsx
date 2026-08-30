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
  Edit3, 
  Check, 
  X,
  Plus,
  Sliders,
  Utensils,
  PartyPopper
} from 'lucide-react';
import { PartyDetails } from '../types';
import { COMMON_DIETARY_OPTIONS, COMMON_PARTY_TYPES, COMMON_THEMES } from '../data/presets';

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
  const isAllDefined = filledCount === 7;

  return (
    <div className="space-y-3">
      {/* Parameters Header / Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2.5">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
            Event Blueprint (7 Factors)
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold font-mono-num ${
            isAllDefined 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : filledCount >= 4 
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}>
            {filledCount} of 7 Defined
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs hover:shadow-xs transition-all active:scale-98"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
              Edit Blueprint
            </button>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3.5 py-1 text-xs font-semibold rounded-lg text-white bg-stone-900 hover:bg-stone-800 shadow-2xs transition-all active:scale-98"
              >
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Apply Changes
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                title="Cancel edit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid layout for specs & restrictions */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Bento Card 1: Core Logistics */}
          <section className="md:col-span-7 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3.5">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 tracking-tight">Core Event Coordinates</h3>
                    <p className="text-3xs text-stone-400">Occasion, scale & financial target</p>
                  </div>
                </div>
                {partyDetails.partyType && (
                  <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/60">
                    {partyDetails.partyType}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Theme */}
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                  <span className="text-3xs uppercase font-bold text-stone-400 tracking-wider block mb-1">Theme</span>
                  <div className="text-xs font-semibold text-stone-800 truncate" title={partyDetails.theme || 'Pending'}>
                    {partyDetails.theme || <span className="text-stone-400 font-normal italic">Awaiting</span>}
                  </div>
                </div>

                {/* Guests */}
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                  <span className="text-3xs uppercase font-bold text-stone-400 tracking-wider block mb-1">Guests</span>
                  <div className="text-xs font-semibold text-stone-800 flex items-center">
                    <Users className="w-3 h-3 mr-1 text-stone-400" />
                    {partyDetails.guestCount ? `${partyDetails.guestCount} ppl` : <span className="text-stone-400 font-normal italic">Awaiting</span>}
                  </div>
                </div>

                {/* Budget */}
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                  <span className="text-3xs uppercase font-bold text-stone-400 tracking-wider block mb-1">Budget</span>
                  <div className="text-xs font-bold font-mono-num text-emerald-800">
                    {partyDetails.budget ? `$${partyDetails.budget}` : <span className="text-stone-400 font-normal italic">Awaiting</span>}
                  </div>
                </div>

                {/* Date */}
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                  <span className="text-3xs uppercase font-bold text-stone-400 tracking-wider block mb-1">Date</span>
                  <div className="text-xs font-semibold text-stone-800 truncate" title={partyDetails.date || 'Pending'}>
                    {partyDetails.date || <span className="text-stone-400 font-normal italic">Awaiting</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Micro per-guest allocation metric */}
            {partyDetails.budget && partyDetails.guestCount && (
              <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between text-2xs text-stone-500">
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                  Estimated spend per guest:
                </span>
                <span className="font-bold font-mono-num text-stone-900">
                  ${(partyDetails.budget / partyDetails.guestCount).toFixed(2)} / guest
                </span>
              </div>
            )}
          </section>

          {/* Bento Card 2: Restrictions & Requests */}
          <section className="md:col-span-5 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3.5">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900 tracking-tight">Dietary & Custom Requests</h3>
                    <p className="text-3xs text-stone-400">Allergen safety & aesthetic notes</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {partyDetails.dietaryRestrictions && partyDetails.dietaryRestrictions.length > 0 ? (
                      partyDetails.dietaryRestrictions.map((d, i) => {
                        const isNut = d.toLowerCase().includes('nut') || d.toLowerCase().includes('peanut');
                        const isGluten = d.toLowerCase().includes('gluten') || d.toLowerCase().includes('gf') || d.toLowerCase().includes('celiac');
                        const isVegan = d.toLowerCase().includes('vegan') || d.toLowerCase().includes('veg');
                        const isDairy = d.toLowerCase().includes('dairy') || d.toLowerCase().includes('lactose');

                        let badgeColor = 'bg-stone-50 text-stone-700 border-stone-200';
                        if (isNut) badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                        else if (isGluten) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                        else if (isVegan) badgeColor = 'bg-teal-50 text-teal-800 border-teal-200';
                        else if (isDairy) badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';

                        return (
                          <span key={i} className={`text-2xs px-2.5 py-0.5 rounded-full font-medium border ${badgeColor}`}>
                            {d}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-2xs text-stone-400 italic">No dietary restrictions recorded</span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-2xs text-stone-600 bg-[#FAF9F6] p-2 rounded-xl border border-stone-200/70 italic leading-relaxed line-clamp-2">
                    {partyDetails.specialRequests || "Standard party setup (appetizers, drinks, tableware & decorations)"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between">
              <div className="text-3xs text-stone-400">
                {filledCount >= 4 ? "✓ Logistics algorithms synced" : "Awaiting event parameters"}
              </div>
              <button
                onClick={onTriggerGenerate}
                disabled={isGenerating}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-stone-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-2xs flex items-center disabled:opacity-50 active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-stone-950" />
                {isGenerating ? "Calculating..." : "Sync Shopping List"}
              </button>
            </div>
          </section>
        </div>
      ) : (
        /* Edit Form Bento Box */
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center">
              <Sliders className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              Edit 7 Event Parameters
            </h3>
            <span className="text-2xs text-stone-400">All fields update the AI shopping matrix</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">1. Party Type</label>
              <input
                type="text"
                list="party-types-list"
                value={editForm.partyType}
                onChange={(e) => setEditForm({ ...editForm, partyType: e.target.value })}
                placeholder="e.g. Children's Birthday Party, Corporate Event"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-stone-50/50"
              />
              <datalist id="party-types-list">
                {COMMON_PARTY_TYPES.map((pt) => (
                  <option key={pt} value={pt} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">2. Number of Guests</label>
              <input
                type="number"
                min="1"
                max="500"
                value={editForm.guestCount || ''}
                onChange={(e) => setEditForm({ ...editForm, guestCount: e.target.value ? parseInt(e.target.value, 10) : null })}
                placeholder="e.g. 15"
                className="w-full px-3 py-2 text-xs font-mono-num rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">3. Target Budget ($ USD)</label>
              <input
                type="number"
                min="10"
                step="5"
                value={editForm.budget || ''}
                onChange={(e) => setEditForm({ ...editForm, budget: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 150"
                className="w-full px-3 py-2 text-xs font-mono-num rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">4. Date / Timing</label>
              <input
                type="text"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                placeholder="e.g. This Saturday 6:00 PM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-stone-50/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">5. Party Theme</label>
              <input
                type="text"
                list="party-themes-list"
                value={editForm.theme}
                onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })}
                placeholder="e.g. Superhero Comic Adventure, Professional Innovation, Luau"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-stone-50/50"
              />
              <datalist id="party-themes-list">
                {COMMON_THEMES.map((th) => (
                  <option key={th} value={th} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">6. Dietary Restrictions</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_DIETARY_OPTIONS.map((item) => {
                const active = editForm.dietaryRestrictions?.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleDietary(item)}
                    className={`px-3 py-1 rounded-full text-2xs font-semibold transition-all ${
                      active
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/80'
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
                className="flex-1 px-3 py-1.5 text-2xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-stone-50/50"
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
                className="px-3 py-1.5 text-2xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-stone-600 mb-1">7. Special Requests & Preferences</label>
            <textarea
              rows={2}
              value={editForm.specialRequests}
              onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
              placeholder="e.g. Bio-degradable plates, glowing decor, signature mocktail"
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-stone-50/50"
            />
          </div>
        </div>
      )}
    </div>
  );
};
