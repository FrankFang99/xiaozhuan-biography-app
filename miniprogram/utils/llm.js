const MINIMAX_API_BASE = 'https://api.minimaxi.com/v1'
const MINIMAX_TOKEN = wx.getStorageSync('minimaxToken') || '<MINIMAX_TOKEN>'

const DEEPSEEK_API_BASE = 'https://api.deepseek.com/v1'
const DEEPSEEK_TOKEN = wx.getStorageSync('deepseekToken') || '<DEEPSEEK_TOKEN>'

const MODEL_CONFIG = {
  minimax: {
    name: 'Minimax M2.5',
    baseUrl: MINIMAX_API_BASE,
    token: MINIMAX_TOKEN,
    model: 'MiniMax-M2.5',
    maxTokens: 800,
    temperature: 0.8,
    topP: 0.9,
    strengths: ['聊天', '情感陪伴', '故事创作', '文学写作', '日常对话', '温暖关怀']
  },
  minimax_m3: {
    name: 'Minimax M3',
    baseUrl: MINIMAX_API_BASE,
    token: MINIMAX_TOKEN,
    model: 'MiniMax-M3',
    maxTokens: 800,
    temperature: 0.7,
    topP: 0.9,
    strengths: ['全能', '复杂推理', '多模态', '代码生成', '兜底'],
    isFallback: true
  },
  minimax_biography: {
    name: 'Minimax M2.5',
    baseUrl: MINIMAX_API_BASE,
    token: MINIMAX_TOKEN,
    model: 'MiniMax-M2.5',
    maxTokens: 4000,
    temperature: 0.75,
    topP: 0.92,
    strengths: ['传记创作', '长篇叙事', '文学写作', '情感表达', '人生故事', '家族记忆'],
    isBiography: true
  },
  minimax_multimodal: {
    name: 'Minimax M3',
    baseUrl: MINIMAX_API_BASE,
    token: MINIMAX_TOKEN,
    model: 'MiniMax-M3',
    maxTokens: 800,
    temperature: 0.7,
    topP: 0.9,
    strengths: ['复杂推理', '长文本生成', '创意写作', '逻辑分析'],
    isMultimodal: false
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: DEEPSEEK_API_BASE,
    token: DEEPSEEK_TOKEN,
    model: 'deepseek-chat',
    maxTokens: 800,
    temperature: 0.7,
    topP: 0.9,
    strengths: ['信息提取', '逻辑推理', '数据处理', '结构化输出', '分析总结']
  },
  deepseek_extraction: {
    name: 'DeepSeek Extraction',
    baseUrl: DEEPSEEK_API_BASE,
    token: DEEPSEEK_TOKEN,
    model: 'deepseek-chat',
    maxTokens: 2000,
    temperature: 0.3,
    topP: 0.8,
    strengths: ['信息提取', '记忆整理', '结构化输出', '数据清洗']
  }
}

function classifyQuestion(content) {
  const contentLower = content.toLowerCase()
  
  const extractionKeywords = ['提取', '总结', '记录', '整理', '分析', '结构化', 'json', '数据']
  const chatKeywords = ['聊', '说说', '讲讲', '怎么样', '好不好', '呢', '吧', '吗']
  
  for (const keyword of extractionKeywords) {
    if (contentLower.includes(keyword)) {
      return 'extraction'
    }
  }
  
  for (const keyword of chatKeywords) {
    if (contentLower.includes(keyword)) {
      return 'chat'
    }
  }
  
  return 'chat'
}

function selectModel(content, taskType = 'chat') {
  if (taskType === 'biography') {
    return 'minimax_biography'
  }
  
  if (taskType === 'extraction') {
    return 'deepseek_extraction'
  }
  
  const category = classifyQuestion(content)
  
  if (category === 'extraction') {
    return 'deepseek'
  }
  
  return 'minimax'
}

