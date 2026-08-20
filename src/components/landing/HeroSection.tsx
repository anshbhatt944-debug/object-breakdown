import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Box, Layers, Cpu, Sparkles } from 'lucide-react';
import { ThreeCanvas } from '../workspace/viewer3d/ThreeCanvas';
import { wristwatchData } from '../../data/objects/wristwatch';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onSelectPopular: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  // Keep the featured watch mostly assembled on first load. The user can expand it with the slider.
  const [explodeAmount, setExplodeAmount] = useState(0.12);
  const placeholders = ['Search a smartphone...', 'Search a ballpoint pen...', 'Search a mechanical keyboard...', 'Search a wristwatch...'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPlaceholderIndex((v) => (v + 1) % placeholders.length), 2600);
    return () => clearInterval(timer);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim() || 'ballpoint-pen');
  };

  return (
    <section className="landing-hero pt-28 sm:pt-32 px-4 sm:px-6 pb-12 max-w-[1500px] mx-auto">
      <div className="landing-hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles className="w-3.5 h-3.5" /> INTERACTIVE ENGINEERING ATLAS</div>
          <h1>ENGINEERING<br /><span>BEHIND</span><br />EVERYTHING.</h1>
          <p>Explore everyday objects from the outside in. See the parts, understand the mechanisms, discover the materials, and learn why they were designed that way.</p>
          <form onSubmit={submit} className="hero-search">
            <Search className="w-5 h-5" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholders[placeholderIndex]} />
            <button type="submit"><span className="hidden sm:inline">Analyze</span><ArrowRight className="w-4 h-4" /></button>
          </form>
          <div className="hero-tags"><span>Try</span>{['Smartphone', 'Mechanical Watch', 'Ballpoint Pen', 'Keyboard'].map((item) => <button key={item} onClick={() => onSearch(item)}>{item}</button>)}</div>
          <div className="hero-stats">
            <div><strong>50+</strong><span>Objects</span></div>
            <div><strong>1000+</strong><span>Components</span></div>
            <div><strong>10K+</strong><span>Engineering insights</span></div>
          </div>
        </div>

        <div className="hero-model-card">
          <div className="model-card-top"><span>FEATURED OBJECT</span><span className="live-dot">● LIVE 3D</span></div>
          <div className="hero-model-title">Mechanical Watch</div>
          <div className="hero-model-subtitle">Explore the mechanism layer by layer.</div>
          <div className="hero-model-viewport">
            <ThreeCanvas objectData={wristwatchData} selectedComponentId={null} onSelectComponent={() => {}} hoveredComponentId={null} onHoverComponent={() => {}} explodeAmount={explodeAmount} viewMode="solid" isPlayingMechanism={true} isolatedComponentId={null} hiddenComponentIds={new Set()} showLeaderLines={true} />
            <div className="model-chip"><Box className="w-3.5 h-3.5" /> 3D interactive model</div>
          </div>
          <div className="model-controls"><button onClick={() => setExplodeAmount(0)} className="control-pill">Reassemble</button><input aria-label="Explosion level" type="range" min="0" max="100" value={explodeAmount * 100} onChange={(e) => setExplodeAmount(Number(e.target.value) / 100)} /><span>{Math.round(explodeAmount * 100)}%</span></div>
        </div>
      </div>

      <div className="feature-strip">
        <div><Layers className="w-5 h-5" /><div><strong>Interactive 3D</strong><span>Explode every assembly</span></div></div>
        <div><Cpu className="w-5 h-5" /><div><strong>Detailed Insights</strong><span>Materials, forces & manufacturing</span></div></div>
        <div><Sparkles className="w-5 h-5" /><div><strong>Visual Learning</strong><span>Understand the why, not just the what</span></div></div>
      </div>
    </section>
  );
};
