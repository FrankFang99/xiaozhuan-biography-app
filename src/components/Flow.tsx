import { useEffect, useRef } from 'react';
import { User, Mic } from 'lucide-react';
import { BookOpen } from 'lucide-react';

interface FlowStep {
  num: number;
  title: string;
  desc: string;
  screenContent: JSX.Element;
}

export function Flow() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const steps = entry.target.querySelectorAll('.flow-step');
            steps.forEach((step, index) => {
              setTimeout(() => {
                step.classList.add('animate-reveal');
              }, index * 100);
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

  const steps: FlowStep[] = [
    {
      num: 1,
      title: '星空启程',
      desc: '在璀璨星空下开启旅程，让每一份回忆都被珍视',
      screenContent: (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-bg-card">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-gold to-brand-red rounded-2xl flex items-center justify-center text-white mb-5 shadow-[0_8px_30px_rgba(212,168,83,0.3)]">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">小传</h2>
          <p className="text-xs text-black/70">让平凡人生在时光里闪耀</p>
          <button className="mt-8 px-8 py-3 bg-gradient-to-r from-brand-gold to-brand-red rounded-full text-white text-sm font-semibold">
            开启记忆之旅
          </button>
        </div>
      ),
    },
    {
      num: 2,
      title: '约定时光',
      desc: '选择记录周期，让AI陪伴您走过人生的每一程',
      screenContent: (
        <div className="flex flex-col h-full bg-bg-page">
          <div className="bg-bg-card px-5 py-4 flex items-center justify-between border-b border-border-light">
            <span className="font-semibold text-black">设定目标</span>
            <span className="text-xs text-black/50">下一步</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div className="bg-bg-card rounded-xl p-4 border border-border-light flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
                <span className="text-accent-blue">30</span>
              </div>
              <div>
                <div className="font-semibold text-black">30天</div>
                <div className="text-xs text-black/50">一个月，30封信</div>
              </div>
            </div>
            <div className="bg-bg-card rounded-xl p-4 border-2 border-accent-green flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-green flex items-center justify-center">
                <span className="text-white font-bold">60</span>
              </div>
              <div>
                <div className="font-semibold text-black">60天</div>
                <div className="text-xs text-black/50">两个月，60封信</div>
              </div>
              <div className="ml-auto w-5 h-5 rounded-full bg-accent-green flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <div className="bg-bg-card rounded-xl p-4 border border-border-light flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
                <span className="text-accent-blue">90</span>
              </div>
              <div>
                <div className="font-semibold text-black">90天</div>
                <div className="text-xs text-black/50">三个月，90封信</div>
              </div>
            </div>
          </div>
          <div className="bg-bg-card px-5 py-4 border-t border-border-light">
            <button className="w-full py-3 bg-accent-green text-white rounded-xl font-semibold">
              确认选择
            </button>
          </div>
        </div>
      ),
    },
    {
      num: 3,
      title: '信夹珍藏',
      desc: '每一次对话化作一封信，珍藏人生的每一段故事',
      screenContent: (
        <div className="flex flex-col h-full bg-bg-page">
          <div className="bg-accent-blue text-white px-5 py-4 flex items-center justify-between">
            <h3 className="font-semibold">我的信夹</h3>
            <span className="text-xs text-brand-gold-light">5/60</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div className="bg-bg-card rounded-lg p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-brand-red uppercase tracking-wider">童年记忆</span>
                <span className="text-xs text-black/50">6月28日</span>
              </div>
              <div className="text-sm font-semibold text-black">第1封信 · 故乡的回忆</div>
              <div className="w-full h-1.5 bg-border-light rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-accent-green rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="bg-bg-card rounded-lg p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-accent-green uppercase tracking-wider">求学经历</span>
                <span className="text-xs text-black/50">6月29日</span>
              </div>
              <div className="text-sm font-semibold text-black">第2封信 · 第一次离开家</div>
              <div className="w-full h-1.5 bg-border-light rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-accent-green rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="bg-bg-card rounded-lg p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">青春岁月</span>
                <span className="text-xs text-black/50">6月30日</span>
              </div>
              <div className="text-sm font-semibold text-black">第3封信 · 年轻时的梦想</div>
              <div className="w-full h-1.5 bg-border-light rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-accent-green rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 4,
      title: '对话时光',
      desc: '与AI传记家亲切交谈，轻松分享人生故事与感悟',
      screenContent: (
        <div className="flex flex-col h-full bg-bg-page">
          <div className="bg-accent-blue text-white px-5 py-4 flex items-center gap-3">
            <svg viewBox="0 0 100 100" className="w-8 h-8 rounded-full border-2 border-white/30">
              <defs>
                <linearGradient id="biographerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F4D06F" />
                  <stop offset="100%" stopColor="#D4A853" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="50" fill="url(#biographerGradient)" />
              <ellipse cx="50" cy="45" rx="20" ry="22" fill="#FFF8E7" />
              <circle cx="42" cy="42" r="4" fill="#1A1A1A" />
              <circle cx="58" cy="42" r="4" fill="#1A1A1A" />
              <path d="M42 52 Q50 58 58 52" stroke="#C73E3A" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M30 35 Q35 30 50 32 Q65 30 70 35" stroke="#8B5A2B" strokeWidth="3" fill="none" />
              <path d="M25 40 Q30 35 50 37" stroke="#8B5A2B" strokeWidth="3" fill="none" />
              <path d="M50 37 Q70 35 75 40" stroke="#8B5A2B" strokeWidth="3" fill="none" />
            </svg>
            <span className="font-semibold">小传 · 写信</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <div className="flex gap-3">
              <svg viewBox="0 0 100 100" className="w-8 h-8 rounded-full flex-shrink-0 border border-accent-blue/30">
                <defs>
                  <linearGradient id="biographerGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F4D06F" />
                    <stop offset="100%" stopColor="#D4A853" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="50" fill="url(#biographerGradient2)" />
                <ellipse cx="50" cy="45" rx="20" ry="22" fill="#FFF8E7" />
                <circle cx="42" cy="42" r="4" fill="#1A1A1A" />
                <circle cx="58" cy="42" r="4" fill="#1A1A1A" />
                <path d="M42 52 Q50 58 58 52" stroke="#C73E3A" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M30 35 Q35 30 50 32 Q65 30 70 35" stroke="#8B5A2B" strokeWidth="3" fill="none" />
              </svg>
              <div className="max-w-[80%] bg-[#DCF8C6] rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-black">
                您好，我是小传，专门帮人记录人生故事的老朋友。今天想和您聊聊小时候的事情，可以吗？
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="max-w-[80%] bg-bg-card rounded-2xl rounded-br-sm px-4 py-3 text-sm text-black shadow-card">
                我小时候住在农村，那个时候条件虽然艰苦，但日子过得很开心。
              </div>
              <svg viewBox="0 0 100 100" className="w-8 h-8 rounded-full flex-shrink-0 shadow-card">
                <defs>
                  <linearGradient id="elderlyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="50" fill="url(#elderlyGradient)" />
                <ellipse cx="50" cy="48" rx="18" ry="20" fill="#FFF8E7" />
                <circle cx="42" cy="46" r="3.5" fill="#1A1A1A" />
                <circle cx="58" cy="46" r="3.5" fill="#1A1A1A" />
                <path d="M44 54 Q50 59 56 54" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M35 32 Q40 28 50 30 Q60 28 65 32" stroke="#808080" strokeWidth="3" fill="none" />
                <path d="M28 38 Q33 33 50 35" stroke="#808080" strokeWidth="3" fill="none" />
                <path d="M50 35 Q67 33 72 38" stroke="#808080" strokeWidth="3" fill="none" />
              </svg>
            </div>
            <div className="flex gap-3">
              <svg viewBox="0 0 100 100" className="w-8 h-8 rounded-full flex-shrink-0 border border-accent-blue/30">
                <defs>
                  <linearGradient id="biographerGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F4D06F" />
                    <stop offset="100%" stopColor="#D4A853" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="50" fill="url(#biographerGradient3)" />
                <ellipse cx="50" cy="45" rx="20" ry="22" fill="#FFF8E7" />
                <circle cx="42" cy="42" r="4" fill="#1A1A1A" />
                <circle cx="58" cy="42" r="4" fill="#1A1A1A" />
                <path d="M42 52 Q50 58 58 52" stroke="#C73E3A" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M30 35 Q35 30 50 32 Q65 30 70 35" stroke="#8B5A2B" strokeWidth="3" fill="none" />
              </svg>
              <div className="max-w-[80%] bg-[#DCF8C6] rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-black">
                农村生活一定很有趣！您小时候最喜欢玩什么游戏？
              </div>
            </div>
          </div>
          <div className="bg-bg-card px-4 py-3 border-t border-border-light">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-bg-page rounded-xl px-4 py-2">
                <input type="text" className="w-full bg-transparent text-sm focus:outline-none" placeholder="在这张纸上写下您的故事..." />
              </div>
              <button className="w-9 h-9 rounded-full bg-accent-green text-white flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-accent-blue text-white flex items-center justify-center">
                <span>↑</span>
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 5,
      title: '成书珍藏',
      desc: 'AI整理成书，让人生故事成为永恒的珍藏',
      screenContent: (
        <div className="flex flex-col h-full bg-bg-page">
          <div className="bg-accent-blue text-white px-5 py-4">
            <h3 className="font-semibold">我的自传</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="bg-bg-card rounded-xl p-6 text-center shadow-card mb-5">
              <svg viewBox="0 0 100 100" className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-brand-gold/30">
                <defs>
                  <linearGradient id="elderlyGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="50" fill="url(#elderlyGradient2)" />
                <ellipse cx="50" cy="48" rx="18" ry="20" fill="#FFF8E7" />
                <circle cx="42" cy="46" r="3.5" fill="#1A1A1A" />
                <circle cx="58" cy="46" r="3.5" fill="#1A1A1A" />
                <path d="M44 54 Q50 59 56 54" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M35 32 Q40 28 50 30 Q60 28 65 32" stroke="#808080" strokeWidth="3" fill="none" />
                <path d="M28 38 Q33 33 50 35" stroke="#808080" strokeWidth="3" fill="none" />
                <path d="M50 35 Q67 33 72 38" stroke="#808080" strokeWidth="3" fill="none" />
              </svg>
              <h4 className="text-lg font-bold text-black mb-1">张先生的人生</h4>
              <p className="text-xs text-black/50">一本写给子孙的传记</p>
              <div className="w-full h-2 bg-border-light rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-gold to-accent-green rounded-full" style={{ width: '45%' }} />
              </div>
              <div className="text-xs text-black/50 mt-2">已完成 45%</div>
            </div>
            <div className="space-y-2">
              <div className="bg-bg-card rounded-lg p-4 flex items-center gap-3 shadow-card">
                <div className="w-7 h-7 rounded-full bg-accent-green/10 flex items-center justify-center">
                  <span className="text-accent-green text-xs font-bold">1</span>
                </div>
                <div className="flex-1 text-sm text-black">童年记忆</div>
                <span className="text-xs text-accent-green">已完成</span>
              </div>
              <div className="bg-bg-card rounded-lg p-4 flex items-center gap-3 shadow-card">
                <div className="w-7 h-7 rounded-full bg-accent-green/10 flex items-center justify-center">
                  <span className="text-accent-green text-xs font-bold">2</span>
                </div>
                <div className="flex-1 text-sm text-black">求学经历</div>
                <span className="text-xs text-accent-green">已完成</span>
              </div>
              <div className="bg-bg-card rounded-lg p-4 flex items-center gap-3 shadow-card">
                <div className="w-7 h-7 rounded-full bg-accent-green/10 flex items-center justify-center">
                  <span className="text-accent-green text-xs font-bold">3</span>
                </div>
                <div className="flex-1 text-sm text-black">青春岁月</div>
                <span className="text-xs text-accent-green">已完成</span>
              </div>
              <div className="bg-bg-card rounded-lg p-4 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-border-light flex items-center justify-center">
                  <span className="text-black/50 text-xs font-bold">4</span>
                </div>
                <div className="flex-1 text-sm text-black">工作生涯</div>
                <span className="text-xs text-black/50">进行中</span>
              </div>
            </div>
          </div>
          <div className="bg-bg-card px-5 py-3 border-t border-border-light">
            <button className="w-full py-3 bg-gradient-to-r from-brand-gold to-accent-green text-white rounded-xl font-semibold">
              预览完整传记
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white" id="flow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block text-accent-green text-sm tracking-[0.3em] font-semibold uppercase mb-4">旅程</span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            五段旅程，书写人生传记
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            从最初的相遇，到最后的成书，AI全程陪伴，让记录成为一种享受
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="flow-step flex flex-col items-center text-center opacity-0">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-gold to-brand-gold-light rounded-full flex items-center justify-center text-starry-dark font-bold text-lg mb-5 shadow-[0_4px_16px_rgba(212,168,83,0.3)]">
                {step.num}
              </div>
              <div className="relative bg-gradient-to-br from-[#F5F5F5] to-[#E8E8E8] rounded-[45px] p-3 shadow-phone w-[260px] h-[560px]">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[100px] h-[22px] bg-[#DFDFDF] rounded-b-[12px] z-20 border border-[#CCCCCC]">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#999999] rounded-full shadow-[14px_0_0_rgba(153,153,153,0.6),-14px_0_0_rgba(153,153,153,0.3)]" />
                </div>
                <div className="w-full h-full bg-bg-card rounded-[32px] overflow-hidden relative">
                  <div className="h-10 bg-gray-100 flex items-center justify-between px-4 text-gray-600 text-xs font-semibold border-b border-gray-200">
                    <span>9:{step.num === 1 ? '41' : step.num === 2 ? '42' : step.num === 3 ? '43' : step.num === 4 ? '44' : '45'}</span>
                    <div className="flex gap-0.5">
                      <span className="w-[3px] h-1 bg-gray-400 rounded" />
                      <span className="w-[3px] h-1.5 bg-gray-400 rounded" />
                      <span className="w-[3px] h-2 bg-gray-400 rounded" />
                      <span className="w-[3px] h-2.5 bg-gray-400 rounded" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 border border-gray-400 rounded px-[2px]">
                        <div className="w-full h-full bg-green-500 rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="h-[calc(100%-40px)] overflow-hidden">
                    {step.screenContent}
                  </div>
                </div>
              </div>
              <h4 className="text-base font-semibold text-text-primary mt-4 mb-2">{step.title}</h4>
              <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