const STRUCTURE_CONFIG = {
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
        '小时候过年过节都是怎么过的？有什么特别的习俗吗？',
        '小时候有没有闯过什么祸？当时是怎么处理的？',
        '童年时期有没有什么特别崇拜的人？为什么崇拜他？'
      ] },
      { id: 'youth', name: '青春年华', questions: [
        '中学时代有什么特别的经历？那时候最喜欢做什么？',
        '年轻时有什么梦想？后来实现了吗？',
        '第一次离开家去远方是什么感觉？还记得当时的心情吗？',
        '青春时期最骄傲的事情是什么？为什么会觉得骄傲呢？',
        '年轻时最喜欢做什么？有没有什么爱好一直坚持到现在？',
        '年轻时有没有喜欢过什么人？那是一段什么样的感情？',
        '年轻的时候有没有什么疯狂的想法或举动？',
        '当时有没有什么事情让你觉得特别迷茫或者困惑？',
        '中学毕业的时候是什么心情？对未来有什么憧憬？',
        '青春时期有没有什么特别难忘的旅行或冒险？'
      ] },
      { id: 'education', name: '求学之路', questions: [
        '上学的时候学习怎么样？最喜欢哪门功课？',
        '有没有特别喜欢的老师？他们对你有什么影响？',
        '大学期间有没有什么特别的经历？那时候是怎么度过的？',
        '学习过程中有没有遇到过什么困难？是怎么克服的？',
        '上学的时候有没有什么特别难忘的同学？你们之间有什么故事？',
        '毕业的时候是什么心情？对未来有什么规划？',
        '在学校里学到的最重要的东西是什么？',
        '有没有什么学习上的遗憾？如果能重来会怎么做？',
        '当时的校园生活是什么样的？有没有什么有趣的回忆？',
        '老师曾经对你说过什么让你印象深刻的话？'
      ] },
      { id: 'career_start', name: '初入职场', questions: [
        '第一份工作是什么？当时是怎么找到的？',
        '刚参加工作的时候是什么感觉？有没有什么不适应的地方？',
        '第一份工作中最难忘的事情是什么？',
        '有没有特别关照你的同事或领导？他们教会了你什么？',
        '工作初期有没有犯过什么错误？是怎么处理的？',
        '当时的工作环境是什么样的？和现在有什么不同？',
        '第一次领工资是什么感觉？怎么花的？',
        '工作初期有没有什么特别的目标或梦想？',
        '有没有什么工作上的趣事？',
        '当时对未来的职业发展有什么期待？'
      ] },
      { id: 'career_growth', name: '事业发展', questions: [
        '工作中遇到过什么挑战？是怎么克服的？',
        '职业生涯中最难忘的时刻是什么？为什么印象这么深？',
        '对现在的年轻人有什么职业建议？',
        '工作中最有成就感的事情是什么？',
        '有没有特别敬佩的同事或者领导？他们教会了你什么？',
        '工作这么多年，最大的收获是什么？',
        '有没有什么工作上的遗憾？如果重来会怎么做？',
        '职业生涯中有没有什么转折点？当时是怎么选择的？',
        '有没有什么重要的项目或任务让你印象深刻？',
        '在工作中有没有什么特别的发现或创新？'
      ] },
      { id: 'love', name: '爱情家庭', questions: [
        '是怎么认识另一半的？还记得第一次见面的场景吗？',
        '结婚时是什么样的场景？那时候心情怎么样？',
        '有什么想对家人说的话？',
        '家庭生活中最温馨的时刻是什么？',
        '为人父母有什么感受？看着孩子长大是什么感觉？',
        '和家人之间有没有什么特别难忘的故事？',
        '有没有什么想对另一半说但一直没说的话？',
        '家庭对你来说意味着什么？',
        '孩子小时候是什么样的？有没有什么有趣的事情？',
        '和家人一起度过的最难忘的时光是什么？'
      ] },
      { id: 'parenting', name: '育儿之路', questions: [
        '刚当父母的时候是什么心情？有没有什么手忙脚乱的事情？',
        '孩子小时候有没有什么特别让你担心的事情？',
        '在孩子成长过程中，你觉得最重要的是什么？',
        '有没有什么育儿方面的心得或经验？',
        '孩子上学的时候你是什么心情？有没有什么难忘的瞬间？',
        '孩子长大后有没有什么让你特别骄傲的事情？',
        '有没有什么想对孩子说但一直没说的话？',
        '作为父母，你觉得自己做得怎么样？有没有什么遗憾？',
        '孩子小时候有没有什么特别可爱或有趣的事情？',
        '和孩子之间有没有什么特别难忘的互动？'
      ] },
      { id: 'friends', name: '友情岁月', questions: [
        '生命中最重要的朋友是谁？你们是怎么认识的？',
        '和朋友之间有没有什么特别难忘的故事？',
        '朋友对你意味着什么？',
        '有没有什么特别想感谢的朋友？想对他们说什么？',
        '年轻时候的朋友现在还有联系吗？',
        '有没有什么和朋友一起经历的特别的事情？',
        '朋友之间有没有什么误会或矛盾？后来怎么解决的？',
        '你觉得什么样的朋友才是真正的朋友？',
        '有没有什么朋友对你的人生影响很大？',
        '和朋友在一起最开心的事情是什么？'
      ] },
      { id: 'hobbies', name: '兴趣爱好', questions: [
        '平时最喜欢做什么？这个爱好是怎么开始的？',
        '年轻时有没有什么特别的爱好？现在还在做吗？',
        '有没有什么兴趣爱好给你带来了特别的收获？',
        '在兴趣爱好方面有没有什么特别的成就或体验？',
        '有没有什么一直想学但还没学的东西？',
        '兴趣爱好对你的生活有什么影响？',
        '有没有什么和兴趣爱好相关的难忘经历？',
        '最喜欢的书/电影/音乐是什么？为什么喜欢？',
        '旅行过哪些地方？有没有什么特别难忘的旅行经历？',
        '有没有什么收藏爱好？收藏的背后有什么故事？'
      ] },
      { id: 'challenges', name: '挑战与成长', questions: [
        '人生中遇到过最大的挑战是什么？是怎么克服的？',
        '最艰难的时期是怎么度过的？谁帮助了你？',
        '从失败中学到了什么？',
        '哪次经历让你成长最多？',
        '有没有什么困难当时觉得过不去，但现在回头看觉得还好？',
        '面对困难的时候，是什么支撑你坚持下去的？',
        '有没有什么挑战让你发现了自己的潜力？',
        '困难过后，你有什么改变吗？',
        '有没有什么特别艰难的决定要做？当时是怎么想的？',
        '经历了这么多挑战，你对人生有什么新的认识？'
      ] },
      { id: 'memories', name: '难忘时刻', questions: [
        '人生中最开心的时刻是什么？为什么？',
        '有没有什么特别感动的事情？现在想起来还会觉得温暖吗？',
        '有没有什么特别遗憾的事情？如果能重来会怎么做？',
        '人生中有没有什么转折点？当时是怎么选择的？',
        '有没有什么事情让你觉得特别骄傲？',
        '有没有什么事情让你觉得特别幸福？',
        '有没有什么特别难忘的旅行或经历？',
        '有没有什么人对你的人生影响很大？他们教会了你什么？',
        '有没有什么特别珍贵的回忆？',
        '如果让你回到过去，你最想回到哪个时刻？'
      ] },
      { id: 'life', name: '人生感悟', questions: [
        '回顾一生，觉得最重要的是什么？',
        '有没有什么遗憾的事情？如果能重来会做什么不同的选择？',
        '最想留给后代的话是什么？',
        '对生命有什么感悟？',
        '这一生最感谢的人是谁？为什么？',
        '有没有什么道理是年纪大了才明白的？',
        '现在最想做的事情是什么？',
        '对现在的自己满意吗？为什么？',
        '你觉得什么样的人生才是圆满的？',
        '如果能给年轻时的自己一句话，你会说什么？'
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
}

function buildSystemPrompt(goal, userMemory) {
  const memory = userMemory || {
    basicInfo: { birthPlace: '', birthDate: '', occupation: '', hobbies: [], familyMembers: [], education: '', workExperience: '' },
    preferences: { topics: [], conversationStyle: 'warm', questionFrequency: 'low', favoriteTopics: [], avoidTopics: [] },
    progress: { totalQuestions: 24, answeredQuestions: [], currentPhase: 'childhood', daysRemaining: 30, conversationPhase: 'trust_building', exchangesInCurrentPhase: 0 },
    history: { totalConversations: 0, lastConversationTime: '', keyMemories: [] }
  }

  const structureType = goal && goal.structure ? goal.structure : 'timeline'
  const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline
  const biographyStages = config.stages

  const currentStage = biographyStages.find(s => s.id === memory.progress.currentPhase) || biographyStages[0]
  const remainingStages = biographyStages.slice(biographyStages.indexOf(currentStage) + 1)

  const conversationPhase = memory.progress.conversationPhase || 'trust_building'
  
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
  }

  const currentPhaseConfig = phaseConfig[conversationPhase] || phaseConfig.trust_building

  const basicInfoStr = `
出生地：${memory.basicInfo.birthPlace || '未记录'}
出生日期：${memory.basicInfo.birthDate || '未记录'}
职业：${memory.basicInfo.occupation || '未记录'}
爱好：${memory.basicInfo.hobbies.length > 0 ? memory.basicInfo.hobbies.join('、') : '未记录'}
家庭成员：${memory.basicInfo.familyMembers.length > 0 ? memory.basicInfo.familyMembers.join('、') : '未记录'}
教育经历：${memory.basicInfo.education || '未记录'}
工作经历：${memory.basicInfo.workExperience || '未记录'}
  `.trim()

  const preferencesStr = `
喜欢的话题：${memory.preferences.favoriteTopics.length > 0 ? memory.preferences.favoriteTopics.join('、') : '无'}
避免的话题：${memory.preferences.avoidTopics.length > 0 ? memory.preferences.avoidTopics.join('、') : '无'}
对话风格偏好：${memory.preferences.conversationStyle === 'warm' ? '温暖亲切' : memory.preferences.conversationStyle === 'formal' ? '正式礼貌' : '轻松随意'}
问题频率偏好：${memory.preferences.questionFrequency === 'low' ? '少问问题多倾听' : memory.preferences.questionFrequency === 'medium' ? '适度提问' : '多追问'}
  `.trim()

  const answeredQuestionsStr = memory.progress.answeredQuestions.length > 0 
    ? memory.progress.answeredQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') 
    : '暂无'

  const stageQuestionsStr = currentStage.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')

  let systemPrompt = `你是一位专业的人生访谈者和传记作家，专门帮助老人记录真实的人生故事。你就像一位经验丰富的记者，善于倾听，懂得引导，能够让老人在轻松愉快的氛围中敞开心扉，分享他们真实的人生经历。

【核心原则】：
- 真实性：所有记录的内容必须是用户真实经历，绝对不能编造或虚构任何内容
- 深度挖掘：不要满足于表面回答，要深入追问细节，挖掘故事背后的情感和意义
- 尊重意愿：当用户不愿意回答时，尊重他们的意愿，不要强迫
- 开放式：使用开放式问题，鼓励用户多说、说详细

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

=================== 深度访谈技巧 ====================

【开放式提问】：
- 使用"怎么样"、"为什么"、"是什么样的"等引导用户详细讲述
- 避免简单的"是"或"否"回答，让用户有足够的空间表达
- 示例："当时是什么样的场景？"、"你当时的心情怎么样？"、"后来呢？发生了什么？"

【细节追问】：
- 当用户提到某个事件时，追问具体细节：时间、地点、人物、事件经过
- 示例："那是哪一年的事情？"、"当时在场的还有谁？"、"事情的经过是怎样的？"

【感受挖掘】：
- 不要只问事件本身，还要问用户当时的感受和现在的感受
- 示例："当时你是什么心情？"、"现在回想起来有什么感受？"、"这件事对你有什么影响？"

【故事引导】：
- 从用户提到的一个小细节入手，引导他们展开讲一个完整的故事
- 示例："你刚才提到那个老师，能多讲讲吗？"、"那件事情听起来很有意思，能详细说说吗？"

【时间线梳理】：
- 帮助用户梳理时间顺序，让故事更有条理
- 示例："那是在什么时间发生的？"、"在那之前发生了什么？"、"后来怎么样了？"

【情感共鸣】：
- 当用户分享开心的事情时，表达喜悦和赞赏
- 当用户分享难过的事情时，表达理解和安慰
- 用"我能想象当时的情景"、"一定很不容易吧"等表达共情

【话题拓展】：
- 当用户提到一个话题时，自然拓展相关话题
- 示例："你刚才提到年轻时喜欢读书，那时候都读些什么书？"、"你说去过那个地方，当时是怎么去的？"

【适老化沟通】：
- 使用简单易懂的语言，避免复杂词汇和网络用语
- 说话速度放慢，给用户足够的反应时间
- 多用鼓励和肯定的话语，增强用户的信心
- 尊重用户的生活经验和人生智慧

=================== 真实性保障 ====================

【绝对禁止】：
- ❌ 绝对不能编造用户没有提到的内容
- ❌ 绝对不能猜测用户的想法或感受，必须由用户亲自讲述
- ❌ 绝对不能虚构任何事件或细节
- ❌ 绝对不能把其他故事套用在用户身上

【必须遵守】：
- ✅ 只记录用户明确提到的内容
- ✅ 如果信息不完整，可以追问，但不能自行补充
- ✅ 如果用户记不清了，可以说"没关系，想不起来也没关系"，不要替用户回忆
- ✅ 对于不确定的内容，明确标注"用户记不清了"或"用户未提及"

【深度采集指南】：
当用户分享一件事情时，你需要像专业记者一样，从以下维度进行追问：

1. 【时间维度】：什么时候发生的？持续了多久？在那之前/之后发生了什么？
2. 【地点维度】：在哪里发生的？那个地方是什么样的？周围环境如何？
3. 【人物维度】：当时都有谁在场？他们是什么样的人？和你的关系如何？
4. 【事件维度】：事情的起因是什么？经过是怎样的？结果如何？
5. 【感受维度】：当时你是什么心情？后来有什么变化？现在回想起来有什么感受？
6. 【细节维度】：有什么特别的细节让你印象深刻？当时的场景是什么样的？
7. 【影响维度】：这件事对你有什么影响？你从中学到了什么？改变了你什么？

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
12. 绝对不能编造任何内容，只记录用户真实讲述的事情
13. 当用户记不清时，不要替用户回忆，尊重他们的记忆
14. 深入挖掘每个故事的细节，让内容更加丰富真实
${conversationPhase === 'deep_collection' ? '15. 完成当前阶段后，自然过渡到下一阶段' : ''}
${conversationPhase !== 'deep_collection' ? '15. 当前阶段不要主动提及传记、人生故事等正式话题，先建立信任关系' : ''}

【回复长度建议】：
- 一般回复：2-3句话，简短而温暖
- 回应分享：适当展开，表达理解和共鸣
- 提出问题：1-2句话，把问题自然地融入对话中

【语气风格】：
- 温暖：像家人一样亲切关心
- 好奇：对用户的经历表现出真诚的兴趣
- 尊重：尊重用户的观点和感受
- 鼓励：鼓励用户继续分享，给予肯定

记住，你的目标是做一个优秀的倾听者和引导者，帮助老人回忆并记录真实的人生故事。这些故事将成为家族最宝贵的精神财富，必须真实、完整、有深度。`

  return { systemPrompt, currentStage, biographyStages, conversationPhase }
}

