import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Check, 
  DollarSign, 
  Users, 
  Calendar, 
  Palette, 
  Sparkles, 
  Info, 
  Copy, 
  Printer, 
  Plus, 
  Minus,
  Trash2, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  Store,
  Share2,
  Tag,
  ShieldCheck,
  ArrowLeftRight,
  CreditCard,
  ArrowRight,
  TrendingDown,
  MapPin,
  Utensils,
  Wine,
  Sparkle,
  Edit3
} from 'lucide-react';
import { ShoppingPlan, ShoppingItem, PartyDetails } from '../types';
import { ReplaceItemModal } from './ReplaceItemModal';
import { CheckoutModal } from './CheckoutModal';

interface ShoppingPlanViewProps {
  plan: ShoppingPlan;
  onUpdatePlan: (updated: ShoppingPlan) => void;
  onOpenAddItemModal: () => void;
  onOpenInStoreMode: () => void;
}

export const ShoppingPlanView: React.FC<ShoppingPlanViewProps> = ({
  plan,
  onUpdatePlan,
  onOpenAddItemModal,
  onOpenInStoreMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'essential' | 'optional'>('all');
  const [showAssumptions, setShowAssumptions] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [itemToReplace, setItemToReplace] = useState<ShoppingItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Extract quantity number and unit label
  const extractQuantityInfo = (item: ShoppingItem): { count: number; unitLabel: string } => {
    const match = item.quantityDescription.match(/^(\d+(\.\d+)?)\s*(.*)$/);
    if (match) {
      return { count: parseFloat(match[1]) || 1, unitLabel: match[3] || 'units' };
    }
    return { count: 1, unitLabel: item.quantityDescription || 'unit' };
  };

  // Change item quantity via stepper (+1 / -1)
  const handleQuantityStep = (id: string, delta: number) => {
    const updatedItems = plan.items.map(item => {
      if (item.id === id) {
        const { count, unitLabel } = extractQuantityInfo(item);
        const newCount = Math.max(1, Math.round((count + delta) * 10) / 10);
        if (newCount === count) return item;

        const effectiveUnitPrice = item.unitPrice > 0 
          ? item.unitPrice 
          : (count > 0 ? Number((item.estimatedPrice / count).toFixed(2)) : item.estimatedPrice);
        
        const newEstimatedPrice = Number((effectiveUnitPrice * newCount).toFixed(2));

        let newDesc = item.quantityDescription;
        const leadingNumMatch = item.quantityDescription.match(/^(\d+(\.\d+)?)/);
        if (leadingNumMatch) {
          newDesc = item.quantityDescription.replace(/^(\d+(\.\d+)?)/, `${newCount}`);
        } else {
          newDesc = `${newCount} ${item.quantityDescription}`;
        }

        return {
          ...item,
          unitPrice: effectiveUnitPrice,
          quantityDescription: newDesc,
          estimatedPrice: newEstimatedPrice
        };
      }
      return item;
    });
    recalculatePlan(updatedItems);
  };

  // Set exact quantity directly
  const handleSetExactQuantity = (id: string, newCount: number) => {
    if (isNaN(newCount) || newCount < 1) return;
    const updatedItems = plan.items.map(item => {
      if (item.id === id) {
        const { count } = extractQuantityInfo(item);
        const effectiveUnitPrice = item.unitPrice > 0 
          ? item.unitPrice 
          : (count > 0 ? Number((item.estimatedPrice / count).toFixed(2)) : item.estimatedPrice);

        const newEstimatedPrice = Number((effectiveUnitPrice * newCount).toFixed(2));

        let newDesc = item.quantityDescription;
        const leadingNumMatch = item.quantityDescription.match(/^(\d+(\.\d+)?)/);
        if (leadingNumMatch) {
          newDesc = item.quantityDescription.replace(/^(\d+(\.\d+)?)/, `${newCount}`);
        } else {
          newDesc = `${newCount} ${item.quantityDescription}`;
        }

        return {
          ...item,
          unitPrice: effectiveUnitPrice,
          quantityDescription: newDesc,
          estimatedPrice: newEstimatedPrice
        };
      }
      return item;
    });
    recalculatePlan(updatedItems);
  };

  // Toggle item enabled state
  const toggleItemEnabled = (id: string) => {
    const updatedItems = plan.items.map(item => {
      if (item.id === id) {
        return { ...item, isEnabled: item.isEnabled === false ? true : false };
      }
      return item;
    });
    recalculatePlan(updatedItems);
  };

  // Replace item
  const handleReplaceItem = (originalId: string, newItem: ShoppingItem) => {
    const updatedItems = plan.items.map(item => {
      if (item.id === originalId) {
        return { ...newItem, id: originalId };
      }
      return item;
    });
    recalculatePlan(updatedItems);
  };

  // Toggle checked state for in-store check-off
  const toggleItemChecked = (id: string) => {
    const updatedItems = plan.items.map(item => {
      if (item.id === id) {
        return { ...item, isChecked: !item.isChecked };
      }
      return item;
    });
    onUpdatePlan({ ...plan, items: updatedItems });
  };

  // Delete item
  const deleteItem = (id: string) => {
    const updatedItems = plan.items.filter(item => item.id !== id);
    recalculatePlan(updatedItems);
  };

  // Recalculate totals after item toggles or additions
  const recalculatePlan = (items: ShoppingItem[]) => {
    const activeItems = items.filter(i => i.isEnabled !== false);
    const essentialsTotal = activeItems
      .filter(i => i.isEssential)
      .reduce((sum, i) => sum + i.estimatedPrice, 0);
    const optionalsTotal = activeItems
      .filter(i => !i.isEssential)
      .reduce((sum, i) => sum + i.estimatedPrice, 0);
    const estimatedTotal = Number((essentialsTotal + optionalsTotal).toFixed(2));
    const budget = plan.budget || 150;
    const guests = plan.partySummary.guestCount || 12;

    onUpdatePlan({
      ...plan,
      items,
      essentialsTotal: Number(essentialsTotal.toFixed(2)),
      optionalsTotal: Number(optionalsTotal.toFixed(2)),
      estimatedTotal,
      remainingBudget: Number((budget - estimatedTotal).toFixed(2)),
      costPerGuest: Number((estimatedTotal / guests).toFixed(2))
    });
  };

  // Group items by category (Strict 6 categories or dynamically populated)
  const categoryOrder: string[] = ['Food', 'Drinks', 'Decorations', 'Tableware', 'Party supplies', 'Optional extras'];
  const presentCategories = Array.from(new Set<string>(plan.items.map(i => i.category)));
  const sortedCategories = [
    ...categoryOrder.filter(c => presentCategories.includes(c)),
    ...presentCategories.filter(c => !categoryOrder.includes(c))
  ];
  const categories: string[] = sortedCategories.length > 0 ? sortedCategories : presentCategories;

  // Quick Refine Handlers
  const handleQuickReduceCost = () => {
    const hasActiveOptionals = plan.items.some(i => !i.isEssential && i.isEnabled !== false);
    if (hasActiveOptionals) {
      const updatedItems = plan.items.map(i => (!i.isEssential ? { ...i, isEnabled: false } : i));
      recalculatePlan(updatedItems);
    } else {
      const updatedItems = plan.items.map(i => ({
        ...i,
        estimatedPrice: Number((i.estimatedPrice * 0.85).toFixed(2))
      }));
      recalculatePlan(updatedItems);
    }
  };

  const handleQuickAdjustGuests = (delta: number) => {
    const currentGuests = plan.partySummary.guestCount || 12;
    const newGuests = Math.max(2, currentGuests + delta);
    const scale = newGuests / currentGuests;

    const updatedItems = plan.items.map(i => ({
      ...i,
      estimatedPrice: Number((i.estimatedPrice * scale).toFixed(2)),
      quantityDescription: i.quantityDescription.replace(/\d+\s*(guests|people)/i, `${newGuests} guests`)
    }));

    const updatedPartySummary = { ...plan.partySummary, guestCount: newGuests };
    const essentialsTotal = updatedItems
      .filter(i => i.isEnabled !== false && i.isEssential)
      .reduce((sum, i) => sum + i.estimatedPrice, 0);
    const optionalsTotal = updatedItems
      .filter(i => i.isEnabled !== false && !i.isEssential)
      .reduce((sum, i) => sum + i.estimatedPrice, 0);
    const estimatedTotal = Number((essentialsTotal + optionalsTotal).toFixed(2));
    const budget = plan.budget || 150;

    onUpdatePlan({
      ...plan,
      partySummary: updatedPartySummary,
      items: updatedItems,
      essentialsTotal: Number(essentialsTotal.toFixed(2)),
      optionalsTotal: Number(optionalsTotal.toFixed(2)),
      estimatedTotal,
      remainingBudget: Number((budget - estimatedTotal).toFixed(2)),
      costPerGuest: Number((estimatedTotal / newGuests).toFixed(2))
    });
  };

  const handleQuickAdjustBudget = (delta: number) => {
    const currentBudget = plan.budget || 150;
    const newBudget = Math.max(20, currentBudget + delta);
    const remainingBudget = Number((newBudget - plan.estimatedTotal).toFixed(2));

    onUpdatePlan({
      ...plan,
      budget: newBudget,
      partySummary: { ...plan.partySummary, budget: newBudget },
      remainingBudget
    });
  };

  // Filter items
  const filteredItems = plan.items.filter(item => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchType = 
      filterType === 'all' || 
      (filterType === 'essential' && item.isEssential) || 
      (filterType === 'optional' && !item.isEssential);
    return matchCategory && matchType;
  });

  // Calculate stats
  const activeItems = plan.items.filter(i => i.isEnabled !== false);
  const totalItemCount = plan.items.length;
  const checkedItemCount = plan.items.filter(i => i.isChecked).length;
  const budgetVariance = (plan.budget || 0) - plan.estimatedTotal;
  const isOverBudget = budgetVariance < 0;

  // Copy plain text list
  const handleCopyList = () => {
    const lines = [
      `🛒 CYMBALMART PARTY SHOPPING LIST`,
      `Event: ${plan.title}`,
      `Guests: ${plan.partySummary.guestCount} | Date: ${plan.partySummary.date} | Budget: $${plan.budget}`,
      `Estimated Total: $${plan.estimatedTotal.toFixed(2)} (Cost/Guest: $${plan.costPerGuest.toFixed(2)})`,
      `\n--- ITEMS BY CATEGORY ---`
    ];

    categories.forEach(cat => {
      const catItems = plan.items.filter(i => i.category === cat && i.isEnabled !== false);
      if (catItems.length === 0) return;
      lines.push(`\n[${cat.toUpperCase()}]`);
      catItems.forEach(it => {
        lines.push(`• ${it.name} - ${it.quantityDescription} (~$${it.estimatedPrice.toFixed(2)}) [${it.isEssential ? 'ESSENTIAL' : 'OPTIONAL'}] - ${it.cymbalMartAisle || 'Aisle'}`);
      });
    });

    lines.push(`\n--- PLANNING ASSUMPTIONS ---`);
    plan.assumptions.forEach(a => lines.push(`• ${a}`));

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getCategoryIcon = (catName: string) => {
    const lower = catName.toLowerCase();
    if (lower.includes('food')) return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
    if (lower.includes('drink')) return <Wine className="w-3.5 h-3.5 text-blue-600" />;
    if (lower.includes('decor')) return <Sparkle className="w-3.5 h-3.5 text-purple-600" />;
    if (lower.includes('table')) return <Tag className="w-3.5 h-3.5 text-emerald-600" />;
    return <ShoppingBag className="w-3.5 h-3.5 text-stone-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header & Budget Gauge Card (Editorial module) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 text-white p-5 sm:p-7 border-b border-stone-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-3xs font-bold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  CymbalMart Curated Plan
                </span>
                <span className="text-stone-400 text-2xs font-mono-num">
                  {new Date(plan.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100 font-serif-luxury">
                {plan.title}
              </h2>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-stone-300 mt-2">
                <span className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  {plan.partySummary.guestCount} Guests
                </span>
                <span className="text-stone-600">•</span>
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  {plan.partySummary.date}
                </span>
                <span className="text-stone-600">•</span>
                <span className="flex items-center">
                  <Palette className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  {plan.partySummary.theme}
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="inline-flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-stone-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md active:scale-98"
              >
                <CreditCard className="w-4 h-4 mr-1.5" />
                Finalize & Reserve
              </button>
              <button
                onClick={onOpenInStoreMode}
                className="inline-flex items-center px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-stone-200 bg-stone-800 hover:bg-stone-700 hover:text-white transition-all border border-stone-700 active:scale-98"
              >
                <Store className="w-4 h-4 mr-1.5 text-amber-400" />
                In-Store Walk
              </button>
            </div>
          </div>
        </div>

        {/* Budget Variance & Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 border-b border-stone-200 bg-[#FAF9F6] text-center text-xs sm:text-sm">
          {/* Estimated Total */}
          <div className="p-4 sm:p-5">
            <div className="text-3xs uppercase tracking-widest font-bold text-stone-400 mb-1">
              Estimated Total
            </div>
            <div className="text-lg sm:text-2xl font-bold font-mono-num text-stone-900">
              ${plan.estimatedTotal.toFixed(2)}
            </div>
            <div className="text-3xs text-stone-500 mt-0.5">
              {activeItems.length} active products
            </div>
          </div>

          {/* Budget Limit */}
          <div className="p-4 sm:p-5">
            <div className="text-3xs uppercase tracking-widest font-bold text-stone-400 mb-1">
              Target Budget
            </div>
            <div className="text-lg sm:text-2xl font-bold font-mono-num text-stone-700">
              ${plan.budget?.toFixed(2) || '0.00'}
            </div>
            <div className="text-3xs text-stone-500 mt-0.5">
              Allocated ceiling
            </div>
          </div>

          {/* Budget Variance */}
          <div className="p-4 sm:p-5">
            <div className="text-3xs uppercase tracking-widest font-bold text-stone-400 mb-1">
              Budget Status
            </div>
            <div className={`text-lg sm:text-2xl font-bold font-mono-num flex items-center justify-center ${
              isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {isOverBudget ? `-$${Math.abs(budgetVariance).toFixed(2)}` : `+$${budgetVariance.toFixed(2)}`}
            </div>
            <div className={`text-3xs font-semibold ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
              {isOverBudget ? 'Above target limit' : 'Under budget (Balanced)'}
            </div>
          </div>

          {/* Cost per Guest */}
          <div className="p-4 sm:p-5">
            <div className="text-3xs uppercase tracking-widest font-bold text-stone-400 mb-1">
              Cost Per Guest
            </div>
            <div className="text-lg sm:text-2xl font-bold font-mono-num text-stone-900">
              ${plan.costPerGuest.toFixed(2)}
            </div>
            <div className="text-3xs text-stone-500 mt-0.5">
              For {plan.partySummary.guestCount} attendees
            </div>
          </div>
        </div>

        {/* Breakdown of Essentials vs Optionals */}
        <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="font-semibold text-stone-600">Essentials:</span>
              <span className="font-bold font-mono-num text-stone-900">${plan.essentialsTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-semibold text-stone-600">Optionals:</span>
              <span className="font-bold font-mono-num text-amber-800">${plan.optionalsTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick budget tips */}
          {isOverBudget && (
            <div className="text-2xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-amber-600" />
              Tip: Toggle off optional items below to save ${plan.optionalsTotal.toFixed(2)}!
            </div>
          )}
        </div>
      </div>

      {/* Assumptions Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="w-full p-4 sm:px-6 bg-[#FAF9F6] hover:bg-stone-100 flex items-center justify-between text-left transition-colors border-b border-stone-200/70"
        >
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-xs">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-stone-900">Planning Assumptions & Portions Formula</h3>
              <p className="text-2xs text-stone-500">Transparent grocery scaling logic for drink multipliers, finger food & tableware</p>
            </div>
          </div>
          <div className="text-stone-400">
            {showAssumptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAssumptions && (
          <div className="p-4 sm:p-6 space-y-4 bg-white text-xs sm:text-sm">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {plan.assumptions.map((assumption, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">{assumption}</span>
                </li>
              ))}
            </ul>

            {/* Dietary & Theme Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                <div className="font-bold text-stone-900 flex items-center mb-1">
                  <Palette className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  Theme Integration ({plan.partySummary.theme})
                </div>
                <ul className="list-disc list-inside space-y-1 text-stone-600 text-2xs sm:text-xs">
                  {plan.themeHighlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200/70">
                <div className="font-bold text-stone-900 flex items-center mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Dietary Accommodations ({plan.partySummary.dietaryRestrictions?.join(', ') || 'Standard'})
                </div>
                <ul className="list-disc list-inside space-y-1 text-stone-600 text-2xs sm:text-xs">
                  {plan.dietaryAccommodations.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shopping List Section (Curated Aisle List) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] p-5 sm:p-6 space-y-5">
        {/* Stage 3: Refine Action Toolbar */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Stage 3 Refine Studio
              </span>
            </div>
            <span className="text-3xs text-stone-400 font-medium">Real-time recalculation of quantities & totals</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleQuickReduceCost}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs active:scale-98"
            >
              <TrendingDown className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              💰 Trim Budget (Auto-Reduce)
            </button>

            <button
              onClick={onOpenAddItemModal}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-2xs active:scale-98"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-amber-300" />
              ➕ Add Custom Item
            </button>

            {/* Guest count adjusters */}
            <div className="inline-flex items-center rounded-xl bg-white border border-stone-200/90 p-0.5 shadow-2xs text-xs">
              <span className="px-2.5 text-stone-500 font-medium flex items-center">
                <Users className="w-3 h-3 mr-1 text-stone-400" />
                Guests ({plan.partySummary.guestCount || 12}):
              </span>
              <button
                onClick={() => handleQuickAdjustGuests(-2)}
                className="px-2 py-0.5 rounded-lg hover:bg-stone-100 font-bold text-stone-700 active:scale-95"
                title="Decrease 2 guests"
              >
                -2
              </button>
              <button
                onClick={() => handleQuickAdjustGuests(5)}
                className="px-2 py-0.5 rounded-lg hover:bg-stone-100 font-bold text-amber-700 active:scale-95"
                title="Add 5 guests"
              >
                +5
              </button>
            </div>

            {/* Budget adjusters */}
            <div className="inline-flex items-center rounded-xl bg-white border border-stone-200/90 p-0.5 shadow-2xs text-xs">
              <span className="px-2.5 text-stone-500 font-medium flex items-center">
                <DollarSign className="w-3 h-3 mr-1 text-stone-400" />
                Budget (${plan.budget || 150}):
              </span>
              <button
                onClick={() => handleQuickAdjustBudget(-25)}
                className="px-2 py-0.5 rounded-lg hover:bg-stone-100 font-bold text-stone-700 active:scale-95"
                title="Decrease $25"
              >
                -$25
              </button>
              <button
                onClick={() => handleQuickAdjustBudget(50)}
                className="px-2 py-0.5 rounded-lg hover:bg-stone-100 font-bold text-emerald-700 active:scale-95"
                title="Add $50"
              >
                +$50
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-stone-100">
          {/* Category & Essential Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Aisles ({plan.items.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Essential vs Optional Filter */}
            <div className="flex items-center space-x-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200/80 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${filterType === 'all' ? 'bg-white shadow-2xs text-stone-900' : 'text-stone-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('essential')}
                className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${filterType === 'essential' ? 'bg-white shadow-2xs text-emerald-800' : 'text-stone-600'}`}
              >
                Essentials
              </button>
              <button
                onClick={() => setFilterType('optional')}
                className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${filterType === 'optional' ? 'bg-white shadow-2xs text-amber-800' : 'text-stone-600'}`}
              >
                Optionals
              </button>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyList}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl text-stone-700 bg-white hover:bg-stone-50 transition-colors border border-stone-200 shadow-2xs active:scale-98"
              title="Copy formatted list"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
              {copiedNotification ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl text-stone-700 bg-white hover:bg-stone-50 transition-colors border border-stone-200 shadow-2xs active:scale-98"
              title="Print shopping list"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
              Print
            </button>
          </div>
        </div>

        {/* Grouped Items List */}
        <div className="space-y-6">
          {categories
            .filter(cat => selectedCategory === 'all' || selectedCategory === cat)
            .map(categoryName => {
              const itemsInCat = filteredItems.filter(i => i.category === categoryName);
              if (itemsInCat.length === 0) return null;

              const catTotal = itemsInCat
                .filter(i => i.isEnabled !== false)
                .reduce((sum, i) => sum + i.estimatedPrice, 0);

              return (
                <div key={categoryName} className="space-y-2">
                  {/* Category Header */}
                  <div className="flex items-center justify-between py-1 border-b border-stone-100">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center">
                      {getCategoryIcon(categoryName)}
                      <span className="ml-1.5 text-stone-800">{categoryName}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full text-3xs font-semibold bg-stone-100 text-stone-600 font-mono-num">
                        {itemsInCat.length} products
                      </span>
                    </h4>
                    <span className="text-xs font-bold font-mono-num text-stone-800">
                      Subtotal: ${catTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Category Items Table */}
                  <div className="divide-y divide-stone-100 border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    {itemsInCat.map(item => {
                      const isEnabled = item.isEnabled !== false;
                      const isChecked = item.isChecked;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            !isEnabled
                              ? 'bg-stone-50/70 opacity-60'
                              : isChecked
                              ? 'bg-amber-50/20'
                              : 'hover:bg-stone-50/60'
                          }`}
                        >
                          {/* Left: Checkbox + Name + Quantity + Badges */}
                          <div className="flex items-start space-x-3 flex-1">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => toggleItemChecked(item.id)}
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-all ${
                                isChecked
                                  ? 'bg-stone-900 border-stone-900 text-amber-400 shadow-2xs'
                                  : 'border-stone-300 bg-white hover:border-amber-500 text-transparent'
                              }`}
                              title={isChecked ? "Mark as unpurchased" : "Mark as purchased"}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className={`font-semibold text-xs sm:text-sm ${
                                  isChecked ? 'line-through text-stone-400' : 'text-stone-900'
                                }`}>
                                  {item.name}
                                </span>

                                {/* Essential vs Optional Tag */}
                                {item.isEssential ? (
                                  <span className="px-1.5 py-0.5 rounded-md text-3xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    ESSENTIAL
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-md text-3xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
                                    OPTIONAL
                                  </span>
                                )}

                                {/* Aisle Location */}
                                {item.cymbalMartAisle && (
                                  <span className="px-2 py-0.5 rounded-md text-3xs font-medium bg-[#FAF9F6] text-stone-600 border border-stone-200/80 flex items-center">
                                    <MapPin className="w-2.5 h-2.5 mr-1 text-stone-400" />
                                    {item.cymbalMartAisle}
                                  </span>
                                )}

                                {/* Dietary Note */}
                                {item.dietaryNote && (
                                  <span className="px-2 py-0.5 rounded-md text-3xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                    {item.dietaryNote}
                                  </span>
                                )}
                              </div>

                              {/* Quantity Stepper & Unit Price Calculation */}
                              <div className="text-xs text-stone-600 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                {/* Interactive Quantity Stepper */}
                                <div className="inline-flex items-center rounded-lg bg-amber-50/90 border border-amber-200/80 p-0.5 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleQuantityStep(item.id, -1)}
                                    className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-amber-100 text-stone-700 hover:text-amber-950 font-bold border border-amber-200/60 active:scale-95 transition-all shadow-2xs disabled:opacity-40"
                                    title="Decrease quantity by 1"
                                    disabled={extractQuantityInfo(item).count <= 1}
                                  >
                                    <Minus className="w-3 h-3 stroke-[2.5]" />
                                  </button>

                                  <span className="px-2 font-bold font-mono-num text-amber-950 text-2xs">
                                    {item.quantityDescription}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleQuantityStep(item.id, 1)}
                                    className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-amber-100 text-stone-700 hover:text-amber-950 font-bold border border-amber-200/60 active:scale-95 transition-all shadow-2xs"
                                    title="Increase quantity by 1"
                                  >
                                    <Plus className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                </div>

                                {item.unitPrice && (
                                  <span className="text-2xs font-mono-num text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/60">
                                    ${item.unitPrice.toFixed(2)} / unit
                                  </span>
                                )}

                                {item.themeRelevance && (
                                  <span className="text-stone-500 italic text-2xs">
                                    • {item.themeRelevance}
                                  </span>
                                )}
                              </div>

                              {/* Custom Item Notes */}
                              {item.notes && (
                                <p className="text-3xs text-stone-400 mt-0.5">{item.notes}</p>
                              )}
                            </div>
                          </div>

                          {/* Right: Estimated Price + Replace + Enable Toggle + Delete */}
                          <div className="flex items-center justify-between sm:justify-end space-x-2.5 self-end sm:self-center pl-8 sm:pl-0">
                            <div className="text-right mr-1.5">
                              <div className="font-bold font-mono-num text-sm text-stone-900">
                                ${item.estimatedPrice.toFixed(2)}
                              </div>
                              <div className="text-3xs text-stone-400">
                                {isEnabled ? 'Subtotal' : 'Excluded'}
                              </div>
                            </div>

                            {/* Replace Product Button */}
                            <button
                              type="button"
                              onClick={() => setItemToReplace(item)}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-2xs font-semibold bg-stone-100 hover:bg-amber-50 hover:text-amber-900 text-stone-700 border border-stone-200 transition-colors active:scale-95"
                              title="Replace or swap product"
                            >
                              <ArrowLeftRight className="w-3 h-3 mr-1 text-stone-400" />
                              Swap
                            </button>

                            {/* Enable/Disable Toggle for Optional/Any items */}
                            <button
                              type="button"
                              onClick={() => toggleItemEnabled(item.id)}
                              className={`px-2.5 py-1 rounded-lg text-2xs font-semibold transition-all active:scale-95 ${
                                isEnabled
                                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                                  : 'bg-stone-900 text-white shadow-2xs'
                              }`}
                              title={isEnabled ? "Exclude from total" : "Include in total"}
                            >
                              {isEnabled ? "Exclude" : "Include"}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Bottom Finalize & Checkout Callout */}
        <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg font-serif-luxury text-stone-100">
                Ready for CymbalMart Curbside or Delivery?
              </div>
              <div className="text-2xs text-stone-300">
                {plan.items.filter(i => i.isEnabled !== false).length} items confirmed • Total: ${plan.estimatedTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="px-6 py-3 text-xs sm:text-sm font-bold rounded-xl text-stone-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md flex items-center active:scale-98"
            >
              <span>Finalize Shopping Plan</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>

        {/* Host Pro Tips Box */}
        {plan.proTips && plan.proTips.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-[#FAF9F6] border border-stone-200/90 text-stone-800">
            <h5 className="font-bold text-xs flex items-center mb-1.5 text-stone-900">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              CymbalMart Host Pro Tips
            </h5>
            <ul className="space-y-1 text-2xs sm:text-xs text-stone-600 list-disc list-inside">
              {plan.proTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Replace Item Modal */}
      {itemToReplace && (
        <ReplaceItemModal
          item={itemToReplace}
          isOpen={!!itemToReplace}
          onClose={() => setItemToReplace(null)}
          onReplace={handleReplaceItem}
        />
      )}

      {/* Finalize & Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          plan={plan}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
};
