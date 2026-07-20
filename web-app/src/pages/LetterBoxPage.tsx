import { useState, useEffect } from 'react';
import { useAppStore, Letter } from '../stores/useAppStore';
import { BookOpen, FileText, ArrowRight, Calendar, CheckCircle, Plus } from 'lucide-react';

export function LetterBoxPage() {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showBiography, setShowBiography] = useState(false);
  
  const letters = useAppStore((state) => state.letters);
  const goal = useAppStore((state) => state.goal);
  const biography = useAppStore((state) => state.biographyProgress);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const calculateDaysRemaining = useAppStore((state) => state.calculateDaysRemaining);

  const [daysRemaining, setDaysRemaining] = useState(30);

  useEffect(() => {
    setDaysRemaining(calculateDaysRemaining());
  }, [calculateDaysRemaining]);

  const targetLetterCount = goal?.targetLetterCount || goal?.letterCount || 5;
  const progress = Math.min(Math.round((letters.length / targetLetterCount) * 100), 100);

  const handleWriteLetter = () => {
    setCurrentPage('chat');
  };

  const handleViewBiography = () => {
    setShowBiography(true);
  };

  const handleCloseBiography = () => {
    setShowBiography(false);
  };

  const handleGoToBiography = () => {
    setShowBiography(false);
    setCurrentPage('biography');
  };

  const chapterColors: Record<string, string> = {
    '童年记忆': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    '青春年华': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '事业奋斗': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    '爱情家庭': 'bg-red-500/20 text-red-300 border-red-500/30',
    '人生感悟': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    '人生第一次': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    '挑战与成长': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    '爱与关系': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    '梦想与追求': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    '人生智慧': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  };

  return (
    <div className="min-h-screen bg-[#030512] flex flex-col pb-24">
      <div className="bg-gradient-to-b from-[#0D1F3C] to-[#030512] px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-bold text-white text-xl" style={{ fontFamily: 'Noto Serif SC, serif' }}>信夹</h1>
            <p className="text-sm text-white/50">共 {letters.length} 封信</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#D4A853]">{letters.length}</span>
            <span className="text-sm text-white/40 ml-1">封</span>
          </div>
        </div>
        
        <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/70">自传进度</span>
            <span className="text-xl font-bold text-[#D4A853]">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-white/40">{letters.length}/{targetLetterCount} 封信</span>
            <span className="text-xs text-white/40">还剩{daysRemaining}天</span>
          </div>
        </div>

        {letters.length >= targetLetterCount && (
          <div 
            className="mt-4 bg-white/12 backdrop-blur-md border border-white/15 rounded-xl p-4 cursor-pointer hover:bg-white/15 transition-colors"
            onClick={handleViewBiography}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#D4A853]/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#D4A853]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{goal?.name || '用户'}的传记</h3>
                <span className="text-sm text-[#D4A853]">已完成</span>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30" />
            </div>
            <p className="text-sm text-white/50 mt-3">点击查看完整传记</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>还没有信件</h3>
            <p className="text-sm text-white/50">点击下方按钮开始写第一封信</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...letters].reverse().map((letter) => (
              <div
                key={letter.id}
                onClick={() => setSelectedLetter(letter)}
                className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/40">{letter.date}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${chapterColors[letter.chapter] || 'bg-white/10 text-white/60 border-white/20'}`}>
                    {letter.chapter}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-base mb-2 line-clamp-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  {letter.title}
                </h3>
                <p className="text-sm text-white/50 line-clamp-2">{letter.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleWriteLetter}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-full shadow-[0_8rpx_24rpx_rgba(212,168,83,0.3)] flex items-center justify-center hover:shadow-[0_12rpx_32rpx_rgba(212,168,83,0.4)] active:scale-95 transition-all z-20"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {selectedLetter && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedLetter(null)}
        >
          <div 
            className="bg-[#070b1f] border border-white/10 rounded-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#D4A853] to-[#C73E3A] h-2 rounded-t-2xl"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40">{selectedLetter.date}</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${chapterColors[selectedLetter.chapter] || 'bg-white/10 text-white/60 border-white/20'}`}>
                  {selectedLetter.chapter}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                {selectedLetter.title}
              </h2>
              <div className="text-white/80 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                {selectedLetter.content}
              </div>
              <button
                onClick={() => setSelectedLetter(null)}
                className="w-full mt-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showBiography && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={handleCloseBiography}
        >
          <div 
            className="bg-[#070b1f] border border-white/10 rounded-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#D4A853]/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#D4A853]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>传记已完成</h3>
              <p className="text-sm text-white/60 mb-6">您的传记已经完成，快去传记宇宙查看吧！</p>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseBiography}
                  className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors"
                >
                  稍后查看
                </button>
                <button
                  onClick={handleGoToBiography}
                  className="flex-1 py-3 bg-gradient-to-r from-[#D4A853] to-[#C73E3A] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(212,168,83,0.3)] transition-all"
                >
                  去查看
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}