import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, ListCheck, ArrowRight, CornerDownLeft } from 'lucide-react';
import { ChatMessage, PartyDetails } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  partyDetails: PartyDetails;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectQuickReply: (reply: string) => void;
  hasPlan: boolean;
  onViewPlanTab?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  partyDetails,
  onSendMessage,
  isLoading,
  onSelectQuickReply,
  hasPlan,
  onViewPlanTab,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  // Extract latest quick replies from the last agent message
  const lastAgentMsg = [...messages].reverse().find(m => m.sender === 'agent');
  const activeQuickReplies = lastAgentMsg?.quickReplies || [];

  return (
    <div className="flex flex-col h-[520px] lg:h-[620px] bg-stone-900 rounded-3xl border border-stone-800 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] overflow-hidden relative text-stone-100">
      {/* Chat Header */}
      <div className="p-4 sm:px-6 border-b border-stone-800 bg-stone-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold text-xs shadow-md">
              <Sparkles className="w-4 h-4 text-stone-950" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-stone-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-xs sm:text-sm text-stone-100 tracking-tight font-serif-luxury">
                CymbalMart AI Party Concierge
              </h3>
            </div>
            <p className="text-3xs text-stone-400 font-medium">Conversational grocery math, portion scaling & aisles</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasPlan && onViewPlanTab && (
            <button
              onClick={onViewPlanTab}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg text-amber-300 bg-stone-800/90 hover:bg-stone-800 border border-amber-500/30 hover:border-amber-400/50 transition-all shadow-2xs active:scale-98"
            >
              <ListCheck className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span>Inspect Plan</span>
            </button>
          )}
          <span className="hidden sm:inline-flex bg-stone-800/80 text-stone-300 text-3xs px-2.5 py-1 rounded-full border border-stone-700 font-mono-num">
            Interactive
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 custom-scrollbar">
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                isAgent ? 'justify-start' : 'justify-end'
              }`}
            >
              {isAgent && (
                <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                isAgent
                  ? 'bg-stone-800/90 text-stone-200 border border-stone-700/80 shadow-md rounded-tl-xs'
                  : 'bg-gradient-to-br from-amber-600 to-amber-700 text-stone-950 font-medium shadow-md rounded-tr-xs'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>

                {/* Plan Notification Card inside message */}
                {msg.planGenerated && (
                  <div className="mt-3.5 p-3 rounded-xl bg-stone-900/90 border border-amber-500/30 text-stone-100 flex items-center justify-between gap-3 shadow-inner">
                    <div>
                      <div className="font-bold text-xs text-amber-300 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                        {msg.planGenerated.title}
                      </div>
                      <div className="text-2xs text-stone-300 mt-0.5">
                        {msg.planGenerated.items.length} products • Est. Total: <span className="font-mono-num font-bold text-emerald-400">${msg.planGenerated.estimatedTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    {onViewPlanTab && (
                      <button
                        onClick={onViewPlanTab}
                        className="px-3 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg transition-all shadow-xs shrink-0 flex items-center active:scale-98"
                      >
                        <span>View List</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-3xs mt-2 font-mono-num ${isAgent ? 'text-stone-500' : 'text-stone-900/70 text-right'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {!isAgent && (
                <div className="w-7 h-7 rounded-lg bg-amber-800/40 border border-amber-700/60 text-amber-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-3.5 shadow-md rounded-tl-xs">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs text-stone-300 font-medium">Calculating portion math & CymbalMart catalog</span>
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Pills */}
      {activeQuickReplies.length > 0 && !isLoading && (
        <div className="px-4 py-2.5 bg-stone-950/80 border-t border-stone-800/90 overflow-x-auto no-scrollbar">
          <div className="text-3xs font-bold text-stone-400 uppercase tracking-widest mb-1.5">
            Suggested quick responses:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeQuickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => onSelectQuickReply(reply)}
                className="px-3 py-1 text-2xs font-semibold rounded-lg bg-stone-800/90 hover:bg-amber-400 hover:text-stone-950 text-stone-300 border border-stone-700/80 transition-all text-left whitespace-nowrap active:scale-95 shadow-2xs"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-stone-950 border-t border-stone-800 flex items-center space-x-2.5">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell the concierge about your party (e.g. '18 guests for a BBQ on Saturday, $200 budget')..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-700/90 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-stone-900/90 text-stone-100 placeholder:text-stone-500 transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shrink-0 active:scale-95"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
