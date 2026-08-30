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
  "Mains & Proteins": [
    { name: "Cymbal Organic Free-Range Chicken Breast (Family Pack)", quantity: "3 lbs (scaled for guests)", priceDiff: -2.50, notes: "Leaner high-protein alternative", aisle: "Aisle 1 - Meat & Poultry", dietary: "Gluten-Free, High Protein" },
    { name: "Cymbal Plant-Based Gourmet Grill Sausages (8-ct)", quantity: "2 packs (16 links)", priceDiff: 1.00, notes: "Great vegan / vegetarian crowd option", aisle: "Aisle 1 - Plant-Based Cooler", dietary: "Certified Vegan" },
    { name: "Cymbal Signature All-Beef Hot Dogs & Bratwurst Combo", quantity: "2 packs (16 links)", priceDiff: -4.00, notes: "Budget-friendly classic cookout staple", aisle: "Aisle 1 - Deli Meats", dietary: "Gluten-Free" },
    { name: "Cymbal Fresh Wild-Caught Salmon Fillet Skewers", quantity: "12 skewers", priceDiff: 6.50, notes: "Premium upscale dinner option", aisle: "Aisle 1 - Fresh Seafood", dietary: "Pescatarian, Keto" }
  ],
  "Fresh Produce": [
    { name: "Cymbal Organic Veggie Crudité Platter with Ranch & Hummus", quantity: "2 party platters (3 lbs total)", priceDiff: 1.50, notes: "Crisp broccoli, carrots, peppers & dip", aisle: "Aisle 1 - Produce Deli", dietary: "Vegetarian, Gluten-Free" },
    { name: "Cymbal Fresh Rainbow Berry Medley (Strawberries, Blueberries, Blackberries)", quantity: "3 lbs clamshells", priceDiff: 2.00, notes: "Vibrant sweet antioxidant mix", aisle: "Aisle 1 - Fresh Berries", dietary: "Vegan, Gluten-Free" },
    { name: "Cymbal Crisp Romaine & Mediterranean Caesar Salad Kit", quantity: "2 family bags", priceDiff: -3.00, notes: "Includes croutons, parmesan & dressing", aisle: "Aisle 1 - Packaged Salads", dietary: "Vegetarian" }
  ],
  "Beverages & Bar": [
    { name: "Cymbal Craft Citrus & Mint Artisan Mocktail Mixer (64 oz)", quantity: "2 jugs", priceDiff: 2.00, notes: "Alcohol-free upscale signature beverage", aisle: "Aisle 7 - Specialty Beverages", dietary: "Non-Alcoholic, Vegan" },
    { name: "Cymbal Sparkling Zero-Calorie Flavored Water (24-pk)", quantity: "1 mega case (24 cans)", priceDiff: -1.50, notes: "Cost-effective crisp hydration", aisle: "Aisle 7 - Sparkling Water", dietary: "Zero Sugar" },
    { name: "Cymbal 100% Pure Cold-Pressed Apple Cider (1 Gallon)", quantity: "1 gallon", priceDiff: 0.50, notes: "Comforting seasonal refresher", aisle: "Aisle 7 - Chilled Juices", dietary: "Gluten-Free, Vegan" },
    { name: "Cymbal Cold Brew Coffee Concentrate Party Jug (64 oz)", quantity: "1 jug", priceDiff: 3.50, notes: "Perfect energy boost for day parties", aisle: "Aisle 7 - Chilled Coffee", dietary: "Dairy-Free" }
  ],
  "Snacks & Appetizers": [
    { name: "Cymbal White Truffle & Sea Salt Kettle Cooked Chips", quantity: "2 party bags (14 oz)", priceDiff: 1.20, notes: "Gourmet crunchy upgrade", aisle: "Aisle 5 - Gourmet Snacks", dietary: "Gluten-Free, Vegan" },
    { name: "Cymbal Mediterranean Dip Trio (Tzatziki, Red Pepper & Roasted Garlic Hummus)", quantity: "1 large sampler tray", priceDiff: 2.50, notes: "Pairs with pita and chips", aisle: "Aisle 2 - Deli Counter", dietary: "Vegetarian" },
    { name: "Cymbal Salted Soft Pretzel Bites with Warm Cheddar Dip", quantity: "1 party tub (30 bites)", priceDiff: 0.80, notes: "Warm savory finger food", aisle: "Aisle 3 - Bakery Showcase", dietary: "Vegetarian" }
  ],
  "Party Supplies & Tableware": [
    { name: "Cymbal Premium Bamboo Compostable Plates & Cutlery Kit", quantity: "1 complete pack (50-ct)", priceDiff: 3.00, notes: "Ultra-sturdy natural wooden aesthetic", aisle: "Aisle 8 - Eco Party Goods", dietary: "100% Biodegradable" },
    { name: "Cymbal Festive Metallic Gold / Silver Party Table Set", quantity: "1 bundle (plates, cups, napkins)", priceDiff: 1.50, notes: "Shiny celebratory theme upgrade", aisle: "Aisle 8 - Party Supplies", dietary: "Food Safe" },
    { name: "Cymbal Clear Heavy-Duty Reusable Tumblers (30-pk)", quantity: "1 pack (30 cups)", priceDiff: 0.50, notes: "Resistant to cracks and spills", aisle: "Aisle 8 - Cups & Barware", dietary: "BPA-Free" }
  ],
  "Desserts & Sweets": [
    { name: "Cymbal Bakery Mini Gourmet French Macarons (24-ct Assorted)", quantity: "1 celebration platter", priceDiff: 4.50, notes: "Pistachio, Raspberry, Chocolate & Salted Caramel", aisle: "Aisle 3 - Bakery Showcase", dietary: "Gluten-Free, Contains Almonds" },
    { name: "Cymbal Fresh Chocolate Chip & Oat Cookie Platter (24-ct)", quantity: "1 tub (24 warm-style cookies)", priceDiff: -2.00, notes: "Affordable crowd favorite", aisle: "Aisle 3 - Bakery Tables", dietary: "Vegetarian" },
    { name: "Cymbal All-Natural Gluten-Free Fudgy Brownie Bites (18-ct)", quantity: "1 tub (18 pieces)", priceDiff: 1.00, notes: "Decadent rich chocolate treat", aisle: "Aisle 3 - Specialty Bakery", dietary: "Certified Gluten-Free" }
  ]
};