function buildRequestMessages(messages, systemPrompt) {
  const historyMessages = messages.slice(-8)
  return [
    { role: 'system', content: systemPrompt },
    ...historyMessages.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }))
  ]
}

function callLLMCloud(messages, goal, userMemory) {
  return new Promise((resolve, reject) => {
    const { systemPrompt } = buildSystemPrompt(goal, userMemory)
    const requestMessages = buildRequestMessages(messages, systemPrompt)

    console.log('[LLM] callLLMCloud starting...')

    wx.cloud.callFunction({
      name: 'callLLM',
      data: {
        messages: requestMessages,
        goal: goal,
        userMemory: userMemory
      }
    }).then(res => {
      console.log('[LLM] callLLMCloud success:', {
        hasResult: !!res.result,
        isSuccess: res.result?.success,
        contentLength: res.result?.content?.length || 0
      })
      if (res.result && res.result.success) {
        resolve(res.result.content)
      } else {
        const errorMsg = res.result?.error || 'Cloud function error'
        console.error('[LLM] callLLMCloud failed:', errorMsg)
        reject(new Error(errorMsg))
      }
    }).catch(err => {
      const errorMsg = err.message || 'Cloud function call failed'
      console.error('[LLM] callLLMCloud catch error:', {
        message: errorMsg,
        errCode: err.errCode,
        errMsg: err.errMsg
      })
      reject(new Error(errorMsg))
    })
  })
}

