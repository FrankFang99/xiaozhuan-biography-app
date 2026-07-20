import { useState, useEffect, useRef } from 'react';
import { useAppStore, Message } from '../stores/useAppStore';
import { aiService, STRUCTURE_CONFIG } from '../services/aiService';
import { User, Volume2, Mic, Keyboard, RefreshCw, ChevronDown, Bell, X, Settings } from 'lucide-react';

export function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [streamMessageId, setStreamMessageId] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showFloatHeader, setShowFloatHeader] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showVoiceTutorial, setShowVoiceTutorial] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const messages = useAppStore((state) => state.messages);
  const addMessage = useAppStore((state) => state.addMessage);
  const saveLetter = useAppStore((state) => state.saveLetter);
  const userMemory = useAppStore((state) => state.userMemory);
  const goal = useAppStore((state) => state.goal);
  const updateUserMemory = useAppStore((state) => state.updateUserMemory);
  const letters = useAppStore((state) => state.letters);
  const fontSize = useAppStore((state) => state.fontSize);
  const setFontSize = useAppStore((state) => state.setFontSize);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const recordingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getGreeting();
      addMessage({ sender: 'agent', content: greeting });
    }
    scrollToBottom();
    
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(storedNotifications);
    
    if (!userMemory.hasSeenVoiceTutorial) {
      setShowVoiceTutorial(true);
    }
  }, []);

  useEffect(() => {
    getSuggestedQuestions();
  }, [userMemory.progress.currentPhase]);

  const getGreeting = () => {
    const hasMemory = userMemory.basicInfo.birthPlace || 
                      userMemory.basicInfo.occupation || 
                      userMemory.preferences.favoriteTopics.length > 0;
    const conversationPhase = userMemory.progress.conversationPhase;
    const stageName = getCurrentStageName();

    if (goal && hasMemory && conversationPhase === 'deep_collection') {
      return `您好！又见面了。今天我们来聊聊${stageName}的故事，您准备好了吗？`;
    } else if (goal && hasMemory) {
      return '您好！又见面了。今天天气真不错，您感觉怎么样？我们先随便聊聊吧。';
    } else if (goal) {
      return `您好！我是${goal.name}的专属聊天伙伴。很高兴认识您！今天先不聊别的，就想问问您今天过得怎么样？`;
    } else {
      return '您好！我是您的专属聊天伙伴。很高兴认识您！今天先不聊别的，就想问问您今天过得怎么样？';
    }
  };

  const getCurrentStageName = () => {
    const structureType = goal && goal.structure ? goal.structure : 'timeline';
    const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline;
    const currentStage = config.stages.find(s => s.id === userMemory.progress.currentPhase);
    return currentStage ? currentStage.name : '童年记忆';
  };

  const getSuggestedQuestions = () => {
    const structureType = goal && goal.structure ? goal.structure : 'timeline';
    const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline;
    const stages = config.stages;
    const currentStage = stages.find(s => s.id === userMemory.progress.currentPhase);
    
    if (!currentStage) return;

    let allQuestions: string[] = [...currentStage.questions];
    const remainingStages = stages.slice(stages.indexOf(currentStage) + 1);
    remainingStages.forEach(stage => {
      allQuestions = [...allQuestions, ...stage.questions];
    });

    const usedQuestions = userMemory.progress.answeredQuestions;
    const availableQuestions = allQuestions.filter(q => !usedQuestions.includes(q));
    const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    setSuggestedQuestions(selected);
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    addMessage({ sender: 'user', content: userMessage });
    saveLetter(userMessage, getCurrentStageName());
    setInputValue('');
    setIsTyping(true);
    setStreamContent('');

    const tempId = Date.now().toString();
    setStreamMessageId(tempId);

    try {
      let fullResponse = '';

      await aiService.sendMessageStream(userMessage, (chunk) => {
        fullResponse += chunk;
        setStreamContent(fullResponse);
      }, userMemory, goal);

      if (streamMessageId === tempId) {
          setIsTyping(false);
          setStreamContent('');
          setStreamMessageId(null);

          if (fullResponse) {
            addMessage({ sender: 'agent', content: fullResponse });
          }

          updateConversationPhase();
          handleExtractMemory();
        }
    } catch (error) {
      console.error('Send message failed:', error);
      setIsTyping(false);
      setStreamContent('');
      setStreamMessageId(null);

      addMessage({
        sender: 'agent',
        content: '抱歉，我刚才走神了，您能再说一遍吗？'
      });
    }
  };

  const updateConversationPhase = () => {
    const newMemory = { ...userMemory };
    newMemory.progress.exchangesInCurrentPhase++;

    const phase = newMemory.progress.conversationPhase;
    const exchanges = newMemory.progress.exchangesInCurrentPhase;

    if (phase === 'trust_building' && exchanges >= 4) {
      newMemory.progress.conversationPhase = 'interest_exploration';
      newMemory.progress.exchangesInCurrentPhase = 0;
    } else if (phase === 'interest_exploration' && exchanges >= 3) {
      newMemory.progress.conversationPhase = 'deep_collection';
      newMemory.progress.exchangesInCurrentPhase = 0;
    }

    updateUserMemory(newMemory);
    getSuggestedQuestions();
  };

  const handleExtractMemory = async () => {
    if (messages.length === 0) return;

    const historyMessages = messages.map(msg => ({
      role: msg.sender === 'agent' ? 'ai' : 'user',
      content: msg.content
    }));

    try {
      const extracted = await aiService.extractMemory(historyMessages, userMemory);
      const newMemory = { ...userMemory };

      if (extracted.basicInfo) {
        Object.keys(extracted.basicInfo).forEach(key => {
          const k = key as keyof typeof newMemory.basicInfo;
          if (extracted.basicInfo[k] && extracted.basicInfo[k] !== newMemory.basicInfo[k]) {
            if (Array.isArray(newMemory.basicInfo[k])) {
              const existing = newMemory.basicInfo[k] as string[];
              const newItems = extracted.basicInfo[k] as string[];
              newItems.forEach(item => {
                if (!existing.includes(item)) {
                  existing.push(item);
                }
              });
            } else {
              newMemory.basicInfo[k] = extracted.basicInfo[k] as never;
            }
          }
        });
      }

      if (extracted.preferences) {
        if (extracted.preferences.favoriteTopics) {
          extracted.preferences.favoriteTopics.forEach(topic => {
            if (!newMemory.preferences.favoriteTopics.includes(topic)) {
              newMemory.preferences.favoriteTopics.push(topic);
            }
          });
        }
        if (extracted.preferences.avoidTopics) {
          extracted.preferences.avoidTopics.forEach(topic => {
            if (!newMemory.preferences.avoidTopics.includes(topic)) {
              newMemory.preferences.avoidTopics.push(topic);
            }
          });
        }
      }

      if (extracted.keyMemories) {
        extracted.keyMemories.forEach(memory => {
          if (!newMemory.history.keyMemories.includes(memory)) {
            newMemory.history.keyMemories.push(memory);
          }
        });
      }

      updateUserMemory(newMemory);
    } catch (error) {
      console.error('Extract memory failed:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTouchStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (inputMode !== 'voice') return;
    if (isTyping) return;
    if (isRecording) return;

    e.preventDefault();
    
    setIsRecording(true);
    setRecordingDuration(0);
    
    recordingTimer.current = window.setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音输入');
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      return;
    }

    const windowAny = window as any;
    const SpeechRecognition = windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      handleSend();
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      alert('语音识别失败，请重试');
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    };

    recognition.start();
  };

  const handleTouchEnd = () => {
    if (inputMode !== 'voice') return;
    if (!isRecording) return;
    
    setIsRecording(false);
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('您的浏览器不支持语音朗读');
    }
  };

  const handleSelectQuestion = (question: string) => {
    setInputValue(question);
    handleSend();
  };

  const handleRefreshQuestions = () => {
    getSuggestedQuestions();
  };

  const handleToggleInputMode = () => {
    setInputMode(prev => prev === 'voice' ? 'text' : 'voice');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const direction = scrollTop < lastScrollTop.current ? 'up' : 'down';

    if (direction === 'up' && scrollTop < lastScrollTop.current - 50 && !showFloatHeader) {
      setShowFloatHeader(true);
    } else if (direction === 'down' && scrollTop > lastScrollTop.current + 50) {
      setShowFloatHeader(false);
    }

    lastScrollTop.current = scrollTop;
  };

  const closeVoiceTutorial = () => {
    setShowVoiceTutorial(false);
    const newMemory = { ...userMemory, hasSeenVoiceTutorial: true };
    updateUserMemory(newMemory);
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
    setShowNotifications(false);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const renderMessage = (message: Message) => (
    <div key={message.id} className={`flex gap-3 ${message.sender === 'agent' ? 'justify-start' : 'justify-end'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden ${
        message.sender === 'agent'
          ? 'bg-[#D4A853]/20'
          : 'bg-white/10'
      }`}>
        {message.sender === 'agent' ? (
          <img src="./biographer.jpg" alt="小传" className="w-full h-full object-cover" />
        ) : currentUser?.avatarUrl ? (
          <img src={currentUser.avatarUrl} alt="用户" className="w-full h-full object-cover" />
        ) : (
          <User className="w-5 h-5 text-white/70" />
        )}
      </div>
      <div className={`max-w-[80%] ${message.sender === 'agent' ? 'flex flex-col' : 'flex flex-col items-end'}`}>
        <div className={`px-4 py-3 rounded-xl leading-relaxed shadow-md ${getFontSizeClass()} ${
          message.sender === 'agent'
            ? 'bg-white/10 border-l-4 border-[#D4A853]'
            : 'bg-[#D4A853]/20 border-r-4 border-[#D4A853]'
        }`} style={{ fontFamily: 'Noto Serif SC, serif' }}>
          <p className="text-white">{message.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-white/40">{message.time}</span>
          <button
            onClick={() => handleSpeak(message.content)}
            className="text-white/40 hover:text-[#D4A853] transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const getPhaseName = () => {
    const phase = userMemory.progress.conversationPhase;
    const phaseNames: Record<string, string> = {
      trust_building: '破冰信任期',
      interest_exploration: '兴趣探索期',
      deep_collection: '深度采集期'
    };
    return phaseNames[phase] || '破冰信任期';
  };

  const targetLetterCount = goal ? (typeof goal.targetLetterCount === 'number' ? goal.targetLetterCount : parseInt(String(goal.targetLetterCount || goal.letterCount)) || 5) : 5;
  const progressPercent = Math.round((letters.length / targetLetterCount) * 100);
  const daysRemaining = goal?.targetTime === 'week' ? Math.max(0, 7 - Math.floor((Date.now() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 
                        goal?.targetTime === 'month' ? Math.max(0, 30 - Math.floor((Date.now() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 0;

  const currentUser = useAppStore((state) => state.currentUser);

  return (
    <div className="min-h-screen bg-[#030512] flex flex-col">
      <div className="bg-gradient-to-b from-[#0D1F3C] to-[#030512] px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#D4A853]/20">
            <img src="./biographer.jpg" alt="小传" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white" style={{ fontFamily: 'Noto Serif SC, serif' }}>小传</h3>
            <span className="text-xs text-[#D4A853]">{getCurrentStageName()}</span>
          </div>
          <button onClick={() => setShowSettings(true)} className="text-white/70 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full transition-all ${userMemory.progress.conversationPhase === 'trust_building' ? 'bg-[#D4A853] scale-125' : 'bg-white/30'}`} />
          <div className={`w-8 h-0.5 transition-all ${userMemory.progress.conversationPhase !== 'trust_building' ? 'bg-[#D4A853]' : 'bg-white/20'}`} />
          <div className={`w-2 h-2 rounded-full transition-all ${userMemory.progress.conversationPhase === 'interest_exploration' ? 'bg-[#D4A853] scale-125' : 'bg-white/30'}`} />
          <div className={`w-8 h-0.5 transition-all ${userMemory.progress.conversationPhase === 'deep_collection' ? 'bg-[#D4A853]' : 'bg-white/20'}`} />
          <div className={`w-2 h-2 rounded-full transition-all ${userMemory.progress.conversationPhase === 'deep_collection' ? 'bg-[#D4A853] scale-125' : 'bg-white/30'}`} />
        </div>

        {progressPercent > 0 && (
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/70">传记进度</span>
              <span className="text-xs font-bold text-[#D4A853]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-white/40">{letters.length}/{targetLetterCount}封信件</span>
              {daysRemaining > 0 && <span className="text-xs text-white/40">预计剩余{daysRemaining}天</span>}
            </div>
          </div>
        )}
      </div>

      {showFloatHeader && (
        <div className="bg-[#0D1F3C]/95 backdrop-blur-md text-white px-4 py-3 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#D4A853]/20">
              <img src="./biographer.jpg" alt="小传" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-white/70">{getCurrentStageName()}</span>
              {progressPercent > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4A853]" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-xs text-[#D4A853]">{progressPercent}%</span>
                </div>
              )}
            </div>
            <button onClick={() => { setShowFloatHeader(false); scrollToBottom(); }} className="text-white/70 hover:text-white">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24" onScroll={handleScroll}>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-sm text-white/70">
            今天我们聊聊<span className="text-[#D4A853] font-semibold">{getCurrentStageName()}</span>，您可以分享任何想说的故事...
          </p>
        </div>

        {suggestedQuestions.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/70">可以聊聊这些话题：</span>
              <button onClick={handleRefreshQuestions} className="text-[#D4A853] hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectQuestion(question)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white/80 hover:border-[#D4A853] hover:text-[#D4A853] transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(renderMessage)}

        {(isTyping || streamContent) && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#D4A853]/20">
              <img src="./biographer.jpg" alt="小传" className="w-full h-full object-cover" />
            </div>
            <div className="bg-white/10 px-4 py-3 rounded-xl border-l-4 border-[#D4A853] max-w-[80%]">
              <p className="text-white text-base leading-relaxed" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                {streamContent || (
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-[#070b1f] px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handleToggleInputMode}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              inputMode === 'voice' ? 'bg-[#D4A853]/20 text-[#D4A853]' : 'bg-white/10 text-white/70'
            }`}
          >
            {inputMode === 'voice' ? <Mic className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
          </button>
          
          {inputMode === 'voice' ? (
            <div 
              className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isRecording ? 'bg-[#C73E3A]/30 border-2 border-[#C73E3A]' : 'bg-white/5 border-2 border-white/10'
              }`}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-[#C73E3A] rounded-full animate-pulse"></span>
                  <span className="text-[#C73E3A] font-medium">{recordingDuration}s</span>
                </div>
              ) : (
                <span className="text-white/70">按住说话</span>
              )}
            </div>
          ) : (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="说说您的故事..."
              className="flex-1 h-12 px-4 py-2 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[#D4A853] text-base"
              rows={1}
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            />
          )}

          {inputMode === 'text' && (
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className={`px-6 h-12 rounded-xl font-bold text-base transition-all ${
                inputValue.trim() && !isTyping
                  ? 'bg-gradient-to-r from-[#D4A853] to-[#C73E3A] text-white shadow-lg hover:shadow-[0_0_20px_rgba(212,168,83,0.3)]'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              发送
            </button>
          )}
        </div>
      </div>

      {showVoiceTutorial && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-6">
          <div className="bg-[#070b1f] rounded-2xl p-6 max-w-sm w-full border border-white/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#D4A853]/20 rounded-full flex items-center justify-center">
                <Mic className="w-8 h-8 text-[#D4A853]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>语音输入教程</h3>
              <p className="text-sm text-white/70">按住下方按钮说话，松开后自动发送</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 bg-[#D4A853] rounded-full animate-pulse"></div>
                <span className="text-white/70 text-sm">请按住按钮开始说话</span>
              </div>
            </div>
            
            <button
              onClick={closeVoiceTutorial}
              className="w-full py-3 bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-xl text-white font-bold"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#070b1f] rounded-t-2xl border-t border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">通知</h3>
              <div className="flex items-center gap-3">
                <button onClick={clearNotifications} className="text-white/50 text-sm hover:text-white">
                  清空
                </button>
                <button onClick={() => setShowNotifications(false)} className="text-white/70">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  暂无通知
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div key={notif.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          notif.type === '新信件' ? 'bg-[#D4A853]/20 text-[#D4A853]' : 'bg-white/10 text-white/70'
                        }`}>
                          {notif.type}
                        </span>
                        <span className="text-xs text-white/40">{notif.time}</span>
                      </div>
                      <p className="text-white/80 text-sm">{notif.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="w-full bg-[#070b1f] rounded-t-2xl border-t border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">设置</h3>
              <button onClick={() => setShowSettings(false)} className="text-white/70">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-6">
                <h4 className="text-sm text-white/70 mb-3">字体大小</h4>
                <div className="flex gap-3">
                  {[
                    { value: 'small', label: '小' },
                    { value: 'medium', label: '中' },
                    { value: 'large', label: '大' },
                  ].map((size) => (
                    <button
                      key={size.value}
                      onClick={() => {
                        setFontSize(size.value as 'small' | 'medium' | 'large');
                      }}
                      className={`flex-1 py-3 rounded-xl border transition-all ${
                        fontSize === size.value
                          ? 'bg-[#D4A853]/20 border-[#D4A853] text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm text-white/70 mb-3">输入模式</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => setInputMode('voice')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      inputMode === 'voice'
                        ? 'bg-[#D4A853]/20 border-[#D4A853] text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>语音</span>
                  </button>
                  <button
                    onClick={() => setInputMode('text')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      inputMode === 'text'
                        ? 'bg-[#D4A853]/20 border-[#D4A853] text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Keyboard className="w-4 h-4" />
                    <span>文字</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}