import React, { useState } from 'react';
import { X, Plus, ShoppingBag, DollarSign, Tag, MapPin } from 'lucide-react';
import { ShoppingItem } from '../types';

interface AddItemModalProps {
  onClose: () => void;
  onAddItem: (item: ShoppingItem) => void;
}

const CATEGORIES = [
  "Mains & Proteins",
  "Fresh Produce",
  "Bakery & Deli",
  "Beverages & Bar",
  "Snacks & Appetizers",
  "Party Supplies & Tableware",
  "Desserts & Sweets",
  "Ice & Essentials"
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
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100">Add Item to Shopping List</h3>
              <p className="text-2xs text-slate-400">Add a grocery, beverage, or party supply item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Item Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Item Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cymbal Artisan Sourdough Baguette, Lime Wedges (1 lb)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Aisle */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CymbalMart Aisle</label>
              <select
                value={cymbalMartAisle}
                onChange={(e) => setCymbalMartAisle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              >
                {AISLES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Quantity Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity Description</label>
              <input
                type="text"
                value={quantityDescription}
                onChange={(e) => setQuantityDescription(e.target.value)}
                placeholder="e.g. 2 packs (16 count total)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Estimated Price */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="5.99"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-mono"
              />
            </div>
          </div>

          {/* Essential vs Optional Toggle */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Priority Level</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsEssential(true)}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-colors ${
                  isEssential
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ✓ Essential Item
              </button>
              <button
                type="button"
                onClick={() => setIsEssential(false)}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-colors ${
                  !isEssential
                    ? 'bg-slate-100 border-slate-400 text-slate-800 ring-2 ring-slate-400/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ★ Optional Item
              </button>
            </div>
          </div>

          {/* Dietary & Theme Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dietary Tag (Optional)</label>
              <input
                type="text"
                value={dietaryNote}
                onChange={(e) => setDietaryNote(e.target.value)}
                placeholder="e.g. Gluten-Free, Vegan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Theme Note (Optional)</label>
              <input
                type="text"
                value={themeRelevance}
                onChange={(e) => setThemeRelevance(e.target.value)}
                placeholder="e.g. Island garnishes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-slate-600 hover:bg-slate-100 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-2xs"
            >
              Add to List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
