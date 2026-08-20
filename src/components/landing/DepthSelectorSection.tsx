import React from 'react';
import { DepthLevel } from '../../types/objectData';
import { Zap, Eye, Cpu, Flame } from 'lucide-react';

interface DepthSelectorSectionProps {
  depthLevel: DepthLevel;
  onDepthChange: (depth: DepthLevel) => void;
}

export const DepthSelectorSection: React.FC<DepthSelectorSectionProps> = ({
  depthLevel,
  onDepthChange,
}) => {
  const tiers: {
    id: DepthLevel;
    title: string;
    tagline: string;
    icon: typeof Zap;
    color: string;
    bg: string;
    border: string;
    bulletPoints: string[];
  }[] = [
    {
      id: 'quick',
      title: 'Quick',
      tagline: 'Understand the object in 30 seconds.',
      icon: Zap,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/[0.04]',
      border: 'border-emerald-500/40',
      bulletPoints: [
        'Core physical purpose',
        'Top 3 primary materials',
        'High-level mechanism summary',
        'Visual 3D exploded view',
      ],
    },
    {
      id: 'detailed',
      title: 'Detailed',
      tagline: 'Understand components and operation.',
      icon: Eye,
      color: 'text-sky-400',
      bg: 'bg-sky-500/[0.04]',
      border: 'border-sky-500/40',
      bulletPoints: [
        'Full Bill of Materials (BOM)',
        'Kinematic step-by-step cycle',
        'Material properties & grade',
        'Basic failure modes & wear points',
      ],
    },
    {
      id: 'engineering',
      title: 'Engineering',
      tagline: 'Deep technical analysis & manufacturing.',
      icon: Cpu,
      color: 'text-purple-400',
      bg: 'bg-purple-500/[0.04]',
      border: 'border-purple-500/40',
      bulletPoints: [
        'Applied force vectors & contact pressures',
        'Machining tolerances (GD&T ±0.002 mm)',
        'Factory tooling & defect risks',
        'Component relationship linkage network',
      ],
    },
    {
      id: 'expert',
      title: 'Expert',
      tagline: 'Advanced equations, FEA & design tradeoffs.',
      icon: Flame,
      color: 'text-rose-400',
      bg: 'bg-rose-500/[0.04]',
      border: 'border-rose-500/40',
      bulletPoints: [
        'First-principles governing physics formulas',
        'Interactive live parameter calculators',
        'FMEA failure modes and mitigation',
        'DFMA part consolidation & cost-down',
      ],
    },
  ];

  return (
    <section id="depth" className="depth-section py-20 px-6 max-w-[1500px] mx-auto select-none">
      <div className="depth-heading">
        <div><span className="section-kicker">01 / CHOOSE YOUR DEPTH</span><h2>Learn at the level you need.</h2></div>
        <p>Move from a rapid orientation to deep engineering analysis without changing the object or losing your place.</p>
      </div>

      <div className="depth-grid">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isSelected = depthLevel === tier.id;

          return (
            <article key={tier.id} onClick={() => onDepthChange(tier.id)} className={`depth-card ${isSelected ? 'depth-card-active' : ''}`}>
              <div className="depth-card-head">
                <span className="depth-number">0{tiers.findIndex((item) => item.id === tier.id) + 1}</span>
                <Icon className="w-4 h-4 depth-icon" />
              </div>
              <h3>{tier.title}</h3>
              <p>{tier.tagline}</p>
              <ul>
                {tier.bulletPoints.map((bp, i) => <li key={i}>{bp}</li>)}
              </ul>
              <button type="button">{isSelected ? 'ACTIVE MODE' : 'SELECT DEPTH'}</button>
            </article>
          );
        })}
      </div>
    </section>
  );
};
