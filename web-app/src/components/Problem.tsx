import { useEffect, useRef } from 'react';
import { PenTool, User, Lightbulb, Sparkles } from 'lucide-react';

export function Problem() {
  const sectionRef = useRef<HTMLElement>(null);

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
      id="problem"
      className="py-20 bg-bg-page"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
        <span className="inline-block text-brand-red text-sm tracking-[0.3em] font-semibold uppercase mb-4">初心</span>
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
          每一个平凡人生，都是一首动人的诗
        </h2>
      </div>
      
      <div className="bg-bg-card rounded-2xl shadow-card p-8 md:p-10 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0">
            <PenTool className="w-5 h-5 text-brand-red" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black mb-3">平凡人生，亦值得被铭记</h3>
            <div className="space-y-4">
              <p className="text-black/70 leading-relaxed">
                传记不只是名人的专属，每一个普通人都有独一无二的故事。我的外公外婆用一生诠释了坚韧与爱，他们的故事值得被看见、被珍藏。
              </p>
              <p className="text-black/70 leading-relaxed">
                忙碌的生活让我们疏于记录，灵感稍纵即逝，而专业的传记作家又太过遥远。小传，正是为了填补这份遗憾而生。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-gold/5 via-accent-green/5 to-brand-red/5 rounded-2xl p-8 md:p-10 border border-brand-gold/10">
        <blockquote className="text-xl md:text-2xl lg:text-3xl text-black font-light italic leading-relaxed text-center">
          <span className="text-brand-gold text-4xl mr-2">「</span>
          每个人的一生，都是一本值得细细品读的书
          <span className="text-brand-gold text-4xl ml-2">」</span>
        </blockquote>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-bg-card rounded-xl p-6 shadow-card">
          <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-accent-blue" />
          </div>
          <h4 className="font-semibold text-black mb-2">温暖陪伴</h4>
          <p className="text-sm text-black/50">为50-80岁长辈及家人打造</p>
        </div>
        <div className="bg-bg-card rounded-xl p-6 shadow-card">
          <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center mb-4">
            <Lightbulb className="w-6 h-6 text-accent-green" />
          </div>
          <h4 className="font-semibold text-black mb-2">珍贵传承</h4>
          <p className="text-sm text-black/50">让故事穿越时光，温暖后世</p>
        </div>
        <div className="bg-bg-card rounded-xl p-6 shadow-card">
          <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-brand-gold" />
          </div>
          <h4 className="font-semibold text-black mb-2">永恒星光</h4>
          <p className="text-sm text-black/50">每一份回忆，都值得永远闪耀</p>
        </div>
      </div>
      </div>
    </section>
  );
}
