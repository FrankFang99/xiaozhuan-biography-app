import { useEffect, useRef, useState } from 'react';

interface MemorialStar {
  id: number;
  x: number;
  y: number;
  type: 'active' | 'dimmed' | 'brightest';
  label: string;
  size: number;
  glowSize: number;
}

export function StarsConcept() {
  const [stars, setStars] = useState<MemorialStar[]>([]);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const positions: MemorialStar[] = [
      { id: 1, x: 5, y: 12, type: 'active', label: '王奶奶 85岁', size: 10, glowSize: 35 },
      { id: 2, x: 22, y: 38, type: 'active', label: '李爷爷 78岁', size: 12, glowSize: 40 },
      { id: 3, x: 52, y: 22, type: 'brightest', label: '张爷爷（我的星星）', size: 28, glowSize: 120 },
      { id: 4, x: 78, y: 28, type: 'dimmed', label: '陈奶奶', size: 6, glowSize: 15 },
      { id: 5, x: 92, y: 42, type: 'active', label: '刘爷爷 82岁', size: 11, glowSize: 38 },
      { id: 6, x: 12, y: 48, type: 'active', label: '赵奶奶 76岁', size: 13, glowSize: 45 },
      { id: 7, x: 38, y: 68, type: 'dimmed', label: '孙爷爷', size: 7, glowSize: 18 },
      { id: 8, x: 58, y: 52, type: 'active', label: '周奶奶 80岁', size: 14, glowSize: 50 },
      { id: 9, x: 88, y: 58, type: 'active', label: '吴爷爷 79岁', size: 10, glowSize: 35 },
      { id: 10, x: 8, y: 78, type: 'active', label: '郑奶奶 83岁', size: 12, glowSize: 40 },
      { id: 11, x: 42, y: 88, type: 'active', label: '冯爷爷 81岁', size: 11, glowSize: 38 },
      { id: 12, x: 62, y: 72, type: 'active', label: '许奶奶 77岁', size: 13, glowSize: 45 },
      { id: 13, x: 75, y: 85, type: 'active', label: '何爷爷 84岁', size: 10, glowSize: 35 },
      { id: 14, x: 95, y: 68, type: 'dimmed', label: '郭奶奶', size: 6, glowSize: 15 },
      { id: 15, x: 28, y: 22, type: 'active', label: '杨爷爷 75岁', size: 9, glowSize: 32 },
      { id: 16, x: 48, y: 48, type: 'active', label: '黄奶奶 79岁', size: 12, glowSize: 40 },
      { id: 17, x: 72, y: 48, type: 'active', label: '曹爷爷 80岁', size: 10, glowSize: 35 },
      { id: 18, x: 32, y: 55, type: 'active', label: '钱奶奶 78岁', size: 14, glowSize: 50 },
      { id: 19, x: 18, y: 32, type: 'active', label: '朱爷爷 76岁', size: 8, glowSize: 28 },
      { id: 20, x: 55, y: 65, type: 'active', label: '胡奶奶 81岁', size: 11, glowSize: 38 },
      { id: 21, x: 82, y: 78, type: 'dimmed', label: '林爷爷', size: 7, glowSize: 18 },
      { id: 22, x: 45, y: 18, type: 'active', label: '罗奶奶 74岁', size: 9, glowSize: 32 },
    ];
    setStars(positions);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-reveal');
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-starry-dark via-starry-deep to-starry-dark"
      id="stars"
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
        <span className="inline-block text-white/80 text-sm tracking-[0.3em] font-semibold uppercase mb-4">星空纪念</span>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          每一颗星星，都承载着一段人生
        </h2>
        <p className="text-white/70 max-w-xl mx-auto">
          当夜幕降临，每一颗闪烁的星辰，都在诉说着一段珍贵的人生故事
        </p>
      </div>
        
        <div className="relative w-full h-[450px] max-w-[900px] mx-auto rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,83,0.08)_0%,transparent_70%)]" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-gold/3 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-blue/5 rounded-full blur-3xl" />
          
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute cursor-pointer transition-all duration-300"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setHoveredStar(star.id)}
              onMouseLeave={() => setHoveredStar(null)}
            >
              <div
                className={`absolute transition-all duration-500 ${
                  star.type === 'active'
                    ? 'animate-pulse-glow'
                    : star.type === 'dimmed'
                    ? ''
                    : 'animate-star-birthday'
                }`}
                style={{
                  width: `${star.glowSize}px`,
                  height: `${star.glowSize}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background:
                    star.type === 'active'
                      ? `radial-gradient(circle, rgba(212,168,83,0.5) 0%, rgba(212,168,83,0.25) 40%, transparent 70%)`
                      : star.type === 'brightest'
                      ? `radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(244,208,111,0.3) 30%, rgba(212,168,83,0.15) 60%, transparent 85%)`
                      : `radial-gradient(circle, rgba(100,100,100,0.1) 0%, transparent 50%)`,
                  opacity: star.type === 'dimmed' ? 0.2 : 0.9,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
              
              {star.type === 'brightest' && (
                <div
                  className="absolute rounded-full animate-star-birthday"
                  style={{
                    width: `${star.size * 1.8}px`,
                    height: `${star.size * 1.8}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: `3px solid rgba(244,208,111,0.8)`,
                    borderRadius: '50%',
                    opacity: 0.6,
                  }}
                />
              )}
              
              <div
                className={`rounded-full transition-all duration-500 ${
                  star.type === 'active'
                    ? 'bg-brand-gold'
                    : star.type === 'dimmed'
                    ? 'bg-gray-500'
                    : 'bg-white'
                } ${hoveredStar === star.id ? 'scale-200' : ''}`}
                style={{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.type === 'dimmed' ? 0.4 : 1,
                  boxShadow:
                    star.type === 'active'
                      ? `0 0 ${star.size * 2}px rgba(212,168,83,1), 0 0 ${star.size * 4}px rgba(212,168,83,0.6), 0 0 ${star.size * 6}px rgba(212,168,83,0.3)`
                      : star.type === 'brightest'
                      ? `0 0 ${star.size * 2}px rgba(255,255,255,1), 0 0 ${star.size * 4}px rgba(244,208,111,0.9), 0 0 ${star.size * 6}px rgba(244,208,111,0.6), 0 0 ${star.size * 10}px rgba(212,168,83,0.4)`
                      : `0 0 ${star.size * 0.5}px rgba(100,100,100,0.3)`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
              
              <div
                className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-medium px-4 py-2 rounded-lg backdrop-blur-md transition-all duration-300 ${
                  star.type === 'brightest' 
                    ? 'text-white bg-white/20 border border-white/50 shadow-lg' 
                    : star.type === 'active' 
                    ? 'text-white bg-white/15 border border-white/30 shadow-lg' 
                    : 'text-white/60 bg-white/5 border border-white/10'
                } ${hoveredStar === star.id ? 'opacity-100 translate-y-4' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                style={{
                  marginTop: '12px',
                  textShadow: star.type === 'brightest' ? '0 0 15px rgba(255,255,255,0.8)' : 'none',
                }}
              >
                {star.label}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center max-w-3xl mx-auto mt-12">
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            <div className="flex items-center gap-2 bg-bg-card/10 rounded-full px-4 py-2">
              <div className="w-3 h-3 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(212,168,83,0.6)]" />
              <span className="text-sm text-white/80">活跃 · 老人在世</span>
            </div>
            <div className="flex items-center gap-2 bg-bg-card/10 rounded-full px-4 py-2">
              <div className="w-4 h-4 rounded-full bg-brand-gold-glow shadow-[0_0_15px_rgba(255,228,158,0.8)]" />
              <span className="text-sm text-white/80">最亮 · 我的星星</span>
            </div>
            <div className="flex items-center gap-2 bg-bg-card/10 rounded-full px-4 py-2">
              <div className="w-3 h-3 rounded-full bg-text-tertiary opacity-40" />
              <span className="text-sm text-white/80">暗淡 · 已离世</span>
            </div>
          </div>
          <div className="bg-bg-card/5 rounded-2xl p-6 md:p-8 border border-bg-card/10">
            <p className="text-base text-white/70 leading-relaxed mb-4">
              当生命仍在延续，<span className="text-brand-gold-light font-medium">星光与回忆一同闪耀</span>；若斯人已逝，<span className="text-brand-gold-light font-medium">光芒便缓缓收敛</span>。
            </p>
            <p className="text-base text-white/70 leading-relaxed mb-6">
              但在生辰或纪念日，<span className="text-brand-gold-light font-medium">家人们踏访这片星空，老人的星辰便重新绽放最耀眼的光芒</span>，让爱与记忆永不褪色。
            </p>
            <p className="text-lg text-brand-gold font-light italic">
              「让每一份记忆，永远闪耀在星河之中」
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
