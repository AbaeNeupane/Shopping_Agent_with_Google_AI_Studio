import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShoppingBag, 
  Truck, 
  Store, 
  Clock, 
  MapPin, 
  DollarSign, 
  Printer, 
  Copy, 
  Share2, 
  Calendar, 
  Users, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode
} from 'lucide-react';
import { ShoppingPlan } from '../types';

interface CheckoutModalProps {
  plan: ShoppingPlan;
  isOpen: boolean;
  onClose: () => void;
}

const CYMBALMART_STORES = [
  { id: 'store-1', name: 'CymbalMart Supercenter #104 - Metro Plaza', address: '100 Market St, Suite A', distance: '1.2 miles' },
  { id: 'store-2', name: 'CymbalMart Fresh Market #208 - Westside', address: '450 West End Ave', distance: '2.8 miles' },
  { id: 'store-3', name: 'CymbalMart Express & Deli #312 - Bayview', address: '820 Ocean Blvd', distance: '4.5 miles' },
];

const TIME_SLOTS = [
  "Today (2:00 PM - 3:00 PM)",
  "Today (4:00 PM - 5:00 PM)",
  "Tomorrow Morning (9:00 AM - 10:00 AM)",
  "Tomorrow Afternoon (2:00 PM - 3:00 PM)",
  "Party Day Morning (8:00 AM - 9:00 AM)"
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
}) => {
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedStore, setSelectedStore] = useState(CYMBALMART_STORES[0].id);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [contactName, setContactName] = useState('Party Host');
  const [contactPhone, setContactPhone] = useState('(555) 382-9102');
  const [deliveryAddress, setDeliveryAddress] = useState('742 Evergreen Terrace, Springfield');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const activeItems = plan.items.filter(i => i.isEnabled !== false);
  const subtotal = plan.estimatedTotal;
  const estimatedTax = Number((subtotal * 0.0825).toFixed(2));
  const serviceFee = fulfillmentType === 'delivery' ? 5.99 : 0.00;
  const finalGrandTotal = Number((subtotal + estimatedTax + serviceFee).toFixed(2));
  const isUnderBudget = finalGrandTotal <= plan.budget;

  const handleCompleteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const lines = [
      `🎉 CYMBALMART PARTY ORDER CONFIRMATION`,
      `Order #: CYMBAL-PARTY-${Math.floor(100000 + Math.random() * 900000)}`,
      `Event: ${plan.title}`,
      `Fulfillment: ${fulfillmentType === 'pickup' ? 'Curbside Drive-Up Pickup' : 'Express Delivery'}`,
      `Time Slot: ${selectedTime}`,
      `Guest Count: ${plan.partySummary.guestCount} | Target Budget: $${plan.budget}`,
      `Final Total: $${finalGrandTotal.toFixed(2)} (${isUnderBudget ? 'Under Target Budget!' : 'Total with tax'})`,
      `\nItems to prepare (${activeItems.length} items):`,
      ...activeItems.map(i => `• [${i.cymbalMartAisle || 'Aisle'}] ${i.name} - ${i.quantityDescription} ($${i.estimatedPrice.toFixed(2)})`)
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-slate-100">
                {isSubmitted ? 'Order Confirmed!' : 'Finalize & Checkout Shopping Plan'}
              </h2>
              <p className="text-2xs text-slate-400">
                {isSubmitted ? 'Your CymbalMart party grocery reservation is ready' : 'Curated, budget-reconciled grocery & supplies list for your event'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleCompleteCheckout} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm">
            {/* Event Summary Ribbon */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 text-sm">{plan.title}</div>
                <div className="text-2xs text-slate-500 flex items-center space-x-2">
                  <span>{plan.partySummary.guestCount} Guests</span>
                  <span>•</span>
                  <span>{plan.partySummary.theme}</span>
                  <span>•</span>
                  <span>{plan.partySummary.date}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xs uppercase tracking-wider font-bold text-slate-400">Active Items</div>
                <div className="font-bold font-mono text-sm text-indigo-700">{activeItems.length} Products</div>
              </div>
            </div>

            {/* Fulfillment Options (Pickup vs Delivery) */}
            <div>
              <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">
                1. Select Fulfillment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('pickup')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    fulfillmentType === 'pickup'
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">CymbalMart Drive-Up Pickup</div>
                    <div className="text-2xs text-slate-500">Free • Ready in reserved staging bays</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    fulfillmentType === 'delivery'
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Same-Day Express Delivery</div>
                    <div className="text-2xs text-slate-500">+$5.99 • Direct to your party venue</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Store Location & Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fulfillmentType === 'pickup' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-xs">CymbalMart Location</label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-xs sm:text-sm"
                  >
                    {CYMBALMART_STORES.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.distance})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-xs">Delivery Address</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-xs sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">Pickup / Delivery Window</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-xs sm:text-sm"
                >
                  {TIME_SLOTS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">Host Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">Mobile Phone (for SMS status)</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Financial Reconciliation Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1">
                Receipt & Budget Reconciliation
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Grocery & Supplies Subtotal ({activeItems.length} items)</span>
                <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Estimated Local Sales Tax</span>
                <span className="font-mono font-medium">${estimatedTax.toFixed(2)}</span>
              </div>

              {fulfillmentType === 'delivery' && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Express Party Delivery</span>
                  <span className="font-mono font-medium">${serviceFee.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Estimated Final Total</span>
                <span className="font-mono text-base text-indigo-600">${finalGrandTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-2xs pt-1">
                <span className="text-slate-500">Target Budget: ${plan.budget.toFixed(2)}</span>
                <span className={`font-semibold ${isUnderBudget ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isUnderBudget ? `✓ $${(plan.budget - finalGrandTotal).toFixed(2)} under budget` : `~$${(finalGrandTotal - plan.budget).toFixed(2)} over budget`}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-full text-slate-600 hover:bg-slate-100"
              >
                Continue Refining
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs sm:text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md flex items-center"
              >
                <span>Confirm & Finalize Plan</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation State */
          <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6 text-center text-slate-800">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-75">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Order Reference: CYMBAL-PARTY-84920
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Your Party Shopping Plan is Ready!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We've reserved and organized your items by aisle. A confirmation SMS has been sent to {contactPhone}.
              </p>
            </div>

            {/* Barcode & Store Details Bento Box */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 text-left max-w-lg mx-auto space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="text-3xs uppercase tracking-wider font-bold text-slate-400">Scheduled Fulfillment</div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">{selectedTime}</div>
                  <div className="text-2xs text-slate-500">{fulfillmentType === 'pickup' ? 'Curbside Drive-Up' : 'Express Delivery'}</div>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
              </div>

              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-600">Total Items Packed:</span>
                <span className="font-bold text-slate-900">{activeItems.length} Products</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Total Amount:</span>
                <span className="font-bold font-mono text-indigo-600">${finalGrandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Tools */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Print Order Sheet
              </button>
              <button
                onClick={handleCopySummary}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                {copiedText ? "Copied Order!" : "Copy Order Text"}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                Return to Planner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
