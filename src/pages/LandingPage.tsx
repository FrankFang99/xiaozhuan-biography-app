import { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Star, Globe, Mail, BookOpen } from 'lucide-react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}

export function LandingPage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const login = useAppStore((state) => state.login);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 150; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.7 + 0.3,
          delay: Math.random() * 5,
          duration: Math.random() * 3 + 2
        });
      }
      setStars(newStars);
    };

    generateStars();
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleStart = () => {
    login('guest');
  };

  return (
    <div className="relative min-h-screen bg-[#0A1628] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D1F3C] to-[#0A1628]"></div>
      
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-[#D4A853] animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: `0 0 ${star.size * 3}px rgba(212, 168, 83, 0.3)`
          }}
        />
      ))}

      <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-6 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-[#D4A853] rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-[#D4A853] to-[#C73E3A] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">传</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            小传
          </h1>
          <p className="text-xl text-[#D4A853] mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            每一份回忆，都值得被珍藏
          </p>
          <p className="text-base text-[#8A8A8A]">
            为每一个平凡人生写传记
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
            <div className="w-10 h-10 bg-[#F5E6C8] rounded-lg flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-[#C73E3A]" />
            </div>
            <h3 className="text-white font-semibold mb-1">信夹</h3>
            <p className="text-xs text-[#8A8A8A]">珍藏每一封信</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
            <div className="w-10 h-10 bg-[#F5E6C8] rounded-lg flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-[#5A5A5A]" />
            </div>
            <h3 className="text-white font-semibold mb-1">书籍</h3>
            <p className="text-xs text-[#8A8A8A]">AI整理成书</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
            <div className="w-10 h-10 bg-[#F5E6C8] rounded-lg flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-[#D4A853]" />
            </div>
            <h3 className="text-white font-semibold mb-1">星空</h3>
            <p className="text-xs text-[#8A8A8A]">点亮每颗星</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
            <div className="w-10 h-10 bg-[#F5E6C8] rounded-lg flex items-center justify-center mb-3">
              <Globe className="w-5 h-5 text-[#D4A853]" />
            </div>
            <h3 className="text-white font-semibold mb-1">纪念网站</h3>
            <p className="text-xs text-[#8A8A8A]">永恒的记忆</p>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="group relative px-12 py-4 bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-full text-white font-bold text-lg shadow-lg hover:shadow-[0_0_30px_rgba(212,168,83,0.4)] transition-all hover:scale-105"
        >
          <span className="relative z-10">开始记录人生故事</span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4D06F] to-[#D44A45] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <p className="mt-8 text-sm text-[#5A5A5A]">
          已有 <span className="text-[#D4A853]">10,000+</span> 位老人开始记录
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A1628] to-transparent"></div>
    </div>
  );
}
