const Tracker = require('../../utils/tracker.js')

Page({
  data: {
    bgStars: [],
    selectedLogoIndex: -1,
    avatarUrl: '',
    nickName: '',
    isChoosingAvatar: false
  },

  onLoad: function() {
    this.initStars()
    Tracker.pageView('login')
  },

  onShow: function() {
    if (this.data.isChoosingAvatar) {
      return
    }
  },

  initStars: function() {
    const stars = []
    for (let i = 0; i < 40; i++) {
      stars.push({
        id: 'star_' + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.6 + 0.2,
        duration: Math.random() * 5 + 3,
        delay: Math.random() * 3,
        size: Math.random() * 12 + 16
      })
    }
    this.setData({ bgStars: stars })
  },

  onChooseAvatar: function(e) {
    this.setData({
      avatarUrl: e.detail.avatarUrl,
      isChoosingAvatar: false
    })
  },

  onNicknameInput: function(e) {
    this.setData({
      nickName: e.detail.value
    })
  },

  onGetPhoneNumber: function(e) {
    wx.showLoading({ title: '登录中...' })
    
    const { avatarUrl, nickName } = this.data
    const hasPhoneAuth = e.detail.errMsg === 'getPhoneNumber:ok'
    
    wx.login({
      success: (res) => {
        if (res.code) {
          const finalAvatar = avatarUrl || ''
          const finalNickName = nickName.trim() || '岁月书用户'
          const phoneCode = hasPhoneAuth ? e.detail.code : ''
          
          this.completeLogin(res.code, finalAvatar, finalNickName, phoneCode, hasPhoneAuth)
        } else {
          wx.hideLoading()
          wx.showToast({ title: '登录失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '登录失败', icon: 'none' })
      }
    })
  },

  completeLogin: function(code, avatarUrl, nickName, phoneCode, hasPhoneAuth) {
    const userInfo = {
      id: 'wx_' + Date.now(),
      nickName: nickName,
      avatarUrl: avatarUrl,
      phone: phoneCode || '',
      birthday: '',
      createdAt: new Date().toISOString(),
      status: 'active',
      loginType: 'wechat',
      wxCode: code,
      phoneCode: phoneCode,
      hasPhoneAuth: hasPhoneAuth,
      isTempAvatar: avatarUrl.startsWith('wxfile://')
    }
    
    wx.setStorageSync('userInfo', userInfo)
    this.initUserMemory()
    wx.hideLoading()
    wx.showToast({ title: '登录成功', icon: 'success' })
    Tracker.login('wechat')
    
    setTimeout(() => {
      this.navigateToNext()
    }, 1500)
  },

  initUserMemory: function() {
    const existingMemory = wx.getStorageSync('userMemory')
    if (!existingMemory) {
      const userMemory = {
        basicInfo: {
          birthPlace: '',
          birthDate: '',
          occupation: '',
          hobbies: [],
          familyMembers: [],
          education: '',
          workExperience: ''
        },
        preferences: {
          topics: [],
          conversationStyle: 'warm',
          questionFrequency: 'low',
          favoriteTopics: [],
          avoidTopics: []
        },
        progress: {
          totalQuestions: 24,
          answeredQuestions: [],
          currentPhase: 'childhood',
          daysRemaining: 30,
          targetLetterCount: 5,
          currentLetterCount: 0,
          conversationPhase: 'trust_building',
          exchangesInCurrentPhase: 0
        },
        history: {
          totalConversations: 0,
          lastConversationTime: '',
          keyMemories: []
        },
        hasSeenVoiceTutorial: false
      }
      wx.setStorageSync('userMemory', userMemory)
    }
  },

  selectLogo: function(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ selectedLogoIndex: index })
    wx.setStorageSync('selectedLogo', index)
    wx.showToast({ title: '已选择方案' + ['A', 'B', 'C', 'D'][index], icon: 'success' })
  },

  navigateToNext: function() {
    const goal = wx.getStorageSync('goal')
    if (goal) {
      wx.switchTab({ url: '/pages/chat/index' })
    } else {
      wx.navigateTo({ url: '/pages/onboarding/index' })
    }
  }
})