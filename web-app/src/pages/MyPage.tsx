import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Target, Star, Circle, BookOpen, LogOut, MessageCircle, X, ArrowRight, Saturn } from 'lucide-react';

export function MyPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const currentUser = useAppStore((state) => state.currentUser);
  const letters = useAppStore((state) => state.letters);
  const goal = useAppStore((state) => state.goal);
  const userMemory = useAppStore((state) => state.userMemory);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const logout = useAppStore((state) => state.logout);
  const clearUserMemory = useAppStore((state) => state.clearUserMemory);
  const biographyProgress = useAppStore((state) => state.biographyProgress);

  const getAccompaniedDays = () => {
    const firstVisit = localStorage.getItem('firstVisit') || Date.now().toString();
    const days = Math.floor((Date.now() - parseInt(firstVisit)) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };

  const handleLogout = () => {
    logout();
  };

  const handleViewBiography = () => {
    setCurrentPage('biography');
  };

  const handleFeedback = () => {
    setCurrentPage('feedback');
  };

  const handleClearMemory = () => {
    if (window.confirm('确定要清除所有记忆吗？此操作不可恢复。')) {
      clearUserMemory();
    }
  };

  const handleEditGoal = () => {
    setCurrentPage('onboarding');
  };

  const handleShowcase = () => {
    setCurrentPage('showcase');
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%)'
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5 animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: Math.random() * 2 + 2 + 's'
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 px-5 pt-8 pb-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>我的</h1>
          <p className="text-sm text-white/40">记录时光，珍藏回忆</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 flex-shrink-0">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#95ec69] to-[#73d13d] flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{currentUser?.nickName?.charAt(0) || '用'}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-1">{currentUser?.nickName || '用户'}</h2>
              <p className="text-sm text-white/50">
                {currentUser?.loginType === 'wechat' ? '微信登录' : 
                 currentUser?.loginType === 'phone' ? '手机登录' : '匿名登录'}
              </p>
            </div>
            <div className="px-3 py-1 bg-[#D4A853]/20 rounded-full">
              <span className="text-xs text-[#D4A853]">在线</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D4A853] mb-1">{letters.length}</div>
              <div className="text-xs text-white/50">已写信件</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-xl font-bold text-[#D4A853] mb-1 truncate max-w-[80px]">{goal?.name || '未设定'}</div>
              <div className="text-xs text-white/50">记录对象</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D4A853] mb-1">{getAccompaniedDays()}</div>
              <div className="text-xs text-white/50">陪伴天数</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <button 
            onClick={handleEditGoal}
            className="w-full flex items-center gap-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-[#D4A853]/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-[#D4A853]" />
            </div>
            <span className="flex-1 text-white">我的目标</span>
            <ArrowRight className="w-5 h-5 text-white/30" />
          </button>

          {biographyProgress > 0 && (
            <button 
              onClick={handleViewBiography}
              className="w-full flex items-center gap-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 bg-[#D4A853]/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-[#D4A853]" />
              </div>
              <span className="flex-1 text-white">我的传记</span>
              <ArrowRight className="w-5 h-5 text-white/30" />
            </button>
          )}

          <button
            onClick={() => setShowAbout(true)}
            className="w-full flex items-center gap-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-[#D4A853]/20 rounded-lg flex items-center justify-center">
              <Saturn className="w-5 h-5 text-[#D4A853]" />
            </div>
            <span className="flex-1 text-white">传记宇宙</span>
            <ArrowRight className="w-5 h-5 text-white/30" />
          </button>

          <button 
            onClick={handleShowcase}
            className="w-full flex items-center gap-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-[#D4A853]/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#D4A853]" />
            </div>
            <span className="flex-1 text-white">示例传记</span>
            <ArrowRight className="w-5 h-5 text-white/30" />
          </button>

          <button 
            onClick={handleFeedback}
            className="w-full flex items-center gap-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-[#D4A853]/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#D4A853]" />
            </div>
            <span className="flex-1 text-white">用户反馈</span>
            <ArrowRight className="w-5 h-5 text-white/30" />
          </button>

          <button 
            onClick={handleClearMemory}
            className="w-full flex items-center gap-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-[#D4A853]/20 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-[#D4A853]" />
            </div>
            <span className="flex-1 text-white">清除记忆</span>
            <ArrowRight className="w-5 h-5 text-white/30" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 py-4 bg-white/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="flex-1 text-red-400">退出登录</span>
            <ArrowRight className="w-5 h-5 text-red-400/50" />
          </button>
        </div>

        <div className="text-center pt-6">
          <p className="text-xs text-white/30">小传 v1.1.0</p>
          <p className="text-xs text-white/20 mt-1">(c) 2026 FrankFang</p>
        </div>
      </div>

      {showSettings && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-[#070b1f] border border-white/10 rounded-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">设置</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <span className="text-white/70">清除用户记忆</span>
                  <button
                    onClick={clearUserMemory}
                    className="text-sm text-red-400 px-3 py-1 bg-red-500/10 rounded-lg"
                  >
                    清除
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/15 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showAbout && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="bg-[#070b1f] border border-white/10 rounded-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 text-center" style={{ fontFamily: 'Noto Serif SC, serif' }}>关于小传</h3>
              <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                <p>小传是一款AI驱动的个人传记生成应用，通过与用户对话采集人生故事，最终生成完整的传记作品。</p>
                <p>我们相信，每一个平凡的人生都值得被铭记。让AI成为您的专属传记作者，记录您珍贵的回忆，留下传世的礼物。</p>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-center text-white/50">版本：v1.1.0</p>
                  <p className="text-center text-white/40 mt-1">© 2026 小传团队</p>
                </div>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-[#D4A853] to-[#b89444] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}