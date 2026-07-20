const Tracker = require('../../utils/tracker.js')
const { STRUCTURE_CONFIG } = require('../../utils/llm.js')

Page({
  data: {
    letters: [],
    biography: null,
    progress: 0,
    daysRemaining: 30,
    showBiography: false,
    showLetterDetail: false,
    selectedLetter: null,
    targetLetterCount: 5,
    currentLetterCount: 0,
    chapters: [],
    currentPhase: 'childhood'
  },

  onLoad: function() {
    Tracker.pageView('letterbox')
    this.loadLetters()
    this.loadBiography()
    this.loadChapters()
    this.calculateProgress()
  },

  onShow: function() {
    this.loadLetters()
    this.loadBiography()
    this.loadChapters()
    this.calculateProgress()
    this.updateTabBar()
    
    setTimeout(() => {
      const viewBiography = wx.getStorageSync('viewBiography')
      const biography = wx.getStorageSync('biography')
      if (viewBiography && biography) {
        this.setData({ showBiography: true })
        wx.removeStorageSync('viewBiography')
      }
    }, 100)
  },

  updateTabBar: function() {
    try {
      const tabBar = this.getTabBar()
      if (tabBar && typeof tabBar.updateCurrentIndex === 'function') {
        tabBar.updateCurrentIndex()
      }
    } catch (e) {
      console.warn('[Letterbox] Failed to update tabBar:', e)
    }
  },

  loadLetters: function() {
    const letters = wx.getStorageSync('letters') || []
    this.setData({ letters, currentLetterCount: letters.length })
  },

  loadBiography: function() {
    const biography = wx.getStorageSync('biography') || null
    this.setData({ biography })
  },

  loadChapters: function() {
    const goal = wx.getStorageSync('goal') || {}
    const structureType = goal.structureType || 'timeline'
    const stages = STRUCTURE_CONFIG[structureType] ? STRUCTURE_CONFIG[structureType].stages : STRUCTURE_CONFIG.timeline.stages
    
    const userMemory = wx.getStorageSync('userMemory') || {}
    const progress = userMemory.progress || {}
    const currentPhase = progress.currentPhase || 'childhood'
    
    const letters = wx.getStorageSync('letters') || []
    
    const chapters = stages.map(stage => {
      const letter = letters.find(l => l.chapterId === stage.id)
      return {
        ...stage,
        letter: letter || null,
        completed: !!letter,
        isCurrent: stage.id === currentPhase
      }
    })
    
    this.setData({ chapters, currentPhase })
  },

  calculateProgress: function() {
    const letters = this.data.letters
    const goal = wx.getStorageSync('goal')
    const targetLetterCount = goal?.targetLetterCount || 5
    
    this.setData({ targetLetterCount })
    
    const progress = Math.min(Math.round((letters.length / targetLetterCount) * 100), 100)
    
    let daysRemaining = 30
    if (goal && goal.createdAt) {
      const targetTime = goal.targetTime
      const createdAt = new Date(goal.createdAt)
      let targetDate = new Date(createdAt)
      
      if (targetTime === 'week') {
        targetDate.setDate(createdAt.getDate() + 7)
      } else if (targetTime === 'month') {
        targetDate.setDate(createdAt.getDate() + 30)
      }
      
      const now = new Date()
      const diff = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      daysRemaining = Math.max(0, diff)
    }
    
    this.setData({ progress, daysRemaining })
  },

  onChapterTap: function(e) {
    const chapterId = e.currentTarget.dataset.id
    const chapter = this.data.chapters.find(c => c.id === chapterId)
    
    if (chapter.completed && chapter.letter) {
      this.setData({ 
        selectedLetter: chapter.letter,
        showLetterDetail: true
      })
    } else if (chapter.isCurrent) {
      wx.switchTab({ url: '/pages/chat/index' })
    }
  },

  onViewBiography: function() {
    this.setData({ showBiography: true })
  },

  onCloseBiography: function() {
    this.setData({ showBiography: false })
  },

  onCloseLetterDetail: function() {
    this.setData({ showLetterDetail: false, selectedLetter: null })
  },

  stopPropagation: function() {}
})