function callLLMDirect(messages, goal, userMemory, modelKey = 'minimax') {
  return new Promise((resolve, reject) => {
    const { systemPrompt } = buildSystemPrompt(goal, userMemory)
    const requestMessages = buildRequestMessages(messages, systemPrompt)
    
    const baseConfig = MODEL_CONFIG[modelKey] || MODEL_CONFIG.minimax
    const token = wx.getStorageSync('minimaxToken') || wx.getStorageSync('deepseekToken') || baseConfig.token
    const config = { ...baseConfig, token }

    if (!token || token.length < 10) {
      const errorMsg = `${config.name} API Token 未配置，请在设置中配置 API Key`
      console.error('[LLM]', errorMsg)
      reject(new Error(errorMsg))
      return
    }

    console.log('[LLM] callLLMDirect starting...', {
      model: config.name,
      url: config.baseUrl + '/chat/completions',
      tokenLength: config.token.length,
      messagesCount: requestMessages.length
    })

    wx.request({
      url: config.baseUrl + '/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.token
      },
      data: {
        model: config.model,
        messages: requestMessages,
        max_completion_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.topP,
        thinking: { type: 'disabled' }
      },
      success: (res) => {
        console.log('[LLM] callLLMDirect success:', {
          model: config.name,
          statusCode: res.statusCode,
          hasData: !!res.data,
          hasChoices: res.data && res.data.choices && res.data.choices.length > 0,
          error: res.data && res.data.error,
          contentLength: res.data?.choices?.[0]?.message?.content?.length || 0
        })
        
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
          let content = res.data.choices[0].message.content
          content = content.replace(/<think>[\s\S]*?<\/think>/g, '')
          content = content.replace(/<\/?think>/g, '')
          content = content.trim()
          resolve(content)
        } else if (res.data && res.data.error) {
          const errorMsg = `${config.name} API error: ${res.data.error.message || res.data.error}`
          console.error('[LLM] callLLMDirect API error:', errorMsg)
          reject(new Error(errorMsg))
        } else {
          const errorMsg = `${config.name} API response error (status: ${res.statusCode})`
          console.error('[LLM] callLLMDirect response error:', errorMsg)
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        const errorMsg = `${config.name} Network error: ${err.message || 'Unknown error'}`
        console.error('[LLM] callLLMDirect network fail:', {
          model: config.name,
          message: err.message,
          errCode: err.errCode,
          errMsg: err.errMsg
        })
        reject(new Error(errorMsg))
      }
    })
  })
}

