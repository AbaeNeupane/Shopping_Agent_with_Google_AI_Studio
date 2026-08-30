import React, { useState } from 'react';
import { X, Plus, ShoppingBag, DollarSign, Tag, MapPin } from 'lucide-react';
import { ShoppingItem } from '../types';

interface AddItemModalProps {
  onClose: () => void;
  onAddItem: (item: ShoppingItem) => void;
}

const CATEGORIES = [
  "Food",
  "Drinks",
  "Decorations",
  "Tableware",
  "Party supplies",
  "Optional extras"
];

const AISLES = [
  "Aisle 1 - Fresh Produce",
  "Aisle 1 - Meat & Seafood",
  "Aisle 2 - Deli & Specialty",
  "Aisle 3 - Fresh Bakery",
  "Aisle 4 - Frozen Meals",
  "Aisle 5 - Chips & Snacks",
  "Aisle 6 - Confectionery",
  "Aisle 7 - Beverages",
  "Aisle 8 - Paper & Party Supplies",
  "Front Entry - Ice Freezers"
];

export const AddItemModal: React.FC<AddItemModalProps> = ({
  onClose,
  onAddItem,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantityDescription, setQuantityDescription] = useState('1 unit');
  const [estimatedPrice, setEstimatedPrice] = useState('5.99');
  const [isEssential, setIsEssential] = useState(true);
  const [cymbalMartAisle, setCymbalMartAisle] = useState(AISLES[0]);
  const [themeRelevance, setThemeRelevance] = useState('');
  const [dietaryNote, setDietaryNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: ShoppingItem = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category,
      quantityDescription: quantityDescription.trim() || '1 item',
      unitPrice: parseFloat(estimatedPrice) || 0,
      estimatedPrice: parseFloat(estimatedPrice) || 0,
      isEssential,
      isEnabled: true,
      isChecked: false,
      cymbalMartAisle,
      themeRelevance: themeRelevance.trim() || undefined,
      dietaryNote: dietaryNote.trim() || undefined,
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white p-5 sm:px-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-100 font-serif-luxury">Add Custom Product</h3>
              <p className="text-2xs text-stone-300">Incorporate additional grocery, beverage, or décor items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm bg-[#FAF9F6]">
          {/* Item Name */}
          <div>
            <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Item Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Guacamole & Artisan Pita Chips"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs sm:text-sm"
            />
          </div>

          {/* Category & Aisle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs sm:text-sm"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">CymbalMart Aisle</label>
              <select
                value={cymbalMartAisle}
                onChange={(e) => setCymbalMartAisle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs sm:text-sm"
              >
                {AISLES.map(aisle => (
                  <option key={aisle} value={aisle}>{aisle}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Quantity & Unit</label>
              <input
                type="text"
                value={quantityDescription}
                onChange={(e) => setQuantityDescription(e.target.value)}
                placeholder="e.g. 2 large packs (16 oz)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Estimated Price ($)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 font-mono-num">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs sm:text-sm font-mono-num"
                />
              </div>
            </div>
          </div>

          {/* Essential vs Optional */}
          <div>
            <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Priority Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsEssential(true)}
                className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                  isEssential
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                Essential Item
              </button>
              <button
                type="button"
                onClick={() => setIsEssential(false)}
                className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                  !isEssential
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                Optional Upgrade
              </button>
            </div>
          </div>

          {/* Theme & Dietary Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Theme Relevance (Optional)</label>
              <input
                type="text"
                value={themeRelevance}
                onChange={(e) => setThemeRelevance(e.target.value)}
                placeholder="e.g. Backyard Luau centerpieces"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Dietary Tag (Optional)</label>
              <input
                type="text"
                value={dietaryNote}
                onChange={(e) => setDietaryNote(e.target.value)}
                placeholder="e.g. Gluten-Free, Vegan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200/60 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-all shadow-md active:scale-98"
            >
              Add to Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
