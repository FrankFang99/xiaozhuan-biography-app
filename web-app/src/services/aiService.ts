interface ChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
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

export interface Goal {
  id?: string;
  name?: string;
  relation?: 'grandparent' | 'parent' | 'self' | 'other';
  structure?: 'timeline' | 'milestone';
  style?: 'warm' | 'formal' | 'story';
  letterCount?: number;
  targetLetterCount?: number;
  startDate?: string;
  targetTime?: string;
  time?: string;
}

export const STRUCTURE_CONFIG = {
  timeline: {
    name: '时间线模式',
    stages: [
      { id: 'childhood', name: '童年记忆', questions: [
        '小时候在哪里长大呀？那个地方现在怎么样了？',
        '童年最难忘的一件事是什么？现在想起来还觉得开心吗？',
        '小时候最喜欢玩什么游戏？有没有和小伙伴一起玩的特别有意思的经历？',
        '有没有印象特别深的老师或同学？他们现在还好吗？',
        '小时候家里是什么样的？爸爸妈妈那时候是做什么的？',
        '小时候有没有什么特别想要却没得到的东西？',
        '上学的时候最喜欢哪门课？有没有什么有趣的课堂故事？',
        '小时候过年过节都是怎么过的？有什么特别的习俗吗？'
      ] },
      { id: 'youth', name: '青春年华', questions: [
        '中学时代有什么特别的经历？那时候最喜欢做什么？',
        '年轻时有什么梦想？后来实现了吗？',
        '第一次离开家去远方是什么感觉？还记得当时的心情吗？',
        '青春时期最骄傲的事情是什么？为什么会觉得骄傲呢？',
        '年轻时最喜欢做什么？有没有什么爱好一直坚持到现在？',
        '年轻时有没有喜欢过什么人？那是一段什么样的感情？',
        '年轻的时候有没有什么疯狂的想法或举动？',
        '当时有没有什么事情让你觉得特别迷茫或者困惑？'
      ] },
      { id: 'career', name: '事业奋斗', questions: [
        '第一份工作是什么？当时是怎么找到的？',
        '工作中遇到过什么挑战？是怎么克服的？',
        '职业生涯中最难忘的时刻是什么？为什么印象这么深？',
        '对现在的年轻人有什么职业建议？',
        '工作中最有成就感的事情是什么？',
        '有没有特别敬佩的同事或者领导？他们教会了你什么？',
        '工作这么多年，最大的收获是什么？',
        '有没有什么工作上的遗憾？如果重来会怎么做？'
      ] },
      { id: 'love', name: '爱情家庭', questions: [
        '是怎么认识另一半的？还记得第一次见面的场景吗？',
        '结婚时是什么样的场景？那时候心情怎么样？',
        '有什么想对家人说的话？',
        '家庭生活中最温馨的时刻是什么？',
        '为人父母有什么感受？看着孩子长大是什么感觉？',
        '和家人之间有没有什么特别难忘的故事？',
        '有没有什么想对另一半说但一直没说的话？',
        '家庭对你来说意味着什么？'
      ] },
      { id: 'life', name: '人生感悟', questions: [
        '回顾一生，觉得最重要的是什么？',
        '有没有什么遗憾的事情？如果能重来会做什么不同的选择？',
        '最想留给后代的话是什么？',
        '对生命有什么感悟？',
        '这一生最感谢的人是谁？为什么？',
        '有没有什么道理是年纪大了才明白的？',
        '现在最想做的事情是什么？',
        '对现在的自己满意吗？为什么？'
      ] }
    ]
  },
  milestone: {
    name: '重大事件模式',
    stages: [
      { id: 'first_time', name: '人生第一次', questions: [
        '人生中印象最深的"第一次"是什么？为什么印象这么深？',
        '第一次离开家乡是什么时候？当时是什么心情？',
        '第一次独立做决定是什么时候？做了什么决定？',
        '第一次感受到人生的意义是什么时候？',
        '第一次感受到爱的时刻是什么？',
        '第一次赚工资是什么感觉？',
        '第一次坐飞机/火车是什么体验？',
        '第一次当父母是什么感觉？'
      ] },
      { id: 'challenge', name: '挑战与成长', questions: [
        '人生中遇到过最大的挑战是什么？是怎么克服的？',
        '从失败中学到了什么？',
        '最艰难的时期是怎么度过的？谁帮助了你？',
        '哪次经历让你成长最多？',
        '有没有什么困难当时觉得过不去，但现在回头看觉得还好？',
        '面对困难的时候，是什么支撑你坚持下去的？',
        '有没有什么挑战让你发现了自己的潜力？',
        '困难过后，你有什么改变吗？'
      ] },
      { id: 'love_relation', name: '爱与关系', questions: [
        '生命中最重要的人是谁？为什么？',
        '和家人之间有什么难忘的故事？',
        '朋友对你意味着什么？',
        '有没有特别想感谢的人？想对他们说什么？',
        '怎么理解爱的意义？',
        '有没有什么人让你觉得特别温暖？',
        '和亲人之间有没有什么遗憾？',
        '你觉得什么样的关系才是好的关系？'
      ] },
      { id: 'dream_pursuit', name: '梦想与追求', questions: [
        '年轻时有什么梦想？为梦想付出过哪些努力？',
        '梦想实现了吗？如果没有，现在怎么看？',
        '还有什么想做的事情？',
        '对梦想有什么新的理解？',
        '有没有什么梦想是后来才有的？',
        '为了梦想，你放弃过什么吗？',
        '实现梦想的那一刻是什么感觉？',
        '如果现在还有一个梦想，你会去实现吗？'
      ] },
      { id: 'life_wisdom', name: '人生智慧', questions: [
        '一生中学到的最重要的道理是什么？',
        '想留给后代什么财富？',
        '对年轻一代有什么建议？',
        '如何看待人生的得与失？',
        '生命的意义是什么？',
        '你觉得什么样的人生才是圆满的？',
        '有没有什么事情是年纪大了才看懂的？',
        '如果能给年轻时的自己一句话，你会说什么？'
      ] }
    ]
  }
};

