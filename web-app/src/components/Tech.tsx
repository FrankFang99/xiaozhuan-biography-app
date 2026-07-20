import { useEffect, useRef, type ReactNode } from 'react';
import { Bot, Smartphone, Cloud, Globe, Mic, BarChart3 } from 'lucide-react';

interface TechItem {
  icon: ReactNode;
  title: string;
  desc: string;
  color: string;
}

export function Tech() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll('.tech-item');
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('animate-reveal');
              }, index * 80);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const techItems: TechItem[] = [
    { icon: <Bot className="w-7 h-7" />, title: 'AI对话', desc: 'AI化身专业传记家，用心聆听，温柔引导，让讲述成为享受', color: 'accent-green' },
    { icon: <Smartphone className="w-7 h-7" />, title: '微信小程序', desc: '无需下载，触手可及，让长辈轻松开启记录之旅', color: 'accent-blue' },
    { icon: <Cloud className="w-7 h-7" />, title: '云端存储', desc: '数据安全守护，跨越时空，随时重温珍贵记忆', color: 'brand-gold' },
    { icon: <Globe className="w-7 h-7" />, title: '纪念网站', desc: '一键创建专属网站，让人生故事在网络世界永恒流传', color: 'brand-red' },
    { icon: <Mic className="w-7 h-7" />, title: '语音交互', desc: '轻声诉说，语音朗读，让科技也能听懂岁月的声音', color: 'accent-mint' },
    { icon: <BarChart3 className="w-7 h-7" />, title: '进度管理', desc: '可视化记录进度，见证每一步成长，激励完成人生自传', color: 'brand-gold' },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    'accent-green': { bg: 'bg-accent-green/5', text: 'text-accent-green', border: 'border-accent-green/20' },
    'accent-blue': { bg: 'bg-accent-blue/5', text: 'text-accent-blue', border: 'border-accent-blue/20' },
    'brand-gold': { bg: 'bg-brand-gold/5', text: 'text-brand-gold', border: 'border-brand-gold/20' },
    'brand-red': { bg: 'bg-brand-red/5', text: 'text-brand-red', border: 'border-brand-red/20' },
    'accent-mint': { bg: 'bg-accent-mint/5', text: 'text-accent-mint', border: 'border-accent-mint/20' },
  };

  return (
    <section ref={sectionRef} className="py-20 bg-bg-page" id="tech">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
        <span className="inline-block text-accent-green text-sm tracking-[0.3em] font-semibold uppercase mb-4">技术</span>
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
          科技赋能，守护记忆
        </h2>
        <p className="text-black/70 max-w-xl mx-auto">
          用前沿技术，让记录变得简单，让记忆得以永恒
        </p>
      </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techItems.map((item, index) => {
            const colors = colorClasses[item.color];
            return (
              <div
                key={index}
                className={`tech-item bg-bg-card border ${colors.border} rounded-2xl p-7 text-center transition-all duration-400 hover:-translate-y-1 hover:shadow-card-hover opacity-0`}
              >
                <div className={`w-14 h-14 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-5`}>
                  <div className={colors.text}>{item.icon}</div>
                </div>
                <h4 className={`text-lg font-semibold ${colors.text} mb-3`}>{item.title}</h4>
                <p className="text-sm text-black/50 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
