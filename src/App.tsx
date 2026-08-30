import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  PartyParametersCard 
} from './components/PartyParametersCard';
import { 
  ChatInterface 
} from './components/ChatInterface';
import { 
  ShoppingPlanView 
} from './components/ShoppingPlanView';
import { 
  InStoreMode 
} from './components/InStoreMode';
import { 
  AddItemModal 
} from './components/AddItemModal';
import { 
  QuickPresetsModal 
} from './components/QuickPresetsModal';
import { 
  PartyDetails, 
  ShoppingPlan, 
  ChatMessage, 
  QuickTheme, 
  ShoppingItem,
  WorkflowStage
} from './types';
import { StageProgressBar } from './components/StageProgressBar';
import { 
  Sparkles, 
  MessageSquare, 
  ListCheck, 
  ShoppingBag, 
  HelpCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const INITIAL_PARTY_DETAILS: PartyDetails = {
  partyType: '',
  guestCount: null,
  date: '',
  theme: '',
  budget: null,
  dietaryRestrictions: [],
  specialRequests: '',
};

const INITIAL_GREETING_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'agent',
  text: `👋 Welcome to CymbalMart's Party Planner Shopping Agent!\n\nI help busy party hosts create practical, budget-conscious grocery & party supply lists scaled precisely to your guest count.\n\nTo tailor your shopping plan, tell me about your event (party type, guest count, budget, date, theme, dietary needs, or special requests).`,
  timestamp: 'Just now',
  quickReplies: [
    "Birthday party for 15 guests ($150 budget)",
    "Backyard BBQ for 20 people",
    "Kids Superhero party with Nut Allergy",
    "Game night with Taco Bar ($100)",
    "Elegant cocktail party with tapas"
  ]
};