const MODEL_CONFIG = {
  minimax: {
    name: 'Minimax abab6',
    baseUrl: 'https://api.minimaxi.com/v1',
    token: 'sk-cp-Y0zSTfvYIXmHmohQzg58dPrtnUOORLpkh2XG4NbWEehE9ChnjMQ4mN1gGA9YrIRkoaZHYd527kSPPf8NYeT_vzIDTICnFX292aY4ycmlPvEFUTZurzosEoI',
    model: 'abab6-chat',
    maxTokens: 800,
    temperature: 0.8,
    topP: 0.9
  },
  minimax_m3: {
    name: 'Minimax M3',
    baseUrl: 'https://api.minimaxi.com/v1',
    token: 'sk-cp-Y0zSTfvYIXmHmohQzg58dPrtnUOORLpkh2XG4NbWEehE9ChnjMQ4mN1gGA9YrIRkoaZHYd527kSPPf8NYeT_vzIDTICnFX292aY4ycmlPvEFUTZurzosEoI',
    model: 'm3-chat',
    maxTokens: 800,
    temperature: 0.7,
    topP: 0.9
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    token: 'sk-7e943d5495704d7fb6a62a6763da5475',
    model: 'deepseek-chat',
    maxTokens: 800,
    temperature: 0.7,
    topP: 0.9
  }
};

function classifyQuestion(content: string): string {
  const contentLower = content.toLowerCase();
  const extractionKeywords = ['提取', '总结', '记录', '整理', '分析', '结构化', 'json', '数据'];
  const chatKeywords = ['聊', '说说', '讲讲', '怎么样', '好不好', '呢', '吧', '吗'];

  for (const keyword of extractionKeywords) {
    if (contentLower.includes(keyword)) {
      return 'extraction';
    }
  }

  for (const keyword of chatKeywords) {
    if (contentLower.includes(keyword)) {
      return 'chat';
    }
  }

  return 'chat';
}

function selectModel(content: string): string {
  const category = classifyQuestion(content);
  if (category === 'extraction') {
    return 'deepseek';
  }
  return 'minimax';
}

