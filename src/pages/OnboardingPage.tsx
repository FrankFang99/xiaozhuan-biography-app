import { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Target } from 'lucide-react';

interface GoalOption {
  days: number;
  letters: number;
  description: string;
}

export function OnboardingPage() {
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const setGoal = useAppStore((state) => state.setGoal);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  const goals: GoalOption[] = [
    { days: 30, letters: 30, description: '一个月，每天一封信' },
    { days: 60, letters: 60, description: '两个月，系统整理' },
    { days: 90, letters: 90, description: '三个月，深度回忆' }
  ];

  const calculateEndDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('zh-CN');
  };

  const handleConfirm = () => {
    if (!selectedGoal) return;
    
    const today = new Date().toLocaleDateString('zh-CN');
    
    setGoal({
      duration: selectedGoal.days,
      targetLetters: selectedGoal.letters,
      startDate: today,
      endDate: calculateEndDate(selectedGoal.days)
    });
    
    setCurrentPage('letterbox');
  };

  return (
    <div className="min-h-screen bg-[#F5E6C8] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#C73E3A] rounded-full flex items-center justify-center mx-auto mb-6">
          <Target className="w-8 h-8 text-white" />
        </div>
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-3" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            设定您的目标
          </h1>
          <p className="text-[#5A5A5A]">选择一个适合您的自传周期</p>
        </div>

        <div className="w-full max-w-sm space-y-4 mb-10">
          {goals.map((goal) => (
            <button
              key={goal.days}
              onClick={() => setSelectedGoal(goal)}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                selectedGoal?.days === goal.days
                  ? 'border-[#C73E3A] bg-white shadow-lg scale-[1.02]'
                  : 'border-transparent bg-white/50 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#2C2C2C]">
                    {goal.days}天
                  </div>
                  <div className="text-sm text-[#5A5A5A] mt-1">{goal.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-[#D4A853]">
                    {goal.letters}封信
                  </div>
                  {selectedGoal?.days === goal.days && (
                    <div className="w-6 h-6 bg-[#C73E3A] rounded-full flex items-center justify-center mx-auto mt-2">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedGoal && (
          <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-8 border border-white/50">
            <div className="flex items-center justify-between text-sm text-[#5A5A5A] mb-3">
              <span>开始日期</span>
              <span className="font-semibold text-[#2C2C2C]">{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[#5A5A5A]">
              <span>预计完成</span>
              <span className="font-semibold text-[#2C2C2C]">{calculateEndDate(selectedGoal.days)}</span>
            </div>
            <div className="mt-4 h-2 bg-[#E8DCC8] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="text-center text-xs text-[#8A8A8A] mt-2">
              进度：0 / {selectedGoal.letters} 封信
            </div>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selectedGoal}
          className={`w-full max-w-sm py-4 rounded-full font-bold text-lg transition-all ${
            selectedGoal
              ? 'bg-gradient-to-r from-[#D4A853] to-[#C73E3A] text-white shadow-lg hover:shadow-xl'
              : 'bg-[#E8DCC8] text-[#8A8A8A] cursor-not-allowed'
          }`}
        >
          确认开始
        </button>
      </div>
    </div>
  );
}
