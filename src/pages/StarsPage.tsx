import { useState, useEffect } from 'react';
import { Star, Heart, Calendar } from 'lucide-react';

interface StarItem {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'active' | 'dimmed' | 'brightest';
  label: string;
  birthday: string;
}

export function StarsPage() {
  const [stars, setStars] = useState<StarItem[]>([]);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    const generateStars = () => {
      const starData: StarItem[] = [];
      const names = ['张先生', '李奶奶', '王爷爷', '刘阿姨', '陈大伯', '赵奶奶', '孙爷爷', '周阿姨', '吴大伯', '郑奶奶'];
      
      for (let i = 0; i < 15; i++) {
        const type = i === 0 ? 'brightest' : Math.random() > 0.3 ? 'active' : 'dimmed';
        starData.push({
          id: i,
          x: 5 + Math.random() * 90,
          y: 10 + Math.random() * 70,
          size: type === 'brightest' ? 12 : type === 'active' ? 6 + Math.random() * 4 : 3 + Math.random() * 3,
          type,
          label: type === 'brightest' ? '您的星星' : names[i % names.length],
          birthday: `${Math.floor(Math.random() * 12) + 1}月${Math.floor(Math.random() * 28) + 1}日`,
        });
      }
      setStars(starData);
    };
    generateStars();
  }, []);

  const getTodayBirthdays = () => {
    const today = new Date();
    return stars.filter(star => {
      const [month, day] = star.birthday.split('月').map(Number);
      return month === today.getMonth() + 1 && day === today.getDate();
    });
  };

  const todayBirthdays = getTodayBirthdays();

  return (
    <div className="min-h-screen bg-[#0A1628] pb-20 overflow-hidden">
      <div className="bg-[#0A1628] text-white px-6 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Noto Serif SC, serif' }}>
              星空纪念
            </h1>
            <p className="text-sm text-[#8A8A8A] mt-1">每颗星星，都是一段人生</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-[#D4A853]" />
            <span className="text-sm text-[#D4A853]">{stars.filter(s => s.type === 'active').length} 位老人</span>
          </div>
        </div>
      </div>

      {todayBirthdays.length > 0 && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-[#D4A853]/20 to-[#C73E3A]/20 border border-[#D4A853]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-[#D4A853]" />
            <span className="text-[#D4A853] font-semibold">今天是他们的生日</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {todayBirthdays.map(star => (
              <div key={star.id} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-[#D4A853] rounded-full animate-pulse"></div>
                <span className="text-white text-sm">{star.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative px-4 mt-6 h-[60vh]">
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
              className={`rounded-full transition-all duration-500 ${
                star.type === 'active'
                  ? 'bg-[#D4A853] animate-pulse'
                  : star.type === 'dimmed'
                  ? 'bg-[#5A5A5A]'
                  : 'bg-[#F4D06F] animate-pulse'
              } ${hoveredStar === star.id ? 'scale-150' : ''}`}
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.type === 'dimmed' ? 0.5 : 1,
                boxShadow:
                  star.type === 'active'
                    ? '0 0 20px rgba(212,168,83,0.6), 0 0 40px rgba(212,168,83,0.3)'
                    : star.type === 'brightest'
                    ? '0 0 30px rgba(244,208,111,0.8), 0 0 60px rgba(244,208,111,0.5), 0 0 90px rgba(255,228,158,0.3)'
                    : '0 0 6px rgba(90,90,90,0.3)',
                animationDuration: star.type === 'brightest' ? '1s' : '2s',
              }}
            />
            
            {hoveredStar === star.id && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap text-xs font-medium px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-lg z-20">
                <div className="flex items-center gap-2 mb-1">
                  {star.type === 'brightest' && <Heart className="w-3 h-3 text-[#C73E3A]" />}
                  <span className={star.type === 'brightest' ? 'text-[#F4D06F] font-bold' : ''}>
                    {star.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#8A8A8A]">
                  <Calendar className="w-3 h-3" />
                  <span>{star.birthday}</span>
                </div>
                <div className={`mt-1 text-[10px] ${
                  star.type === 'active' ? 'text-[#D4A853]' : 
                  star.type === 'dimmed' ? 'text-[#5A5A5A]' : 'text-[#F4D06F]'
                }`}>
                  {star.type === 'active' ? '✨ 活跃' : 
                   star.type === 'dimmed' ? '🌙 安息' : '🌟 最亮的星'}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-[#5A5A5A]">点击星星查看详情</p>
        </div>
      </div>

      <div className="mx-4 mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
        <h3 className="text-white font-semibold mb-3" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          星空纪念
        </h3>
        <div className="space-y-2 text-sm text-[#8A8A8A]">
          <p>每颗星星代表一位老人的人生传记。</p>
          <p className="flex items-start gap-2">
            <span className="w-2 h-2 bg-[#D4A853] rounded-full mt-1.5 flex-shrink-0"></span>
            活跃的星星：老人在世，正在记录人生故事
          </p>
          <p className="flex items-start gap-2">
            <span className="w-2 h-2 bg-[#5A5A5A] rounded-full mt-1.5 flex-shrink-0"></span>
            暗淡的星星：老人已安息，故事永流传
          </p>
          <p className="flex items-start gap-2">
            <span className="w-2 h-2 bg-[#F4D06F] rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(244,208,111,0.8)]"></span>
            最亮的星：今天是老人的生日或纪念日，家人点亮了这颗星
          </p>
        </div>
      </div>
    </div>
  );
}