function buildSystemPrompt(goal: Goal | null, userMemory: UserMemory): { systemPrompt: string; currentStage: { id: string; name: string; questions: string[] }; biographyStages: { id: string; name: string; questions: string[] }[]; conversationPhase: string } {
  const memory = userMemory || {
    basicInfo: { birthPlace: '', birthDate: '', occupation: '', hobbies: [], familyMembers: [], education: '', workExperience: '' },
    preferences: { topics: [], conversationStyle: 'warm', questionFrequency: 'low', favoriteTopics: [], avoidTopics: [] },
    progress: { totalQuestions: 24, answeredQuestions: [], currentPhase: 'childhood', daysRemaining: 30, conversationPhase: 'trust_building', exchangesInCurrentPhase: 0 },
    history: { totalConversations: 0, lastConversationTime: '', keyMemories: [] },
    hasSeenVoiceTutorial: false
  };

  const structureType = goal && goal.structure ? goal.structure : 'timeline';
  const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline;
  const biographyStages = config.stages;

  const currentStage = biographyStages.find(s => s.id === memory.progress.currentPhase) || biographyStages[0];
  const remainingStages = biographyStages.slice(biographyStages.indexOf(currentStage) + 1);

  const conversationPhase = memory.progress.conversationPhase || 'trust_building';

  const phaseConfig = {
    trust_building: {
      name: '破冰信任期',
      description: '纯粹闲聊，建立信任关系，不涉及任何传记问题',
      behavior: '像家人朋友一样聊天，询问用户的近况、心情、天气、饮食、身体状况等轻松话题。用关心的态度让用户感到舒适和放松，建立信任关系。可以说"今天天气怎么样？"、"身体还好吧？"、"最近有没有什么开心的事？"。绝对不要询问任何与人生故事、传记相关的问题。重点是让用户觉得你是一个值得信任的聊天伙伴。'
    },
    interest_exploration: {
      name: '兴趣探索期',
      description: '探索用户感兴趣的话题，逐步引入人生主题',
      behavior: '继续亲切聊天，但可以偶尔自然地提及一些与人生经历相关的轻松话题。比如"您平时喜欢做什么呀？"、"年轻时有没有什么特别的爱好？"、"听说您年轻时去过很多地方？"。观察用户对哪些话题感兴趣，多聊他们感兴趣的内容。不要直接开始正式的传记问题，而是用轻松的方式了解用户的兴趣点和人生经历。重点是让用户打开话匣子，愿意分享。'
    },
    deep_collection: {
      name: '深度采集期',
      description: '正式开始传记内容采集',
      behavior: '按照传记阶段引导问题进行正式的信息采集，但依然保持亲切温和的语气。不要像审问一样提问，而是把问题融入到聊天中。比如"说到童年，您小时候是在哪里长大的呀？"、"我很好奇，您的第一份工作是什么样的？"。在用户回答后，适当追问细节和感受，比如"当时是什么样的场景？"、"您当时的心情怎么样？"、"后来呢？发生了什么？"。当用户分享得很详细时，给予肯定和鼓励，让他们感受到被重视和赞赏。'
    }
  };

  const currentPhaseConfig = phaseConfig[conversationPhase] || phaseConfig.trust_building;

  const basicInfoStr = `
出生地：${memory.basicInfo.birthPlace || '未记录'}
出生日期：${memory.basicInfo.birthDate || '未记录'}
职业：${memory.basicInfo.occupation || '未记录'}
爱好：${memory.basicInfo.hobbies.length > 0 ? memory.basicInfo.hobbies.join('、') : '未记录'}
家庭成员：${memory.basicInfo.familyMembers.length > 0 ? memory.basicInfo.familyMembers.join('、') : '未记录'}
教育经历：${memory.basicInfo.education || '未记录'}
工作经历：${memory.basicInfo.workExperience || '未记录'}
  `.trim();

  const preferencesStr = `
喜欢的话题：${memory.preferences.favoriteTopics.length > 0 ? memory.preferences.favoriteTopics.join('、') : '无'}
避免的话题：${memory.preferences.avoidTopics.length > 0 ? memory.preferences.avoidTopics.join('、') : '无'}
对话风格偏好：${memory.preferences.conversationStyle === 'warm' ? '温暖亲切' : memory.preferences.conversationStyle === 'formal' ? '正式礼貌' : '轻松随意'}
问题频率偏好：${memory.preferences.questionFrequency === 'low' ? '少问问题多倾听' : memory.preferences.questionFrequency === 'medium' ? '适度提问' : '多追问'}
  `.trim();

  const answeredQuestionsStr = memory.progress.answeredQuestions.length > 0
    ? memory.progress.answeredQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : '暂无';

  const stageQuestionsStr = currentStage.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');

  let systemPrompt = `你是一位温暖、耐心、富有同理心的聊天伙伴和传记作家，专门帮助老人记录人生故事。你就像他们的老朋友一样，善于倾听，懂得引导，能够让老人在轻松愉快的氛围中分享自己的人生经历。

【当前记录对象】：${goal ? goal.name : '用户'}
【关系】：${goal ? (goal.relation === 'grandparent' ? '祖父母' : goal.relation === 'parent' ? '父母' : goal.relation === 'self' ? '自己' : '其他') : '未知'}

【对话阶段】：${currentPhaseConfig.name}
【阶段描述】：${currentPhaseConfig.description}

${conversationPhase === 'deep_collection' ? `
【传记结构】：${config.name}
【传记风格】：${goal && goal.style ? (goal.style === 'warm' ? '温馨回忆录风格，亲切感人' : goal.style === 'formal' ? '正式传记风格，庄重典雅' : '故事集风格，生动有趣') : '温馨回忆录风格'}

【当前阶段】：${currentStage.name}
【本阶段待问问题】：
${stageQuestionsStr}

【后续阶段】：${remainingStages.map(s => s.name).join(' → ') || '已完成所有阶段'}
` : ''}

【已采集的基础信息】：
${basicInfoStr}

【用户对话偏好】：
${preferencesStr}

【已问过的问题】：
${answeredQuestionsStr}

=================== 核心对话技巧 ====================

【倾听技巧】：
- 认真倾听用户说的每一句话，不要打断
- 对用户的分享表示理解和共鸣，让他们感受到被重视
- 用"嗯"、"我明白了"、"原来是这样"等简短回应鼓励用户继续说下去

【提问技巧】：
- 使用开放式问题，避免简单的"是"或"否"回答
- 提问时带着好奇和兴趣，而不是审问的态度
- 从具体的场景和细节入手，引导用户回忆
- 适当追问"当时是什么样的场景？"、"你当时的心情怎么样？"、"后来呢？"
- 把问题包装在关心和好奇的表达中，而不是直接生硬地问

【共情技巧】：
- 当用户分享开心的事情时，表达喜悦和赞赏
- 当用户分享难过的事情时，表达理解和安慰
- 用"我能想象当时的情景"、"一定很不容易吧"等表达共情
- 分享适当的共鸣感受，但不要把话题转移到自己身上

【话题引导技巧】：
- 从用户感兴趣的话题切入，慢慢引导到人生故事
- 注意观察用户的兴趣点，当用户对某个话题表现出兴趣时，多聊一些
- 当用户犹豫或不愿意回答时，不要追问，自然转移话题
- 用故事性的方式引导，比如"听说那个年代的人都经历过很多有意思的事情"

【适老化沟通】：
- 使用简单易懂的语言，避免复杂词汇和网络用语
- 说话速度放慢，给用户足够的反应时间
- 多用鼓励和肯定的话语，增强用户的信心
- 尊重用户的生活经验和人生智慧

=================== 行为准则 ====================

你需要：
${currentPhaseConfig.behavior}
1. 使用亲切、温和的语气，像家人一样聊天，不要太正式
2. 在闲聊中自然穿插关键问题，不要生硬地提问
3. 根据用户的回答，提出深入的追问，了解背后的故事和感受
4. 不要一次性问太多问题，一次只问一个，给用户足够的时间回答
5. 当用户不愿意回答某个问题时，要尊重他们的意愿，转开话题
6. 记录下所有有价值的信息，用于后续生成传记
7. 不要重复问已经问过的问题
8. 根据用户偏好调整对话方向，多聊用户喜欢的话题
9. 当用户说"结束"或表示想停止时，礼貌地结束对话并总结本次对话内容
10. 当用户询问功能时，耐心解释如何使用
11. 在对话中注意观察用户的兴趣点，当用户对某个话题表现出兴趣时，可以多聊一些
${conversationPhase === 'deep_collection' ? '12. 完成当前阶段后，自然过渡到下一阶段' : ''}
${conversationPhase !== 'deep_collection' ? '12. 当前阶段不要主动提及传记、人生故事等正式话题，先建立信任关系' : ''}

【回复长度建议】：
- 一般回复：2-3句话，简短而温暖
- 回应分享：适当展开，表达理解和共鸣
- 提出问题：1-2句话，把问题自然地融入对话中

【语气风格】：
- 温暖：像家人一样亲切关心
- 好奇：对用户的经历表现出真诚的兴趣
- 尊重：尊重用户的观点和感受
- 鼓励：鼓励用户继续分享，给予肯定

记住，你的目标是让老人感受到被理解、被尊重、被关爱，愿意敞开心扉分享他们的人生故事。`;

  return { systemPrompt, currentStage, biographyStages, conversationPhase };
}

