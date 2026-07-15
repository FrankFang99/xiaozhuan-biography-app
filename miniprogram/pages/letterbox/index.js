const Tracker = require('../../utils/tracker.js')

Page({
  data: {
    letters: [],
    biography: null,
    progress: 0,
    daysRemaining: 30,
    showBiography: false,
    targetLetterCount: 5,
    currentLetterCount: 0
  },

  onLoad: function() {
    Tracker.pageView('letterbox')
    this.loadLetters()
    this.loadBiography()
    this.calculateProgress()
  },

  onShow: function() {
    this.loadLetters()
    this.loadBiography()
    this.calculateProgress()
    
    const viewBiography = wx.getStorageSync('viewBiography')
    if (viewBiography && this.data.biography) {
      this.setData({ showBiography: true })
      wx.removeStorageSync('viewBiography')
    }
    
    this.updateTabBar()
  },

  updateTabBar: function() {
    const tabBar = this.getTabBar()
    if (tabBar) {
      tabBar.updateCurrentIndex()
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

  onLetterTap: function(e) {
    const letterId = e.currentTarget.dataset.id
    wx.setStorageSync('currentLetterId', letterId)
    wx.switchTab({ url: '/pages/chat/index' })
  },

  onWriteLetter: function() {
    wx.removeStorageSync('currentLetterId')
    wx.switchTab({ url: '/pages/chat/index' })
  },

  onViewBiography: function() {
    this.setData({ showBiography: true })
  },

  onCloseBiography: function() {
    this.setData({ showBiography: false })
  },

  stopPropagation: function() {}
})
