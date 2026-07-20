const { TEST_SAMPLES, runEvaluationSample, iterativeOptimization, saveEvaluationResult, getEvaluationHistory, EVALUATION_CRITERIA } = require('../../utils/biographyEvaluator.js')

Page({
  data: {
    samples: TEST_SAMPLES,
    currentSample: TEST_SAMPLES[0]?.id || '',
    currentConversations: [],
    isEvaluating: false,
    evaluationResult: null,
    scoreItems: [],
    history: []
  },

  onLoad: function() {
    this.setCurrentSample(TEST_SAMPLES[0]?.id || '')
    this.loadHistory()
  },

  setCurrentSample: function(sampleId) {
    const sample = TEST_SAMPLES.find(s => s.id === sampleId)
    if (sample) {
      this.setData({
        currentSample: sampleId,
        currentConversations: sample.conversations || []
      })
    }
  },

  onSelectSample: function(e) {
    const sampleId = e.currentTarget.dataset.id
    this.setCurrentSample(sampleId)
    this.setData({
      evaluationResult: null
    })
  },

  onStartEvaluation: async function() {
    if (this.data.isEvaluating) return
    
    this.setData({ isEvaluating: true })
    
    try {
      const result = await runEvaluationSample(this.data.currentSample)
      
      saveEvaluationResult(result)
      
      this.setEvaluationResult(result)
      this.loadHistory()
      
      wx.showToast({ title: '评测完成', icon: 'success' })
    } catch (err) {
      console.error('Evaluation error:', err)
      wx.showToast({ title: '评测失败，请重试', icon: 'none' })
    } finally {
      this.setData({ isEvaluating: false })
    }
  },

  onStartIterative: async function() {
    if (this.data.isEvaluating) return
    
    this.setData({ isEvaluating: true })
    
    try {
      const sample = TEST_SAMPLES.find(s => s.id === this.data.currentSample)
      if (!sample) return
      
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
      
      const result = await iterativeOptimization(memory, goal, 3, 80)
      
      const fullResult = {
        sample: sample,
        generatedBiography: result.biography,
        evaluation: result.evaluation
      }
      
      saveEvaluationResult(fullResult)
      
      this.setEvaluationResult(fullResult)
      this.loadHistory()
      
      wx.showToast({ title: '迭代优化完成', icon: 'success' })
    } catch (err) {
      console.error('Iterative optimization error:', err)
      wx.showToast({ title: '优化失败，请重试', icon: 'none' })
    } finally {
      this.setData({ isEvaluating: false })
    }
  },

  setEvaluationResult: function(result) {
    const scores = result.evaluation.scores || {}
    const scoreItems = []
    
    for (const key in EVALUATION_CRITERIA) {
      const criteria = EVALUATION_CRITERIA[key]
      const score = scores[key] || { score: 0, comment: '' }
      const maxScore = Math.round(criteria.weight * 100)
      const percent = maxScore > 0 ? (score.score / maxScore) * 100 : 0
      
      scoreItems.push({
        key: key,
        name: criteria.name,
        score: score.score,
        percent: percent,
        comment: score.comment
      })
    }
    
    this.setData({
      evaluationResult: result,
      scoreItems: scoreItems
    })
  },

  loadHistory: function() {
    const history = getEvaluationHistory()
    this.setData({ history: history })
  },

  formatTime: function(timestamp) {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }
})