function buildRequestMessages(messages: { role: string; content: string }[], systemPrompt: string): ChatMessage[] {
  const historyMessages = messages.slice(-8);
  return [
    { role: 'system' as const, content: systemPrompt },
    ...historyMessages.map(msg => ({
      role: (msg.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: msg.content
    }))
  ];
}

async function callLLMDirect(messages: { role: string; content: string }[], goal: Goal | null, userMemory: UserMemory, modelKey: string = 'minimax'): Promise<string> {
  const { systemPrompt } = buildSystemPrompt(goal, userMemory);
  const requestMessages = buildRequestMessages(messages, systemPrompt);

  const config = MODEL_CONFIG[modelKey as keyof typeof MODEL_CONFIG] || MODEL_CONFIG.minimax;

  const response = await fetch(config.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.token
    },
    body: JSON.stringify({
      model: config.model,
      messages: requestMessages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      top_p: config.topP
    })
  });

  const data = await response.json();

  if (data && data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    throw new Error('API response error');
  }
}

async function callLLM(messages: { role: string; content: string }[], goal: Goal | null, userMemory: UserMemory): Promise<string> {
  const lastMessage = messages[messages.length - 1];
  const modelKey = lastMessage ? selectModel(lastMessage.content) : 'minimax';
  const fallbackModelKey = 'minimax_m3';

  try {
    return await callLLMDirect(messages, goal, userMemory, modelKey);
  } catch {
    try {
      return await callLLMDirect(messages, goal, userMemory, fallbackModelKey);
    } catch (err) {
      throw err;
    }
  }
}

