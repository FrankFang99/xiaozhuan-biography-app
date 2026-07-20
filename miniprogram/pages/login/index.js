const Tracker = require('../../utils/tracker.js')
const { resolveImageUrl, isValidUrl } = require('../../utils/imageUtils.js')

Page({
  data: {
    bgStars: [],
    selectedLogoIndex: -1,
    avatarUrl: '',
    nickName: '',
    isChoosingAvatar: false,
    isLoading: false,
    agreed: false
  },

  onLoad: function() {
    this.initStars()
    Tracker.pageView('login')
    
    const existingUser = wx.getStorageSync('userInfo')
    if (existingUser && existingUser.nickName) {
      let nickName = existingUser.nickName
      if (nickName === '岁月书用户' || nickName === '小助用户') {
        nickName = '小传用户'
        existingUser.nickName = nickName
        wx.setStorageSync('userInfo', existingUser)
      }
      
      if (existingUser.avatarUrl) {
        resolveImageUrl(existingUser.avatarUrl).then(resolvedUrl => {
          this.setData({
            nickName: nickName,
            avatarUrl: resolvedUrl || ''
          })
        }).catch(() => {
          this.setData({
            nickName: nickName,
            avatarUrl: ''
          })
        })
      } else {
        this.setData({
          nickName: nickName,
          avatarUrl: ''
        })
      }
    }
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
    const tempAvatarUrl = e.detail.avatarUrl
    
    wx.showLoading({ title: '上传头像...' })
    
    const cloudPath = 'avatars/' + Date.now() + '.jpg'
    
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: tempAvatarUrl,
      success: (res) => {
        wx.cloud.getTempFileURL({
          fileList: [res.fileID],
          success: (urlRes) => {
            wx.hideLoading()
            if (urlRes.fileList && urlRes.fileList.length > 0 && urlRes.fileList[0].tempFileURL) {
              this.setData({
                avatarUrl: urlRes.fileList[0].tempFileURL,
                isChoosingAvatar: false
              })
            } else {
              this.setData({
                avatarUrl: '',
                isChoosingAvatar: false
              })
              wx.showToast({ title: '头像获取失败', icon: 'none' })
            }
          },
          fail: () => {
            wx.hideLoading()
            this.setData({
              avatarUrl: '',
              isChoosingAvatar: false
            })
            wx.showToast({ title: '头像获取失败', icon: 'none' })
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '头像上传失败', icon: 'none' })
        this.setData({
          isChoosingAvatar: false
        })
      }
    })
  },

  onAvatarError: function() {
    this.setData({ avatarUrl: '' })
  },

  onNicknameInput: function(e) {
    this.setData({
      nickName: e.detail.value
    })
  },

  toggleAgreement: function() {
    this.setData({
      agreed: !this.data.agreed
    })
  },

  onWechatLogin: function() {
    const { nickName, avatarUrl } = this.data
    
    if (!nickName.trim()) {
      wx.showToast({ title: '请先输入昵称', icon: 'none' })
      return
    }

    this.setData({ isLoading: true })
    
    wx.login({
      success: (res) => {
        if (res.code) {
          this.completeLogin(res.code, avatarUrl, nickName.trim(), '', false)
        } else {
          this.setData({ isLoading: false })
          wx.showToast({ title: '登录失败', icon: 'none' })
        }
      },
      fail: () => {
        this.setData({ isLoading: false })
        wx.showToast({ title: '登录失败', icon: 'none' })
      }
    })
  },

  completeLogin: function(code, avatarUrl, nickName, phoneCode, hasPhoneAuth) {
    const existingUser = wx.getStorageSync('userInfo')
    const loginDate = existingUser && existingUser.loginDate ? existingUser.loginDate : new Date().toISOString()
    
    const userInfo = {
      id: 'wx_' + Date.now(),
      nickName: nickName,
      avatarUrl: avatarUrl,
      phone: phoneCode || '',
      birthday: '',
      createdAt: new Date().toISOString(),
      loginDate: loginDate,
      status: 'active',
      loginType: 'wechat',
      wxCode: code,
      phoneCode: phoneCode,
      hasPhoneAuth: hasPhoneAuth,
      isTempAvatar: avatarUrl && avatarUrl.startsWith('wxfile://')
    }
    
    wx.setStorageSync('userInfo', userInfo)
    this.initUserMemory()
    this.setData({ isLoading: false })
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