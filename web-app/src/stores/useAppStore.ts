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
  phone?: string;
  name?: string;
  avatar?: string;
  nickName?: string;
  avatarUrl?: string;
  loginType?: 'wechat' | 'phone' | 'anonymous';
}

export interface GoalSetting {
  id?: string;
  name?: string;
  relation?: 'grandparent' | 'parent' | 'self' | 'other';
  structure?: 'timeline' | 'milestone';
  style?: 'warm' | 'formal' | 'story';
  duration?: number;
  letterCount?: number;
  targetLetterCount?: number;
  startDate?: string;
  endDate?: string;
  targetTime?: string;
  time?: string;
}

export interface UserMemory {
  basicInfo: {
    birthPlace: string;
    birthDate: string;
    occupation: string;
    hobbies: string[];
    familyMembers: string[];
    education: string;
    workExperience: string;
  };
  preferences: {
    topics: string[];
    conversationStyle: 'warm' | 'formal' | 'casual';
    questionFrequency: 'low' | 'medium' | 'high';
    favoriteTopics: string[];
    avoidTopics: string[];
  };
  progress: {
    totalQuestions: number;
    answeredQuestions: string[];
    currentPhase: string;
    daysRemaining: number;
    conversationPhase: 'trust_building' | 'interest_exploration' | 'deep_collection';
    exchangesInCurrentPhase: number;
  };
  history: {
    totalConversations: number;
    lastConversationTime: string;
    keyMemories: string[];
  };
  hasSeenVoiceTutorial: boolean;
}

const defaultUserMemory: UserMemory = {
  basicInfo: {
    birthPlace: '',
    birthDate: '',
    occupation: '',
    hobbies: [],
    familyMembers: [],
    education: '',
    workExperience: ''
  },
  preferences: {
    topics: [],
    conversationStyle: 'warm',
    questionFrequency: 'low',
    favoriteTopics: [],
    avoidTopics: []
  },
  progress: {
    totalQuestions: 24,
    answeredQuestions: [],
    currentPhase: 'childhood',
    daysRemaining: 30,
    conversationPhase: 'trust_building',
    exchangesInCurrentPhase: 0
  },
  history: {
    totalConversations: 0,
    lastConversationTime: '',
    keyMemories: []
  },
  hasSeenVoiceTutorial: false
};

interface AppState {
  currentUser: User | null;
  messages: Message[];
  letters: Letter[];
  bookChapters: BookChapter[];
  biographyProgress: number;
  chatCount: number;
  wordCount: number;
  currentPage: 'login' | 'onboarding' | 'letterbox' | 'chat' | 'book' | 'stars' | 'biography' | 'showcase' | 'my';
  goal: GoalSetting | null;
  currentLetterIndex: number;
  selectedLetterId: string | null;
  userMemory: UserMemory;
  notifications: { id: string; type: string; text: string; time: string; read: boolean }[];
  currentStage: string;
  stageName: string;
  suggestedQuestions: string[];
  usedQuestions: string[];
  fontSize: 'small' | 'medium' | 'large';

  login: (phone: string) => void;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentPage: (page: 'login' | 'onboarding' | 'letterbox' | 'chat' | 'book' | 'stars' | 'biography' | 'showcase' | 'my') => void;
  setGoal: (goal: GoalSetting) => void;
  addMessage: (message: Omit<Message, 'id' | 'time'>) => void;
  saveLetter: (content: string, chapter: string) => void;
  selectLetter: (letterId: string) => void;
  markLetterRead: (letterId: string) => void;
  updateBook: () => void;
  updateProgress: () => void;
  updateUserMemory: (memory: UserMemory) => void;
  clearUserMemory: () => void;
  addNotification: (type: string, text: string) => void;
  clearNotifications: () => void;
  setCurrentStage: (stage: string, name: string) => void;
  setSuggestedQuestions: (questions: string[]) => void;
  addUsedQuestion: (question: string) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  clearMessages: () => void;
  calculateDaysRemaining: () => number;
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
      userMemory: defaultUserMemory,
      notifications: [],
      currentStage: 'childhood',
      stageName: '童年记忆',
      suggestedQuestions: [],
      usedQuestions: [],
      fontSize: 'medium',

      login: (phone) => {
        set({
          currentUser: {
            phone,
            name: phone === 'guest' ? '游客朋友' : '张先生',
            avatar: '👴',
            nickName: phone === 'guest' ? '游客朋友' : '张先生',
            loginType: phone === 'guest' ? 'anonymous' : 'phone'
          },
          currentPage: phone === 'guest' ? 'letterbox' : 'onboarding'
        });
      },

      setCurrentUser: (user) => set({ currentUser: user }),

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
          selectedLetterId: null,
          userMemory: defaultUserMemory
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
        const chapterNames = ['童年记忆', '青春年华', '事业奋斗', '爱情家庭', '人生感悟'];
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
        const chapterNames = ['童年记忆', '青春年华', '事业奋斗', '爱情家庭', '人生感悟'];

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
        const target = goal?.targetLetterCount || goal?.letterCount || 5;
        const progress = Math.min(100, Math.round((letters.length / target) * 100));
        set({ biographyProgress: progress });
      },

      updateUserMemory: (memory) => set({ userMemory: memory }),

      addNotification: (type, text) => {
        const notification = {
          id: Date.now().toString(),
          type,
          text,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          read: false
        };
        set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 10) }));
      },

      clearNotifications: () => set({ notifications: [] }),

      setCurrentStage: (stage, name) => set({ currentStage: stage, stageName: name }),

      setSuggestedQuestions: (questions) => set({ suggestedQuestions: questions }),

      addUsedQuestion: (question) => {
        set((state) => {
          if (!state.usedQuestions.includes(question)) {
            return { usedQuestions: [...state.usedQuestions, question] };
          }
          return state;
        });
      },

      setFontSize: (size) => set({ fontSize: size }),

      clearMessages: () => set({ messages: [] }),

      clearUserMemory: () => {
        set({ userMemory: defaultUserMemory });
      },

      calculateDaysRemaining: () => {
        const { goal } = get();
        if (!goal || !goal.startDate) return 0;
        
        const startDate = new Date(goal.startDate);
        const now = new Date();
        let daysRemaining = 0;
        
        const timeType = goal.targetTime || goal.time;
        
        switch (timeType) {
          case 'week':
            daysRemaining = Math.max(0, 7 - Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
            break;
          case 'month':
            daysRemaining = Math.max(0, 30 - Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
            break;
          case 'unlimited':
            return 0;
          default:
            daysRemaining = 30;
        }
        
        return daysRemaining;
      }
    }),
    {
      name: 'xiaozhuan-app-store',
      version: 4
    }
  )
);
