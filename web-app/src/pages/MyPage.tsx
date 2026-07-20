import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { User, Settings, HelpCircle, LogOut, Star, Clock, Heart, MessageSquare, BookMarked } from 'lucide-react';

export function MyPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'memory' | 'stats'>('memory');

  const currentUser = useAppStore((state) => state.currentUser);
  const letters = useAppStore((state) => state.letters);
  const goal = useAppStore((state) => state.goal);
  const userMemory = useAppStore((state) => state.userMemory);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const logout = useAppStore((state) => state.logout);
  const clearUserMemory = useAppStore((state) => state.clearUserMemory);

  const handleLogout = () => {
    logout();
  };

  const handleViewBiography = () => {
    setCurrentPage('biography');
  };

  return (
    <div className="min-h-screen bg-[#030512] pb-24">
      <div className="bg-gradient-to-b from-[#0D1F3C] to-[#030512] px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden flex-shrink-0">
            {currentUser?.avatarUrl || currentUser?.avatar ? (
              <img src={currentUser.avatarUrl || currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[rgba(212,168,83,0.2)] to-[rgba(212,168,83,0.05)] flex items-center justify-center">
                <User className="w-10 h-10 text-white/50" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Noto Serif SC, serif' }}>
              {currentUser?.nickName || currentUser?.name || '用户'}
            </h2>
            <p className="text-sm text-white/50">开始记录您的人生故事</p>
          </div>
          <button onClick={() => setShowSettings(true)} className="text-white/70 hover:text-white">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D4A853] mb-1">{letters.length}</div>
              <div className="text-xs text-white/50">已写信件</div>
            </div>
            <div className="border-x border-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D4A853] mb-1">{goal?.name || '未设定'}</div>
              <div className="text-xs text-white/50">记录对象</div>
            </div>
            <div className="border-x border-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D4A853] mb-1">
                {userMemory.history.totalConversations || 0}
              </div>
              <div className="text-xs text-white/50">对话次数</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'memory'
                ? 'bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/30'
                : 'bg-white/5 text-white/70 border border-white/10'
            }`}
          >
            用户记忆
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/30'
                : 'bg-white/5 text-white/70 border border-white/10'
            }`}
          >
            统计数据
          </button>
        </div>

        {activeTab === 'memory' && (
          <div className="space-y-4">
            {(userMemory.basicInfo.birthPlace || userMemory.basicInfo.birthDate || userMemory.basicInfo.occupation || userMemory.basicInfo.hobbies.length || userMemory.basicInfo.familyMembers.length || userMemory.basicInfo.education || userMemory.basicInfo.workExperience) && (
              <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#D4A853]"><User className="w-4 h-4" /></span>
                  <h3 className="font-semibold text-white">基本信息</h3>
                </div>
                <div className="space-y-2">
                  {userMemory.basicInfo.birthPlace && (
                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>出生地: {userMemory.basicInfo.birthPlace}</span>
                    </div>
                  )}
                  {userMemory.basicInfo.birthDate && (
                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>出生日期: {userMemory.basicInfo.birthDate}</span>
                    </div>
                  )}
                  {userMemory.basicInfo.occupation && (
                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>职业: {userMemory.basicInfo.occupation}</span>
                    </div>
                  )}
                  {userMemory.basicInfo.hobbies.length > 0 && userMemory.basicInfo.hobbies.map((hobby, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>爱好: {hobby}</span>
                    </div>
                  ))}
                  {userMemory.basicInfo.familyMembers.length > 0 && userMemory.basicInfo.familyMembers.map((member, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>家庭成员: {member}</span>
                    </div>
                  ))}
                  {userMemory.basicInfo.education && (
                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>教育背景: {userMemory.basicInfo.education}</span>
                    </div>
                  )}
                  {userMemory.basicInfo.workExperience && (
                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>工作经历: {userMemory.basicInfo.workExperience}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(userMemory.preferences.topics.length || userMemory.preferences.favoriteTopics.length || userMemory.preferences.avoidTopics.length) && (
              <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#D4A853]"><Heart className="w-4 h-4" /></span>
                  <h3 className="font-semibold text-white">偏好</h3>
                </div>
                <div className="space-y-2">
                  {userMemory.preferences.topics.length > 0 && userMemory.preferences.topics.map((topic, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>感兴趣的话题: {topic}</span>
                    </div>
                  ))}
                  {userMemory.preferences.favoriteTopics.length > 0 && userMemory.preferences.favoriteTopics.map((topic, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>喜欢的话题: {topic}</span>
                    </div>
                  ))}
                  {userMemory.preferences.avoidTopics.length > 0 && userMemory.preferences.avoidTopics.map((topic, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>避免的话题: {topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(userMemory.progress.conversationPhase || userMemory.progress.currentPhase) && (
              <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#D4A853]"><Clock className="w-4 h-4" /></span>
                  <h3 className="font-semibold text-white">进度</h3>
                </div>
                <div className="space-y-2">
                  {userMemory.progress.conversationPhase && (
                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>对话阶段: {userMemory.progress.conversationPhase}</span>
                    </div>
                  )}
                  {userMemory.progress.currentPhase && (
                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>当前阶段: {userMemory.progress.currentPhase}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-white/30 mt-1">-</span>
                    <span>总问题数: {userMemory.progress.totalQuestions}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-white/30 mt-1">-</span>
                    <span>当前阶段对话次数: {userMemory.progress.exchangesInCurrentPhase}</span>
                  </div>
                </div>
              </div>
            )}

            {(userMemory.history.totalConversations || userMemory.history.lastConversationTime || userMemory.history.keyMemories.length) && (
              <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#D4A853]"><BookMarked className="w-4 h-4" /></span>
                  <h3 className="font-semibold text-white">历史</h3>
                </div>
                <div className="space-y-2">
                  {userMemory.history.totalConversations > 0 && (
                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>总对话次数: {userMemory.history.totalConversations}</span>
                    </div>
                  )}
                  {userMemory.history.lastConversationTime && (
                    <div className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>最近对话: {userMemory.history.lastConversationTime}</span>
                    </div>
                  )}
                  {userMemory.history.keyMemories.length > 0 && userMemory.history.keyMemories.slice(0, 3).map((memory, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-white/30 mt-1">-</span>
                      <span>记忆{index + 1}: {memory}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!userMemory.basicInfo.birthPlace && !userMemory.basicInfo.birthDate && !userMemory.basicInfo.occupation && !userMemory.basicInfo.hobbies.length && !userMemory.basicInfo.familyMembers.length && !userMemory.basicInfo.education && !userMemory.basicInfo.workExperience && !userMemory.preferences.topics.length && !userMemory.preferences.favoriteTopics.length && !userMemory.preferences.avoidTopics.length && !userMemory.progress.conversationPhase && !userMemory.progress.currentPhase && !userMemory.history.totalConversations && !userMemory.history.lastConversationTime && !userMemory.history.keyMemories.length && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-white/50">暂无记忆数据</p>
                <p className="text-sm text-white/30 mt-1">与小传对话后，AI会记住您的信息</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">目标设置</h3>
              </div>
              <div className="space-y-3">
                {goal && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">记录对象</span>
                      <span className="text-white">{goal.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">记录结构</span>
                      <span className="text-white">{goal.structure === 'timeline' ? '时间线' : '里程碑'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">叙事风格</span>
                      <span className="text-white">
                        {goal.style === 'warm' ? '温暖' : goal.style === 'formal' ? '正式' : '故事'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">预计信件数</span>
                      <span className="text-white">{goal.targetLetterCount || goal.letterCount || 5}封</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">完成时间</span>
                      <span className="text-white">
                        {goal.targetTime === 'week' ? '一周内' : goal.targetTime === 'month' ? '一个月内' : '不限时间'}
                      </span>
                    </div>
                  </>
                )}
                {!goal && (
                  <p className="text-center text-white/50 py-4">未设置目标</p>
                )}
              </div>
            </div>

            <div className="bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">信件统计</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">已写信件</span>
                  <span className="text-white font-bold text-[#D4A853]">{letters.length}封</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">传记状态</span>
                  <span className={`text-white ${letters.length >= (goal?.targetLetterCount || goal?.letterCount || 5) ? 'text-[#D4A853]' : ''}`}>
                    {letters.length >= (goal?.targetLetterCount || goal?.letterCount || 5) ? '已完成' : '进行中'}
                  </span>
                </div>
              </div>
            </div>

            <div 
              className={`bg-white/8 backdrop-blur-md border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/15 transition-colors ${
                letters.length < (goal?.targetLetterCount || goal?.letterCount || 5) ? 'opacity-50' : ''
              }`}
              onClick={letters.length >= (goal?.targetLetterCount || goal?.letterCount || 5) ? handleViewBiography : undefined}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#D4A853]/20 rounded-xl flex items-center justify-center">
                  <BookMarked className="w-6 h-6 text-[#D4A853]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">查看传记</h3>
                  <p className="text-sm text-white/50">
                    {letters.length >= (goal?.targetLetterCount || goal?.letterCount || 5) 
                      ? '点击查看完整传记' 
                      : '完成所有信件后可查看'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <HelpCircle className="w-5 h-5 text-white/50" />
            <span className="text-white/70">帮助与反馈</span>
          </button>
          <button className="w-full flex items-center gap-4 py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <MessageSquare className="w-5 h-5 text-white/50" />
            <span className="text-white/70">联系我们</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 py-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/15 transition-colors"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-red-400">退出登录</span>
          </button>
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
    </div>
  );
}