const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const STRUCTURE_CONFIG = {
  timeline: {
    name: '时间线模式',
    stages: [
      { id: 'childhood', name: '童年记忆', questions: ['小时候在哪里长大？', '童年最难忘的一件事是什么？', '小时候最喜欢玩什么游戏？', '有没有印象特别深的老师或同学？', '小时候家里是什么样的？'] },
      { id: 'youth', name: '青春年华', questions: ['中学时代有什么特别的经历？', '年轻时有什么梦想？', '第一次离开家去远方是什么感觉？', '青春时期最骄傲的事情是什么？', '年轻时最喜欢做什么？'] },
      { id: 'career', name: '事业奋斗', questions: ['第一份工作是什么？', '工作中遇到过什么挑战？', '职业生涯中最难忘的时刻是什么？', '对现在的年轻人有什么职业建议？', '工作中最有成就感的事情是什么？'] },
      { id: 'love', name: '爱情家庭', questions: ['是怎么认识另一半的？', '结婚时是什么样的场景？', '有什么想对家人说的话？', '家庭生活中最温馨的时刻是什么？', '为人父母有什么感受？'] },
      { id: 'life', name: '人生感悟', questions: ['回顾一生，觉得最重要的是什么？', '有没有什么遗憾的事情？', '最想留给后代的话是什么？', '对生命有什么感悟？', '如果能重来，会做什么不同的选择？'] }
    ]
  },
  milestone: {
    name: '重大事件模式',
    stages: [
      { id: 'first_time', name: '人生第一次', questions: ['人生中印象最深的"第一次"是什么？', '第一次离开家乡是什么时候？', '第一次独立做决定是什么时候？', '第一次感受到人生的意义是什么时候？', '第一次感受到爱的时刻是什么？'] },
      { id: 'challenge', name: '挑战与成长', questions: ['人生中遇到过最大的挑战是什么？', '是怎么克服困难的？', '从失败中学到了什么？', '最艰难的时期是怎么度过的？', '哪次经历让你成长最多？'] },
      { id: 'love_relation', name: '爱与关系', questions: ['生命中最重要的人是谁？', '和家人之间有什么难忘的故事？', '朋友对你意味着什么？', '有没有特别想感谢的人？', '怎么理解爱的意义？'] },
      { id: 'dream_pursuit', name: '梦想与追求', questions: ['年轻时有什么梦想？', '为梦想付出过哪些努力？', '梦想实现了吗？', '还有什么想做的事情？', '对梦想有什么新的理解？'] },
      { id: 'life_wisdom', name: '人生智慧', questions: ['一生中学到的最重要的道理是什么？', '想留给后代什么财富？', '对年轻一代有什么建议？', '如何看待人生的得与失？', '生命的意义是什么？'] }
    ]
  }
}

exports.main = async (event, context) => {
  const { messages, goal, userMemory } = event
  
  const memory = userMemory || {
    basicInfo: { birthPlace: '', birthDate: '', occupation: '', hobbies: [], familyMembers: [], education: '', workExperience: '' },
    preferences: { topics: [], conversationStyle: 'warm', questionFrequency: 'low', favoriteTopics: [], avoidTopics: [] },
    progress: { totalQuestions: 24, answeredQuestions: [], currentPhase: 'childhood', daysRemaining: 30 },
    history: { totalConversations: 0, lastConversationTime: '', keyMemories: [] }
  }

  const structureType = goal && goal.structure ? goal.structure : 'timeline'
  const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline
  const biographyStages = config.stages

  const currentStage = biographyStages.find(s => s.id === memory.progress.currentPhase) || biographyStages[0]
  const remainingStages = biographyStages.slice(biographyStages.indexOf(currentStage) + 1)

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

  const styleStr = goal && goal.style ? (goal.style === 'warm' ? '温馨回忆录风格，亲切感人，语言温暖' : goal.style === 'formal' ? '正式传记风格，庄重典雅，语言规范' : '故事集风格，生动有趣，语言活泼') : '温馨回忆录风格，亲切感人'

  const systemPrompt = `你是一位温暖、耐心的传记作家，专门帮助老人记录人生故事。
你的任务是通过对话，引导用户讲述他们的人生经历。

【当前记录对象】：${goal ? goal.name : '用户'}
【关系】：${goal ? (goal.relation === 'grandparent' ? '祖父母' : goal.relation === 'parent' ? '父母' : goal.relation === 'self' ? '自己' : '其他') : '未知'}

【传记结构】：${config.name}
【传记风格】：${styleStr}

【当前阶段】：${currentStage.name}
【本阶段待问问题】：
${stageQuestionsStr}

【后续阶段】：${remainingStages.map(s => s.name).join(' → ') || '已完成所有阶段'}

【已采集的基础信息】：
${basicInfoStr}

【用户对话偏好】：
${preferencesStr}

【已问过的问题】：
${answeredQuestionsStr}

你需要：
1. 使用亲切、温和的语气，像家人一样聊天，不要太正式
2. 在闲聊中自然穿插关键问题，不要生硬地提问
3. 根据当前阶段，选择一个合适的问题进行引导
4. 根据用户的回答，提出深入的追问，了解背后的故事和感受
5. 不要一次性问太多问题，一次只问一个，给用户足够的时间回答
6. 当用户不愿意回答某个问题时，要尊重他们的意愿，转开话题
7. 记录下所有有价值的信息，用于后续生成传记
8. 不要重复问已经问过的问题
9. 根据用户偏好调整对话方向，多聊用户喜欢的话题
10. 当用户说"结束"或表示想停止时，礼貌地结束对话并总结本次对话内容
11. 当用户询问功能时，耐心解释如何使用
12. 在对话中注意观察用户的兴趣点，当用户对某个话题表现出兴趣时，可以多聊一些
13. 完成当前阶段后，自然过渡到下一阶段
14. 严格按照设定的传记风格进行对话`

  const historyMessages = messages.slice(-8)
  const requestMessages = [
    {
      role: 'system',
      content: systemPrompt
    },
    ...historyMessages.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    }))
  ]

  const token = process.env.MINIMAX_TOKEN || 'sk-cp-Y0zSTfvYIXmHmohQzg58dPrtnUOORLpkh2XG4NbWEehE9ChnjMQ4mN1gGA9YrIRkoaZHYd527kSPPf8NYeT_vzIDTICnFX292aY4ycmlPvEFUTZurzosEoI'

  try {
    const response = await cloud.httpclient.request({
      url: 'https://api.minimaxi.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      data: {
        model: 'abab6-chat',
        messages: requestMessages,
        max_tokens: 800,
        temperature: 0.8,
        top_p: 0.9
      },
      dataType: 'json'
    })

    if (response && response.data && response.data.choices && response.data.choices.length > 0) {
      return {
        success: true,
        content: response.data.choices[0].message.content
      }
    } else {
      return {
        success: false,
        error: 'API response error'
      }
    }
  } catch (error) {
    console.error('MiniMax API error:', error)
    return {
      success: false,
      error: error.message || 'Network error'
    }
  }
}
