const { callLLMDirect, MODEL_CONFIG } = require('./llm.js')

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

    const systemPrompt = `你是一位顶级专业传记作家，荣获多项文学奖项，擅长撰写感人至深的长篇人生传记。你曾为多位知名人士撰写传记，作品深受读者喜爱。

【核心原则 - 真实性第一】：
- 所有内容必须基于用户真实讲述的经历，绝对不能编造或虚构任何内容
- 只记录用户明确提到的事情，对于用户未提及的内容，不要自行补充
- 如果某些信息缺失，可以留空或标注"用户未提及"，但不能猜测或编造
- 人物的感受和想法必须来自用户的讲述，不能凭空推断

【写作要求】
风格：${styleDesc[style] || styleDesc.warm}
语言：中文，流畅优美，富有感染力，兼具文学性和可读性，如同一部优秀的文学作品
读者：中老年人群及其家人，作品将作为家族传承的珍贵财富
篇幅：长篇传记，约15-20章，每章不少于2000字，全书总字数不少于30000字（三万字以上）

【人物信息】
${basicInfoStr}

【关键记忆】
${memoriesStr}

【已完成对话次数】：${conversationHistory}次

【传记结构】：${structureType === 'timeline' ? '按时间顺序' : '按重大事件'}

请根据以上信息，生成一份完整、专业的人生传记，包含以下内容：

1. intro（引言）：不少于800字，概括人物的一生，引出传记主题，奠定全文基调，要有感染力
2. ending（结语）：不少于1500字，总结人生感悟，传递温暖的力量，升华主题，要有深度
3. timeline（时间线）：25-30个关键时间节点，包含年份和事件，涵盖人生各个阶段
4. photos（照片位）：20个照片位，包含标题和描述，根据章节内容推断合适的照片场景
5. chapters（章节）：15-20章，每章包含：
   - title：章节标题，要有文学性和概括性
   - year：时间范围，准确清晰
   - content：正文内容（不少于2000字，建议2500-3000字），内容丰富详实
   - quote：金句（25-40字，富有哲理和感染力，令人印象深刻）
   - emotion：情感标签（如：感恩、温暖、坚韧、奋斗、幸福、怀念、感悟等）
6. familyView（家人视角）：不少于1000字，从家人的角度描述人物，温暖感人
7. epilogue（后记）：不少于500字，记录传记创作过程或家人的读后感受

【写作标准】：
1. 叙事性：将零散记忆转化为连贯、完整的叙事故事，要有情节和起伏
2. 细节描写：基于用户提供的细节进行描写，加入合理的场景渲染，但不能编造新细节
3. 人物刻画：人物形象要立体丰满，展现性格特点和内心世界，刻画细腻
4. 时间意识：明确交代事件发生的年代和背景，让读者有时代感
5. 语言风格：温暖亲切，适合中老年人阅读，兼具文学性和艺术性
6. 情感共鸣：能够打动人心，引发情感共鸣，让人读后回味无穷
7. 人生感悟：适当融入用户提到的人生道理和感悟，给读者以启发和思考
8. 丰富性：内容要充实，涵盖人生各个方面，不遗漏重要经历
9. 深度：不仅记录事件，还要挖掘事件背后的意义和人物的内心世界
10. 艺术性：语言要有文采，描写要有感染力，达到文学作品的水准
11. 真实性：所有内容必须真实，基于用户讲述，不能虚构

【真实性保障】：
- ❌ 绝对不能编造用户没有提到的事件或细节
- ❌ 绝对不能猜测用户的想法或感受，必须基于用户讲述
- ❌ 绝对不能把其他故事套用在用户身上
- ✅ 只记录用户明确提到的内容
- ✅ 如果信息不完整，可以留空或标注"用户未提及"
- ✅ 可以基于用户提到的细节进行合理的场景渲染和文学加工

【章节规划建议】：
第1-3章：童年与少年时期（1-18岁）
第4-6章：青年时期与求学（18-28岁）
第7-9章：初入职场与事业起步（28-38岁）
第10-12章：事业发展与成就（38-50岁）
第13-15章：爱情家庭与育儿（贯穿一生）
第16-18章：友情岁月与兴趣爱好（贯穿一生）
第19-20章：挑战成长与人生感悟（晚年回顾）

【返回格式要求】（必须是纯JSON格式，不要包含任何其他文字）：

{
  "intro": "引言内容（不少于800字）",
  "ending": "结语内容（不少于1500字）",
  "epilogue": "后记内容（不少于500字）",
  "timeline": [
    {"year": "年份", "event": "事件描述"},
    ...
  ],
  "photos": [
    {"title": "照片标题", "desc": "照片描述，包含照片中的场景、人物和故事背景", "position": "chapter-1", "time": "建议放置时间"},
    ...
  ],
  "chapters": [
    {
      "title": "章节标题",
      "year": "时间范围",
      "content": "正文内容（不少于2000字）",
      "quote": "金句（25-40字）",
      "emotion": "情感标签",
      "imagePosition": "建议放置图片的位置描述"
    },
    ...
  ],
  "familyView": {
    "title": "家人视角标题",
    "content": "家人视角内容（不少于1000字）"
  }
}

【注意事项】：
1. 如果某些信息缺失，请标注"用户未提及"，不要凭空捏造
2. 章节内容要生动具体，基于用户提供的细节进行描写，要有故事性
3. 金句要简洁有力，富有哲理和感染力，让人印象深刻
4. 情感标签要准确反映章节的情感基调
5. 照片描述要与章节内容相关，具有画面感和故事性，描述照片中的场景和人物
6. 将用户上传的照片优先分配到合适的章节位置
7. 家人视角要温暖感人，从亲人的角度展现人物的另一面
8. 全文要有统一的叙事风格和基调，保持连贯性
9. 结尾要有升华，点明人生主题和感悟，引人深思
10. 后记可以记录创作过程或家人的读后感受，增加真实感
11. 确保全书总字数不少于30000字，内容充实丰富
12. 最重要的是：确保所有内容都是真实的，基于用户的真实讲述`

    callLLMDirect([{ role: 'system', content: systemPrompt }], goal, memory, 'minimax_biography')
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