export default function App() {
  const [partyDetails, setPartyDetails] = useState<PartyDetails>(INITIAL_PARTY_DETAILS);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING_MESSAGE]);
  const [currentPlan, setCurrentPlan] = useState<ShoppingPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'plan'>('chat');
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('define');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Modals
  const [isInStoreMode, setIsInStoreMode] = useState<boolean>(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);

  // Send message to server agent
  const handleSendMessage = async (text: string, forcePlan: boolean = false) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          partyDetails,
          userMessage: text,
          forceGeneratePlan: forcePlan,
          currentStage: workflowStage,
          currentPlan: currentPlan
        })
      });

      const data = await response.json();

      if (data.extractedDetails) {
        setPartyDetails((prev) => ({ ...prev, ...data.extractedDetails }));
      }

      if (data.stage) {
        setWorkflowStage(data.stage);
      }

      if (data.shoppingPlan) {
        setCurrentPlan(data.shoppingPlan);
        setActiveTab('plan');
      }

      const agentMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: data.replyText || "I've updated your party plan!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: data.quickReplies || [],
        missingFields: data.missingFields || [],
        planGenerated: data.shoppingPlan || undefined
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error("Failed to send message:", err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: "I encountered a minor network glitch, but I've preserved your party parameters. You can still generate or edit your shopping list!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick reply click
  const handleSelectQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  // Stage selection via progress bar
  const handleSelectStage = (stage: WorkflowStage) => {
    setWorkflowStage(stage);
    if (stage === 'define') {
      setActiveTab('chat');
    } else if (stage === 'review' || stage === 'refine' || stage === 'finalize') {
      if (currentPlan) {
        setActiveTab('plan');
      } else {
        handleSendMessage("Generate shopping list based on current party details", true);
      }
    }
  };

  // Manual Trigger to generate/update shopping plan directly
  const handleTriggerGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyDetails: {
            ...partyDetails,
            partyType: partyDetails.partyType || "Celebration Party",
            guestCount: partyDetails.guestCount || 12,
            budget: partyDetails.budget || 150,
            theme: partyDetails.theme || "Festive Gathering",
            date: partyDetails.date || "Upcoming Weekend",
            dietaryRestrictions: partyDetails.dietaryRestrictions?.length ? partyDetails.dietaryRestrictions : ["None"]
          }
        })
      });
      const data = await response.json();
      if (data.plan) {
        setCurrentPlan(data.plan);
        setActiveTab('plan');

        const agentMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: `🎉 Here is your updated CymbalMart shopping plan for **${data.plan.partySummary.guestCount} guests** with your **$${data.plan.budget} budget**! I've grouped all items by supermarket category, scaled the quantities, and clearly separated essentials from optional items.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          planGenerated: data.plan,
          quickReplies: ["Show In-Store Shopping Mode", "Make it cheaper", "Add more finger foods", "Copy shopping list"]
        };
        setMessages((prev) => [...prev, agentMsg]);
      }
    } catch (err) {
      console.error("Error generating plan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Preset Template
  const handleSelectPreset = (preset: QuickTheme) => {
    const newDetails: PartyDetails = {
      partyType: preset.type,
      guestCount: preset.defaultGuests,
      date: 'This Saturday',
      theme: preset.suggestedTheme,
      budget: preset.defaultBudget,
      dietaryRestrictions: preset.dietarySuggestions,
      specialRequests: preset.specialRequests,
    };
    setPartyDetails(newDetails);

    const userPrompt = `I want to plan a ${preset.name} for ${preset.defaultGuests} guests with a $${preset.defaultBudget} budget on this Saturday. Theme is ${preset.suggestedTheme}. Dietary: ${preset.dietarySuggestions.join(', ')}.`;
    handleSendMessage(userPrompt, true);
  };

  // Reset all
  const handleReset = () => {
    if (window.confirm("Start a new party plan? This will clear current chat and shopping list.")) {
      setPartyDetails(INITIAL_PARTY_DETAILS);
      setCurrentPlan(null);
      setMessages([INITIAL_GREETING_MESSAGE]);
      setActiveTab('chat');
    }
  };

  // Add custom item
  const handleAddItem = (item: ShoppingItem) => {
    if (!currentPlan) return;
    const updatedItems = [item, ...currentPlan.items];
    const activeItems = updatedItems.filter(i => i.isEnabled !== false);
    const essentialsTotal = activeItems
      .filter(i => i.isEssential)
      .reduce((sum, i) => sum + i.estimatedPrice, 0);
    const optionalsTotal = activeItems
      .filter(i => !i.isEssential)
      .reduce((sum, i) => sum + i.estimatedPrice, 0);
    const estimatedTotal = Number((essentialsTotal + optionalsTotal).toFixed(2));
    const budget = currentPlan.budget || 150;
    const guests = currentPlan.partySummary.guestCount || 12;

    setCurrentPlan({
      ...currentPlan,
      items: updatedItems,
      essentialsTotal: Number(essentialsTotal.toFixed(2)),
      optionalsTotal: Number(optionalsTotal.toFixed(2)),
      estimatedTotal,
      remainingBudget: Number((budget - estimatedTotal).toFixed(2)),
      costPerGuest: Number((estimatedTotal / guests).toFixed(2))
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <Navbar
        partyDetails={partyDetails}
        currentPlan={currentPlan}
        onReset={handleReset}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        onToggleInStoreMode={() => setIsInStoreMode(true)}
        isInStoreMode={isInStoreMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Stage 1-4 Guided Workflow Progress Bar */}
        <StageProgressBar
          currentStage={workflowStage}
          onSelectStage={handleSelectStage}
          hasPlan={!!currentPlan}
        />

        {/* 7-Factor Party Parameters Card */}
        <PartyParametersCard
          partyDetails={partyDetails}
          onUpdatePartyDetails={(updated) => setPartyDetails((prev) => ({ ...prev, ...updated }))}
          onTriggerGenerate={handleTriggerGenerate}
          isGenerating={isLoading}
        />

        {/* View Switcher Tabs (For mobile & split layout) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                activeTab === 'chat'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-1.5 text-indigo-400" />
              Party Planner Chat
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`inline-flex items-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all relative ${
                activeTab === 'plan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ListCheck className="w-4 h-4 mr-1.5 text-indigo-300" />
              CymbalMart Shopping List
              {currentPlan && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-3xs font-bold bg-white text-indigo-700">
                  {currentPlan.items.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick status text */}
          <div className="hidden md:flex items-center text-xs text-slate-400 space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-mono text-2xs uppercase tracking-wider">CymbalMart AI Shopping Engine Connected</span>
          </div>
        </div>

        {/* Content Area: Chat or Shopping Plan (or Side-by-Side on very wide screens if plan exists) */}
        <div className="space-y-6">
          {activeTab === 'chat' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Chat Column */}
              <div className={currentPlan ? "lg:col-span-7" : "lg:col-span-12"}>
                <ChatInterface
                  messages={messages}
                  partyDetails={partyDetails}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onSelectQuickReply={handleSelectQuickReply}
                  hasPlan={!!currentPlan}
                  onViewPlanTab={() => setActiveTab('plan')}
                />
              </div>

              {/* Side Preview of Plan if exists */}
              {currentPlan && (
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Current Plan Summary</h3>
                      <p className="text-2xs text-slate-500">{currentPlan.title}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('plan')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      Open Full View →
                    </button>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-3xs text-slate-400 font-bold uppercase tracking-wider">Total Estimated</div>
                      <div className="text-base font-bold font-mono text-slate-900">${currentPlan.estimatedTotal.toFixed(2)}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-3xs text-slate-400 font-bold uppercase tracking-wider">Budget Status</div>
                      <div className={`text-base font-bold font-mono ${currentPlan.remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {currentPlan.remainingBudget >= 0 ? `+$${currentPlan.remainingBudget.toFixed(2)} under` : `-$${Math.abs(currentPlan.remainingBudget).toFixed(2)} over`}
                      </div>
                    </div>
                  </div>

                  {/* Top Essential Items Preview */}
                  <div className="space-y-1.5">
                    <div className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                      Key Items Preview ({currentPlan.items.length} items total)
                    </div>
                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                      {currentPlan.items.slice(0, 5).map(item => (
                        <div key={item.id} className="p-2.5 flex items-center justify-between text-xs bg-white">
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                            <div className="text-3xs text-slate-400">{item.quantityDescription} • {item.cymbalMartAisle}</div>
                          </div>
                          <div className="font-bold font-mono text-slate-900 shrink-0">
                            ${item.estimatedPrice.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('plan')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-full transition-colors shadow-2xs text-center"
                  >
                    View All Items & Assumptions
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {currentPlan ? (
                <ShoppingPlanView
                  plan={currentPlan}
                  onUpdatePlan={(updated) => setCurrentPlan(updated)}
                  onOpenAddItemModal={() => setIsAddItemModalOpen(true)}
                  onOpenInStoreMode={() => setIsInStoreMode(true)}
                />
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">No Shopping List Generated Yet</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Chat with the CymbalMart agent or select a template to automatically generate your personalized grocery & supplies list.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold transition-colors"
                    >
                      Return to Chat
                    </button>
                    <button
                      onClick={() => setIsPresetsModalOpen(true)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-semibold transition-colors"
                    >
                      Browse Party Templates
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* In-Store Mode Modal */}
      {isInStoreMode && currentPlan && (
        <InStoreMode
          plan={currentPlan}
          onUpdatePlan={(updated) => setCurrentPlan(updated)}
          onClose={() => setIsInStoreMode(false)}
        />
      )}

      {/* Add Custom Item Modal */}
      {isAddItemModalOpen && (
        <AddItemModal
          onClose={() => setIsAddItemModalOpen(false)}
          onAddItem={handleAddItem}
        />
      )}

      {/* Presets Modal */}
      {isPresetsModalOpen && (
        <QuickPresetsModal
          onClose={() => setIsPresetsModalOpen(false)}
          onSelectPreset={handleSelectPreset}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 CymbalMart Party Planning Services • Powered by Google AI</span>
          <span>Fresh Groceries, Tableware & Beverage Estimates tailored to your guest count</span>
        </div>
      </footer>
    </div>
  );
}
