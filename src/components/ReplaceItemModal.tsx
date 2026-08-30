import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Sparkles, 
  DollarSign, 
  Check, 
  Tag, 
  Store,
  Layers
} from 'lucide-react';
import { ShoppingItem } from '../types';

interface ReplaceItemModalProps {
  item: ShoppingItem;
  isOpen: boolean;
  onClose: () => void;
  onReplace: (originalId: string, newItem: ShoppingItem) => void;
}

// Smart replacement suggestions by category
const SUGGESTIONS_BY_CATEGORY: Record<string, Array<{ name: string; quantity: string; priceDiff: number; notes: string; aisle: string; dietary?: string }>> = {
  "Food": [
    { name: "Cymbal Organic Free-Range Chicken Breast (Family Pack)", quantity: "3 lbs (scaled for guests)", priceDiff: -2.50, notes: "Leaner high-protein alternative", aisle: "Aisle 1 - Meat & Poultry", dietary: "Gluten-Free, High Protein" },
    { name: "Cymbal Plant-Based Gourmet Grill Sausages (8-ct)", quantity: "2 packs (16 links)", priceDiff: 1.00, notes: "Great vegan / vegetarian crowd option", aisle: "Aisle 1 - Plant-Based Cooler", dietary: "Certified Vegan" },
    { name: "Cymbal Signature All-Beef Hot Dogs & Bratwurst Combo", quantity: "2 packs (16 links)", priceDiff: -4.00, notes: "Budget-friendly classic cookout staple", aisle: "Aisle 1 - Deli Meats", dietary: "Gluten-Free" },
    { name: "Cymbal Fresh Wild-Caught Salmon Fillet Skewers", quantity: "12 skewers", priceDiff: 6.50, notes: "Premium upscale dinner option", aisle: "Aisle 1 - Fresh Seafood", dietary: "Pescatarian, Keto" }
  ],
  "Drinks": [
    { name: "Cymbal Craft Citrus & Mint Artisan Mocktail Mixer (64 oz)", quantity: "2 jugs", priceDiff: 2.00, notes: "Alcohol-free upscale signature beverage", aisle: "Aisle 7 - Specialty Beverages", dietary: "Non-Alcoholic, Vegan" },
    { name: "Cymbal Sparkling Zero-Calorie Flavored Water (24-pk)", quantity: "1 mega case (24 cans)", priceDiff: -1.50, notes: "Cost-effective crisp hydration", aisle: "Aisle 7 - Sparkling Water", dietary: "Zero Sugar" },
    { name: "Cymbal 100% Pure Cold-Pressed Apple Cider (1 Gallon)", quantity: "1 gallon", priceDiff: 0.50, notes: "Comforting seasonal refresher", aisle: "Aisle 7 - Chilled Juices", dietary: "Gluten-Free, Vegan" },
    { name: "Cymbal Cold Brew Coffee Concentrate Party Jug (64 oz)", quantity: "1 jug", priceDiff: 3.50, notes: "Perfect energy boost for day parties", aisle: "Aisle 7 - Chilled Coffee", dietary: "Dairy-Free" }
  ],
  "Decorations": [
    { name: "Cymbal Festive Metallic Gold / Silver Party Table Set", quantity: "1 bundle (plates, cups, napkins)", priceDiff: 1.50, notes: "Shiny celebratory theme upgrade", aisle: "Aisle 8 - Party Supplies", dietary: "Food Safe" },
    { name: "Cymbal Biodegradable Helium Balloon Arch Kit", quantity: "1 complete kit (60 balloons)", priceDiff: 3.00, notes: "Eye-catching photo backdrop", aisle: "Aisle 8 - Party Decorations", dietary: "Eco-Friendly" }
  ],
  "Tableware": [
    { name: "Cymbal Premium Bamboo Compostable Plates & Cutlery Kit", quantity: "1 complete pack (50-ct)", priceDiff: 3.00, notes: "Ultra-sturdy natural wooden aesthetic", aisle: "Aisle 8 - Eco Party Goods", dietary: "100% Biodegradable" },
    { name: "Cymbal Clear Heavy-Duty Reusable Tumblers (30-pk)", quantity: "1 pack (30 cups)", priceDiff: 0.50, notes: "Resistant to cracks and spills", aisle: "Aisle 8 - Cups & Barware", dietary: "BPA-Free" }
  ],
  "Party supplies": [
    { name: "Cymbal Multi-Game Lawn & Yard Party Pack", quantity: "1 set", priceDiff: 5.00, notes: "Outdoor games bundle", aisle: "Aisle 8 - Seasonal Housewares", dietary: "All Ages" }
  ],
  "Optional extras": [
    { name: "Cymbal Bakery Mini Gourmet French Macarons (24-ct Assorted)", quantity: "1 celebration platter", priceDiff: 4.50, notes: "Pistachio, Raspberry, Chocolate & Salted Caramel", aisle: "Aisle 3 - Bakery Showcase", dietary: "Gluten-Free, Contains Almonds" },
    { name: "Cymbal Fresh Chocolate Chip & Oat Cookie Platter (24-ct)", quantity: "1 tub (24 warm-style cookies)", priceDiff: -2.00, notes: "Affordable crowd favorite", aisle: "Aisle 3 - Bakery Tables", dietary: "Vegetarian" }
  ]
};

