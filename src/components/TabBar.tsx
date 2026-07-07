import { Inbox, Mail, BookOpen, Star } from 'lucide-react';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'letterbox', label: '信夹', icon: Inbox },
  { id: 'chat', label: '写信', icon: Mail },
  { id: 'book', label: '成书', icon: BookOpen },
  { id: 'stars', label: '星空', icon: Star },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8DCC8] px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive ? 'text-[#C73E3A]' : 'text-[#8A8A8A]'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <Icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(199,62,58,0.3)]' : ''}`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C73E3A] rounded-full"></div>
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
