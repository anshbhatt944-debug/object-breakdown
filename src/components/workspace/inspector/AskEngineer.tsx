import React, { useState } from 'react';
import { ObjectBreakdownData, ComponentNode } from '../../../types/objectData';
import { Bot, Send, Sparkles, User, CornerDownLeft, Lightbulb } from 'lucide-react';

interface AskEngineerProps {
  objectData: ObjectBreakdownData;
  selectedComponent: ComponentNode | null;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AskEngineer: React.FC<AskEngineerProps> = ({
  objectData,
  selectedComponent,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your AI Staff Mechanical Engineer. I have complete CAD geometry, FEA load cases, and material specifications for **${objectData.name}**${
        selectedComponent ? ` and currently focused on **${selectedComponent.name}** (${selectedComponent.cadId})` : ''
      }. What technical question can I answer for you?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Synthesize realistic AI Staff Engineer response
    setTimeout(() => {
      const response = generateAIResponse(q, objectData, selectedComponent);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  function generateAIResponse(
    query: string,
    obj: ObjectBreakdownData,
    comp: ComponentNode | null
  ): string {
    const qLower = query.toLowerCase();

    if (qLower.includes('material') || qLower.includes('steel') || qLower.includes('brass') || qLower.includes('plastic') || qLower.includes('titanium')) {
      return `From a materials engineering perspective, ${comp ? comp.name : obj.name} uses **${comp ? comp.material.name : obj.materials[0]?.name}**. This was selected primarily to satisfy the contact stress threshold and prevent abrasive wear over millions of cycles, while maintaining tight manufacturing tolerances (typically ${comp ? comp.manufacturing.tolerance : '±0.01 mm'}). Alternative materials like aluminum or non-reinforced polymers would either gall under friction or suffer creep under sustained load.`;
    }

    if (qLower.includes('cheaper') || qLower.includes('cost') || qLower.includes('reduce')) {
      return `To reduce production costs for ${obj.name} by approximately **${obj.redesignInsights.cheaperVersion.costReduction}**, manufacturing engineers would implement: \n\n• ${obj.redesignInsights.cheaperVersion.changes}\n\n**Engineering Trade-offs:** ${obj.redesignInsights.cheaperVersion.tradeoffs}`;
    }

    if (qLower.includes('fail') || qLower.includes('break') || qLower.includes('wear')) {
      return `The primary fatigue and failure mechanism for this system is **cyclic shear stress and micro-fretting**. In ${comp ? comp.name : obj.name}, the component experiences peak stresses that require specific surface treatments (such as induction hardening, shot peening, or diamond-like carbon coatings) to ensure infinite fatigue life past $10^7$ cycles.`;
    }

    if (qLower.includes('how') || qLower.includes('work') || qLower.includes('mechanism')) {
      return `The fundamental kinematic principle governing ${obj.name} relies on converting energy through mechanical advantage and precise physical constraints. Key operating parameters include:\n\n• **Governing Equation:** ${obj.engineeringEquations[0]?.latex || 'F = m · a'}\n• **Energy Conversion Efficiency:** ~88-94%\n• **Cycle Time:** Under ${comp?.manufacturing.cycleTime || '1.2 seconds'} per actuation.`;
    }

    return `Regarding "${query}": In ${obj.name}, mechanical engineers optimized this specific parameter through finite element analysis (FEA) to ensure a safety factor $SF > 2.0$. Every dimension, draft angle, and material choice balances high-speed automated assembly yield against real-world environmental durability.`;
  }

  return (
    <div className="flex flex-col h-full bg-[#0d111a]/95 text-slate-300 font-sans select-none">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00f2ad]/10 border border-[#00f2ad]/30 flex items-center justify-center text-[#00f2ad]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono-cad font-bold text-slate-100 uppercase tracking-wider">
              Ask the Engineer
            </h3>
            <span className="text-[10px] text-slate-400 font-mono-cad">
              Context: {objectData.name} {selectedComponent ? `→ ${selectedComponent.name}` : ''}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono-cad px-2 py-0.5 rounded-full bg-[#00f2ad]/10 text-[#00f2ad] border border-[#00f2ad]/30">
          Staff AI Active
        </span>
      </div>

      {/* Suggested Question Chips */}
      <div className="p-3 border-b border-white/5 bg-black/20 overflow-x-auto flex items-center gap-1.5 shrink-0">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mr-1" />
        {objectData.aiSuggestedQuestions.slice(0, 3).map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-mono-cad bg-white/5 hover:bg-[#00f2ad]/20 hover:text-[#00f2ad] border border-white/10 text-slate-300 transition-all shrink-0 truncate max-w-xs text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#00f2ad]/20 text-[#00f2ad] border border-[#00f2ad]/40 rounded-br-none'
                  : 'bg-black/50 text-slate-200 border border-white/10 rounded-bl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
            </div>
            <span className="text-[9px] font-mono-cad text-slate-500 mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-black/40 border border-white/10 text-slate-400 text-xs w-28">
            <Sparkles className="w-3.5 h-3.5 text-[#00f2ad] animate-spin" />
            <span className="font-mono-cad">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-white/10 bg-black/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask anything about ${selectedComponent ? selectedComponent.name : objectData.name}...`}
            className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00f2ad]/50 font-mono-cad"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-2 rounded-xl bg-[#00f2ad] text-slate-950 hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_#00f2ad]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
