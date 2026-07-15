const Tracker = require('../../utils/tracker.js')

Page({
  data: {
    userInfo: null,
    goal: null,
    letterCount: 0,
    bgStars: [],
    userMemory: null,
    biography: null
  },

  onLoad: function() {
    Tracker.pageView('my')
    this.initStars()
    this.loadUserData()
  },

  onShow: function() {
    this.loadUserData()
    this.updateTabBar()
  },

  updateTabBar: function() {
    const tabBar = this.getTabBar()
    if (tabBar) {
      tabBar.updateCurrentIndex()
    }
  },

  initStars: function() {
    const stars = []
    for (let i = 0; i < 40; i++) {
      stars.push({
        id: 'star_' + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.2,
        size: Math.random() * 12 + 8,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 2
      })
    }
    this.setData({ bgStars: stars })
  },

  loadUserData: function() {
    const userInfo = wx.getStorageSync('userInfo') || null
    const goal = wx.getStorageSync('goal') || null
    const letters = wx.getStorageSync('letters') || []
    const userMemory = wx.getStorageSync('userMemory') || this.getDefaultMemory()
    const biography = wx.getStorageSync('biography') || null
    
    this.setData({ 
      userInfo, 
      goal,
      letterCount: letters.length,
      userMemory,
      biography
    })
  },

  getDefaultMemory: function() {
    return {
      basicInfo: { birthPlace: '', birthDate: '', occupation: '', hobbies: [], familyMembers: [], education: '', workExperience: '' },
      preferences: { topics: [], conversationStyle: 'warm', questionFrequency: 'low', favoriteTopics: [], avoidTopics: [] },
      progress: { totalQuestions: 24, answeredQuestions: [], currentPhase: 'childhood', daysRemaining: 30, targetLetterCount: 5, currentLetterCount: 0 },
      history: { totalConversations: 0, lastConversationTime: '', keyMemories: [] }
    }
  },

  onEditGoal: function() {
    wx.navigateTo({ url: '/pages/onboarding/index' })
  },

  onViewBiography: function() {
    wx.setStorageSync('viewBiography', true)
    wx.switchTab({ url: '/pages/letterbox/index' })
  },

  onShowcase: function() {
    wx.navigateTo({ url: '/pages/showcase/index' })
  },

  onSampleBiography: function() {
    wx.navigateTo({ url: '/pages/biography/index' })
  },

  onClearMemory: function() {
    wx.showModal({
      title: '确认清除',
      content: '清除记忆后，AI将忘记之前记录的信息，确定要清除吗？',
      success: (res) => {
        if (res.confirm) {
          const defaultMemory = this.getDefaultMemory()
          this.setData({ userMemory: defaultMemory })
          wx.setStorageSync('userMemory', defaultMemory)
          wx.showToast({ title: '记忆已清除', icon: 'success' })
        }
      }
    })
  },

  onLogout: function() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录，确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('goal')
          wx.removeStorageSync('letters')
          wx.removeStorageSync('biography')
          wx.removeStorageSync('currentChatMessages')
          wx.removeStorageSync('notifications')
          wx.removeStorageSync('userMemory')
          wx.redirectTo({ url: '/pages/login/index' })
        }
      }
    })
  },

  onAbout: function() {
    wx.showModal({
      title: '关于岁月书',
      content: '岁月书是一款帮助您记录人生故事的AI传记助手。通过与AI对话，您可以轻松记录长辈的人生经历，最终生成一本温馨的数字传记。\n\n核心功能：\n- AI陪伴式闲聊\n- 智能信息采集\n- 用户记忆系统\n- 自动传记生成',
      showCancel: false
    })
  },

  onPrivacy: function() {
    wx.navigateTo({ url: '/pages/privacy/index' })
  },

  onUserAgreement: function() {
    wx.navigateTo({ url: '/pages/privacy/index' })
  }
})