function extractMemoryDirect(messages, currentMemory) {
  return new Promise((resolve, reject) => {
    const memory = currentMemory || {
      basicInfo: { birthPlace: '', birthDate: '', occupation: '', hobbies: [], familyMembers: [], education: '', workExperience: '' },
      preferences: { topics: [], conversationStyle: 'warm', questionFrequency: 'low', favoriteTopics: [], avoidTopics: [] },
      progress: { totalQuestions: 24, answeredQuestions: [], currentPhase: 'childhood', daysRemaining: 30 },
      history: { totalConversations: 0, lastConversationTime: '', keyMemories: [] }
    }

    const recentMessages = messages.slice(-6)
    const conversationText = recentMessages.map(m => `${m.role === 'ai' ? '助手' : '用户'}: ${m.content}`).join('\n')

    const basicInfoStr = `
出生地：${memory.basicInfo.birthPlace || '未记录'}
出生日期：${memory.basicInfo.birthDate || '未记录'}
职业：${memory.basicInfo.occupation || '未记录'}
爱好：${memory.basicInfo.hobbies.join('、') || '未记录'}
家庭成员：${memory.basicInfo.familyMembers.join('、') || '未记录'}
教育经历：${memory.basicInfo.education || '未记录'}
工作经历：${memory.basicInfo.workExperience || '未记录'}
    `.trim()

    const preferencesStr = `
喜欢的话题：${memory.preferences.favoriteTopics.join('、') || '无'}
避免的话题：${memory.preferences.avoidTopics.join('、') || '无'}
    `.trim()

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
5. keyMemories是对话中提到的重要人生事件或回忆`

    console.log('[LLM] extractMemoryDirect request:', {
      url: MINIMAX_API_BASE + '/chat/completions',
      model: 'MiniMax-M2.5',
      messagesCount: 1,
      systemPromptLength: systemPrompt.length
    })

    const token = wx.getStorageSync('minimaxToken') || MINIMAX_TOKEN
    wx.request({
      url: MINIMAX_API_BASE + '/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      data: {
        model: 'MiniMax-M2.5',
        messages: [{ role: 'system', content: systemPrompt }],
        max_completion_tokens: 600,
        temperature: 0.2,
        top_p: 0.5,
        thinking: { type: 'disabled' }
      },
      success: (res) => {
        console.log('[LLM] extractMemoryDirect response:', {
          statusCode: res.statusCode,
          hasChoices: res.data && res.data.choices && res.data.choices.length > 0,
          error: res.data && res.data.error
        })
        
        if (res.data && res.data.choices && res.data.choices.length > 0) {
          const content = res.data.choices[0].message.content
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const extracted = JSON.parse(jsonMatch[0])
              resolve(extracted)
            } else {
              resolve({ basicInfo: {}, preferences: {}, keyMemories: [] })
            }
          } catch (parseError) {
            resolve({ basicInfo: {}, preferences: {}, keyMemories: [] })
          }
        } else {
          resolve({ basicInfo: {}, preferences: {}, keyMemories: [] })
        }
      },
      fail: (err) => {
        console.error('[LLM] extractMemoryDirect fail:', err)
        resolve({ basicInfo: {}, preferences: {}, keyMemories: [] })
      }
    })
  })
}

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: MINIMAX_API_BASE + '/image_generation',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + MINIMAX_TOKEN
      },
      data: {
        model: 'abab6-image',
        prompt: prompt,
        n: 1,
        size: '512x512'
      },
      success: (res) => {
        if (res.data && res.data.data && res.data.data.length > 0) {
          resolve(res.data.data[0].url)
        } else {
          reject(new Error('Image generation response error'))
        }
      },
      fail: (err) => {
        reject(new Error(err.message || 'Image generation network error'))
      }
    })
  })
}

function callLLM(messages, goal, userMemory) {
  return new Promise((resolve, reject) => {
    const lastMessage = messages[messages.length - 1]
    const content = lastMessage ? lastMessage.content : ''
    const modelKey = lastMessage ? selectModel(content, 'chat') : 'minimax'
    
    console.log('[LLM] callLLM starting...', {
      modelKey,
      messagesCount: messages.length
    })
    
    callLLMDirect(messages, goal, userMemory, modelKey)
      .then(content => {
        console.log('[LLM] callLLM success via direct API:', modelKey)
        resolve(content)
      })
      .catch(err => {
        console.error('[LLM] callLLM failed:', err.message)
        reject(err)
      })
  })
}

function extractMemory(messages, currentMemory) {
  return extractMemoryDirect(messages, currentMemory)
}

module.exports = {
  callLLM,
  extractMemory,
  buildSystemPrompt,
  callLLMCloud,
  callLLMDirect,
  extractMemoryDirect,
  generateImage,
  STRUCTURE_CONFIG,
  MODEL_CONFIG,
  classifyQuestion,
  selectModel
}