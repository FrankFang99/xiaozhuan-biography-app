const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { messages, currentMemory } = event
  
  const memory = currentMemory || {
    basicInfo: { birthPlace: '', birthDate: '', occupation: '', hobbies: [], familyMembers: [], education: '', workExperience: '' },
    preferences: { topics: [], conversationStyle: 'warm', questionFrequency: 'low', favoriteTopics: [], avoidTopics: [] },
    progress: { totalQuestions: 24, answeredQuestions: [], currentPhase: 'childhood', daysRemaining: 30 },
    history: { totalConversations: 0, lastConversationTime: '', keyMemories: [] }
  }

  const recentMessages = messages.slice(-6)
  const conversationText = recentMessages.map(m => `${m.role === 'ai' ? '助手' : '用户'}: ${m.content}`).join('\n')

  const systemPrompt = `你是一个信息提取助手，负责从对话中提取用户的个人信息和偏好。

当前已有的用户记忆：
【基础信息】
出生地：${memory.basicInfo.birthPlace || '未记录'}
出生日期：${memory.basicInfo.birthDate || '未记录'}
职业：${memory.basicInfo.occupation || '未记录'}
爱好：${memory.basicInfo.hobbies.join('、') || '未记录'}
家庭成员：${memory.basicInfo.familyMembers.join('、') || '未记录'}
教育经历：${memory.basicInfo.education || '未记录'}
工作经历：${memory.basicInfo.workExperience || '未记录'}

【偏好】
喜欢的话题：${memory.preferences.favoriteTopics.join('、') || '无'}
避免的话题：${memory.preferences.avoidTopics.join('、') || '无'}

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
        messages: [{ role: 'system', content: systemPrompt }],
        max_tokens: 600,
        temperature: 0.2,
        top_p: 0.5
      },
      dataType: 'json'
    })

    if (response && response.data && response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const extracted = JSON.parse(jsonMatch[0])
          return {
            success: true,
            extracted
          }
        } else {
          return {
            success: false,
            error: 'Invalid JSON format',
            rawContent: content
          }
        }
      } catch (parseError) {
        return {
          success: false,
          error: 'JSON parse error',
          rawContent: content
        }
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
