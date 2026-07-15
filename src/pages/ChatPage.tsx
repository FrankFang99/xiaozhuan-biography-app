import { useState, useEffect, useRef } from 'react';
import { useAppStore, Message } from '../stores/useAppStore';
import { stageNames } from '../data/conversation';
import { aiService } from '../services/aiService';
import { User, Volume2, Mic, Mail } from 'lucide-react';

export function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('childhood');
  const [streamContent, setStreamContent] = useState('');
  const [streamMessageId, setStreamMessageId] = useState<string | null>(null);
  
  const messages = useAppStore((state) => state.messages);
  const addMessage = useAppStore((state) => state.addMessage);
  const saveLetter = useAppStore((state) => state.saveLetter);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({ 
        sender: 'agent', 
        content: '您好，我是小传，专门帮人记录人生故事的老朋友。您愿意和我聊聊您的人生故事吗？' 
      });
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentStageName = () => stageNames[currentStage as keyof typeof stageNames] || '人生故事';

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
      });
      
      if (streamMessageId === tempId) {
        setIsTyping(false);
        setStreamContent('');
        setStreamMessageId(null);
        
        if (fullResponse) {
          addMessage({ sender: 'agent', content: fullResponse });
        }
        
        const stages = Object.keys(stageNames);
        const currentIndex = stages.indexOf(currentStage);
        if (currentIndex < stages.length - 1 && Math.random() > 0.5) {
          setCurrentStage(stages[currentIndex + 1]);
        }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音输入');
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
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      alert('语音识别失败，请重试');
    };

    recognition.start();
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

  const renderMessage = (message: Message) => (
    <div key={message.id} className={`flex gap-4 ${message.sender === 'agent' ? 'justify-start' : 'justify-end'}`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
        message.sender === 'agent' 
          ? 'bg-gradient-to-br from-[#D4A853] to-[#C73E3A] text-white' 
          : 'bg-[#F5E6C8]'
      }`}>
        {message.sender === 'agent' ? '传' : <User className="w-6 h-6 text-[#5A5A5A]" />}
      </div>
      <div className={`max-w-[80%] ${message.sender === 'agent' ? 'flex flex-col' : 'flex flex-col items-end'}`}>
        <div className={`px-5 py-4 rounded-lg text-lg leading-relaxed shadow-md ${
          message.sender === 'agent' 
            ? 'bg-[#FEFCF3] border-l-4 border-[#D4A853]' 
            : 'bg-[#FEFCF3] border-r-4 border-[#C73E3A]'
        }`} style={{ fontFamily: message.sender === 'agent' ? 'cursive, serif' : 'Noto Serif SC, serif' }}>
          {message.content}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-[#8A8A8A]">{message.time}</span>
          <button 
            onClick={() => handleSpeak(message.content)}
            className="text-[#8A8A8A] hover:text-[#D4A853] transition-colors p-1 rounded-full hover:bg-white/50"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5E6C8] flex flex-col">
      <div className="bg-[#0A1628] text-white px-4 py-4">
        <div className="text-center">
          <h3 className="font-bold" style={{ fontFamily: 'Noto Serif SC, serif' }}>小传 · 写信</h3>
          <p className="text-xs text-[#8A8A8A]">{getCurrentStageName()}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        <div className="bg-white/50 rounded-lg p-4 border border-white/50">
          <p className="text-sm text-[#5A5A5A]">
            今天我们聊聊<span className="text-[#C73E3A] font-semibold">{getCurrentStageName()}</span>，您可以分享任何想说的故事...
          </p>
        </div>
        
        {messages.map(renderMessage)}
        
        {(isTyping || streamContent) && (
          <div className="flex gap-4 justify-start">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4A853] to-[#C73E3A] rounded-lg flex items-center justify-center text-xl text-white">
              传
            </div>
            <div className="bg-[#FEFCF3] px-5 py-4 rounded-lg border-l-4 border-[#D4A853] max-w-[80%]">
              <p style={{ fontFamily: 'cursive, serif' }} className="text-lg leading-relaxed">
                {streamContent || (
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-[#FEFCF3] px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="bg-white border-2 border-[#E8DCC8] rounded-lg p-2 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-[#C73E3A] rounded-full"></div>
            <span className="text-xs text-[#8A8A8A]">写给未来的信</span>
          </div>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="在这张纸上写下您的故事..."
            className="w-full px-4 py-3 text-lg text-[#2C2C2C] resize-none focus:outline-none"
            rows={3}
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleVoiceInput}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl bg-[#E8DCC8] hover:bg-[#D4C4B0] transition-colors"
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`flex-1 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              inputValue.trim() && !isTyping
                ? 'bg-gradient-to-r from-[#D4A853] to-[#C73E3A] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-[#E8DCC8] text-[#8A8A8A] cursor-not-allowed'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span>寄出这封信</span>
          </button>
        </div>
      </div>
    </div>
  );
}