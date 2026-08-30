import React from 'react';
import { Store, Check, ArrowLeft, ShoppingCart, CheckCircle2, RotateCcw } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 w-full max-w-3xl mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between sticky top-0 z-10 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-base sm:text-lg">In-Store Shopping Assistant</h3>
              </div>
              <p className="text-2xs text-slate-400">Organized by CymbalMart aisle walking sequence</p>
            </div>
          </div>

          <button
            onClick={resetAllChecks}
            className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors flex items-center border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </button>
        </div>

        {/* Progress Bar Ribbon */}
        <div className="bg-white p-3.5 sm:px-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">Cart Progress: {checkedItems.length} of {activeItems.length} items</span>
              <span className="text-indigo-600 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xs text-slate-400 font-bold uppercase tracking-wider">Total in Cart</div>
            <div className="text-sm font-bold font-mono text-slate-900">
              ${checkedItems.reduce((s, i) => s + i.estimatedPrice, 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Aisle List View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {aisles.map(aisle => {
            const aisleItems = activeItems.filter(i => (i.cymbalMartAisle || "Other Aisles") === aisle);
            const allCheckedInAisle = aisleItems.every(i => i.isChecked);

            return (
              <div key={aisle} className="space-y-2">
                <div className="flex items-center justify-between bg-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800">
                  <span className="flex items-center">
                    <Store className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    {aisle}
                  </span>
                  <span className={`text-3xs font-semibold px-2 py-0.5 rounded-full ${
                    allCheckedInAisle ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-slate-600'
                  }`}>
                    {aisleItems.filter(i => i.isChecked).length}/{aisleItems.length} picked
                  </span>
                </div>

                <div className="space-y-1.5">
                  {aisleItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-99 ${
                        item.isChecked
                          ? 'bg-indigo-50/40 border-indigo-200 text-slate-500'
                          : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-900 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0 mr-2">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          item.isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs sm:text-sm font-semibold truncate ${
                            item.isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}>
                            {item.name}
                          </div>
                          <div className="text-2xs text-slate-500 flex items-center space-x-2">
                            <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{item.quantityDescription}</span>
                            {item.isEssential ? (
                              <span className="text-indigo-700 font-semibold">• Essential</span>
                            ) : (
                              <span className="text-slate-500 font-medium">• Optional</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-bold font-mono text-slate-800">
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

        {/* Bottom Done CTA */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-full transition-colors shadow-xs"
          >
            Done Shopping (Return to Planner)
          </button>
        </div>
      </div>
    </div>
  );
};
