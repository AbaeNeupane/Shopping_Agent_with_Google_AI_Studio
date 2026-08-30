import React from 'react';
import { Store, Check, ArrowLeft, ShoppingCart, CheckCircle2, RotateCcw, MapPin } from 'lucide-react';
import { ShoppingPlan, ShoppingItem } from '../types';

interface InStoreModeProps {
  plan: ShoppingPlan;
  onUpdatePlan: (updated: ShoppingPlan) => void;
  onClose: () => void;
}

export const InStoreMode: React.FC<InStoreModeProps> = ({
  plan,
  onUpdatePlan,
  onClose,
}) => {
  const toggleItem = (id: string) => {
    const updatedItems = plan.items.map(item => {
      if (item.id === id) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });
    onUpdatePlan({ ...plan, items: updatedItems });
  };

  const resetAllChecks = () => {
    const updatedItems = plan.items.map(item => ({ ...item, isChecked: false }));
    onUpdatePlan({ ...plan, items: updatedItems });
  };

  // Group by Aisle/Department
  const aisleOrder = [
    "Aisle 1 - Fresh Produce",
    "Aisle 1 - Produce Department",
    "Aisle 1 - Produce Deli",
    "Aisle 1 - Meat & Seafood",
    "Aisle 1 - Plant-Based Cooler",
    "Aisle 2 - Deli & Specialty",
    "Aisle 3 - Fresh Bakery",
    "Aisle 3 - Specialty Bakery",
    "Aisle 3 - Bakery Showcase",
    "Aisle 4 - Frozen Meals",
    "Aisle 4 - Frozen Specialty",
    "Aisle 5 - Chips & Snacks",
    "Aisle 6 - Confectionery",
    "Aisle 7 - Beverages",
    "Aisle 7 - Chilled Drinks",
    "Aisle 8 - Paper & Party Supplies",
    "Aisle 8 - Party Decorations",
    "Aisle 8 - Seasonal & Housewares",
    "Front Entry - Ice Freezers"
  ];

  // Group items
  const activeItems = plan.items.filter(i => i.isEnabled !== false);
  const checkedItems = activeItems.filter(i => i.isChecked);
  const progressPercent = activeItems.length > 0 ? Math.round((checkedItems.length / activeItems.length) * 100) : 0;

  // Collect unique aisles from items and sort according to aisleOrder
  const aisles: string[] = Array.from(new Set<string>(activeItems.map(i => i.cymbalMartAisle || "Other Aisles"))).sort((a: string, b: string) => {
    const idxA = aisleOrder.findIndex(o => o.toLowerCase().includes(a.toLowerCase()));
    const idxB = aisleOrder.findIndex(o => o.toLowerCase().includes(b.toLowerCase()));
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF9F6] w-full max-w-3xl mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-stone-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white p-4 sm:p-5 flex items-center justify-between sticky top-0 z-10 border-b border-stone-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white transition-colors border border-stone-700 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-base sm:text-lg font-serif-luxury">In-Store Shopping Walk</h3>
              </div>
              <p className="text-2xs text-stone-300">Organized in optimal CymbalMart supermarket walking route</p>
            </div>
          </div>

          <button
            onClick={resetAllChecks}
            className="text-xs font-semibold text-stone-300 hover:text-white px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 transition-colors flex items-center border border-stone-700 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-stone-400" />
            Reset
          </button>
        </div>

        {/* Progress Bar Ribbon */}
        <div className="bg-white p-4 sm:px-6 border-b border-stone-200 flex items-center justify-between shadow-2xs">
          <div className="flex-1 mr-4">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-stone-800">Basket Progress: {checkedItems.length} of {activeItems.length} items</span>
              <span className="text-amber-700 font-mono-num">{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xs text-stone-400 font-bold uppercase tracking-widest">In Basket</div>
            <div className="text-sm font-bold font-mono-num text-stone-900">
              ${checkedItems.reduce((s, i) => s + i.estimatedPrice, 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Aisles & Items List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {aisles.map((aisleName) => {
            const itemsInAisle = activeItems.filter(i => (i.cymbalMartAisle || "Other Aisles") === aisleName);
            if (itemsInAisle.length === 0) return null;

            return (
              <div key={aisleName} className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{aisleName}</span>
                  <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono-num">
                    {itemsInAisle.length}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200/90 divide-y divide-stone-100 overflow-hidden shadow-2xs">
                  {itemsInAisle.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                        item.isChecked ? 'bg-amber-50/20 opacity-70' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                            item.isChecked
                              ? 'bg-stone-900 border-stone-900 text-amber-400 shadow-xs'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {item.isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div>
                          <div className={`text-xs sm:text-sm font-semibold ${item.isChecked ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                            {item.name}
                          </div>
                          <div className="text-2xs text-stone-500 flex items-center space-x-2">
                            <span>{item.quantityDescription}</span>
                            {item.isEssential && (
                              <span className="text-emerald-700 font-bold">• Essential</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono-num text-xs sm:text-sm font-bold text-stone-900">
                          ${item.estimatedPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Finish In-Store Button */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs text-stone-500 font-medium">
            {checkedItems.length === activeItems.length ? '🎉 All items picked!' : `${activeItems.length - checkedItems.length} items remaining`}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition-colors active:scale-98"
          >
            Exit In-Store Walk
          </button>
        </div>
      </div>
    </div>
  );
};
