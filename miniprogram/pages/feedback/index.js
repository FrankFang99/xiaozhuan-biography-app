const Tracker = require('../../utils/tracker.js')

Page({
  data: {
    feedbackType: 'suggestion',
    feedbackContent: '',
    contactInfo: '',
    isLoading: false,
    includeContext: true,
    contextPreview: '',
    feedbackTypes: [
      { value: 'suggestion', label: '功能建议', icon: '💡' },
      { value: 'bug', label: '问题反馈', icon: '🐛' },
      { value: 'complaint', label: '不满意', icon: '😔' },
      { value: 'praise', label: '表扬', icon: '👍' },
      { value: 'other', label: '其他', icon: '📝' }
    ]
  },

  onLoad: function(options) {
    Tracker.pageView('feedback')
    
    if (options && options.type) {
      this.setData({ feedbackType: options.type })
    }
    
    this.loadContextPreview()
  },

  loadContextPreview: function() {
    const messages = wx.getStorageSync('currentChatMessages') || []
    const recentMessages = messages.slice(-5)
    
    if (recentMessages.length > 0) {
      const preview = recentMessages.map(m => {
        const role = m.role === 'user' ? '用户' : 'AI'
        const content = m.content.length > 50 ? m.content.substring(0, 50) + '...' : m.content
        return `${role}: ${content}`
      }).join('\n')
      this.setData({ contextPreview: preview })
    }
  },

  onTypeChange: function(e) {
    this.setData({ feedbackType: e.currentTarget.dataset.value })
  },

  onContentInput: function(e) {
    this.setData({ feedbackContent: e.detail.value })
  },

  onContactInput: function(e) {
    this.setData({ contactInfo: e.detail.value })
  },

  onIncludeContextToggle: function() {
    this.setData({ includeContext: !this.data.includeContext })
  },

  onSubmit: function() {
    if (!this.data.feedbackContent.trim()) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }

    this.setData({ isLoading: true })
    
    const feedbackData = {
      type: this.data.feedbackType,
      content: this.data.feedbackContent.trim(),
      contactInfo: this.data.contactInfo.trim(),
      includeContext: this.data.includeContext,
      timestamp: new Date().toISOString(),
      userId: wx.getStorageSync('userId') || '',
      userInfo: wx.getStorageSync('userInfo') || {},
      goal: wx.getStorageSync('goal') || {}
    }

    if (this.data.includeContext) {
      feedbackData.context = this.getFullContext()
    }

    this.uploadFeedback(feedbackData)
      .then(result => {
        Tracker.feedbackSubmit(this.data.feedbackType, this.data.feedbackContent)
        
        if (result.status === 'uploaded') {
          wx.showToast({ title: '反馈提交成功', icon: 'success' })
        } else {
          wx.showToast({ title: '反馈已保存，网络恢复后自动上传', icon: 'none' })
        }
        
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      })
      .catch(err => {
        console.error('[Feedback] Upload failed:', err)
        wx.showToast({ title: '提交失败，请重试', icon: 'none' })
      })
      .finally(() => {
        this.setData({ isLoading: false })
      })
  },

  getFullContext: function() {
    const messages = wx.getStorageSync('currentChatMessages') || []
    const userMemory = wx.getStorageSync('userMemory') || {}
    const letters = wx.getStorageSync('letters') || []
    const biography = wx.getStorageSync('biography') || null
    
    return {
      messages: messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        time: m.time,
        timestamp: m.timestamp,
        type: m.type
      })),
      userMemory: {
        basicInfo: userMemory.basicInfo || {},
        preferences: userMemory.preferences || {},
        progress: userMemory.progress || {},
        history: userMemory.history || {}
      },
      letters: letters.length,
      biography: biography ? {
        id: biography.id,
        chapterCount: biography.chapters ? biography.chapters.length : 0,
        lastGeneratedAt: biography.lastGeneratedAt
      } : null,
      conversationCount: messages.filter(m => m.role === 'user').length,
      lastConversationTime: messages.length > 0 ? messages[messages.length - 1].timestamp : ''
    }
  },

  uploadFeedback: function(data) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'submitFeedback',
        data: {
          feedbackType: data.type,
          content: data.content,
          contact: data.contactInfo,
          includeContext: data.includeContext,
          contextData: data.context
        }
      }).then(res => {
        if (res.result && res.result.success) {
          this.clearLocalFeedbacks()
          resolve({ status: 'uploaded' })
        } else {
          this.saveToLocal(data)
          resolve({ status: 'saved_locally', error: res.result?.error })
        }
      }).catch(err => {
        console.warn('[Feedback] Cloud function failed, saving locally:', err)
        this.saveToLocal(data)
        resolve({ status: 'saved_locally', error: err.message })
      })
    })
  },

  saveToLocal: function(data) {
    const localFeedbacks = wx.getStorageSync('localFeedbacks') || []
    localFeedbacks.push({
      ...data,
      localId: Date.now().toString(),
      status: 'pending',
      savedAt: new Date().toISOString()
    })
    wx.setStorageSync('localFeedbacks', localFeedbacks)
  },

  clearLocalFeedbacks: function() {
    const localFeedbacks = wx.getStorageSync('localFeedbacks') || []
    if (localFeedbacks.length > 0) {
      this.retryLocalFeedbacks(localFeedbacks)
    }
  },

  retryLocalFeedbacks: function(feedbacks) {
    feedbacks.forEach(feedback => {
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
        }
      }).catch(err => {
        console.warn('[Feedback] Retry failed for local feedback:', err)
      })
    })
  },

  onCancel: function() {
    wx.navigateBack()
  }
})