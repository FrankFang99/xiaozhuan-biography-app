const { callLLMDirect } = require('./llm.js')
const { generateBiographyFromMemory, generateBiographyAgent } = require('./biographyGenerator.js')

const EVALUATION_CRITERIA = {
  narrativeFlow: {
    name: '叙事流畅度',
    description: '故事是否连贯、逻辑清晰、过渡自然',
    weight: 0.20
  },
  emotionalImpact: {
    name: '情感感染力',
    description: '是否能打动人心、引发情感共鸣',
    weight: 0.20
  },
  characterDepth: {
    name: '人物刻画',
    description: '人物形象是否立体丰满、有血有肉',
    weight: 0.15
  },
  detailRichness: {
    name: '细节丰富度',
    description: '是否包含丰富的场景描写和细节刻画',
    weight: 0.15
  },
  authenticity: {
    name: '内容真实性',
    description: '是否基于真实记忆，不凭空捏造',
    weight: 0.15
  },
  writingQuality: {
    name: '写作质量',
    description: '语言是否优美、流畅、富有文学性',
    weight: 0.15
  }
}

const TEST_SAMPLES = [
  {
    id: 'sample_001',
    name: '张阿姨的一生',
    basicInfo: {
      name: '张桂英',
      birthDate: '1950',
      birthPlace: '河南郑州',
      occupation: '小学教师',
      hobbies: ['读书', '养花', '太极拳'],
      familyMembers: ['丈夫李明', '女儿李婷', '儿子李强']
    },
    conversations: [
      {
        turn: 1,
        aiQuestion: '张阿姨，您小时候在哪里长大呀？能说说您的童年生活吗？',
        userAnswer: '我小时候在河南郑州的一个小县城长大。那时候家里条件不好，但是兄弟姐妹多，每天都很热闹。我记得家门口有一棵大槐树，夏天我们都在树下乘凉、玩游戏。我父亲是个木匠，手很巧，经常给我们做玩具。母亲是家庭主妇，每天忙着做饭、洗衣服，但总是笑眯眯的。'
      },
      {
        turn: 2,
        aiQuestion: '您小时候上学的情况怎么样？有没有印象特别深的老师？',
        userAnswer: '我上学的时候已经是六十年代了。学校条件很差，教室是土坯房，桌椅都是破旧的。但是老师们都很认真负责。我印象最深的是我的小学班主任王老师，她教我们语文，字写得特别漂亮。她经常鼓励我，说我有读书的天赋。后来我能考上师范学校，很大程度上是因为她的鼓励。'
      },
      {
        turn: 3,
        aiQuestion: '您后来成为了一名教师，能说说您的教学经历吗？',
        userAnswer: '我1972年师范毕业，分配到了县城的一所小学当老师。那时候当老师很辛苦，工资不高，但是看到孩子们天真的笑脸，我就觉得很满足。我教过很多学生，他们有的考上了大学，有的成了工程师，有的也当了老师。每次看到他们回来探望我，我都特别欣慰。我在那个小学教了35年书，直到2007年退休。'
      },
      {
        turn: 4,
        aiQuestion: '您的家庭生活怎么样？能说说您和丈夫、孩子们的故事吗？',
        userAnswer: '我和我丈夫是经人介绍认识的，他是个老实本分的人，在机械厂工作。我们结婚后一直很和睦，虽然日子不富裕，但是很温馨。我们有一儿一女，女儿大一点，儿子小。女儿从小就很懂事，学习也很好，后来考上了师范大学，现在也是一名老师。儿子调皮一些，但是很聪明，后来当了工程师。现在他们都成家立业了，我们老两口身体都还好，每天打打太极拳、养养花，日子过得很舒心。'
      },
      {
        turn: 5,
        aiQuestion: '您这一辈子有没有什么特别难忘的事情？',
        userAnswer: '最难忘的事情应该是1998年我带的那届学生毕业。那时候班里有个叫王小燕的学生，家里特别困难，父亲去世了，母亲身体不好。我经常给她补课，还给她买学习用品。后来她以全县第一名的成绩考上了重点高中，又考上了大学。现在她在大城市工作，每年都回来看我。还有一件事，就是我退休那天，全校的老师和学生都来送我，孩子们给我献了一束花，我当时眼泪都流下来了。'
      },
      {
        turn: 6,
        aiQuestion: '您对人生有什么感悟吗？想对年轻人说些什么？',
        userAnswer: '我觉得人生最重要的就是脚踏实地，做好自己的本职工作。我当了一辈子老师，虽然没有什么大的成就，但是我教过的每一个学生，我都尽力了。年轻人现在条件好了，应该珍惜机会，好好学习，将来为社会做贡献。还有就是要孝敬父母，家庭和睦最重要。钱不重要，一家人平平安安、健健康康就是最大的幸福。'
      }
    ],
    expectedBiography: {
      intro: '张桂英，1950年出生于河南郑州的一个小县城。她的一生，是平凡而又伟大的一生。从一个普通的农家女孩，到一名教书育人三十五年的人民教师，她用勤劳和智慧书写了属于自己的精彩人生。她见证了新中国从贫穷到富强的变迁，用自己的方式为国家培养了一代又一代的人才。这是一段值得铭记的生命历程，让我们一起走进张桂英的故事。',
      chapters: [
        {
          title: '童年时光',
          year: '1950-1965',
          content: '张桂英的童年是在河南郑州的一个小县城度过的。那时候的生活虽然清贫，但充满了温暖和欢乐。家门口的大槐树是孩子们的乐园，夏天乘凉，冬天堆雪。父亲是个手艺精湛的木匠，经常用边角料给孩子们做各种玩具。母亲是位慈祥的家庭主妇，操持家务之余，总是用乐观的态度感染着全家人。正是这种朴实而温暖的家庭氛围，培养了张桂英善良、坚韧的品格。',
          quote: '童年的记忆是人生最珍贵的宝藏',
          emotion: '温暖'
        },
        {
          title: '求学之路',
          year: '1965-1972',
          content: '六十年代的学校条件艰苦，但张桂英对知识的渴望从未减退。土坯房教室、破旧桌椅，都挡不住她学习的热情。小学班主任王老师成为她人生的引路人，那漂亮的板书和鼓励的话语，在她心中种下了教书育人的种子。凭借着刻苦努力和老师们的悉心培养，张桂英顺利考上了师范学校，开始了她与教育事业的不解之缘。',
          quote: '知识改变命运，教育成就未来',
          emotion: '感恩'
        },
        {
          title: '三尺讲台',
          year: '1972-2007',
          content: '1972年，张桂英踏上了教师岗位，这一站就是三十五年。她将青春和热血都奉献给了那三尺讲台，用爱心和耐心浇灌着每一朵祖国的花朵。工资微薄、条件艰苦，但看到孩子们纯真的笑脸，她便觉得一切都值得。她教过的学生遍布各行各业，有的成为工程师，有的成为医生，有的也像她一样走上了教书育人的道路。',
          quote: '春蚕到死丝方尽，蜡炬成灰泪始干',
          emotion: '奉献'
        },
        {
          title: '家庭温暖',
          year: '1970-2025',
          content: '张桂英的家庭生活朴实而幸福。她与丈夫相濡以沫，共同养育了一双儿女。女儿继承了她的衣钵，成为一名教师；儿子则凭借聪明才智，成为了一名工程师。如今，张桂英和丈夫已经退休，每天打太极拳、养花种草，享受着天伦之乐。她常说，家庭和睦、身体健康，就是最大的幸福。',
          quote: '家和万事兴，平安就是福',
          emotion: '幸福'
        },
        {
          title: '难忘岁月',
          year: '1998',
          content: '1998年是张桂英记忆中特别难忘的一年。那一年，她带的毕业班中，有一位叫王小燕的学生，家境贫寒却成绩优异。张桂英不仅在学业上给予她帮助，更在生活上给予她关怀。最终，王小燕以全县第一的成绩考入重点高中，后来又考上了大学。如今，王小燕每年都会回来看望这位改变她命运的恩师。',
          quote: '师恩难忘，桃李芬芳',
          emotion: '感动'
        },
        {
          title: '人生感悟',
          year: '2025',
          content: '回首七十多年的人生历程，张桂英感慨万千。她认为，人生最重要的就是脚踏实地，做好自己的本职工作。她用一辈子的时间践行着这句话，虽然没有什么惊天动地的成就，但她问心无愧。她希望年轻人能够珍惜当下，努力学习，将来成为对社会有用的人。她也希望每个家庭都能和睦幸福，让爱传递下去。',
          quote: '脚踏实地，心怀感恩',
          emotion: '感悟'
        }
      ],
      ending: '张桂英的人生故事，是千万普通人的真实写照。她用一生的时间诠释了什么是奉献，什么是坚守，什么是爱。从童年的大槐树下，到三十五年的三尺讲台，再到如今的退休生活，她始终保持着一颗善良、乐观的心。她的故事告诉我们，平凡的岗位也能创造不平凡的价值，普通的人生也能闪耀出耀眼的光芒。岁月会流逝，但美好的记忆永远不会褪色。这些故事将代代相传，成为家族最宝贵的精神财富。愿每一个生命都能被温柔以待，愿每一段故事都能温暖人心。',
      familyView: {
        title: '家人眼中的张桂英',
        content: '在家人眼中，张桂英是一位慈爱的母亲、一位贤惠的妻子。她对家庭的付出和关爱，让整个家庭充满了温暖。作为母亲，她以身作则，用自己的言行教育子女，培养他们成为正直、善良的人。作为妻子，她与丈夫相濡以沫，共同走过了五十多年的风风雨雨。她不仅是一位优秀的教师，更是一位伟大的母亲和妻子。'
      }
    }
  }
]

