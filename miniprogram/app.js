const Tracker = require('./utils/tracker.js')

App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'trae-ai-creativity'
    })

    // 隐私授权处理：当用户使用涉及隐私的接口时，弹出隐私协议弹窗
    if (wx.onNeedPrivacyAuthorization) {
      wx.onNeedPrivacyAuthorization(function(resolve, eventInfo) {
        wx.showModal({
          title: '隐私保护提示',
          content: '为了保障您的权益，请先阅读并同意《用户隐私保护指引》',
          confirmText: '同意',
          cancelText: '拒绝',
          success: function(res) {
            if (res.confirm) {
              resolve({ buttonId: 'agree', event: 'agree' })
            } else {
              resolve({ buttonId: 'disagree', event: 'disagree' })
            }
          }
        })
      })
    }

    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }

    const goal = wx.getStorageSync('goal')
    if (goal) {
      this.globalData.goal = goal
    }

    this.initTracker()
    this.initErrorMonitoring()
    this.initPerformanceMonitoring()
    this.retryLocalFeedbacks()
  },

  retryLocalFeedbacks: function() {
    const localFeedbacks = wx.getStorageSync('localFeedbacks') || []
    if (localFeedbacks.length === 0) return

    console.log('[App] Retrying', localFeedbacks.length, 'local feedbacks...')

    localFeedbacks.forEach(feedback => {
      wx.cloud.callFunction({
        name: 'submitFeedback',
        data: {
          feedbackType: feedback.type,
          content: feedback.content,
          contact: feedback.contactInfo,
          includeContext: feedback.includeContext,
          contextData: feedback.context
        }
      }).then(res => {
        if (res.result && res.result.success) {
          const remaining = wx.getStorageSync('localFeedbacks') || []
          const filtered = remaining.filter(f => f.localId !== feedback.localId)
          wx.setStorageSync('localFeedbacks', filtered)
          console.log('[App] Local feedback uploaded successfully:', feedback.localId)
        }
      }).catch(err => {
        console.warn('[App] Retry failed for local feedback:', err)
      })
    })
  },

  onShow: function() {
    Tracker.appShow()
  },

  onHide: function() {
    Tracker.appHide()
  },

  initTracker: function() {
    const userId = wx.getStorageSync('userId') || ''
    Tracker.init(userId)
    Tracker.appLaunch()
  },

  initErrorMonitoring: function() {
    const originalError = wx.onError
    wx.onError = (error) => {
      console.error('[App] Error:', error)
      Tracker.systemError(error)
      
      if (originalError) {
        originalError(error)
      }
    }

    const originalUnhandledRejection = wx.onUnhandledRejection
    wx.onUnhandledRejection = (error) => {
      console.error('[App] Unhandled rejection:', error)
      Tracker.systemError(error)
      
      if (originalUnhandledRejection) {
        originalUnhandledRejection(error)
      }
    }
  },

  initPerformanceMonitoring: function() {
    const originalRequest = wx.request
    wx.request = (options) => {
      const startTime = Date.now()
      const url = options.url || ''
      const method = options.method || 'GET'
      
      const originalSuccess = options.success
      const originalFail = options.fail
      
      options.success = (res) => {
        const duration = Date.now() - startTime
        Tracker.apiCall(url, duration, true, res.statusCode)
        
        if (originalSuccess) {
          originalSuccess(res)
        }
      }
      
      options.fail = (err) => {
        const duration = Date.now() - startTime
        Tracker.networkError(url, method, err.statusCode || 0, err)
        
        if (originalFail) {
          originalFail(err)
        }
      }
      
      return originalRequest(options)
    }
  },

  globalData: {
    userInfo: null,
    isLoggedIn: false,
    goal: null,
    letters: [],
    messages: [],
    currentPage: 'chat',
    tracker: Tracker
  }
})