export const ReplaceItemModal: React.FC<ReplaceItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onReplace,
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
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
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100">Replace Product</h3>
              <p className="text-2xs text-slate-400">Swap item with recommended alternatives or enter a custom substitute</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Item Overview */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <div className="text-3xs uppercase tracking-wider font-bold text-slate-400">Currently Selected Item</div>
            <div className="font-bold text-sm text-slate-900 mt-0.5">{item.name}</div>
            <div className="text-slate-500">{item.quantityDescription} • {item.cymbalMartAisle}</div>
          </div>
          <div className="text-right">
            <div className="text-3xs uppercase tracking-wider font-bold text-slate-400">Current Price</div>
            <div className="text-sm font-bold font-mono text-slate-900">${item.estimatedPrice.toFixed(2)}</div>
            <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-3xs font-bold ${
              item.isEssential ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-700'
            }`}>
              {item.isEssential ? 'Essential' : 'Optional'}
            </span>
          </div>
        </div>

        {/* Tabs: Suggested Alternatives vs Custom Input */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 text-xs font-semibold">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center ${
              !isCustomMode
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            Curated CymbalMart Alternatives
          </button>
          <button
            onClick={() => {
              setIsCustomMode(true);
              setCustomName(item.name);
            }}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center ${
              isCustomMode
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            Custom Replacement
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          {!isCustomMode ? (
            <div className="space-y-3">
              <p className="text-slate-600 text-xs mb-2">
                Select an alternative below to swap out this item. The budget and total will automatically adjust:
              </p>

              {categorySuggestions.map((sug, idx) => {
                const targetPrice = Math.max(0.99, Number((item.estimatedPrice + sug.priceDiff).toFixed(2)));
                const isCheaper = sug.priceDiff < 0;
                const isPrisier = sug.priceDiff > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => handleApplySuggestion(sug)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-900 flex items-center">
                          {sug.name}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {sug.quantity} • {sug.aisle}
                        </div>
                        {sug.notes && (
                          <div className="text-2xs text-slate-600 italic">
                            💡 {sug.notes}
                          </div>
                        )}
                        {sug.dietary && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-3xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {sug.dietary}
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold font-mono text-sm text-slate-900">
                          ${targetPrice.toFixed(2)}
                        </div>
                        <div className={`text-2xs font-semibold ${
                          isCheaper ? 'text-emerald-600' : isPrisier ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {isCheaper ? `Save $${Math.abs(sug.priceDiff).toFixed(2)}` : isPrisier ? `+$${sug.priceDiff.toFixed(2)}` : 'Same price'}
                        </div>
                        <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-2xs font-semibold bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleApplyCustom} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Item Name *</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Cymbal Gourmet Brioche Hot Dog Buns"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity Description</label>
                  <input
                    type="text"
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(e.target.value)}
                    placeholder="e.g. 2 packs (16 count)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="6.99"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aisle Location</label>
                  <input
                    type="text"
                    value={customAisle}
                    onChange={(e) => setCustomAisle(e.target.value)}
                    placeholder="e.g. Aisle 3 - Bakery"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dietary Tag</label>
                  <input
                    type="text"
                    value={customDietary}
                    onChange={(e) => setCustomDietary(e.target.value)}
                    placeholder="e.g. Gluten-Free, Vegan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomIsEssential(true)}
                    className={`p-2 rounded-xl border text-center font-bold text-xs ${
                      customIsEssential
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    ✓ Essential Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomIsEssential(false)}
                    className={`p-2 rounded-xl border text-center font-bold text-xs ${
                      !customIsEssential
                        ? 'bg-slate-100 border-slate-400 text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    ★ Optional Item
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-2xs"
                >
                  Save Replacement
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