async function evaluateBiography(memory, goal, generatedBiography, sampleId = null) {
  try {
    const sample = TEST_SAMPLES.find(s => s.id === sampleId) || TEST_SAMPLES[0]
    
    const evaluationPrompt = `你是一位专业的传记评审专家，荣获多项文学奖项，擅长评估人生传记的创作质量。请根据以下标准对生成的传记进行评分。

【评测标准】（总分100分）：
1. 叙事流畅度（20分）：故事是否连贯、逻辑清晰、过渡自然
2. 情感感染力（20分）：是否能打动人心、引发情感共鸣
3. 人物刻画（15分）：人物形象是否立体丰满、有血有肉
4. 细节丰富度（15分）：是否包含丰富的场景描写和细节刻画
5. 内容真实性（15分）：是否基于真实记忆，不凭空捏造
6. 写作质量（15分）：语言是否优美、流畅、富有文学性

【人物信息】：
${JSON.stringify(sample.basicInfo, null, 2)}

【原始记忆素材（对话记录）】：
${sample.conversations.map(c => `\n${c.turn}. AI：${c.aiQuestion}\n   用户：${c.userAnswer}`).join('')}

【生成的传记】：
${JSON.stringify(generatedBiography, null, 2)}

【评分要求】：
1. 请逐项打分，每项给出具体分数和简短评语
2. 给出总分和综合评价
3. 指出优点和改进建议
4. 评估内容是否忠实于原始记忆素材

【返回格式】：
{
  "scores": {
    "narrativeFlow": {"score": 0-20, "comment": "评语"},
    "emotionalImpact": {"score": 0-20, "comment": "评语"},
    "characterDepth": {"score": 0-15, "comment": "评语"},
    "detailRichness": {"score": 0-15, "comment": "评语"},
    "authenticity": {"score": 0-15, "comment": "评语"},
    "writingQuality": {"score": 0-15, "comment": "评语"}
  },
  "totalScore": 总分,
  "overallComment": "综合评价",
  "strengths": ["优点1", "优点2"],
  "improvements": ["改进建议1", "改进建议2"],
  "faithfulness": "内容忠实度评估（高/中/低）"
}`

    const result = await callLLMDirect([{ role: 'system', content: evaluationPrompt }], null, null, 'minimax_biography')
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const evaluation = JSON.parse(jsonMatch[0])
        evaluation.timestamp = new Date().toISOString()
        evaluation.sampleId = sampleId || 'sample_001'
        evaluation.generatedBiography = generatedBiography
        return evaluation
      }
    } catch (parseError) {
      console.error('[Evaluator] JSON parse error:', parseError)
    }
    
    return {
      scores: {},
      totalScore: 0,
      overallComment: '无法解析评分结果',
      strengths: [],
      improvements: [],
      faithfulness: '未知'
    }
  } catch (err) {
    console.error('[Evaluator] Evaluation error:', err)
    throw err
  }
}