function generateNarrativeChapter(chapterMemories, chapterTitle, yearRange, style = 'warm', feedback = '') {
  return new Promise((resolve, reject) => {
    const memoriesStr = chapterMemories.map(m => m.content || m).join('\n\n')

    const styleDesc = {
      warm: '温馨回忆录风格，亲切感人，语言朴实真挚，像家人在耳边娓娓道来',
      formal: '正式传记风格，庄重典雅，结构严谨，语言规范考究',
      story: '故事集风格，生动有趣，情节跌宕起伏，引人入胜'
    }

    const systemPrompt = `你是一位顶级专业叙事作家，荣获多项文学奖项，擅长将零散记忆片段转化为连贯、生动、感人的长篇故事。你的作品具有很高的文学水准，深受读者喜爱。

【章节主题】：${chapterTitle}（${yearRange}）
【记忆素材】：${memoriesStr}

${feedback ? `【用户反馈/修改意见】：${feedback}` : ''}

【写作要求】：
1. 采用第三人称叙述，将记忆素材转化为流畅、完整的叙事故事，要有情节和起伏
2. 加入丰富的场景描写、细节刻画和情感表达，让读者身临其境
3. 保留所有关键细节，去除重复内容，补充合理的过渡和背景信息
4. 语言风格温暖亲切，适合中老年人及其家人阅读，兼具文学性和艺术性
5. 篇幅要求：每章不少于2000字，建议2500-3000字，内容要充实丰富
6. 不要直接引用对话，而是转化为间接叙述，用叙述者的口吻讲述
7. 要有时间线意识，明确交代事件发生的年代和背景，让读者有时代感
8. 人物刻画要立体丰满，展现人物的性格特点和内心世界，刻画细腻
9. ${feedback ? '请根据用户反馈认真调整写作方式、内容结构和语言风格' : ''}
10. 结尾要有升华，点明章节主题和人生感悟，引人深思
11. 不仅记录事件，还要挖掘事件背后的意义和人物的内心世界
12. 语言要有文采，描写要有感染力，达到文学作品的水准

【返回格式】：
{ 
  "content": "章节完整内容（不少于2000字）", 
  "quote": "章节金句（25-40字，富有哲理和感染力，令人印象深刻）", 
  "emotion": "情感标签（如：感恩、温暖、坚韧、奋斗、幸福、怀念、感悟等）" 
}`

    callLLMDirect([{ role: 'system', content: systemPrompt }], null, null, 'minimax_biography')
      .then(content => {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0])
            result.title = chapterTitle
            result.year = yearRange
            resolve(result)
          } else {
            reject(new Error('章节生成失败'))
          }
        } catch (parseError) {
          reject(new Error('章节生成失败'))
        }
      })
      .catch(reject)
  })
}