async function extractMemoryDirect(messages: { role: string; content: string }[], currentMemory: UserMemory): Promise<{ basicInfo: Partial<UserMemory['basicInfo']>; preferences: Partial<UserMemory['preferences']>; keyMemories: string[] }> {
  const memory = currentMemory || {
    basicInfo: { birthPlace: '', birthDate: '', occupation: '', hobbies: [], familyMembers: [], education: '', workExperience: '' },
    preferences: { topics: [], conversationStyle: 'warm', questionFrequency: 'low', favoriteTopics: [], avoidTopics: [] },
    progress: { totalQuestions: 24, answeredQuestions: [], currentPhase: 'childhood', daysRemaining: 30, conversationPhase: 'trust_building', exchangesInCurrentPhase: 0 },
    history: { totalConversations: 0, lastConversationTime: '', keyMemories: [] },
    hasSeenVoiceTutorial: false
  };

  const recentMessages = messages.slice(-6);
  const conversationText = recentMessages.map(m => `${m.role === 'ai' ? '助手' : '用户'}: ${m.content}`).join('\n');

  const basicInfoStr = `
出生地：${memory.basicInfo.birthPlace || '未记录'}
出生日期：${memory.basicInfo.birthDate || '未记录'}
职业：${memory.basicInfo.occupation || '未记录'}
爱好：${memory.basicInfo.hobbies.join('、') || '未记录'}
家庭成员：${memory.basicInfo.familyMembers.join('、') || '未记录'}
教育经历：${memory.basicInfo.education || '未记录'}
工作经历：${memory.basicInfo.workExperience || '未记录'}
    `.trim();

  const preferencesStr = `
喜欢的话题：${memory.preferences.favoriteTopics.join('、') || '无'}
避免的话题：${memory.preferences.avoidTopics.join('、') || '无'}
    `.trim();

  const systemPrompt = `你是一个信息提取助手，负责从对话中提取用户的个人信息和偏好。

当前已有的用户记忆：
【基础信息】
${basicInfoStr}

【偏好】
${preferencesStr}

请分析下面的对话，提取新的信息并返回JSON格式的更新内容。

对话内容：
${conversationText}

返回格式要求：
{
  "basicInfo": {
    "birthPlace": "提取到的出生地（如果有新信息）",
    "birthDate": "提取到的出生日期",
    "occupation": "提取到的职业",
    "hobbies": ["爱好1", "爱好2"],
    "familyMembers": ["成员1", "成员2"],
    "education": "教育经历",
    "workExperience": "工作经历"
  },
  "preferences": {
    "favoriteTopics": ["喜欢的话题"],
    "avoidTopics": ["避免的话题"]
  },
  "keyMemories": ["关键记忆点1", "关键记忆点2"]
}

注意：
1. 只返回新发现的信息，如果某个字段没有新信息则返回空字符串或空数组
2. 不要凭空猜测，只提取对话中明确提到的信息
3. 如果用户提到喜欢某个话题，添加到favoriteTopics
4. 如果用户提到不喜欢某个话题或不愿意讨论某个话题，添加到avoidTopics
5. keyMemories是对话中提到的重要人生事件或回忆`;

  const response = await fetch(MODEL_CONFIG.minimax.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + MODEL_CONFIG.minimax.token
    },
    body: JSON.stringify({
      model: 'abab6-chat',
      messages: [{ role: 'system', content: systemPrompt }],
      max_tokens: 600,
      temperature: 0.2,
      top_p: 0.5
    })
  });

  const data = await response.json();

  if (data && data.choices && data.choices.length > 0) {
    const content = data.choices[0].message.content;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return extracted;
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch {
      return { basicInfo: {}, preferences: {}, keyMemories: [] };
    }
  } else {
    throw new Error('API response error');
  }
}

