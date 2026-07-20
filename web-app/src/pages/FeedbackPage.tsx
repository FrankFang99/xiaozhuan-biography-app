import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { ArrowLeft, Send, MessageSquare, Bug, Lightbulb, Heart, FileText, Check, X } from 'lucide-react';

interface FeedbackType {
  value: string;
  label: string;
  icon: typeof MessageSquare;
}

export function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [includeContext, setIncludeContext] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const messages = useAppStore((state) => state.messages);
  const userMemory = useAppStore((state) => state.userMemory);
  const letters = useAppStore((state) => state.letters);
  const goal = useAppStore((state) => state.goal);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  const feedbackTypes: FeedbackType[] = [
    { value: 'feature_suggestion', label: '功能建议', icon: Lightbulb },
    { value: 'bug_report', label: '问题反馈', icon: Bug },
    { value: 'complaint', label: '投诉', icon: MessageSquare },
    { value: 'praise', label: '表扬', icon: Heart },
    { value: 'other', label: '其他', icon: FileText },
  ];

  const compressContext = (context: any, maxTokens: number = 4000): any => {
    const estimateTokens = (text: string): number => {
      return Math.ceil(text.length / 2);
    };

    let totalTokens = 0;
    const compressed: any = { ...context };

    if (compressed.messages && Array.isArray(compressed.messages)) {
      const compressedMessages: any[] = [];
      for (const msg of [...compressed.messages].reverse()) {
        const msgTokens = estimateTokens(msg.content);
        if (totalTokens + msgTokens <= maxTokens) {
          compressedMessages.unshift(msg);
          totalTokens += msgTokens;
        } else {
          const remainingTokens = maxTokens - totalTokens;
          if (remainingTokens > 0) {
            const maxLength = remainingTokens * 2;
            compressedMessages.unshift({
              ...msg,
              content: msg.content.substring(0, maxLength) + '...',
              truncated: true
            });
          }
          break;
        }
      }
      compressed.messages = compressedMessages;
    }

    return compressed;
  };

  const getFullContext = () => {
    const context = {
      messages: messages.map(m => ({
        id: m.id,
        role: m.sender === 'user' ? 'user' : 'ai',
        content: m.content,
        time: m.time
      })),
      userMemory: {
        basicInfo: userMemory.basicInfo,
        preferences: userMemory.preferences,
        progress: userMemory.progress,
        history: userMemory.history
      },
      lettersCount: letters.length,
      goal: goal ? {
        name: goal.name,
        structure: goal.structure,
        style: goal.style,
        targetLetterCount: goal.targetLetterCount || goal.letterCount
      } : null,
      conversationCount: messages.filter(m => m.sender === 'user').length,
      lastConversationTime: messages.length > 0 ? 
        new Date().toISOString() : ''
    };

    return compressContext(context);
  };

  const saveToLocal = (data: any) => {
    const localFeedbacks = JSON.parse(localStorage.getItem('localFeedbacks') || '[]');
    const newFeedback = {
      ...data,
      localId: Date.now().toString(),
      savedAt: new Date().toISOString()
    };
    localFeedbacks.push(newFeedback);
    localStorage.setItem('localFeedbacks', JSON.stringify(localFeedbacks));
  };

  const clearLocalFeedbacks = () => {
    localStorage.removeItem('localFeedbacks');
  };

  const uploadFeedback = async (data: any) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submitFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedbackType: data.type,
          content: data.content,
          contact: data.contactInfo,
          includeContext: data.includeContext,
          contextData: data.context
        })
      });

      const result = await response.json();

      if (result.success) {
        clearLocalFeedbacks();
        setSubmitSuccess(true);
        setTimeout(() => {
          setCurrentPage('my');
        }, 2000);
      } else {
        saveToLocal(data);
        alert('提交失败，已保存到本地，稍后会自动重试');
      }
    } catch (error) {
      console.warn('[Feedback] Upload failed, saving locally:', error);
      saveToLocal(data);
      alert('网络异常，已保存到本地，稍后会自动重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (!feedbackType) {
      alert('请选择反馈类型');
      return;
    }
    if (!feedbackContent.trim()) {
      alert('请填写反馈内容');
      return;
    }

    const context = includeContext ? getFullContext() : null;

    uploadFeedback({
      type: feedbackType,
      content: feedbackContent.trim(),
      contactInfo: contactInfo.trim(),
      includeContext,
      context
    });
  };

  const handleBack = () => {
    setCurrentPage('my');
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#030512] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">反馈提交成功</h2>
        <p className="text-white/50">感谢您的反馈，我们会认真处理</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030512] to-[#0a0a1a] pb-24">
      <div className="bg-gradient-to-b from-[#0D1F3C] to-[#030512] px-4 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            用户反馈
          </h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="feedback-section">
          <h3 className="text-lg font-bold text-white mb-4">反馈类型</h3>
          <div className="grid grid-cols-2 gap-3">
            {feedbackTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  onClick={() => setFeedbackType(item.value)}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    feedbackType === item.value
                      ? 'bg-[#D4A853]/20 border-2 border-[#D4A853]'
                      : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${feedbackType === item.value ? 'text-[#D4A853]' : 'text-white/50'}`} />
                  <span className={`text-sm font-medium ${feedbackType === item.value ? 'text-[#D4A853]' : 'text-white/70'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="feedback-section">
          <h3 className="text-lg font-bold text-white mb-4">反馈内容</h3>
          <textarea
            className="w-full h-40 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4A853]/50 resize-none"
            placeholder="请详细描述您的反馈..."
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            maxLength={2000}
          />
          <div className="text-right mt-2">
            <span className="text-sm text-white/30">{feedbackContent.length}/2000</span>
          </div>
        </div>

        <div className="feedback-section">
          <h3 className="text-lg font-bold text-white mb-4">联系方式</h3>
          <input
            type="text"
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4A853]/50"
            placeholder="选填，方便我们联系您"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
          />
        </div>

        <div className="feedback-section">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">包含对话上下文</h3>
              <p className="text-sm text-white/50 mt-1">帮助我们更好地理解问题</p>
            </div>
            <button
              onClick={() => setIncludeContext(!includeContext)}
              className={`w-14 h-7 rounded-full transition-colors relative ${
                includeContext ? 'bg-[#D4A853]' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  includeContext ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !feedbackType || !feedbackContent.trim()}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            isSubmitting || !feedbackType || !feedbackContent.trim()
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#D4A853] to-[#b89444] text-white hover:opacity-90'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>提交中...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>提交反馈</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}