async function runEvaluationSample(sampleId = null) {
  try {
    const sample = TEST_SAMPLES.find(s => s.id === sampleId) || TEST_SAMPLES[0]
    
    const memory = {
      basicInfo: sample.basicInfo,
      keyMemories: sample.conversations.map(c => c.userAnswer),
      history: {
        totalConversations: sample.conversations.length
      },
      progress: {}
    }
    
    const goal = {
      name: sample.basicInfo.name,
      structure: 'timeline',
      style: 'warm'
    }
    
    const generatedBiography = await generateBiographyFromMemory(memory, goal)
    
    const evaluation = await evaluateBiography(memory, goal, generatedBiography, sampleId)
    
    return {
      sample: sample,
      generatedBiography: generatedBiography,
      evaluation: evaluation
    }
  } catch (err) {
    console.error('[Evaluator] Run sample error:', err)
    throw err
  }
}

function generateOptimizationFeedback(evaluation) {
  const feedback = []
  
  if (evaluation.scores.narrativeFlow && evaluation.scores.narrativeFlow.score < 15) {
    feedback.push('需要增强叙事的连贯性和逻辑结构')
  }
  
  if (evaluation.scores.emotionalImpact && evaluation.scores.emotionalImpact.score < 15) {
    feedback.push('需要增加情感描写，增强故事的感染力')
  }
  
  if (evaluation.scores.characterDepth && evaluation.scores.characterDepth.score < 11) {
    feedback.push('需要更深入地刻画人物性格和内心世界')
  }
  
  if (evaluation.scores.detailRichness && evaluation.scores.detailRichness.score < 11) {
    feedback.push('需要增加更多细节描写和场景刻画')
  }
  
  if (evaluation.scores.authenticity && evaluation.scores.authenticity.score < 11) {
    feedback.push('需要更忠实于原始记忆素材，减少虚构内容')
  }
  
  if (evaluation.scores.writingQuality && evaluation.scores.writingQuality.score < 11) {
    feedback.push('需要提升语言表达能力，增强文学性')
  }
  
  if (evaluation.improvements && evaluation.improvements.length > 0) {
    feedback.push(...evaluation.improvements)
  }
  
  return feedback.join('；')
}