const fallbackResponses = {
  trust_building: [
    '今天天气真不错，您感觉怎么样？',
    '身体还好吧？最近有没有什么开心的事？',
    '好久不见，您最近过得怎么样？',
    '今天想吃点什么特别的吗？',
    '外面天气挺好的，有没有出去走走？',
    '最近睡得好吗？',
    '今天心情怎么样？有什么想聊的吗？'
  ],
  interest_exploration: [
    '您平时喜欢做什么呀？有没有什么特别的爱好？',
    '听说您年轻时去过很多地方？能和我说说吗？',
    '您平时喜欢看什么电视节目或者书？',
    '有没有什么事情是您一直想做但还没做的？',
    '您最喜欢的季节是什么？为什么？',
    '年轻的时候有没有什么特别的梦想？',
    '您平时喜欢和家人一起做什么？'
  ],
  deep_collection: []
};

function getFallbackResponse(userMessage: string, userMemory: UserMemory, goal: Goal | null): string {
  const conversationPhase = userMemory.progress.conversationPhase || 'trust_building';
  
  if (conversationPhase === 'trust_building') {
    const responses = fallbackResponses.trust_building;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    if (userMessage.length > 10) {
      return `听您这么说，我很有共鸣。${randomResponse}`;
    }
    return randomResponse;
  }

  if (conversationPhase === 'interest_exploration') {
    const responses = fallbackResponses.interest_exploration;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    if (userMessage.length > 10) {
      return `这很有意思！${randomResponse}`;
    }
    return randomResponse;
  }

  const structureType = goal && goal.structure ? goal.structure : 'timeline';
  const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline;
  const biographyStages = config.stages;
  const currentStage = biographyStages.find(s => s.id === userMemory.progress.currentPhase) || biographyStages[0];
  
  const availableQuestions = currentStage.questions.filter(q => !userMemory.progress.answeredQuestions.includes(q));
  if (availableQuestions.length > 0) {
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }

  return '今天想聊点什么呢？';
}

export class AIService {
  private messages: ChatMessage[] = [];

  constructor() {}

  getSuggestedQuestions(userMemory: UserMemory, goal: Goal | null): string[] {
    const structureType = goal && goal.structure ? goal.structure : 'timeline';
    const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline;
    const biographyStages = config.stages;
    const currentStage = biographyStages.find(s => s.id === userMemory.progress.currentPhase) || biographyStages[0];
    const remainingStages = biographyStages.slice(biographyStages.indexOf(currentStage) + 1);

    let allQuestions: string[] = [];
    if (currentStage) {
      allQuestions = [...currentStage.questions];
    }

    remainingStages.forEach(stage => {
      allQuestions = [...allQuestions, ...stage.questions];
    });

    const usedQuestions = userMemory.progress.answeredQuestions;
    const availableQuestions = allQuestions.filter(q => !usedQuestions.includes(q));

    const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  async sendMessageStream(
    userMessage: string,
    onChunk: (chunk: string) => void,
    userMemory: UserMemory,
    goal: Goal | null
  ): Promise<void> {
    try {
      const messages: ChatMessage[] = [...this.messages, { role: 'user' as const, content: userMessage }];
      let response: string;

      try {
        response = await callLLM(messages, goal, userMemory);
        this.messages = messages;
      } catch {
        response = getFallbackResponse(userMessage, userMemory, goal);
      }

      const chunks = response.split('');
      for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
        onChunk(chunk);
      }

      this.messages = [...this.messages, { role: 'assistant' as const, content: response }];
    } catch (error) {
      console.error('AI API stream call failed:', error);
      const fallbackResponse = getFallbackResponse(userMessage, userMemory, goal);
      onChunk(fallbackResponse);
    }
  }

