import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { User, BookOpen, Download, Globe, Inbox } from 'lucide-react';

export function BookPage() {
  const [bookView, setBookView] = useState<'cover' | 'inner'>('cover');
  const [activeChapter, setActiveChapter] = useState(0);
  
  const bookChapters = useAppStore((state) => state.bookChapters);
  const biographyProgress = useAppStore((state) => state.biographyProgress);
  const currentUser = useAppStore((state) => state.currentUser);
  const navigateTo = useAppStore((state) => state.setCurrentPage);

  const handleExport = () => {
    let content = `📖 ${currentUser?.name || '用户'}的人生传记\n\n`;
    content += `作者：${currentUser?.name || '用户'}\n`;
    content += `记录时间：${new Date().toLocaleDateString()}\n`;
    content += `完成度：${biographyProgress}%\n\n`;
    content += `────────────────────────\n\n`;
    
    bookChapters.forEach(chapter => {
      content += `${chapter.title}\n`;
      content += `${chapter.content}\n\n`;
      content += `────────────────────────\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentUser?.name || '用户'}的人生传记.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateWebsite = () => {
    alert('正在为您创建个人纪念网站...\n\n这是一个演示功能，实际项目中将生成专属的纪念网站，每一位老人都是星空里一颗独特的星星。');
  };

  return (
    <div className="min-h-screen bg-[#F5E6C8] flex flex-col">
      <div className="bg-[#0A1628] text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo('letterbox')}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"
          >
            ←
          </button>
          <h3 className="font-bold" style={{ fontFamily: 'Noto Serif SC, serif' }}>我的自传</h3>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {bookView === 'cover' ? (
          <div className="flex flex-col items-center">
            <div 
              className="w-full max-w-xs bg-[#FEFCF3] shadow-2xl cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => setBookView('inner')}
              style={{ aspectRatio: '3/4' }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#D4A853] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#D4A853] to-transparent"></div>
                
                <div className="w-20 h-20 bg-[#F5E6C8] rounded-full flex items-center justify-center mb-6">
                  <User className="w-10 h-10 text-[#5A5A5A]" />
                </div>
                
                <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  {currentUser?.name || '用户'}的人生
                </h1>
                <p className="text-lg text-[#5A5A5A] mb-8" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  一本写给子孙的传记
                </p>
                
                <div className="w-full h-2 bg-[#E8DCC8] rounded-full mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-full"
                    style={{ width: `${biographyProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-[#8A8A8A]">已完成 {biographyProgress}%</p>
                
                <p className="absolute bottom-8 text-xs text-[#8A8A8A]">点击翻开</p>
              </div>
            </div>

            <div className="w-full max-w-xs mt-8 space-y-4">
              <button
                onClick={() => setBookView('inner')}
                className="w-full py-4 bg-white rounded-xl font-semibold text-[#2C2C2C] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                翻开书籍
              </button>
              <button
                onClick={handleExport}
                className="w-full py-4 bg-white rounded-xl font-semibold text-[#2C2C2C] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                导出为文本
              </button>
              <button
                onClick={handleCreateWebsite}
                className="w-full py-4 bg-gradient-to-r from-[#D4A853] to-[#C73E3A] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" />
                创建纪念网站
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="bg-[#FEFCF3] rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 bg-[#F5E6C8] rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-[#5A5A5A]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2C2C2C]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                    {currentUser?.name || '用户'}的人生传记
                  </h2>
                  <p className="text-sm text-[#8A8A8A]">记录于 {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <p className="text-[#5A5A5A] italic" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  "每一份回忆，都值得被珍藏"
                </p>
              </div>
              
              <button
                onClick={() => setBookView('cover')}
                className="w-full py-2 text-sm text-[#8A8A8A] hover:text-[#D4A853] transition-colors"
              >
                ← 返回封面
              </button>
            </div>

            <div className="bg-[#FEFCF3] rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-[#E8DCC8]">
                <h3 className="font-semibold text-[#2C2C2C]">目录</h3>
              </div>
              <div className="divide-y divide-[#E8DCC8]">
                {bookChapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveChapter(index)}
                    className={`w-full p-4 text-left transition-colors flex items-center justify-between ${
                      activeChapter === index ? 'bg-[#F5E6C8]' : 'hover:bg-[#FDFDFD]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[#2C2C2C]">{chapter.title}</div>
                      <div className="text-xs text-[#8A8A8A] mt-1">
                        {chapter.content !== '（等待您分享相关故事...）' ? '已收录' : '待记录'}
                      </div>
                    </div>
                    <span className="text-[#8A8A8A]">{activeChapter === index ? '▼' : '›'}</span>
                  </button>
                ))}
              </div>
            </div>

            {activeChapter >= 0 && (
              <div className="mt-6 bg-[#FEFCF3] rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 pb-2 border-b border-[#E8DCC8]" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                  {bookChapters[activeChapter]?.title}
                </h3>
                <div 
                  className="text-[#2C2C2C] leading-loose whitespace-pre-wrap"
                  style={{ fontFamily: 'Noto Serif SC, serif' }}
                >
                  {bookChapters[activeChapter]?.content}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      
    </div>
  );
}
