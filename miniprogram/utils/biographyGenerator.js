const { callLLMDirect } = require('./llm.js')

function generateBiographyFromMemory(memory, goal) {
  return new Promise((resolve, reject) => {
    const basicInfo = memory.basicInfo || {}
    const keyMemories = memory.keyMemories || []
    const history = memory.history || {}
    const progress = memory.progress || {}

    const basicInfoStr = `
姓名：${goal?.name || '用户'}
出生地：${basicInfo.birthPlace || '未记录'}
出生日期：${basicInfo.birthDate || '未记录'}
职业：${basicInfo.occupation || '未记录'}
爱好：${basicInfo.hobbies?.join('、') || '未记录'}
家庭成员：${basicInfo.familyMembers?.join('、') || '未记录'}
教育经历：${basicInfo.education || '未记录'}
工作经历：${basicInfo.workExperience || '未记录'}
    `.trim()

    const memoriesStr = keyMemories.length > 0 
      ? keyMemories.map((m, i) => `${i + 1}. ${m}`).join('\n')
      : '暂无关键记忆'

    const conversationHistory = history.totalConversations || 0

    const structureType = goal && goal.structure ? goal.structure : 'timeline'
    const style = goal && goal.style ? goal.style : 'warm'

    const styleDesc = {
      warm: '温馨回忆录风格，亲切感人，语言朴实真挚，像家人在耳边讲述故事',
      formal: '正式传记风格，庄重典雅，结构严谨，语言规范',
      story: '故事集风格，生动有趣，情节跌宕起伏，引人入胜'
    }

    const systemPrompt = `你是一位专业的传记作家，擅长根据用户的人生故事和记忆片段，撰写完整、感人的人生传记。

【写作要求】
风格：${styleDesc[style] || styleDesc.warm}
语言：中文，简洁流畅，富有感染力
读者：中老年人群及其家人
篇幅：长篇传记，约8-10章，每章500-800字

【人物信息】
${basicInfoStr}

【关键记忆】
${memoriesStr}

【已完成对话次数】：${conversationHistory}次

【传记结构】：${structureType === 'timeline' ? '按时间顺序' : '按重大事件'}

请根据以上信息，生成一份完整的人生传记，包含以下内容：

1. intro（引言）：约150字，概括人物的一生，引出传记主题
2. ending（结语）：约300字，总结人生感悟，传递温暖的力量
3. timeline（时间线）：10-15个关键时间节点，包含年份和事件
4. photos（照片位）：8个照片位，包含标题和描述
5. chapters（章节）：8-10章，每章包含：
   - title：章节标题
   - year：时间范围
   - content：正文内容（500-800字）
   - quote：金句（15-20字）
   - emotion：情感标签（如：感恩、温暖、骄傲、坚强等）
6. familyView（家人视角）：约200字，从家人的角度描述人物

返回格式要求（必须是纯JSON格式，不要包含任何其他文字）：

{
  "intro": "引言内容",
  "ending": "结语内容",
  "timeline": [
    {"year": "年份", "event": "事件描述"},
    ...
  ],
  "photos": [
    {"title": "照片标题", "desc": "照片描述", "position": "chapter-1"},
    ...
  ],
  "chapters": [
    {
      "title": "章节标题",
      "year": "时间范围",
      "content": "正文内容",
      "quote": "金句",
      "emotion": "情感标签"
    },
    ...
  ],
  "familyView": {
    "title": "家人视角标题",
    "content": "家人视角内容"
  }
}

注意：
1. 如果某些信息缺失，请根据已有信息合理推断，但不要凭空捏造
2. 章节内容要生动具体，包含细节和情感
3. 金句要简洁有力，富有哲理
4. 情感标签要准确反映章节的情感基调
5. 照片描述要与章节内容相关
6. 家人视角要温暖感人，从亲人的角度展现人物的另一面`

    callLLMDirect([{ role: 'system', content: systemPrompt }], goal, memory)
      .then(content => {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const biography = JSON.parse(jsonMatch[0])
            biography.id = 'user_biography'
            biography.name = goal?.name || '用户'
            biography.avatar = (goal?.name || '用')[0] || '用'
            biography.bio = `${basicInfo.occupation || ''}${basicInfo.birthDate ? ` · ${new Date().getFullYear() - parseInt(basicInfo.birthDate) || 0}岁` : ''}`
            biography.tag = '人生传记'
            biography.starPosition = { x: 600, y: 800 }
            biography.starColor = '#9c27b0'
            biography.starSize = 100
            resolve(biography)
          } else {
            reject(new Error('Invalid JSON format in response'))
          }
        } catch (parseError) {
          reject(new Error('JSON parse error: ' + parseError.message))
        }
      })
      .catch(reject)
  })
}

function generateChapterFromMemories(memories, chapterTitle, yearRange, style = 'warm') {
  return new Promise((resolve, reject) => {
    const memoriesStr = memories.map((m, i) => `${i + 1}. ${m}`).join('\n')

    const styleDesc = {
      warm: '温馨回忆录风格，亲切感人',
      formal: '正式传记风格，庄重典雅',
      story: '故事集风格，生动有趣'
    }

    const systemPrompt = `你是一位专业的传记作家。请根据以下记忆片段，撰写一章完整的传记内容。

章节标题：${chapterTitle}
时间范围：${yearRange}
写作风格：${styleDesc[style]}

记忆片段：
${memoriesStr}

请生成以下内容：
1. content：正文内容（500-800字），生动具体，包含细节和情感
2. quote：金句（15-20字），简洁有力，富有哲理
3. emotion：情感标签（如：感恩、温暖、骄傲、坚强、温馨、怀念等）

返回格式（纯JSON）：
{
  "content": "正文内容",
  "quote": "金句",
  "emotion": "情感标签"
}`

    callLLMDirect([{ role: 'system', content: systemPrompt }], null, null)
      .then(content => {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0])
            result.title = chapterTitle
            result.year = yearRange
            resolve(result)
          } else {
            reject(new Error('Invalid JSON format'))
          }
        } catch (parseError) {
          reject(new Error('JSON parse error'))
        }
      })
      .catch(reject)
  })
}

function generateTimelineFromMemories(memories) {
  return new Promise((resolve, reject) => {
    const memoriesStr = memories.map((m, i) => `${i + 1}. ${m}`).join('\n')

    const systemPrompt = `请根据以下记忆片段，提取10-15个关键时间节点，生成人生时间线。

记忆片段：
${memoriesStr}

返回格式（纯JSON）：
[
  {"year": "年份", "event": "事件描述"},
  ...
]

注意：
1. 年份要合理推断，不要凭空捏造
2. 事件描述要简洁准确
3. 按时间顺序排列`

    callLLMDirect([{ role: 'system', content: systemPrompt }], null, null)
      .then(content => {
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const timeline = JSON.parse(jsonMatch[0])
            resolve(timeline)
          } else {
            reject(new Error('Invalid JSON format'))
          }
        } catch (parseError) {
          reject(new Error('JSON parse error'))
        }
      })
      .catch(reject)
  })
}

module.exports = {
  generateBiographyFromMemory,
  generateChapterFromMemories,
  generateTimelineFromMemories
}