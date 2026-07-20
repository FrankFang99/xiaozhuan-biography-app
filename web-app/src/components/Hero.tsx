import { useEffect, useState, useRef } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

export function Hero() {
  const [stars, setStars] = useState<Star[]>([]);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const generatedStars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      const size = Math.random();
      generatedStars.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: size < 0.5 ? 1 : size < 0.85 ? 2 : size < 0.95 ? 3 : 5,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3,
      });
    }
    setStars(generatedStars);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-starry-dark via-starry-deep to-starry-dark"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,208,111,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-blue/5 rounded-full blur-3xl" />
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full animate-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              backgroundColor: star.size >= 5 ? '#F4D06F' : star.size >= 3 ? '#D4A853' : '#FFFFFF',
              opacity: star.size >= 5 ? 0.9 : star.size >= 3 ? 0.7 : star.size >= 2 ? 0.5 : 0.35,
              boxShadow: star.size >= 5 ? '0 0 12px rgba(244,208,111,0.6), 0 0 24px rgba(244,208,111,0.3)' : star.size >= 3 ? '0 0 8px rgba(212,168,83,0.4)' : 'none',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-block mb-8 px-6 py-2 rounded-full border border-white/30 bg-white/5">
          <span className="text-white text-sm tracking-[0.4em] font-light uppercase">2026 Trae AI 创造力大赛</span>
        </div>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 tracking-[0.15em] leading-none">
          小传
        </h1>
        <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent mx-auto mb-8" />
        <p className="text-xl md:text-2xl text-white font-light tracking-[0.2em] mb-4">
          让平凡的人生，在时光里闪耀
        </p>
        <p className="text-base text-white/70 font-light tracking-[0.05em] mb-12">
          用AI记录人生故事 · 让每一份记忆都被看见
        </p>
        <button
          onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-12 py-4 bg-gradient-to-r from-brand-gold to-brand-red rounded-full text-white font-semibold text-lg transition-all duration-400 hover:translate-y-[-3px] hover:shadow-[0_8px_30px_rgba(212,168,83,0.4)]"
        >
          开启记忆之旅
        </button>
      </div>

      <div className="absolute bottom-10 text-white/60 text-sm animate-float">
        向下滚动探索 ↓
      </div>
    </section>
  );
}