async function generateBiographyAgent(memory, goal, letters, options = {}) {
  try {
    const basicInfo = memory.basicInfo || {}
    const keyMemories = memory.keyMemories || []
    const chapters = []
    const feedback = options.feedback || ''
    
    const stages = [
      { id: 'childhood', name: '童年记忆', year: '1949-1960' },
      { id: 'youth', name: '少年时光', year: '1960-1968' },
      { id: 'education', name: '求学之路', year: '1968-1978' },
      { id: 'career_start', name: '初入职场', year: '1978-1985' },
      { id: 'career_growth', name: '事业发展', year: '1985-1995' },
      { id: 'love', name: '爱情相遇', year: '1975-1980' },
      { id: 'parenting', name: '育儿之路', year: '1980-2000' },
      { id: 'friends', name: '友情岁月', year: '1960-2025' },
      { id: 'hobbies', name: '兴趣爱好', year: '1970-2025' },
      { id: 'challenges', name: '挑战与成长', year: '1980-2000' },
      { id: 'memories', name: '难忘时刻', year: '1949-2025' },
      { id: 'life', name: '人生感悟', year: '2000-2025' }
    ]

    for (const stage of stages) {
      const stageMemories = keyMemories.filter(m => 
        (m.chapter && m.chapter.includes(stage.id)) || 
        (m.chapter && m.chapter.includes(stage.name))
      )
      
      if (stageMemories.length > 0) {
        const chapter = await generateNarrativeChapter(
          stageMemories,
          stage.name, 
          stage.year,
          'warm',
          feedback
        ).catch(err => ({
          title: stage.name,
          year: stage.year,
          content: stageMemories.map(m => m.content || m).join('\n'),
          quote: '',
          emotion: '温馨'
        }))
        chapters.push(chapter)
      }
    }

    if (letters && letters.length > 0) {
      for (const letter of letters) {
        const existingChapter = chapters.find(c => c.title === letter.chapter)
        if (!existingChapter) {
          const chapter = await generateNarrativeChapter(
            [{ content: letter.content }],
            letter.chapter,
            letter.date,
            'warm',
            feedback
          ).catch(err => ({
            title: letter.chapter,
            year: letter.date,
            content: letter.content,
            quote: '',
            emotion: '温馨'
          }))
          chapters.push(chapter)
        }
      }
    }

    if (chapters.length === 0) {
      chapters.push({
        title: '人生故事',
        year: '',
        content: keyMemories.map(m => m.content || m).join('\n'),
        quote: '',
        emotion: '温馨'
      })
    }

    const timeline = await generateTimelineFromMemories(keyMemories).catch(err => [])

    const intro = await generateIntro(basicInfo, goal, feedback).catch(err => 
      `在${basicInfo.birthPlace || '这片土地'}上，${goal?.name || '一位平凡而伟大的老人'}度过了${new Date().getFullYear() - (basicInfo.birthDate ? parseInt(basicInfo.birthDate) : 1949)}年的人生岁月。他/她经历了时代的变迁，见证了国家的发展，用勤劳和智慧书写了属于自己的精彩人生。这是一段值得铭记的生命历程，让我们一起走进他/她的故事。`
    )

    const ending = await generateEnding(basicInfo, goal, chapters, feedback).catch(err => 
      `${goal?.name || '这位老人'}的人生故事，是时代的缩影，也是千万普通人的真实写照。他/她用一生的时间诠释了什么是奋斗，什么是坚持，什么是爱。岁月会流逝，但美好的记忆永远不会褪色。这些故事将代代相传，成为家族最宝贵的精神财富。愿每一个生命都能被温柔以待，愿每一段故事都能温暖人心。`
    )

    const familyView = await generateFamilyView(basicInfo, goal, feedback).catch(err => ({
      title: '家人眼中的他/她',
      content: `${goal?.name || '他/她'}是一位慈祥的长辈，用爱和关怀守护着整个家庭。在家人眼中，${goal?.name || '他/她'}是坚强的支柱，是温暖的港湾。${goal?.name || '他/她'}的故事，将永远铭刻在我们心中。`
    }))

    const biographyPhotos = chapters.map((c, i) => ({
      title: c.title,
      desc: `${c.year}年的记忆`,
      position: `chapter-${i + 1}`,
      time: c.year
    }))

    const biography = {
      id: 'user_biography',
      name: goal?.name || '用户',
      avatar: (goal?.name || '用')[0] || '用',
      bio: `${basicInfo.occupation || ''}${basicInfo.birthDate ? ` · ${new Date().getFullYear() - parseInt(basicInfo.birthDate) || 0}岁` : ''}`,
      tag: '人生传记',
      starPosition: { x: 600, y: 800 },
      starColor: '#9c27b0',
      starSize: 100,
      intro: intro,
      ending: ending,
      timeline: timeline,
      photos: biographyPhotos,
      chapters: chapters,
      familyView: familyView,
      lastGeneratedAt: new Date().toISOString(),
      feedback: feedback
    }

    return biography
  } catch (err) {
    console.error('[Biography] generateBiographyAgent error:', err)
    throw err
  }
}

