import { useState, useEffect, useRef } from 'react';
import { useAppStore, Message } from '../stores/useAppStore';
import { aiService, STRUCTURE_CONFIG } from '../services/aiService';
import { User, Volume2, Mic, Keyboard, RefreshCw, ChevronDown, Settings, Image as ImageIcon } from 'lucide-react';
import biographerImage from '../assets/biographer_avatar.jpg';

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
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasNotification, setHasNotification] = useState(false);

  const messages = useAppStore((state) => state.messages);
  const addMessage = useAppStore((state) => state.addMessage);
  const saveLetter = useAppStore((state) => state.saveLetter);
  const userMemory = useAppStore((state) => state.userMemory);
  const goal = useAppStore((state) => state.goal);
  const updateUserMemory = useAppStore((state) => state.updateUserMemory);
  const letters = useAppStore((state) => state.letters);
  const fontSize = useAppStore((state) => state.fontSize);
  const setFontSize = useAppStore((state) => state.setFontSize);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const currentUser = useAppStore((state) => state.currentUser);

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
    setHasNotification(storedNotifications.length > 0);
    
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

  const isFeedbackIntent = (text: string): boolean => {
    const feedbackTriggers = [
      ['反馈'], ['意见'], ['建议'], ['投诉'], ['问题'], ['bug'],
      ['报错'], ['有问题'], ['不满意'], ['改进'], ['优化'],
      ['功能', '建议'], ['给', '建议'], ['提', '意见'], ['反馈', '问题'],
      ['报告', '问题'], ['帮助', '中心'], ['联系', '客服'], ['联系', '我们']
    ];

    for (const trigger of feedbackTriggers) {
      const allMatch = trigger.every(k => text.includes(k));
      if (allMatch) return true;
    }

    return false;
  };

  const handleFeedbackRequest = () => {
    setIsTyping(false);
    const feedbackMessage = {
      id: Date.now().toString(),
      sender: 'agent' as const,
      content: '非常感谢您的反馈！我们非常重视您的意见。\n\n您可以告诉我具体的问题或建议，或者点击下方按钮进入反馈页面，我们会记录完整的对话上下文以便更好地帮助您。',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    addMessage(feedbackMessage);

    if (window.confirm('感谢您的反馈！我们会认真对待每一条建议。是否进入反馈页面提交详细内容？')) {
      setCurrentPage('feedback');
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

    const feedbackIntent = isFeedbackIntent(userMessage);
    if (feedbackIntent) {
      handleFeedbackRequest();
      return;
    }

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      handleSendImage(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSendImage = async (imageUrl: string) => {
    if (isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      content: imageUrl,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: 'image' as const
    };

    addMessage(userMessage);
    setIsTyping(true);

    try {
      let fullResponse = '';
      await aiService.sendMessageStream(imageUrl, (chunk) => {
        fullResponse += chunk;
        setStreamContent(fullResponse);
      }, userMemory, goal);

      setIsTyping(false);
      setStreamContent('');

      if (fullResponse) {
        addMessage({ sender: 'agent', content: fullResponse });
      }

      updateConversationPhase();
      handleExtractMemory();
    } catch (error) {
      console.error('Send image failed:', error);
      setIsTyping(false);
      setStreamContent('');

      addMessage({
        sender: 'agent',
        content: '抱歉，我刚才走神了，您能再说一遍吗？'
      });
    }
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
    setHasNotification(false);
    localStorage.removeItem('notifications');
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const renderMessage = (message: Message) => (
    <div key={message.id} className={`flex gap-3 ${message.sender === 'agent' ? 'justify-start' : 'justify-end'} mb-6`}>
      {message.sender === 'agent' && (
        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-[#D4A853]/20 border border-[#D4A853]/30">
          <img src={biographerImage} alt="小传" className="w-full h-full object-cover" />
        </div>
      )}
      <div className={`max-w-[75%] ${message.sender === 'agent' ? 'flex flex-col' : 'flex flex-col items-end'}`}>
        {message.type === 'image' ? (
          <div className={`rounded-2xl shadow-sm overflow-hidden ${
            message.sender === 'agent'
              ? 'rounded-tl-sm'
              : 'rounded-tr-sm bg-gradient-to-r from-[#07c160] to-[#06ad56] p-1'
          }`}>
            <img
              src={message.content}
              alt="图片"
              className="max-w-xs max-h-[300px] object-cover rounded-xl"
              onClick={() => window.open(message.content, '_blank')}
              style={{ cursor: 'pointer' }}
            />
          </div>
        ) : (
          <div className={`px-5 py-3 rounded-2xl leading-relaxed shadow-sm ${getFontSizeClass()} ${
            message.sender === 'agent'
              ? 'bg-white rounded-tl-sm text-gray-900'
              : 'bg-gradient-to-r from-[#07c160] to-[#06ad56] text-white rounded-tr-sm'
          }`} style={{ fontFamily: 'Noto Serif SC, serif' }}>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
        <div className="flex items-center gap-2 mt-1.5 px-1">
          <span className="text-xs text-gray-400">{message.time}</span>
          {message.sender === 'agent' && message.type !== 'image' && (
            <button
              onClick={() => handleSpeak(message.content)}
              className="text-gray-400 hover:text-[#D4A853] transition-colors p-1 rounded-full hover:bg-gray-100"
              title="朗读"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {message.sender === 'user' && (
        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="用户" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#95ec69] to-[#73d13d] flex items-center justify-center">
              <span className="text-xs font-bold text-white">{currentUser?.nickName?.charAt(0) || '用'}</span>
            </div>
          )}
        </div>
      )}
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

  return (
    <div className="h-screen bg-gradient-to-b from-[#eef2f7] to-[#f5f7fa] flex flex-col overflow-hidden">
      {/* 顶部头部区域 - 固定高度 */}
      <div className="bg-white/95 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#D4A853]/20 flex-shrink-0">
            <img src={biographerImage} alt="小传" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Noto Serif SC, serif' }}>小传</h3>
            <span className="text-sm text-[#D4A853]">{getCurrentStageName()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              title="设置"
            >
              <span className="text-[#D4A853] font-bold text-xs">A</span>
            </button>
            <button onClick={() => setShowSettings(true)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors" title="设置">
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`w-4 h-4 rounded-full transition-all ${userMemory.progress.conversationPhase === 'trust_building' ? 'bg-[#D4A853] scale-125' : 'bg-gray-200'}`} />
          <div className={`w-10 h-1 rounded-full transition-all ${userMemory.progress.conversationPhase !== 'trust_building' ? 'bg-[#D4A853]' : 'bg-gray-200'}`} />
          <div className={`w-4 h-4 rounded-full transition-all ${userMemory.progress.conversationPhase === 'interest_exploration' ? 'bg-[#D4A853] scale-125' : 'bg-gray-200'}`} />
          <div className={`w-10 h-1 rounded-full transition-all ${userMemory.progress.conversationPhase === 'deep_collection' ? 'bg-[#D4A853]' : 'bg-gray-200'}`} />
          <div className={`w-4 h-4 rounded-full transition-all ${userMemory.progress.conversationPhase === 'deep_collection' ? 'bg-[#D4A853] scale-125' : 'bg-gray-200'}`} />
        </div>

        {progressPercent > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">传记进度</span>
              <span className="text-sm font-bold text-[#D4A853]">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">{letters.length}/{targetLetterCount}封信件</span>
              {daysRemaining > 0 && <span className="text-xs text-[#e74c3c]">预计剩余{daysRemaining}天</span>}
            </div>
          </div>
        )}
      </div>

      {showFloatHeader && (
        <div className="bg-white/98 backdrop-blur-md text-gray-900 px-5 py-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#D4A853]/20">
              <img src={biographerImage} alt="小传" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-900 font-medium">{getCurrentStageName()}</span>
              {progressPercent > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4A853]" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-xs text-[#D4A853]">{progressPercent}%</span>
                </div>
              )}
            </div>
            <button onClick={() => { setShowFloatHeader(false); scrollToBottom(); }} className="text-gray-400 hover:text-gray-600">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {hasNotification && notifications.length > 0 && (
        <div className="mx-5 mt-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm" onClick={clearNotifications}>
          <div className="space-y-3">
            {notifications.slice(0, 3).map(notif => (
              <div key={notif.id} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-[#D4A853]">{notif.type}</span>
                <span className="text-sm text-gray-600">{notif.text}</span>
                <span className="text-xs text-gray-400">{notif.time}</span>
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-400 text-center block mt-3 pt-3 border-t border-gray-100">点击清空</span>
        </div>
      )}

      {/* 消息列表区域 - 自适应高度，可滚动 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-4" onScroll={handleScroll}>
        {suggestedQuestions.length > 0 && (
          <div className="bg-white/80 rounded-xl p-3 border border-gray-100 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[#D4A853]/20 flex-shrink-0">
                  <img src={biographerImage} alt="小传" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-gray-700">可以聊聊这些话题：</span>
              </div>
              <button onClick={handleRefreshQuestions} className="text-[#D4A853] hover:text-gray-900 transition-colors p-1" title="刷新">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectQuestion(question)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 hover:border-[#D4A853] hover:text-[#D4A853] transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(renderMessage)}

        {(isTyping || streamContent) && (
          <div className="flex gap-3 justify-start mb-6">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#D4A853]/20 border border-[#D4A853]/30 flex-shrink-0">
              <img src={biographerImage} alt="小传" className="w-full h-full object-cover" />
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[75%]">
              <p className="text-gray-900 text-base leading-relaxed" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                {streamContent || (
                  <span className="flex gap-2 items-center">
                    <span className="w-2 h-2 bg-[#D4A853] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-[#D4A853] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-[#D4A853] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区域 - 固定在TabBar上方 */}
      <div className="bg-white px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-gray-100 flex-shrink-0 pb-20">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleInputMode}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
              inputMode === 'voice' ? 'bg-[#07c160]/20 text-[#07c160]' : 'bg-gray-100 text-gray-600'
            }`}
            title={inputMode === 'voice' ? '切换到文字' : '切换到语音'}
          >
            {inputMode === 'voice' ? <Mic className="w-4 h-4" /> : <Keyboard className="w-4 h-4" />}
          </button>

          {inputMode === 'voice' ? (
            <div
              className={`flex-1 h-10 rounded-full flex items-center justify-center transition-colors ${
                isRecording ? 'bg-[#C73E3A]/20 border-2 border-[#C73E3A]' : 'bg-gradient-to-r from-[#07c160] to-[#06ad56] border-2 border-[#07c160]'
              }`}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {isRecording ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#C73E3A] rounded-full animate-pulse"></span>
                  <span className="text-[#C73E3A] font-medium text-sm">{recordingDuration}s</span>
                </div>
              ) : (
                <span className="text-white font-medium text-sm">按住说话</span>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <button
                onClick={() => document.getElementById('image-upload')?.click()}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#07c160]/20 text-[#07c160] hover:bg-[#07c160]/30 transition-colors flex-shrink-0"
                title="发送图片"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="说说您的故事..."
                className="flex-1 h-10 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:border-[#D4A853] text-sm"
                rows={1}
                style={{ fontFamily: 'Noto Serif SC, serif' }}
              />
            </div>
          )}

          {inputMode === 'text' && (
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className={`px-5 h-10 rounded-full font-bold text-sm transition-all flex-shrink-0 ${
                inputValue.trim() && !isTyping
                  ? 'bg-gradient-to-r from-[#D4A853] to-[#b89444] text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              发送
            </button>
          )}
        </div>
      </div>

      {showVoiceTutorial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#D4A853]/20 rounded-full flex items-center justify-center">
                <Mic className="w-8 h-8 text-[#D4A853]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>语音输入教程</h3>
              <p className="text-sm text-gray-600">按住下方按钮说话，松开后自动发送</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 bg-[#D4A853] rounded-full animate-pulse"></div>
                <span className="text-gray-600 text-sm">请按住按钮开始说话</span>
              </div>
            </div>
            
            <button
              onClick={closeVoiceTutorial}
              className="w-full py-3 bg-gradient-to-r from-[#D4A853] to-[#b89444] rounded-xl text-white font-bold"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">设置</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm text-gray-600 mb-3">字体大小</h4>
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
                          ? 'bg-[#D4A853]/20 border-[#D4A853] text-gray-900'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm text-gray-600 mb-3">输入模式</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => setInputMode('voice')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      inputMode === 'voice'
                        ? 'bg-[#D4A853]/20 border-[#D4A853] text-gray-900'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>语音</span>
                  </button>
                  <button
                    onClick={() => setInputMode('text')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      inputMode === 'text'
                        ? 'bg-[#D4A853]/20 border-[#D4A853] text-gray-900'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
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