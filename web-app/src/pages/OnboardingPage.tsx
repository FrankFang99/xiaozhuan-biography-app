import { useState } from 'react';
import { useAppStore, GoalSetting } from '../stores/useAppStore';
import { STRUCTURE_CONFIG } from '../services/aiService';

type Step = 'name' | 'relation' | 'time' | 'count' | 'style' | 'structure';

interface OutlineStage {
  id: string;
  name: string;
  order: number;
  questions: string[];
}

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [goal, setGoalState] = useState<GoalSetting>({
    name: '',
    relation: undefined,
    structure: 'timeline',
    style: 'warm',
    targetTime: undefined,
    targetLetterCount: 5,
    startDate: new Date().toISOString().split('T')[0]
  });
  const [showOutline, setShowOutline] = useState(false);
  const [outlineStages, setOutlineStages] = useState<OutlineStage[]>([]);

  const setGoal = useAppStore((state) => state.setGoal);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);
  const updateUserMemory = useAppStore((state) => state.updateUserMemory);
  const userMemory = useAppStore((state) => state.userMemory);

  const steps: { key: Step; label: string }[] = [
    { key: 'name', label: '称呼' },
    { key: 'relation', label: '关系' },
    { key: 'time', label: '时间' },
    { key: 'count', label: '数量' },
    { key: 'style', label: '风格' },
    { key: 'structure', label: '结构' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep === 'name' && !goal.name.trim()) {
      alert('请输入称呼');
      return;
    }
    if (currentStep === 'relation' && !goal.relation) {
      alert('请选择关系');
      return;
    }
    if (currentStep === 'time' && !goal.targetTime) {
      alert('请选择完成时间');
      return;
    }
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    } else {
      const config = STRUCTURE_CONFIG[goal.structure] || STRUCTURE_CONFIG.timeline;
      const stages = config.stages.map((stage, index) => ({
        ...stage,
        order: index + 1
      }));
      setOutlineStages(stages);
      setShowOutline(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  const handleConfirmOutline = () => {
    const finalGoal: GoalSetting = {
      ...goal,
      letterCount: goal.targetLetterCount,
    };

    setGoal(finalGoal);
    
    const updatedMemory = {
      ...userMemory,
      progress: {
        ...userMemory.progress,
        targetLetterCount: goal.targetLetterCount,
        currentPhase: goal.structure === 'timeline' ? 'childhood' : 'early_life'
      }
    };
    updateUserMemory(updatedMemory);

    setCurrentPage('chat');
  };

  const handleRegenerateOutline = () => {
    const config = STRUCTURE_CONFIG[goal.structure] || STRUCTURE_CONFIG.timeline;
    const stages = config.stages.map((stage, index) => {
      const shuffledQuestions = [...stage.questions].sort(() => Math.random() - 0.5);
      return {
        ...stage,
        order: index + 1,
        questions: shuffledQuestions
      };
    });
    setOutlineStages(stages);
    alert('已重新生成大纲');
  };

  const relationOptions = [
    { value: 'grandparent', label: '祖父母' },
    { value: 'parent', label: '父母' },
    { value: 'self', label: '自己' },
    { value: 'other', label: '其他' },
  ];

  const timeOptions = [
    { value: 'week', label: '一周内' },
    { value: 'month', label: '一个月内' },
    { value: 'unlimited', label: '不限时间' },
  ];

  const countOptions = [3, 5, 7, 10];

  const styleOptions = [
    { value: 'warm', label: '温馨回忆', desc: '亲切感人的回忆录风格' },
    { value: 'formal', label: '正式传记', desc: '庄重典雅的传记风格' },
    { value: 'story', label: '故事集', desc: '生动有趣的故事风格' },
  ];

  const structureOptions = [
    { value: 'timeline', label: '时间线模式', desc: '按时间顺序记录人生历程' },
    { value: 'milestone', label: '重大事件模式', desc: '按人生重大事件记录故事' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 'name':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>称呼</h2>
              <p className="text-white/60">请输入传记主角的称呼</p>
            </div>
            <input
              type="text"
              value={goal.name}
              onChange={(e) => setGoalState({ ...goal, name: e.target.value })}
              placeholder="例如：奶奶、爸爸、爷爷"
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-xl placeholder-white/30 focus:outline-none focus:border-[#D4A853] transition-colors"
              maxLength={10}
            />
            <div className="flex flex-wrap justify-center gap-2">
              {['爸爸', '妈妈', '爷爷', '奶奶', '自己'].map((name) => (
                <button
                  key={name}
                  onClick={() => setGoalState({ ...goal, name })}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    goal.name === name
                      ? 'bg-[#D4A853] text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        );

      case 'relation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>关系</h2>
              <p className="text-white/60">选择您与传记主角的关系</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {relationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGoalState({ ...goal, relation: option.value as GoalSetting['relation'] })}
                  className={`p-4 rounded-xl border transition-all ${
                    goal.relation === option.value
                      ? 'bg-[#D4A853]/20 border-[#D4A853] text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>目标完成时间</h2>
              <p className="text-white/60">选择完成传记的时间周期</p>
            </div>
            <div className="space-y-3">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGoalState({ ...goal, targetTime: option.value as GoalSetting['targetTime'] })}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    goal.targetTime === option.value
                      ? 'bg-[#D4A853]/20 border-[#D4A853]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-white font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'count':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>完成传记所需信件数</h2>
              <p className="text-white/60">选择想要写的信件数量</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {countOptions.map((count) => (
                <button
                  key={count}
                  onClick={() => setGoalState({ ...goal, targetLetterCount: count })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    goal.targetLetterCount === count
                      ? 'bg-[#D4A853]/20 border-[#D4A853]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className={`text-3xl font-bold ${goal.targetLetterCount === count ? 'text-[#D4A853]' : 'text-white'}`}>
                    {count}
                  </span>
                  <span className="text-sm text-white/60">封信件</span>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-white/40">达到目标信件数后，传记将自动完成</p>
          </div>
        );

      case 'style':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>传记风格</h2>
              <p className="text-white/60">选择传记的写作风格</p>
            </div>
            <div className="space-y-3">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGoalState({ ...goal, style: option.value as GoalSetting['style'] })}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    goal.style === option.value
                      ? 'bg-[#D4A853]/20 border-[#D4A853]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="text-white font-medium">{option.label}</div>
                      <div className="text-sm text-white/50">{option.desc}</div>
                    </div>
                    {goal.style === option.value && (
                      <div className="w-6 h-6 rounded-full bg-[#D4A853] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'structure':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>传记结构</h2>
              <p className="text-white/60">选择传记的组织结构</p>
            </div>
            <div className="space-y-3">
              {structureOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGoalState({ ...goal, structure: option.value as GoalSetting['structure'] })}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    goal.structure === option.value
                      ? 'bg-[#D4A853]/20 border-[#D4A853]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-medium">{option.label}</span>
                    {goal.structure === option.value && (
                      <div className="w-6 h-6 rounded-full bg-[#D4A853] flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white/50 mb-3">{option.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {STRUCTURE_CONFIG[option.value as keyof typeof STRUCTURE_CONFIG].stages.slice(0, 3).map((stage) => (
                      <span key={stage.id} className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">
                        {stage.name}
                      </span>
                    ))}
                    <span className="text-xs px-2 py-1 bg-white/10 text-white/40 rounded-full">...</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#030512] flex flex-col">
      <div className="bg-gradient-to-b from-[#0D1F3C] to-[#030512] px-4 py-6">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-[#D4A853] to-[#C73E3A] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-1">
            {steps.map((step, index) => (
              <div
                key={step.key}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  index < currentStepIndex
                    ? 'bg-[#D4A853] text-white'
                    : index === currentStepIndex
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="w-10" />
        </div>
      </div>

      {!showOutline ? (
        <>
          <div className="flex-1 flex items-center justify-center px-6 py-8">
            {renderStep()}
          </div>

          <div className="px-6 py-6 bg-[#030512]">
            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-[#C73E3A] to-[#E74C3C] rounded-xl font-bold text-white shadow-[0_8rpx_24rpx_rgba(231,76,60,0.3)] hover:shadow-[0_12rpx_32rpx_rgba(231,76,60,0.4)] active:scale-98 transition-all"
            >
              {currentStep === 'structure' ? '查看大纲' : '下一步'}
              <svg className="inline-block w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center animate-float">
                <span className="text-4xl" style={{ fontFamily: 'Noto Serif SC, serif' }}>书</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-shadow-glow" style={{ fontFamily: 'Noto Serif SC, serif' }}>传记大纲</h2>
              <p className="text-white/60">请确认您的传记记录框架</p>
            </div>

            <div className="bg-white/12 backdrop-blur-md border border-white/15 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">记录框架</h3>
                <button
                  onClick={handleRegenerateOutline}
                  className="text-sm text-[#D4A853] hover:text-[#E5C06F] transition-colors"
                >
                  重新生成
                </button>
              </div>

              <div className="space-y-4">
                {outlineStages.map((stage) => (
                  <div key={stage.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#D4A853]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#D4A853] font-bold">{stage.order}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">{stage.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {stage.questions.slice(0, 2).map((question, index) => (
                          <span key={index} className="text-xs px-3 py-1 bg-white/10 text-white/60 rounded-full">
                            {question}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-white/50">记录对象</div>
                    <div className="text-white font-medium">{goal.name}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-white/50">预计信件数</div>
                    <div className="text-white font-medium">{goal.targetLetterCount}封</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-white/50">完成时间</div>
                    <div className="text-white font-medium">
                      {goal.targetTime === 'week' ? '一周内' : goal.targetTime === 'month' ? '一个月内' : '不限时间'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 bg-[#030512]">
            <div className="flex gap-3">
              <button
                onClick={() => setShowOutline(false)}
                className="flex-1 py-4 bg-white/10 border border-white/10 rounded-xl font-semibold text-white hover:bg-white/15 transition-colors"
              >
                返回修改
              </button>
              <button
                onClick={handleConfirmOutline}
                className="flex-1 py-4 bg-gradient-to-r from-[#C73E3A] to-[#E74C3C] rounded-xl font-bold text-white shadow-[0_8rpx_24rpx_rgba(231,76,60,0.3)] hover:shadow-[0_12rpx_32rpx_rgba(231,76,60,0.4)] active:scale-98 transition-all"
              >
                确认开始
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}