const Tracker = require('../../utils/tracker.js')
const { resolveImageUrl } = require('../../utils/imageUtils.js')

Page({
  data: {
    userInfo: null,
    goal: null,
    letterCount: 0,
    bgStars: [],
    userMemory: null,
    biography: null,
    accompaniedDays: 0
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
    try {
      const tabBar = this.getTabBar()
      if (tabBar && typeof tabBar.updateCurrentIndex === 'function') {
        tabBar.updateCurrentIndex()
      }
    } catch (e) {
      console.warn('[My] Failed to update tabBar:', e)
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
    let userInfo = wx.getStorageSync('userInfo') || null
    const goal = wx.getStorageSync('goal') || null
    const letters = wx.getStorageSync('letters') || []
    const userMemory = wx.getStorageSync('userMemory') || this.getDefaultMemory()
    const biography = wx.getStorageSync('biography') || null
    
    if (userInfo && userInfo.nickName === '岁月书用户' || userInfo && userInfo.nickName === '小助用户') {
      userInfo = { ...userInfo, nickName: '小传用户' }
      wx.setStorageSync('userInfo', userInfo)
    }
    
    if (userInfo && userInfo.avatarUrl) {
      resolveImageUrl(userInfo.avatarUrl).then(resolvedUrl => {
        if (resolvedUrl !== userInfo.avatarUrl) {
          userInfo = { ...userInfo, avatarUrl: resolvedUrl || '' }
          wx.setStorageSync('userInfo', userInfo)
        }
        
        const accompaniedDays = this.calculateAccompaniedDays(userInfo)
        
        this.setData({ 
          userInfo, 
          goal,
          letterCount: letters.length,
          userMemory,
          biography,
          accompaniedDays
        })
      }).catch(() => {
        const accompaniedDays = this.calculateAccompaniedDays(userInfo)
        
        this.setData({ 
          userInfo, 
          goal,
          letterCount: letters.length,
          userMemory,
          biography,
          accompaniedDays
        })
      })
    } else {
      const accompaniedDays = this.calculateAccompaniedDays(userInfo)
      
      this.setData({ 
        userInfo, 
        goal,
        letterCount: letters.length,
        userMemory,
        biography,
        accompaniedDays
      })
    }
  },

  calculateAccompaniedDays: function(userInfo) {
    if (!userInfo || !userInfo.loginDate) {
      return 0
    }
    
    const loginDate = new Date(userInfo.loginDate)
    const now = new Date()
    const diffTime = Math.abs(now - loginDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
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
    wx.navigateTo({ url: '/pages/biography/index?mode=user' })
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

  onFeedback: function() {
    wx.navigateTo({ url: '/pages/feedback/index' })
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
      title: '关于小传',
      content: '小传是一款帮助您记录人生故事的AI传记助手。通过与AI对话，您可以轻松记录长辈的人生经历，最终生成一本温馨的数字传记。\n\n核心功能：\n- AI陪伴式闲聊\n- 智能信息采集\n- 用户记忆系统\n- 自动传记生成',
      showCancel: false
    })
  },

  onApiSettings: function() {
    const currentToken = wx.getStorageSync('minimaxToken') || ''
    wx.showModal({
      title: 'API设置',
      editable: true,
      placeholderText: '请输入Minimax Token Plan订阅Key（sk-cp-开头）',
      content: currentToken,
      confirmText: '保存',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.setStorageSync('minimaxToken', res.content.trim())
          wx.showToast({ title: '设置成功', icon: 'success' })
        }
      }
    })
  },

  onAvatarError: function() {
    if (this.data.userInfo) {
      this.setData({
        'userInfo.avatarUrl': ''
      })
    }
  }
})