export const ReplaceItemModal: React.FC<ReplaceItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onReplace,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const [customName, setCustomName] = useState('');
  const [customQuantity, setCustomQuantity] = useState(item.quantityDescription);
  const [customPrice, setCustomPrice] = useState(item.estimatedPrice.toString());
  const [customAisle, setCustomAisle] = useState(item.cymbalMartAisle || 'Aisle 1');
  const [customNotes, setCustomNotes] = useState('');
  const [customDietary, setCustomDietary] = useState(item.dietaryNote || '');
  const [customIsEssential, setCustomIsEssential] = useState(item.isEssential);

  if (!isOpen) return null;

  const categorySuggestions = SUGGESTIONS_BY_CATEGORY[item.category] || [
    { name: `Cymbal Organic Premium ${item.name}`, quantity: item.quantityDescription, priceDiff: 2.00, notes: "Certified organic upgrade", aisle: item.cymbalMartAisle || "Aisle 1" },
    { name: `Cymbal Essentials Value ${item.name}`, quantity: item.quantityDescription, priceDiff: -2.50, notes: "Budget-friendly store brand", aisle: item.cymbalMartAisle || "Aisle 1" },
    { name: `Cymbal Plant-Based / GF Alternative to ${item.name}`, quantity: item.quantityDescription, priceDiff: 1.00, notes: "Dietary friendly substitute", aisle: item.cymbalMartAisle || "Aisle 1", dietary: "Gluten-Free / Vegan" }
  ];

  const handleApplySuggestion = (sug: typeof categorySuggestions[0]) => {
    const newPrice = Math.max(0.99, Number((item.estimatedPrice + sug.priceDiff).toFixed(2)));
    const newItem: ShoppingItem = {
      ...item,
      name: sug.name,
      quantityDescription: sug.quantity,
      estimatedPrice: newPrice,
      cymbalMartAisle: sug.aisle,
      dietaryNote: sug.dietary || item.dietaryNote,
      notes: sug.notes,
      themeRelevance: `Alternative chosen to match ${item.themeRelevance || 'party requirements'}`
    };
    onReplace(item.id, newItem);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: ShoppingItem = {
      ...item,
      name: customName.trim(),
      quantityDescription: customQuantity.trim() || item.quantityDescription,
      estimatedPrice: parseFloat(customPrice) || item.estimatedPrice,
      cymbalMartAisle: customAisle.trim() || item.cymbalMartAisle,
      notes: customNotes.trim() || "Custom product replacement",
      dietaryNote: customDietary.trim() || undefined,
      isEssential: customIsEssential
    };
    onReplace(item.id, newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white p-5 sm:px-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-100 font-serif-luxury">Product Alternative</h3>
              <p className="text-2xs text-stone-300">Swap with recommended store brands, dietary alternatives, or custom items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Item Banner */}
        <div className="p-4 bg-[#FAF9F6] border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-3xs uppercase tracking-widest font-bold text-stone-400">Current Selection</div>
            <div className="font-bold text-xs sm:text-sm text-stone-900">{item.name}</div>
            <div className="text-2xs text-stone-500">{item.quantityDescription} • {item.category}</div>
          </div>
          <div className="text-right">
            <div className="font-bold font-mono-num text-sm text-stone-900">${item.estimatedPrice.toFixed(2)}</div>
            <div className="text-3xs text-stone-400">{item.isEssential ? 'Essential' : 'Optional'}</div>
          </div>
        </div>

        {/* Tabs: Suggested vs Custom */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`flex-1 py-2.5 font-bold transition-all text-center ${
              !isCustomMode
                ? 'bg-white text-amber-950 border-b-2 border-amber-600 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Curated Recommendations ({categorySuggestions.length})
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`flex-1 py-2.5 font-bold transition-all text-center ${
              isCustomMode
                ? 'bg-white text-amber-950 border-b-2 border-amber-600 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Custom Replacement
          </button>
        </div>

        {/* Content Body */}
        {!isCustomMode ? (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-white custom-scrollbar">
            {categorySuggestions.map((sug, idx) => {
              const estNewTotal = Math.max(0.99, Number((item.estimatedPrice + sug.priceDiff).toFixed(2)));
              const isCheaper = sug.priceDiff < 0;

              return (
                <div
                  key={idx}
                  onClick={() => handleApplySuggestion(sug)}
                  className="p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 hover:border-amber-500/80 hover:bg-amber-50/20 transition-all cursor-pointer group shadow-2xs active:scale-99"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-amber-900">
                          {sug.name}
                        </h4>
                        {sug.dietary && (
                          <span className="px-1.5 py-0.5 rounded text-3xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {sug.dietary}
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-stone-600">{sug.notes}</p>
                      <div className="text-3xs text-stone-400 flex items-center space-x-2">
                        <span>{sug.quantity}</span>
                        <span>•</span>
                        <span>{sug.aisle}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold font-mono-num text-sm text-stone-900">
                        ${estNewTotal.toFixed(2)}
                      </div>
                      <div className={`text-3xs font-semibold font-mono-num ${isCheaper ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {isCheaper ? `Save $${Math.abs(sug.priceDiff).toFixed(2)}` : `+$${sug.priceDiff.toFixed(2)}`}
                      </div>
                      <button
                        type="button"
                        className="mt-2 px-3 py-1 rounded-lg text-3xs font-bold bg-stone-900 text-white group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleApplyCustom} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 text-xs bg-[#FAF9F6]">
            <div>
              <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">New Product Name *</label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Artisanal Garlic Crostini"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Quantity</label>
                <input
                  type="text"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs font-mono-num"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Aisle Location</label>
                <input
                  type="text"
                  value={customAisle}
                  onChange={(e) => setCustomAisle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 text-2xs uppercase tracking-wider">Dietary Label</label>
                <input
                  type="text"
                  value={customDietary}
                  onChange={(e) => setCustomDietary(e.target.value)}
                  placeholder="e.g. Gluten-Free"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200/60 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold transition-all shadow-md active:scale-98"
              >
                Save Replacement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
