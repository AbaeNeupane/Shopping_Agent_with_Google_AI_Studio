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
  ArrowRight
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

  // Toggle item enabled state (especially for optional items to trim budget)
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

  // Group items by category
  const categories: string[] = Array.from(new Set<string>(plan.items.map(i => i.category)));

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

  return (
    <div className="space-y-6">
      {/* Header & Budget Gauge Card (Bento module) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CymbalMart Tailored Plan
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  {new Date(plan.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{plan.title}</h1>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-300 mt-2">
                <span className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  {plan.partySummary.guestCount} Guests
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  {plan.partySummary.date}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Palette className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  {plan.partySummary.theme}
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="inline-flex items-center px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md active:scale-98"
              >
                <CreditCard className="w-4 h-4 mr-1.5" />
                Finalize & Checkout
              </button>
              <button
                onClick={onOpenInStoreMode}
                className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
              >
                <Store className="w-4 h-4 mr-1.5 text-indigo-400" />
                In-Store Mode
              </button>
            </div>
          </div>
        </div>

        {/* Budget Variance & Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-200 bg-slate-50/70 text-center text-xs sm:text-sm">
          {/* Estimated Total */}
          <div className="p-3.5 sm:p-4">
            <div className="text-3xs uppercase tracking-widest font-bold text-slate-400 mb-0.5">
              Estimated Total
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
              ${plan.estimatedTotal.toFixed(2)}
            </div>
            <div className="text-3xs text-slate-500">
              {activeItems.length} active items
            </div>
          </div>

          {/* Budget Limit */}
          <div className="p-3.5 sm:p-4">
            <div className="text-3xs uppercase tracking-widest font-bold text-slate-400 mb-0.5">
              Target Budget
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-700">
              ${plan.budget?.toFixed(2) || '0.00'}
            </div>
            <div className="text-3xs text-slate-500">
              Allocated ceiling
            </div>
          </div>

          {/* Budget Variance */}
          <div className="p-3.5 sm:p-4">
            <div className="text-3xs uppercase tracking-widest font-bold text-slate-400 mb-0.5">
              Budget Status
            </div>
            <div className={`text-lg sm:text-xl font-bold font-mono flex items-center justify-center ${
              isOverBudget ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {isOverBudget ? `-$${Math.abs(budgetVariance).toFixed(2)}` : `+$${budgetVariance.toFixed(2)}`}
            </div>
            <div className={`text-3xs font-medium ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isOverBudget ? 'Above target budget' : 'Under budget (Safe)'}
            </div>
          </div>

          {/* Cost per Guest */}
          <div className="p-3.5 sm:p-4">
            <div className="text-3xs uppercase tracking-widest font-bold text-slate-400 mb-0.5">
              Cost Per Guest
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
              ${plan.costPerGuest.toFixed(2)}
            </div>
            <div className="text-3xs text-slate-500">
              For {plan.partySummary.guestCount} attendees
            </div>
          </div>
        </div>

        {/* Breakdown of Essentials vs Optionals & Progress bar */}
        <div className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="font-medium text-slate-600">Essentials:</span>
              <span className="font-bold font-mono text-slate-900">${plan.essentialsTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="font-medium text-slate-600">Optionals:</span>
              <span className="font-bold font-mono text-indigo-600">${plan.optionalsTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick budget tips */}
          {isOverBudget && (
            <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-amber-600" />
              Tip: Toggle off optional items below to trim ${plan.optionalsTotal.toFixed(2)}!
            </div>
          )}
        </div>
      </div>

      {/* Assumptions Bento Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="w-full p-4 sm:px-6 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors border-b border-slate-100"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-800">Planning Assumptions & Calculation Logic</h3>
              <p className="text-2xs text-slate-500">Transparent grocery formulas for drink counts, food portions & tableware</p>
            </div>
          </div>
          <div className="text-slate-400">
            {showAssumptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAssumptions && (
          <div className="p-4 sm:p-6 space-y-4 bg-white text-xs sm:text-sm">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {plan.assumptions.map((assumption, idx) => (
                <li key={idx} className="flex items-start space-x-2 p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-slate-800">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">{assumption}</span>
                </li>
              ))}
            </ul>

            {/* Dietary & Theme Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 flex items-center mb-1">
                  <Palette className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  Theme Integration ({plan.partySummary.theme})
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-2xs sm:text-xs">
                  {plan.themeHighlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 flex items-center mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Dietary Accommodations ({plan.partySummary.dietaryRestrictions?.join(', ') || 'Standard'})
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-2xs sm:text-xs">
                  {plan.dietaryAccommodations.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shopping List Section (Bento module) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        {/* Filter and Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Category & Essential Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category dropdown / pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Categories ({plan.items.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Essential vs Optional Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-0.5 rounded-full font-medium ${filterType === 'all' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('essential')}
                className={`px-3 py-0.5 rounded-full font-medium ${filterType === 'essential' ? 'bg-white shadow-2xs text-indigo-700' : 'text-slate-600'}`}
              >
                Essentials
              </button>
              <button
                onClick={() => setFilterType('optional')}
                className={`px-3 py-0.5 rounded-full font-medium ${filterType === 'optional' ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-600'}`}
              >
                Optionals
              </button>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAddItemModal}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Item
            </button>
            <button
              onClick={handleCopyList}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full text-slate-700 bg-white hover:bg-slate-100 transition-colors border border-slate-200 shadow-2xs"
              title="Copy formatted list"
            >
              <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {copiedNotification ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full text-slate-700 bg-white hover:bg-slate-100 transition-colors border border-slate-200 shadow-2xs"
              title="Print shopping list"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" />
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
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                      <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                      {categoryName}
                      <span className="ml-2 px-2 py-0.5 rounded-full text-3xs font-medium bg-slate-100 text-slate-600">
                        {itemsInCat.length} items
                      </span>
                    </h4>
                    <span className="text-xs font-bold font-mono text-slate-700">
                      Subtotal: ${catTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Category Items Table / Bento Rows */}
                  <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl overflow-hidden bg-white">
                    {itemsInCat.map(item => {
                      const isEnabled = item.isEnabled !== false;
                      const isChecked = item.isChecked;

                      return (
                        <div
                          key={item.id}
                          className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            !isEnabled
                              ? 'bg-slate-50/70 opacity-60'
                              : isChecked
                              ? 'bg-indigo-50/30'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          {/* Left: Checkbox + Name + Quantity + Badges */}
                          <div className="flex items-start space-x-3 flex-1">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => toggleItemChecked(item.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                                isChecked
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'border-slate-300 bg-white hover:border-indigo-500 text-transparent'
                              }`}
                              title={isChecked ? "Mark as unpurchased" : "Mark as purchased"}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className={`font-semibold text-xs sm:text-sm ${
                                  isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}>
                                  {item.name}
                                </span>

                                {/* Essential vs Optional Tag */}
                                {item.isEssential ? (
                                  <span className="px-1.5 py-0.5 rounded text-3xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    ESSENTIAL
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-3xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                    OPTIONAL
                                  </span>
                                )}

                                {/* Aisle Location */}
                                {item.cymbalMartAisle && (
                                  <span className="px-1.5 py-0.5 rounded text-3xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {item.cymbalMartAisle}
                                  </span>
                                )}

                                {/* Dietary Note */}
                                {item.dietaryNote && (
                                  <span className="px-1.5 py-0.5 rounded text-3xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                    {item.dietaryNote}
                                  </span>
                                )}
                              </div>

                              {/* Quantity & Sizing Calculation */}
                              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 text-xs">
                                  Qty: {item.quantityDescription}
                                </span>
                                {item.themeRelevance && (
                                  <span className="text-slate-500 italic text-2xs">
                                    • {item.themeRelevance}
                                  </span>
                                )}
                              </div>

                              {/* Custom Item Notes */}
                              {item.notes && (
                                <p className="text-3xs text-slate-400 mt-0.5">{item.notes}</p>
                              )}
                            </div>
                          </div>

                          {/* Right: Estimated Price + Replace + Enable Toggle + Delete */}
                          <div className="flex items-center justify-between sm:justify-end space-x-2.5 self-end sm:self-center pl-8 sm:pl-0">
                            <div className="text-right mr-1">
                              <div className="font-bold font-mono text-sm text-slate-900">
                                ${item.estimatedPrice.toFixed(2)}
                              </div>
                              <div className="text-3xs text-slate-400">
                                {isEnabled ? 'In total' : 'Excluded'}
                              </div>
                            </div>

                            {/* Replace Product Button */}
                            <button
                              type="button"
                              onClick={() => setItemToReplace(item)}
                              className="inline-flex items-center px-2 py-1 rounded-full text-2xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-colors"
                              title="Replace or swap product"
                            >
                              <ArrowLeftRight className="w-3 h-3 mr-1 text-slate-500" />
                              Replace
                            </button>

                            {/* Enable/Disable Toggle for Optional/Any items */}
                            <button
                              type="button"
                              onClick={() => toggleItemEnabled(item.id)}
                              className={`px-2.5 py-1 rounded-full text-2xs font-semibold transition-colors ${
                                isEnabled
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                  : 'bg-indigo-600 text-white shadow-2xs'
                              }`}
                              title={isEnabled ? "Exclude from total" : "Include in total"}
                            >
                              {isEnabled ? "Exclude" : "Include"}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
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
        <div className="mt-6 p-4 sm:p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base">Ready for CymbalMart Checkout?</div>
              <div className="text-2xs text-slate-300">
                {plan.items.filter(i => i.isEnabled !== false).length} items selected • Estimated Total: ${plan.estimatedTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-sm flex items-center"
            >
              <span>Finalize Shopping Plan</span>
              <ArrowRight className="w-4 h-4 ml-1.5 text-indigo-600" />
            </button>
          </div>
        </div>

        {/* Pro Tips Bento Box */}
        {plan.proTips && plan.proTips.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950">
            <h5 className="font-bold text-xs flex items-center mb-1.5 text-amber-900">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
              CymbalMart Host Pro Tips
            </h5>
            <ul className="space-y-1 text-xs text-amber-900 list-disc list-inside">
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
