import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, CornerDownLeft, RefreshCw, MessageSquare, ListCheck } from 'lucide-react';
import { ChatMessage, PartyDetails, ShoppingPlan } from '../types';

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
    <div className="flex flex-col h-[520px] lg:h-[600px] bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative text-white">
      {/* Chat Header */}
      <div className="p-4 sm:px-6 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-indigo-500/30">
            AI
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-xs sm:text-sm text-slate-100 tracking-tight">CymbalMart AI Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-3xs sm:text-2xs text-slate-400">Natural language party & grocery reasoning</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasPlan && onViewPlanTab && (
            <button
              onClick={onViewPlanTab}
              className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full text-indigo-300 bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 transition-colors shadow-2xs"
            >
              <ListCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              View List
            </button>
          )}
          <span className="hidden sm:inline-flex bg-slate-800 text-indigo-400 text-2xs px-2.5 py-0.5 rounded-full border border-slate-700 font-medium">
            Live Console
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-900/90 custom-scrollbar">
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
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                  AI
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                isAgent
                  ? 'bg-slate-800 text-slate-200 border border-slate-700/60 shadow-sm rounded-tl-none'
                  : 'bg-indigo-600 text-white shadow-md rounded-tr-none'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Plan Notification Card inside message */}
                {msg.planGenerated && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-slate-100 flex items-center justify-between gap-2 shadow-inner">
                    <div>
                      <div className="font-bold text-xs text-indigo-300 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                        {msg.planGenerated.title}
                      </div>
                      <div className="text-2xs text-slate-300 mt-0.5">
                        {msg.planGenerated.items.length} items • Est. Total: <span className="font-mono font-semibold text-emerald-400">${msg.planGenerated.estimatedTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    {onViewPlanTab && (
                      <button
                        onClick={onViewPlanTab}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-xs shrink-0"
                      >
                        Inspect List
                      </button>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-3xs mt-1.5 ${isAgent ? 'text-slate-400' : 'text-indigo-200 text-right'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {!isAgent && (
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              AI
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 shadow-sm rounded-tl-none">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-300 font-medium">Calculating portion math & CymbalMart catalog</span>
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Pills */}
      {activeQuickReplies.length > 0 && !isLoading && (
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 overflow-x-auto no-scrollbar">
          <div className="text-3xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Suggested quick responses:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeQuickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => onSelectQuickReply(reply)}
                className="px-3 py-1 text-xs font-medium rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 transition-all text-left whitespace-nowrap active:scale-95 shadow-2xs"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell the agent about your party (e.g., '18 guests for a BBQ on Saturday, $200 budget')..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-slate-100 placeholder:text-slate-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/40 shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
