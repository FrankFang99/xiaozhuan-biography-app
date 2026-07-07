import { useState, useEffect, useRef } from 'react';
import { useAppStore, Message } from '../stores/useAppStore';
import { conversationScript, stageQuestions, stageNames } from '../data/conversation';
import { User, Volume2, Mic, Mail } from 'lucide-react';

export function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [scriptIndex, setScriptIndex] = useState(0);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('childhood');
  
  const messages = useAppStore((state) => state.messages);
  const addMessage = useAppStore((state) => state.addMessage);
  const saveLetter = useAppStore((state) => state.saveLetter);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0 && scriptIndex === 0) {
      addMessage({ sender: 'agent', content: conversationScript[0].agent });
      setScriptIndex(1);
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentStageName = () => stageNames[currentStage as keyof typeof stageNames] || '人生故事';

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;
    
    addMessage({ sender: 'user', content: inputValue.trim() });
    saveLetter(inputValue.trim(), getCurrentStageName());
    setInputValue('');
    
    if (scriptIndex < conversationScript.length) {
      setIsTyping(true);
      setTimeout(() => {
        addMessage({ sender: 'agent', content: conversationScript[scriptIndex].agent });
        
        const stages = Object.keys(stageNames);
        const currentIndex = stages.indexOf(currentStage);
        if (currentIndex < stages.length - 1) {
          setCurrentStage(stages[currentIndex + 1]);
        }
        
        setIsTyping(false);
        setScriptIndex(scriptIndex + 1);
      }, 1500 + Math.random() * 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleSuggestedReply = (reply: string) => {
    setInputValue(reply);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音输入');
      return;
    }

    if (isVoiceInput) {
      setIsVoiceInput(false);
      return;
    }

    setIsVoiceInput(true);
    const windowAny = window as any;
    const SpeechRecognition = windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsVoiceInput(false);
    };

    recognition.onerror = () => {
      setIsVoiceInput(false);
    };

    recognition.start();
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
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
            className="text-[#8A8A8A] hover:text-[#D4A853] transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const currentScript = conversationScript[scriptIndex];

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
        
        {isTyping && (
          <div className="flex gap-4 justify-start">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4A853] to-[#C73E3A] rounded-lg flex items-center justify-center text-xl text-white">
              传
            </div>
            <div className="bg-[#FEFCF3] px-4 py-3 rounded-lg border-l-4 border-[#D4A853]">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {currentScript?.suggestedReply && !isTyping && (
          <div className="flex justify-end">
            <button
              onClick={() => handleSuggestedReply(currentScript.suggestedReply)}
              className="px-4 py-2 bg-white rounded-full text-[#5A5A5A] text-sm hover:bg-[#FEFCF3] transition-colors"
            >
              试试: {currentScript.suggestedReply.slice(0, 20)}...
            </button>
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
            placeholder={isVoiceInput ? '正在听您说话...' : '在这张纸上写下您的故事...'}
            className="w-full px-4 py-3 text-lg text-[#2C2C2C] resize-none focus:outline-none"
            rows={3}
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleVoiceInput}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${
              isVoiceInput ? 'bg-[#C73E3A] text-white' : 'bg-[#E8DCC8]'
            }`}
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`flex-1 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              inputValue.trim() && !isTyping
                ? 'bg-gradient-to-r from-[#D4A853] to-[#C73E3A] text-white shadow-lg hover:shadow-xl'
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
