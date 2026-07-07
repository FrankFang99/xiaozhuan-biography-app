import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  sender: 'agent' | 'user';
  content: string;
  time: string;
}

export interface Letter {
  id: string;
  title: string;
  content: string;
  date: string;
  chapter: string;
  isRead: boolean;
}

export interface BookChapter {
  id: string;
  title: string;
  content: string;
  letters: string[];
}

export interface User {
  phone: string;
  name: string;
  avatar: string;
}

export interface GoalSetting {
  duration: number;
  targetLetters: number;
  startDate: string;
  endDate: string;
}

interface AppState {
  currentUser: User | null;
  messages: Message[];
  letters: Letter[];
  bookChapters: BookChapter[];
  biographyProgress: number;
  chatCount: number;
  wordCount: number;
  currentPage: 'login' | 'onboarding' | 'letterbox' | 'chat' | 'book' | 'stars';
  goal: GoalSetting | null;
  currentLetterIndex: number;
  selectedLetterId: string | null;
  
  login: (phone: string) => void;
  logout: () => void;
  setCurrentPage: (page: 'login' | 'onboarding' | 'letterbox' | 'chat' | 'book' | 'stars') => void;
  setGoal: (goal: GoalSetting) => void;
  addMessage: (message: Omit<Message, 'id' | 'time'>) => void;
  saveLetter: (content: string, chapter: string) => void;
  selectLetter: (letterId: string) => void;
  markLetterRead: (letterId: string) => void;
  updateBook: () => void;
  updateProgress: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      messages: [],
      letters: [],
      bookChapters: [],
      biographyProgress: 0,
      chatCount: 0,
      wordCount: 0,
      currentPage: 'login',
      goal: null,
      currentLetterIndex: 0,
      selectedLetterId: null,
      
      login: (phone) => {
        set({
          currentUser: {
            phone,
            name: phone === 'guest' ? '游客朋友' : '张先生',
            avatar: '👴'
          },
          currentPage: phone === 'guest' ? 'letterbox' : 'onboarding'
        });
      },
      
      logout: () => {
        set({
          currentUser: null,
          messages: [],
          letters: [],
          bookChapters: [],
          biographyProgress: 0,
          chatCount: 0,
          wordCount: 0,
          currentPage: 'login',
          goal: null,
          currentLetterIndex: 0,
          selectedLetterId: null
        });
      },
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setGoal: (goal) => set({ goal }),
      
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
        
        if (message.sender === 'user') {
          get().updateProgress();
        }
      },
      
      saveLetter: (content, chapter) => {
        const { letters, goal } = get();
        const chapterNames = ['童年记忆', '求学经历', '青春岁月', '爱情家庭', '事业奋斗', '人生感悟'];
        const chapterIndex = chapterNames.indexOf(chapter);
        const letterNumber = letters.length + 1;
        
        const newLetter: Letter = {
          id: Date.now().toString(),
          title: `第${letterNumber}封信 - ${chapter}`,
          content,
          date: new Date().toLocaleDateString('zh-CN'),
          chapter: chapterNames[chapterIndex] || chapter,
          isRead: false
        };
        
        set((state) => ({ 
          letters: [...state.letters, newLetter],
          currentLetterIndex: letterNumber
        }));
        
        get().updateBook();
        get().updateProgress();
      },
      
      selectLetter: (letterId) => set({ selectedLetterId: letterId }),
      
      markLetterRead: (letterId) => {
        set((state) => ({
          letters: state.letters.map(l => 
            l.id === letterId ? { ...l, isRead: true } : l
          )
        }));
      },
      
      updateBook: () => {
        const { letters } = get();
        const chapterNames = ['童年记忆', '求学经历', '青春岁月', '爱情家庭', '事业奋斗', '人生感悟'];
        
        const chapters: BookChapter[] = chapterNames.map((name, index) => ({
          id: (index + 1).toString(),
          title: `第${index + 1}章：${name}`,
          content: letters
            .filter(l => l.chapter === name)
            .map(l => l.content)
            .join('\n\n') || '（等待您分享相关故事...）',
          letters: letters.filter(l => l.chapter === name).map(l => l.id)
        }));
        
        set({ bookChapters: chapters });
      },
      
      updateProgress: () => {
        const { letters, goal } = get();
        const target = goal?.targetLetters || 60;
        const progress = Math.min(100, Math.round((letters.length / target) * 100));
        set({ biographyProgress: progress });
      }
    }),
    {
      name: 'xiaozhuan-app-store',
      version: 2
    }
  )
);
