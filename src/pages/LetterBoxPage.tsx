import { useState } from 'react';
import { useAppStore, Letter } from '../stores/useAppStore';
import { Mail, BookOpen, Inbox } from 'lucide-react';

export function LetterBoxPage() {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const letters = useAppStore((state) => state.letters);
  const goal = useAppStore((state) => state.goal);
  const biographyProgress = useAppStore((state) => state.biographyProgress);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  const chapterColors: Record<string, string> = {
    '童年记忆': 'bg-blue-100 text-blue-600',
    '求学经历': 'bg-green-100 text-green-600',
    '青春岁月': 'bg-purple-100 text-purple-600',
    '爱情家庭': 'bg-red-100 text-red-600',
    '事业奋斗': 'bg-orange-100 text-orange-600',
    '人生感悟': 'bg-yellow-100 text-yellow-600'
  };

  const handleWriteLetter = () => {
    setCurrentPage('chat');
  };

  const handleViewBook = () => {
    setCurrentPage('book');
  };

  return (
    <div className="min-h-screen bg-[#F5E6C8] flex flex-col">
      <div className="bg-[#0A1628] text-white px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            我的信夹
          </h1>
          <div className="text-sm text-[#8A8A8A]">
            {letters.length} / {goal?.targetLetters || 60} 封
          </div>
        </div>
        <div className="h-3 bg-[#1A2A44] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-full transition-all duration-500"
            style={{ width: `${biographyProgress}%` }}
          ></div>
        </div>
        <div className="text-center text-sm text-[#8A8A8A] mt-2">
          自传进度 {biographyProgress}%
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {letters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-6">
            <Inbox className="w-12 h-12 text-[#8A8A8A]" />
          </div>
            <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">信夹是空的</h3>
            <p className="text-[#5A5A5A] mb-8">开始写第一封信，记录您的人生故事</p>
            <button
              onClick={handleWriteLetter}
              className="px-8 py-4 bg-gradient-to-r from-[#D4A853] to-[#C73E3A] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              写第一封信
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {[...letters].reverse().map((letter) => (
              <div
                key={letter.id}
                onClick={() => setSelectedLetter(letter)}
                className={`relative bg-[#FEFCF3] rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 ${
                  !letter.isRead ? 'ring-2 ring-[#C73E3A]' : ''
                }`}
              >
                <div className="h-4 bg-[#C73E3A]"></div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${chapterColors[letter.chapter] || 'bg-gray-100 text-gray-600'}`}>
                      {letter.chapter}
                    </span>
                    {!letter.isRead && (
                      <div className="w-2 h-2 bg-[#C73E3A] rounded-full"></div>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#2C2C2C] text-sm mb-2 line-clamp-2">
                    {letter.title}
                  </h3>
                  <p className="text-xs text-[#8A8A8A]">{letter.date}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F5E6C8] to-transparent pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      

      {selectedLetter && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedLetter(null)}
        >
          <div 
            className="bg-[#FEFCF3] rounded-xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#C73E3A] h-6 rounded-t-xl"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2 py-1 rounded-full ${chapterColors[selectedLetter.chapter] || 'bg-gray-100 text-gray-600'}`}>
                  {selectedLetter.chapter}
                </span>
                <span className="text-xs text-[#8A8A8A]">{selectedLetter.date}</span>
              </div>
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-6" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                {selectedLetter.title}
              </h2>
              <div className="text-[#2C2C2C] leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                {selectedLetter.content}
              </div>
              <button
                onClick={() => setSelectedLetter(null)}
                className="w-full mt-6 py-3 bg-[#F5E6C8] text-[#2C2C2C] font-semibold rounded-full hover:bg-[#E8DCC8] transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
