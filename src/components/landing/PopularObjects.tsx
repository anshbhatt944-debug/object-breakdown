import React from 'react';
import { ALL_OBJECTS } from '../../data/objectRegistry';
import { ArrowRight, Smartphone, Watch, PenTool, Keyboard, Cog, Cpu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PopularObjectsProps { onSelectObjectById: (id: string) => void; }

const objectIcon = (name: string): LucideIcon => {
  const key = name.toLowerCase();
  if (key.includes('smartphone')) return Smartphone;
  if (key.includes('watch')) return Watch;
  if (key.includes('pen')) return PenTool;
  if (key.includes('keyboard')) return Keyboard;
  if (key.includes('motor')) return Cog;
  if (key.includes('engine')) return Cog;
  return Cpu;
};

export const PopularObjects: React.FC<PopularObjectsProps> = ({ onSelectObjectById }) => (
  <section id="popular" className="landing-section px-4 sm:px-6 py-14 max-w-[1500px] mx-auto select-none">
    <div className="section-heading-row">
      <div><span className="section-kicker">TRENDING OBJECTS</span><h2>Pick something to understand.</h2></div>
      <p>Start with a real object, then explore its assembly, materials, manufacturing, failure modes and engineering logic.</p>
    </div>
    <div className="object-card-grid">
      {ALL_OBJECTS.slice(0, 6).map((obj) => {
        const Icon = objectIcon(obj.name);
        return (
        <button key={obj.id} onClick={() => onSelectObjectById(obj.id)} className="object-card text-left group">
          <div className="object-card-visual">
            <div className="object-card-icon-wrap"><Icon className="object-card-icon" /></div>
            <span>{obj.category}</span>
          </div>
          <div className="object-card-content"><div><h3>{obj.name}</h3><p>{obj.heroTagline}</p></div><div className="object-card-arrow"><ArrowRight className="w-4 h-4" /></div></div>
          <div className="object-card-meta"><span>{obj.stats.componentCount} Parts</span><span>•</span><span>{obj.stats.materialCount} Materials</span><span className="ml-auto">★ {obj.complexityScore.overall.toFixed(1)}</span></div>
        </button>
        );
      })}
    </div>
  </section>
);