function generateIntro(basicInfo, goal, feedback) {
  return new Promise((resolve, reject) => {
    const basicInfoStr = `
姓名：${goal?.name || '用户'}
出生地：${basicInfo.birthPlace || '未记录'}
出生日期：${basicInfo.birthDate || '未记录'}
职业：${basicInfo.occupation || '未记录'}
爱好：${basicInfo.hobbies?.join('、') || '未记录'}
家庭成员：${basicInfo.familyMembers?.join('、') || '未记录'}
教育经历：${basicInfo.education || '未记录'}
    `.trim()

    const systemPrompt = `你是一位顶级专业传记作家，荣获多项文学奖项，擅长撰写感人至深的人生传记引言。你的作品具有很高的文学水准，深受读者喜爱。

【人物信息】
${basicInfoStr}

${feedback ? `【用户反馈/修改意见】：${feedback}` : ''}

【写作要求】
- 篇幅要求：不少于800字，建议800-1000字
- 概括人物的一生，引出传记主题，奠定全文基调
- 语言温暖亲切，富有感染力，适合中老年人及其家人阅读，兼具文学性和艺术性
- 风格：温馨回忆录风格，像家人在讲述故事
- 要有时间感和历史厚重感，体现人生的历程和时代背景
- 可以适当描写人物的外貌、性格特点，让读者对人物有初步印象
- 要有感染力，让读者产生继续阅读的欲望
- 如果有用户反馈，请根据反馈认真调整内容

请只返回引言内容，不要包含其他文字。`

    callLLMDirect([{ role: 'system', content: systemPrompt }], null, null, 'minimax_biography')
      .then(content => {
        resolve(content.trim())
      })
      .catch(reject)
  })
}

function generateEnding(basicInfo, goal, chapters, feedback) {
  return new Promise((resolve, reject) => {
    const chapterTitles = chapters.map(c => c.title).join('、')
    const chapterCount = chapters.length
    
    const systemPrompt = `你是一位顶级专业传记作家，荣获多项文学奖项，擅长撰写感人至深的人生传记结语。你的作品具有很高的文学水准，深受读者喜爱。

【人物信息】
姓名：${goal?.name || '用户'}
职业：${basicInfo.occupation || '未记录'}
传记章节：${chapterTitles}（共${chapterCount}章）

${feedback ? `【用户反馈/修改意见】：${feedback}` : ''}

【写作要求】
- 篇幅要求：不少于1500字，建议1500-2000字
- 总结人生感悟，传递温暖的力量，升华主题
- 语言温暖亲切，富有感染力，适合中老年人及其家人阅读，兼具文学性和艺术性
- 风格：温馨回忆录风格，像家人在讲述故事
- 回顾人物一生的重要历程和成就，要有深度
- 表达对未来的期许和对后人的寄语
- 可以提及一些人生道理和感悟，给读者以启发和思考
- 要有升华，点明人生主题，引人深思
- 如果有用户反馈，请根据反馈认真调整内容

请只返回结语内容，不要包含其他文字。`

    callLLMDirect([{ role: 'system', content: systemPrompt }], null, null, 'minimax_biography')
      .then(content => {
        resolve(content.trim())
      })
      .catch(reject)
  })
}

function generateFamilyView(basicInfo, goal, feedback) {
  return new Promise((resolve, reject) => {
    const systemPrompt = `你是一位顶级专业传记作家，荣获多项文学奖项，擅长撰写温暖感人的家人视角传记内容。你的作品具有很高的文学水准，深受读者喜爱。

【人物信息】
姓名：${goal?.name || '用户'}
职业：${basicInfo.occupation || '未记录'}
家庭成员：${basicInfo.familyMembers?.join('、') || '未记录'}

${feedback ? `【用户反馈/修改意见】：${feedback}` : ''}

【写作要求】
- 篇幅要求：不少于1000字，建议1000-1500字
- 从家人的角度描述人物，展现人物作为父母、长辈的形象
- 语言温暖感人，细腻真挚，像家人在讲述故事，兼具文学性和艺术性
- 可以描述人物的日常生活、性格特点、对家人的关爱，要有丰富的细节
- 展现人物不为人知的一面，让读者感受到真实的人物形象
- 可以描述一些具体的家庭故事和温馨瞬间，让内容更加生动
- 如果有用户反馈，请根据反馈认真调整内容

请返回JSON格式：
{
  "title": "家人视角标题",
  "content": "家人视角内容（不少于1000字）"
}`

    callLLMDirect([{ role: 'system', content: systemPrompt }], null, null, 'minimax_biography')
      .then(content => {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]))
          } else {
            resolve({
              title: '家人眼中的他/她',
              content: content.trim()
            })
          }
        } catch (parseError) {
          resolve({
            title: '家人眼中的他/她',
            content: content.trim()
          })
        }
      })
      .catch(reject)
  })
}

module.exports = {
  generateBiographyFromMemory,
  generateChapterFromMemories,
  generateTimelineFromMemories,
  generateNarrativeChapter,
  generateBiographyAgent
}