  async sendMessage(userMessage: string, userMemory: UserMemory, goal: Goal | null): Promise<string> {
    try {
      const messages: ChatMessage[] = [...this.messages, { role: 'user' as const, content: userMessage }];
      let response: string;

      try {
        response = await callLLM(messages, goal, userMemory);
        this.messages = messages;
      } catch {
        response = getFallbackResponse(userMessage, userMemory, goal);
      }

      this.messages = [...this.messages, { role: 'assistant' as const, content: response }];
      return response;
    } catch (error) {
      console.error('AI API call failed:', error);
      return getFallbackResponse(userMessage, userMemory, goal);
    }
  }

  async extractMemory(messages: { role: string; content: string }[], userMemory: UserMemory): Promise<{ basicInfo: Partial<UserMemory['basicInfo']>; preferences: Partial<UserMemory['preferences']>; keyMemories: string[] }> {
    try {
      return await extractMemoryDirect(messages, userMemory);
    } catch {
      return { basicInfo: {}, preferences: {}, keyMemories: [] };
    }
  }

  async generateBiography(userMemory: UserMemory, goal: Goal | null): Promise<string> {
    const structureType = goal && goal.structure ? goal.structure : 'timeline';
    const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline;

    let biography = `# ${goal?.name || '用户'}的传记\n\n`;

    biography += `## 序章\n\n亲爱的读者，这本传记按照${structureType === 'timeline' ? '时间顺序' : '重要事件'}，记录了${goal?.name || '一位平凡老人'}的一生。每一段文字，都是时光的印记；每一个故事，都是生命的馈赠。让我们一起走进${goal?.name || '这位老人'}的人生旅程。\n\n`;

    if (userMemory && userMemory.basicInfo) {
      const info = userMemory.basicInfo;
      biography += `## 基本信息\n\n`;
      if (info.birthPlace) biography += `出生地点：${info.birthPlace}\n\n`;
      if (info.birthDate) biography += `出生日期：${info.birthDate}\n\n`;
      if (info.occupation) biography += `职业：${info.occupation}\n\n`;
      if (info.hobbies.length > 0) biography += `爱好：${info.hobbies.join('、')}\n\n`;
      if (info.familyMembers.length > 0) biography += `家庭成员：${info.familyMembers.join('、')}\n\n`;
    }

    config.stages.forEach((stage) => {
      biography += `## ${stage.name}\n\n`;
      biography += `本阶段待问问题：\n${stage.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
    });

    if (userMemory && userMemory.history && userMemory.history.keyMemories && userMemory.history.keyMemories.length > 0) {
      biography += `## 珍贵记忆\n\n`;
      userMemory.history.keyMemories.forEach((memory, index) => {
        biography += `${index + 1}. ${memory}\n\n`;
      });
    }

    biography += `## 结语\n\n这本传记记录了${goal?.name || '老人'}平凡而精彩的一生。每一个平凡的人，都有属于自己的故事。让我们铭记这些珍贵的记忆，让平凡的人生，在时光里永远闪耀。\n\n感谢${goal?.name || '老人'}愿意分享这些故事，也感谢您愿意聆听。愿这本传记成为一份永恒的礼物，传递给下一代。`;

    return biography;
  }

  buildSystemPrompt(goal: Goal | null, userMemory: UserMemory): string {
    return buildSystemPrompt(goal, userMemory).systemPrompt;
  }

  getStages(goal: Goal | null): { id: string; name: string; questions: string[] }[] {
    const structureType = goal && goal.structure ? goal.structure : 'timeline';
    return STRUCTURE_CONFIG[structureType] ? STRUCTURE_CONFIG[structureType].stages : STRUCTURE_CONFIG.timeline.stages;
  }
}

export const aiService = new AIService();