async function iterativeOptimization(memory, goal, maxIterations = 3, targetScore = 80) {
  let currentBiography = null
  let currentEvaluation = null
  
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`[Evaluator] Iteration ${iteration}/${maxIterations}`)
    
    const feedback = currentEvaluation ? generateOptimizationFeedback(currentEvaluation) : ''
    
    if (iteration === 1) {
      currentBiography = await generateBiographyFromMemory(memory, goal)
    } else {
      const options = { feedback: feedback }
      currentBiography = await generateBiographyAgent(memory, goal, [], options)
    }
    
    currentEvaluation = await evaluateBiography(memory, goal, currentBiography)
    
    console.log(`[Evaluator] Score: ${currentEvaluation.totalScore}/100`)
    
    if (currentEvaluation.totalScore >= targetScore) {
      console.log('[Evaluator] Target score reached!')
      break
    }
    
    if (iteration === maxIterations) {
      console.log('[Evaluator] Max iterations reached, returning best result')
    }
  }
  
  return {
    biography: currentBiography,
    evaluation: currentEvaluation,
    iterations: maxIterations
  }
}

function saveEvaluationResult(result) {
  try {
    const evaluations = wx.getStorageSync('biographyEvaluations') || []
    evaluations.push(result)
    if (evaluations.length > 50) {
      evaluations.splice(0, evaluations.length - 50)
    }
    wx.setStorageSync('biographyEvaluations', evaluations)
    console.log('[Evaluator] Evaluation saved')
  } catch (e) {
    console.error('[Evaluator] Failed to save evaluation:', e)
  }
}

function getEvaluationHistory() {
  try {
    return wx.getStorageSync('biographyEvaluations') || []
  } catch (e) {
    console.error('[Evaluator] Failed to get evaluation history:', e)
    return []
  }
}

module.exports = {
  TEST_SAMPLES,
  EVALUATION_CRITERIA,
  evaluateBiography,
  runEvaluationSample,
  iterativeOptimization,
  generateOptimizationFeedback,
  saveEvaluationResult,
  getEvaluationHistory
}