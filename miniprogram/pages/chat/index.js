const { callLLM, extractMemory, STRUCTURE_CONFIG } = require('../../utils/llm.js')
const Tracker = require('../../utils/tracker.js')
const { generateBiographyFromMemory, generateBiographyAgent } = require('../../utils/biographyGenerator.js')
const { TEST_ELDERS } = require('../../data/testElders.js')

Page({
  data: {
    messages: [],
    inputText: '',
    scrollTop: 0,
    scrollHeight: 0,
    scrollDirection: 'down',
    goal: null,
    isLoading: false,
    hasNotification: false,
    notifications: [],
    userMemory: null,
    currentLetterCount: 0,
    targetLetterCount: 5,
    progressPercent: 0,
    daysRemaining: 0,
    userAvatar: '',
    userNickName: '',
    currentStage: 'childhood',
    stageName: '童年记忆',
    conversationPhase: 'trust_building',
    isRecording: false,
    recordingDuration: 0,
    showVoiceTutorial: false,
    inputMode: 'voice',
    fontSize: 'medium',
    suggestedQuestions: [],
    usedQuestions: [],
    showFloatHeader: false,
    showTestElders: false,
    testElders: [],
    currentTestElder: {},
    isTestMode: false,
    showTutorial: false,
    hasCompletedTutorial: false
  },
  
  recorderManager: null,
  recordingTimer: null,
  speechManager: null,
  floatHeaderTimer: null,
  lastScrollTop: 0,

  onLoad: function() {
    const goal = wx.getStorageSync('goal')
    const notifications = wx.getStorageSync('notifications') || []
    const messages = wx.getStorageSync('currentChatMessages') || []
    
    Tracker.init(wx.getStorageSync('userId'))
    Tracker.pageView('chat')
    const userMemory = wx.getStorageSync('userMemory') || this.getDefaultMemory()
    const letters = wx.getStorageSync('letters') || []
    const userInfo = wx.getStorageSync('userInfo') || {}
    
    const stages = this.getStages(goal)
    const currentStage = stages.find(s => s.id === userMemory.progress.currentPhase) || stages[0]
    
    const targetLetterCount = goal ? parseInt(goal.letterCount || goal.targetLetterCount) || 5 : 5
      const progressPercent = Math.round((letters.length / targetLetterCount) * 100)
      const daysRemaining = this.calculateDaysRemaining(goal)
      
      const hasCompletedTutorial = wx.getStorageSync('hasCompletedTutorial') || false
      
      const conversationPhase = userMemory.progress.conversationPhase || 'trust_building'
    const showVoiceTutorial = !userMemory.hasSeenVoiceTutorial && !hasCompletedTutorial
    
    this.setData({ 
      goal, 
      notifications: notifications.slice(0, 3),
      hasNotification: notifications.length > 0,
      messages,
      currentLetterCount: letters.length,
      targetLetterCount,
      progressPercent,
      daysRemaining,
      userAvatar: userInfo.avatarUrl || '',
      userNickName: userInfo.nickName || '',
      currentStage: currentStage.id,
      stageName: currentStage.name,
      conversationPhase,
      showVoiceTutorial,
      showFloatHeader: false,
      showTutorial: !hasCompletedTutorial,
      hasCompletedTutorial
    }, () => {
      this.calculateScrollHeight()
      
      if (messages.length === 0) {
        this.initConversation()
      } else {
        setTimeout(() => {
          this.scrollToBottom()
        }, 50)
      }
    })
    
    this.initRecorder()
    this.getSuggestedQuestions()
    
    this.resetFloatHeaderTimer()
  },
  
  calculateScrollHeight: function() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    const windowHeight = windowInfo.windowHeight
    
    const headerHeight = 140
    const inputHeight = 70
    const tabBarHeight = 70
    
    const scrollHeight = windowHeight - headerHeight - inputHeight - tabBarHeight
    this.setData({ scrollHeight })
  },
  
  initRecorder: function() {
    this.recorderManager = wx.getRecorderManager()
    
    try {
      const plugin = requirePlugin('WechatSI')
      this.speechManager = plugin.getRecordRecognitionManager()
      
      this.speechManager.onStart = () => {
        this.setData({ isRecording: true, recordingDuration: 0 })
        this.startRecordingTimer()
      }
      
      this.speechManager.onStop = (res) => {
        this.stopRecordingTimer()
        this.setData({ isRecording: false })
        
        if (res.result && res.result.length > 0) {
          this.setData({ inputText: res.result })
          this.onSend()
        } else {
          wx.showToast({ title: '未识别到语音', icon: 'none' })
        }
      }
      
      this.speechManager.onError = (err) => {
        this.stopRecordingTimer()
        this.setData({ isRecording: false })
        console.error('Speech recognition error:', err)
        wx.showToast({ title: '语音识别失败，请重试', icon: 'none' })
      }
      
      console.log('微信同声传译插件初始化成功')
    } catch (e) {
      this.speechManager = null
    }
    
    this.recorderManager.onStart(() => {
      this.setData({ isRecording: true, recordingDuration: 0 })
      this.startRecordingTimer()
      Tracker.recordingStart()
    })
    
    this.recorderManager.onStop((res) => {
      this.stopRecordingTimer()
      this.setData({ isRecording: false })
      Tracker.recordingEnd(res.duration)
      
      if (res.duration > 0) {
        this.handleRecordingResult(res)
      } else {
        wx.showToast({ title: '录音时间太短', icon: 'none' })
      }
    })
    
    this.recorderManager.onError((err) => {
      this.stopRecordingTimer()
      this.setData({ isRecording: false })
      console.error('Recording error:', err)
      wx.showToast({ title: '录音失败，请重试', icon: 'none' })
    })
  },
  
  startRecordingTimer: function() {
    this.recordingTimer = setInterval(() => {
      this.setData({ recordingDuration: this.data.recordingDuration + 1 })
    }, 1000)
  },
  
  stopRecordingTimer: function() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer)
      this.recordingTimer = null
    }
  },
  
  onTouchStart: function(e) {
    if (this.data.inputMode !== 'voice') return
    if (this.data.isLoading) return
    if (this.data.isRecording) return
    
    e.preventDefault()
    
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              this.startRecording()
            },
            fail: () => {
              wx.showModal({
                title: '需要录音权限',
                content: '请在设置中允许录音权限，以便使用语音输入功能',
                showCancel: false
              })
            }
          })
        } else {
          this.startRecording()
        }
      }
    })
  },
  
  startRecording: function() {
    if (this.speechManager) {
      try {
        this.speechManager.start({
          lang: 'zh_CN'
        })
        return
      } catch (e) {
        console.error('Speech manager start error:', e)
      }
    }
    
    this.recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    })
  },
  
  onTouchEnd: function(e) {
    if (this.data.inputMode !== 'voice') return
    if (this.data.isRecording) {
      if (this.speechManager) {
        try {
          this.speechManager.stop()
          return
        } catch (e) {}
      }
      this.recorderManager.stop()
    }
  },
  
  onTouchCancel: function() {
    if (this.data.inputMode !== 'voice') return
    if (this.data.isRecording) {
      if (this.speechManager) {
        try {
          this.speechManager.stop()
          return
        } catch (e) {}
      }
      this.recorderManager.stop()
    }
  },
  
  onMouseDown: function(e) {
    this.onTouchStart(e)
  },
  
  onMouseUp: function(e) {
    this.onTouchEnd(e)
  },
  
  handleRecordingResult: function(res) {
    wx.showLoading({ title: '识别中...' })
    
    const fileExtension = res.tempFilePath.split('.').pop()
    
    wx.getStorage({
      key: 'serverConfig',
      success: (configRes) => {
        const speechUrl = configRes.data?.speechUrl || ''
        if (speechUrl) {
          this.uploadToServerAndRecognize(res.tempFilePath, fileExtension, speechUrl)
        } else {
          this.handleRecordingFallback()
        }
      },
      fail: () => {
        this.handleRecordingFallback()
      }
    })
  },
  
  uploadToServerAndRecognize: function(filePath, fileExtension, serverUrl) {
    wx.uploadFile({
      url: serverUrl,
      filePath: filePath,
      name: 'file',
      formData: {
        filename: `voice/${Date.now()}.${fileExtension}`
      },
      success: (res) => {
        wx.hideLoading()
        try {
          const data = JSON.parse(res.data)
          if (data.text) {
            this.setData({ inputText: data.text })
            this.onSend()
          } else {
            throw new Error('识别结果格式错误')
          }
        } catch (e) {
          console.error('解析识别结果失败:', e)
          wx.showToast({ title: '识别失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.hideLoading()
        this.handleRecordingFallback()
      }
    })
  },
  
  handleRecordingFallback: function() {
    wx.hideLoading()
    wx.showModal({
      title: '语音识别',
      content: '当前环境不支持语音识别，是否切换到文字输入？',
      confirmText: '切换文字',
      cancelText: '取消',
      success: (modalRes) => {
        if (modalRes.confirm) {
          this.setData({ inputMode: 'text' })
        }
      }
    })
  },
  
  onToggleInputMode: function() {
    const fromMode = this.data.inputMode
    const toMode = fromMode === 'voice' ? 'text' : 'voice'
    this.setData({ inputMode: toMode })
    Tracker.modeSwitch(fromMode, toMode)
  },

  onShow: function() {
    const notifications = wx.getStorageSync('notifications') || []
    const letters = wx.getStorageSync('letters') || []
    const userMemory = wx.getStorageSync('userMemory') || this.getDefaultMemory()
    const goal = wx.getStorageSync('goal')
    const userInfo = wx.getStorageSync('userInfo') || {}
    
    const stages = this.getStages(goal)
    const currentStage = stages.find(s => s.id === userMemory.progress.currentPhase) || stages[0]
    
    let avatarUrl = userInfo.avatarUrl || ''
    if (avatarUrl.startsWith('wxfile://')) {
      avatarUrl = ''
      if (userInfo.id) {
        const updatedUserInfo = { ...userInfo, avatarUrl: '' }
        wx.setStorageSync('userInfo', updatedUserInfo)
      }
    }
    
    this.setData({ 
      notifications: notifications.slice(0, 3),
      hasNotification: notifications.length > 0,
      currentLetterCount: letters.length,
      currentStage: currentStage.id,
      stageName: currentStage.name,
      conversationPhase: userMemory.progress.conversationPhase || 'trust_building',
      goal,
      userAvatar: avatarUrl,
      userNickName: userInfo.nickName || ''
    })

    this.updateTabBar()
  },

  updateTabBar: function() {
    try {
      const tabBar = this.getTabBar()
      if (tabBar && typeof tabBar.updateCurrentIndex === 'function') {
        tabBar.updateCurrentIndex()
      }
    } catch (e) {
      console.warn('[Chat] Failed to update tabBar:', e)
    }
  },

  getStages: function(goal) {
    const structureType = goal && goal.structure ? goal.structure : 'timeline'
    const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline
    return config.stages
  },

  getDefaultMemory: function() {
    return {
      basicInfo: { birthPlace: '', birthDate: '', occupation: '', hobbies: [], familyMembers: [], education: '', workExperience: '' },
      preferences: { topics: [], conversationStyle: 'warm', questionFrequency: 'low', favoriteTopics: [], avoidTopics: [] },
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
      history: { totalConversations: 0, lastConversationTime: '', keyMemories: [] },
      hasSeenVoiceTutorial: false
    }
  },

  initConversation: function() {
    const goal = this.data.goal
    const userMemory = this.data.userMemory
    const stageName = this.data.stageName
    const hasMemory = userMemory.basicInfo.birthPlace || userMemory.basicInfo.occupation || userMemory.preferences.favoriteTopics.length > 0
    const conversationPhase = userMemory.progress.conversationPhase
    
    let greeting = ''
    if (goal && hasMemory && conversationPhase === 'deep_collection') {
      greeting = `您好！又见面了。今天我们来聊聊${stageName}的故事，您准备好了吗？`
    } else if (goal && hasMemory) {
      greeting = `您好！又见面了。今天天气真不错，您感觉怎么样？我们先随便聊聊吧。`
    } else if (goal) {
      greeting = `您好！我是${goal.name}的专属聊天伙伴。很高兴认识您！今天先不聊别的，就想问问您今天过得怎么样？`
    } else {
      greeting = `您好！我是您的专属聊天伙伴。很高兴认识您！今天先不聊别的，就想问问您今天过得怎么样？`
    }
    
    const aiMessage = {
      id: 'ai_' + Date.now(),
      role: 'ai',
      content: greeting,
      time: this.formatTime(new Date()),
      timestamp: new Date().toISOString()
    }
    
    this.setData({ 
      messages: [aiMessage]
    }, () => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    })
  },
  
  onCloseVoiceTutorial: function() {
    this.setData({ showVoiceTutorial: false })
    const userMemory = this.data.userMemory
    userMemory.hasSeenVoiceTutorial = true
    wx.setStorageSync('userMemory', userMemory)
    Tracker.tutorialClose('voice_tutorial')
  },
  
  stopPropagation: function() {
  },

  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  },

  calculateDaysRemaining: function(goal) {
    if (!goal || !goal.startDate) return 0
    
    const startDate = new Date(goal.startDate)
    const now = new Date()
    let daysRemaining = 0
    
    const timeType = goal.targetTime || goal.time
    
    switch (timeType) {
      case 'week':
        daysRemaining = Math.max(0, 7 - Math.floor((now - startDate) / (1000 * 60 * 60 * 24)))
        break
      case 'month':
        daysRemaining = Math.max(0, 30 - Math.floor((now - startDate) / (1000 * 60 * 60 * 24)))
        break
      case 'unlimited':
        return 0
    }
    
    return daysRemaining
  },

  scrollToBottom: function() {
    const messages = this.data.messages
    if (messages.length > 0) {
      const lastMessageId = messages[messages.length - 1].id
      this.setData({ scrollToId: 'msg-' + lastMessageId })
    }
  },

  onScroll: function(e) {
    const scrollTop = e.detail.scrollTop
    const direction = scrollTop < this.lastScrollTop ? 'up' : 'down'
    
    this.setData({ scrollDirection: direction })
    
    if (direction === 'up' && scrollTop < this.lastScrollTop - 50 && !this.data.showFloatHeader) {
      this.setData({ showFloatHeader: true })
    } else if (direction === 'down' && scrollTop > this.lastScrollTop + 50) {
      this.setData({ showFloatHeader: false })
    }
    
    this.resetFloatHeaderTimer()
    this.lastScrollTop = scrollTop
  },

  resetFloatHeaderTimer: function() {
    if (this.floatHeaderTimer) {
      clearTimeout(this.floatHeaderTimer)
    }
    
    this.floatHeaderTimer = setTimeout(() => {
      this.setData({ showFloatHeader: false })
    }, 10000)
  },

  onInput: function(e) {
    const MAX_INPUT_LENGTH = 2000
    let value = e.detail.value
    if (value.length > MAX_INPUT_LENGTH) {
      value = value.substring(0, MAX_INPUT_LENGTH)
      wx.showToast({ title: `输入已达${MAX_INPUT_LENGTH}字上限`, icon: 'none' })
    }
    this.setData({ inputText: value })
    if (this.data.showFloatHeader) {
      this.resetFloatHeaderTimer()
    }
  },

  isBiographyIntent: function(text) {
    const biographyTriggers = [
      ['传记', '生成'],
      ['传记', '查看'],
      ['传记', '写'],
      ['我的', '故事'],
      ['人生', '故事'],
      ['成果'],
      ['作品'],
      ['想看', '传记'],
      ['要', '传记']
    ]
    
    const regenerateTriggers = [
      ['传记', '重新'],
      ['传记', '修改'],
      ['传记', '调整'],
      ['不满意', '传记'],
      ['传记', '不满意'],
      ['太长', '传记'],
      ['太短', '传记'],
      ['传记', '太长'],
      ['传记', '太短'],
      ['补充', '传记'],
      ['传记', '补充']
    ]
    
    for (const trigger of biographyTriggers) {
      const allMatch = trigger.every(k => text.includes(k))
      if (allMatch) return 'generate'
    }
    
    for (const trigger of regenerateTriggers) {
      const allMatch = trigger.every(k => text.includes(k))
      if (allMatch) return 'regenerate'
    }
    
    if (text.includes('传记') && text.length < 15) {
      return 'generate'
    }
    
    return null
  },

  isFeedbackIntent: function(text) {
    const feedbackTriggers = [
      ['反馈'],
      ['意见'],
      ['建议'],
      ['投诉'],
      ['问题'],
      ['bug'],
      ['报错'],
      ['有问题'],
      ['不满意'],
      ['改进'],
      ['优化'],
      ['功能', '建议'],
      ['给', '建议'],
      ['提', '意见'],
      ['反馈', '问题'],
      ['报告', '问题'],
      ['帮助', '中心'],
      ['联系', '客服'],
      ['联系', '我们']
    ]
    
    for (const trigger of feedbackTriggers) {
      const allMatch = trigger.every(k => text.includes(k))
      if (allMatch) return true
    }
    
    return false
  },

  onSend: async function() {
    const { inputText, messages, goal } = this.data
    const userMemory = wx.getStorageSync('userMemory') || this.getDefaultMemory()
    if (!inputText.trim()) return

    Tracker.sendMessage(inputText.trim(), this.data.inputMode)

    const userMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: inputText.trim(),
      time: this.formatTime(new Date()),
      timestamp: new Date().toISOString()
    }

    const newMessages = [...messages, userMessage]
    this.setData({ 
      messages: newMessages,
      inputText: '',
      isLoading: true,
      scrollToId: 'msg-' + userMessage.id
    })

    const biographyIntent = this.isBiographyIntent(inputText.trim())
    if (biographyIntent) {
      this.handleBiographyRequest(biographyIntent, inputText.trim(), newMessages)
      return
    }

    const feedbackIntent = this.isFeedbackIntent(inputText.trim())
    if (feedbackIntent) {
      this.handleFeedbackRequest(newMessages)
      return
    }

    callLLM(newMessages, goal, userMemory, true)
      .then(content => {
        this.setData({ isLoading: false })
        
        Tracker.messageReceive(content)
        
        const aiMessage = {
          id: 'ai_' + Date.now(),
          role: 'ai',
          content: content,
          time: this.formatTime(new Date()),
          timestamp: new Date().toISOString()
        }
        
        const updatedMessages = [...newMessages, aiMessage]
        this.setData({ 
          messages: updatedMessages,
          scrollToId: 'msg-' + aiMessage.id
        })
        wx.setStorageSync('currentChatMessages', updatedMessages)

        this.extractMemory(updatedMessages)

        if (inputText.trim() === '结束' || inputText.trim() === '停止' || inputText.trim() === '保存') {
          this.saveLetter(updatedMessages)
        }

        if (this.data.isTestMode && this.data.currentTestElder) {
          setTimeout(() => {
            this.generateElderResponse(updatedMessages)
          }, 2000)
        }
      })
      .catch(err => {
        this.setData({ isLoading: false })
        console.error('LLM call error:', err)
        Tracker.error(err.message || 'LLM call failed', 'api_error')
        
        if (err.message && err.message.includes('API Token 未配置')) {
          wx.showModal({
            title: 'API Token 未配置',
            content: '请先在"我的"页面配置 Minimax Token Plan 订阅 Key',
            confirmText: '去配置',
            success: (res) => {
              if (res.confirm) {
                wx.switchTab({ url: '/pages/my/index' })
              }
            }
          })
        } else {
          wx.showToast({ title: '网络错误，请重试', icon: 'none' })
          
          const fallbackMessage = {
            id: 'ai_' + Date.now(),
            role: 'ai',
            content: '抱歉，网络不太稳定，可以再说一遍吗？',
            time: this.formatTime(new Date()),
            timestamp: new Date().toISOString()
          }
          
          this.setData({ 
            messages: [...newMessages, fallbackMessage],
            scrollTop: 999999
          })
        }
      })
  },

  handleBiographyRequest: function(intent, userText, messages) {
    const { goal, userMemory } = this.data
    
    wx.showLoading({ title: '正在生成传记...' })
    
    const letters = wx.getStorageSync('letters') || []
    
    const options = {}
    if (intent === 'regenerate') {
      options.feedback = userText
      console.log('[Biography] Regenerating with feedback:', userText)
    }
    
    generateBiographyAgent(userMemory, goal, letters, options)
      .then(biography => {
        wx.hideLoading()
        
        wx.setStorageSync('biography', biography)
        
        let chaptersText = biography.chapters.map((c, i) => {
          return `\n${i + 1}. ${c.title}（${c.year}）\n${c.content}\n「${c.quote || ''}」`
        }).join('\n')
        
        let responseText = `好的！我已经为您生成了完整的人生传记：\n\n${biography.intro}\n\n${chaptersText}\n\n${biography.ending}`
        
        if (responseText.length > 2000) {
          responseText = `好的！我已经为您生成了完整的人生传记，包含${biography.chapters.length}个章节。\n\n${biography.intro}\n\n📖 章节列表：\n${biography.chapters.map((c, i) => `${i + 1}. ${c.title}（${c.year}）`).join('\n')}\n\n${biography.ending}\n\n👉 点击底部"我的"可以查看完整传记内容，或者您可以告诉我想要修改哪里。`
        }
        
        const aiMessage = {
          id: 'ai_' + Date.now(),
          role: 'ai',
          content: responseText,
          time: this.formatTime(new Date()),
          timestamp: new Date().toISOString(),
          type: 'biography'
        }
        
        const updatedMessages = [...messages, aiMessage]
        this.setData({ 
          messages: updatedMessages,
          isLoading: false,
          scrollTop: 999999
        })
        wx.setStorageSync('currentChatMessages', updatedMessages)
        
        wx.showModal({
          title: '传记生成完成',
          content: '您的人生传记已生成！可以点击"我的"查看完整内容，或者告诉我您的修改意见。',
          confirmText: '去查看',
          cancelText: '继续修改',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({ url: '/pages/profile/index' })
            }
          }
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.error('[Biography] Generation error:', err)
        
        this.setData({ isLoading: false })
        
        wx.showToast({ title: '传记生成失败，请重试', icon: 'none' })
        
        const fallbackMessage = {
          id: 'ai_' + Date.now(),
          role: 'ai',
          content: '抱歉，传记生成遇到了一些问题。请稍后再试，或者您可以告诉我具体想要什么样的传记内容。',
          time: this.formatTime(new Date()),
          timestamp: new Date().toISOString()
        }
        
        this.setData({ 
          messages: [...messages, fallbackMessage],
          scrollTop: 999999
        })
        wx.setStorageSync('currentChatMessages', [...messages, fallbackMessage])
      })
  },

  handleFeedbackRequest: function(messages) {
    this.setData({ isLoading: false })
    
    const aiMessage = {
      id: 'ai_' + Date.now(),
      role: 'ai',
      content: '非常感谢您的反馈！我们非常重视您的意见。\n\n您可以告诉我具体的问题或建议，或者点击下方按钮进入反馈页面，我们会记录完整的对话上下文以便更好地帮助您。',
      time: this.formatTime(new Date()),
      timestamp: new Date().toISOString(),
      type: 'feedback'
    }
    
    const updatedMessages = [...messages, aiMessage]
    this.setData({ 
      messages: updatedMessages,
      scrollTop: 999999
    })
    wx.setStorageSync('currentChatMessages', updatedMessages)
    
    wx.showModal({
      title: '用户反馈',
      content: '感谢您的反馈！我们会认真对待每一条建议。是否进入反馈页面提交详细内容？',
      confirmText: '去反馈',
      cancelText: '继续聊天',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/feedback/index' })
        }
      }
    })
  },

  extractMemory: function(messages) {
    const userMemory = this.data.userMemory
    
    extractMemory(messages, userMemory, true)
      .then(extracted => {
        this.updateUserMemory(extracted)
      })
      .catch(err => {
        console.error('Extract memory error:', err)
      })
  },

  updateUserMemory: function(extracted) {
    let userMemory = this.data.userMemory
    
    if (extracted.basicInfo) {
      if (extracted.basicInfo.birthPlace && !userMemory.basicInfo.birthPlace) {
        userMemory.basicInfo.birthPlace = extracted.basicInfo.birthPlace
      }
      if (extracted.basicInfo.birthDate && !userMemory.basicInfo.birthDate) {
        userMemory.basicInfo.birthDate = extracted.basicInfo.birthDate
      }
      if (extracted.basicInfo.occupation && !userMemory.basicInfo.occupation) {
        userMemory.basicInfo.occupation = extracted.basicInfo.occupation
      }
      if (extracted.basicInfo.education && !userMemory.basicInfo.education) {
        userMemory.basicInfo.education = extracted.basicInfo.education
      }
      if (extracted.basicInfo.workExperience && !userMemory.basicInfo.workExperience) {
        userMemory.basicInfo.workExperience = extracted.basicInfo.workExperience
      }
      if (extracted.basicInfo.hobbies && extracted.basicInfo.hobbies.length > 0) {
        extracted.basicInfo.hobbies.forEach(hobby => {
          if (!userMemory.basicInfo.hobbies.includes(hobby)) {
            userMemory.basicInfo.hobbies.push(hobby)
          }
        })
      }
      if (extracted.basicInfo.familyMembers && extracted.basicInfo.familyMembers.length > 0) {
        extracted.basicInfo.familyMembers.forEach(member => {
          if (!userMemory.basicInfo.familyMembers.includes(member)) {
            userMemory.basicInfo.familyMembers.push(member)
          }
        })
      }
    }
    
    if (extracted.preferences) {
      if (extracted.preferences.favoriteTopics && extracted.preferences.favoriteTopics.length > 0) {
        extracted.preferences.favoriteTopics.forEach(topic => {
          if (!userMemory.preferences.favoriteTopics.includes(topic)) {
            userMemory.preferences.favoriteTopics.push(topic)
          }
        })
      }
      if (extracted.preferences.avoidTopics && extracted.preferences.avoidTopics.length > 0) {
        extracted.preferences.avoidTopics.forEach(topic => {
          if (!userMemory.preferences.avoidTopics.includes(topic)) {
            userMemory.preferences.avoidTopics.push(topic)
          }
        })
      }
    }
    
    if (extracted.keyMemories && extracted.keyMemories.length > 0) {
      extracted.keyMemories.forEach(memory => {
        if (!userMemory.history.keyMemories.includes(memory)) {
          userMemory.history.keyMemories.push(memory)
        }
      })
    }
    
    userMemory.history.totalConversations++
    userMemory.history.lastConversationTime = new Date().toISOString()
    
    this.updateConversationPhase(userMemory)
    
    this.setData({ 
      userMemory,
      conversationPhase: userMemory.progress.conversationPhase || 'trust_building'
    })
    wx.setStorageSync('userMemory', userMemory)
  },
  
  updateConversationPhase: function(userMemory) {
    const phase = userMemory.progress.conversationPhase
    userMemory.progress.exchangesInCurrentPhase++
    
    const exchanges = userMemory.progress.exchangesInCurrentPhase
    
    if (phase === 'trust_building' && exchanges >= 4) {
      userMemory.progress.conversationPhase = 'interest_exploration'
      userMemory.progress.exchangesInCurrentPhase = 0
    } else if (phase === 'interest_exploration' && exchanges >= 3) {
      userMemory.progress.conversationPhase = 'deep_collection'
      userMemory.progress.exchangesInCurrentPhase = 0
    }
  },

  saveLetter: function(messages) {
    const goal = this.data.goal
    const stageName = this.data.stageName
    const content = messages.map(m => (m.role === 'ai' ? 'AI：' : '用户：') + m.content).join('\n')
    const now = new Date()
    
    const letter = {
      id: 'letter_' + Date.now(),
      date: `${now.getMonth() + 1}月${now.getDate()}日`,
      time: this.formatTime(now),
      title: stageName,
      content: content,
      chapter: stageName,
      chapterId: this.data.currentStage,
      createdAt: now.toISOString()
    }

    const letters = wx.getStorageSync('letters') || []
    letters.unshift(letter)
    wx.setStorageSync('letters', letters)
    
    const backupMessages = wx.getStorageSync('chatMessagesBackup') || []
    backupMessages.push({
      stage: stageName,
      timestamp: now.toISOString(),
      messages: [...messages]
    })
    wx.setStorageSync('chatMessagesBackup', backupMessages)
    
    wx.removeStorageSync('currentChatMessages')

    const userMemory = this.data.userMemory
    userMemory.progress.currentLetterCount = letters.length
    
    const stages = this.getStages(goal)
    const currentStageIndex = stages.findIndex(s => s.id === userMemory.progress.currentPhase)
    if (currentStageIndex < stages.length - 1) {
      const nextStage = stages[currentStageIndex + 1]
      userMemory.progress.currentPhase = nextStage.id
      this.setData({ 
        currentStage: nextStage.id,
        stageName: nextStage.name
      })
      this.addNotification('阶段更新', `已完成${stageName}，下一阶段：${nextStage.name}`)
    }
    
    const progressPercent = Math.round((letters.length / this.data.targetLetterCount) * 100)
    const daysRemaining = this.calculateDaysRemaining(goal)
    
    this.setData({ 
      userMemory, 
      currentLetterCount: letters.length,
      progressPercent,
      daysRemaining
    })
    wx.setStorageSync('userMemory', userMemory)

    this.addNotification('新信件', `您的新信件"${stageName}"已保存到信夹`)

    this.showChapterCompleteToast(stageName)

    this.checkBiographyComplete()
  },

  getLetterCount: function() {
    const letters = wx.getStorageSync('letters') || []
    return letters.length
  },

  checkBiographyComplete: function() {
    const letters = wx.getStorageSync('letters') || []
    const userMemory = this.data.userMemory
    const targetCount = userMemory.progress.targetLetterCount || 5
    
    if (letters.length >= targetCount) {
      const goal = wx.getStorageSync('goal')
      
      wx.showLoading({ title: '正在生成传记...' })
      
      generateBiographyAgent(userMemory, goal, letters)
        .then(biography => {
          wx.hideLoading()
          
          wx.setStorageSync('biography', biography)
          this.addNotification('传记完成', `${goal.name || '用户'}的传记已完成！`)
          
          wx.showModal({
            title: '🎊 传记完成',
            content: `恭喜您！${goal.name || '用户'}的人生传记已经完成。\n\n这是一部根据您的真实记忆和对话精心撰写的完整传记，包含多个章节、金句、时间线和家人视角。\n\n快去查看您的人生故事吧！`,
            showCancel: false,
            confirmText: '去查看',
            success: () => {
              wx.switchTab({ 
                url: '/pages/profile/index' 
              })
            }
          })
        })
        .catch(err => {
          wx.hideLoading()
          console.error('Biography generation error:', err)
          
          generateBiographyFromMemory(userMemory, goal)
            .then(biography => {
              wx.setStorageSync('biography', biography)
              this.addNotification('传记完成', `${goal.name || '用户'}的传记已完成！`)
              
              wx.showModal({
                title: '🎊 传记完成',
                content: `${goal.name || '用户'}的人生传记已经完成，快去传记宇宙查看吧！`,
                showCancel: false,
                confirmText: '去查看',
                success: () => {
                  wx.switchTab({ 
                    url: '/pages/profile/index' 
                  })
                }
              })
            })
            .catch(fallbackErr => {
              const fallbackBiography = {
                id: 'bio_' + Date.now(),
                userId: wx.getStorageSync('userInfo').id || '',
                goalId: goal.id || '',
                title: `${goal.name || '用户'}的传记`,
                content: this.generateBiography(letters),
                status: 'completed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              
              wx.setStorageSync('biography', fallbackBiography)
              this.addNotification('传记完成', `${goal.name || '用户'}的传记已完成！`)
              
              wx.showToast({ title: '传记已完成', icon: 'success' })
            })
        })
    }
  },

  generateBiography: function(letters) {
    const goal = wx.getStorageSync('goal')
    const userMemory = wx.getStorageSync('userMemory')
    const structureType = goal && goal.structure ? goal.structure : 'timeline'
    const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline
    
    let biography = `# ${goal.name || '用户'}的传记\n\n`
    
    if (structureType === 'timeline') {
      biography += `## 序章\n\n亲爱的读者，这本传记按照时间顺序，记录了${goal.name || '一位平凡老人'}的一生。每一段文字，都是时光的印记；每一个故事，都是生命的馈赠。让我们一起走进${goal.name || '这位老人'}的人生旅程。\n\n`
    } else {
      biography += `## 序章\n\n亲爱的读者，这本传记通过一个个重要的人生事件，记录了${goal.name || '一位平凡老人'}的一生。每一段文字，都是时光的印记；每一个故事，都是生命的馈赠。让我们一起走进${goal.name || '这位老人'}的人生旅程。\n\n`
    }
    
    if (userMemory && userMemory.basicInfo) {
      const info = userMemory.basicInfo
      biography += `## 基本信息\n\n`
      if (info.birthPlace) biography += `出生地点：${info.birthPlace}\n\n`
      if (info.birthDate) biography += `出生日期：${info.birthDate}\n\n`
      if (info.occupation) biography += `职业：${info.occupation}\n\n`
      if (info.hobbies.length > 0) biography += `爱好：${info.hobbies.join('、')}\n\n`
      if (info.familyMembers.length > 0) biography += `家庭成员：${info.familyMembers.join('、')}\n\n`
    }
    
    const stageOrder = config.stages.map(s => s.name)
    const sortedLetters = [...letters].sort((a, b) => {
      const indexA = stageOrder.indexOf(a.chapter)
      const indexB = stageOrder.indexOf(b.chapter)
      return indexA === -1 ? 1 : indexB === -1 ? -1 : indexA - indexB
    })
    
    sortedLetters.forEach((letter, index) => {
      biography += `## ${letter.chapter}\n\n${letter.content}\n\n`
    })
    
    if (userMemory && userMemory.history && userMemory.history.keyMemories && userMemory.history.keyMemories.length > 0) {
      biography += `## 珍贵记忆\n\n`
      userMemory.history.keyMemories.forEach((memory, index) => {
        biography += `${index + 1}. ${memory}\n\n`
      })
    }
    
    biography += `## 结语\n\n这本传记记录了${goal.name || '老人'}平凡而精彩的一生。每一个平凡的人，都有属于自己的故事。让我们铭记这些珍贵的记忆，让平凡的人生，在时光里永远闪耀。\n\n感谢${goal.name || '老人'}愿意分享这些故事，也感谢您愿意聆听。愿这本传记成为一份永恒的礼物，传递给下一代。`
    
    return biography
  },

  addNotification: function(type, text) {
    const notifications = wx.getStorageSync('notifications') || []
    notifications.unshift({
      id: 'notif_' + Date.now(),
      type: type,
      text: text,
      time: this.formatTime(new Date()),
      read: false
    })
    wx.setStorageSync('notifications', notifications.slice(0, 10))
  },

  onClearNotification: function() {
    wx.removeStorageSync('notifications')
    this.setData({ notifications: [], hasNotification: false })
  },

  getSuggestedQuestions: function() {
    const goal = this.data.goal
    const structureType = goal && goal.structure ? goal.structure : 'timeline'
    const config = STRUCTURE_CONFIG[structureType] || STRUCTURE_CONFIG.timeline
    const stages = config.stages
    const currentStage = stages.find(s => s.id === this.data.currentStage)
    
    let allQuestions = []
    if (currentStage) {
      allQuestions = [...currentStage.questions]
    }
    
    const remainingStages = stages.slice(stages.indexOf(currentStage) + 1)
    remainingStages.forEach(stage => {
      allQuestions = [...allQuestions, ...stage.questions]
    })
    
    const usedQuestions = this.data.usedQuestions
    const availableQuestions = allQuestions.filter(q => !usedQuestions.includes(q))
    
    const shuffled = availableQuestions.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 3)
    
    this.setData({ 
      suggestedQuestions: selected,
      usedQuestions: [...usedQuestions, ...selected]
    }, () => {
      setTimeout(() => {
        this.scrollToBottom(true)
      }, 100)
    })
  },

  onRefreshQuestions: function() {
    this.getSuggestedQuestions()
    wx.showToast({ title: '已更换问题', icon: 'success' })
  },

  onSelectQuestion: function(e) {
    const question = e.currentTarget.dataset.question
    const enhancedQuestion = `我想聊一聊：${question}，你能围绕这个话题继续问我吗？`
    this.setData({ inputText: enhancedQuestion })
    this.onSend()
  },

  onToggleFontSize: function() {
    const sizes = ['small', 'medium', 'large']
    const currentIndex = sizes.indexOf(this.data.fontSize)
    const nextIndex = (currentIndex + 1) % sizes.length
    const newSize = sizes[nextIndex]
    
    this.setData({ fontSize: newSize })
    wx.setStorageSync('fontSize', newSize)
    
    const sizeNames = { small: '小', medium: '中', large: '大' }
    wx.showToast({ title: `字体已切换为${sizeNames[newSize]}号`, icon: 'none' })
  },

  onUserAvatarError: function() {
    this.setData({ userAvatar: '' })
  },

  getStages: function(goal) {
    const structureType = goal && goal.structure ? goal.structure : 'timeline'
    return STRUCTURE_CONFIG[structureType] ? STRUCTURE_CONFIG[structureType].stages : STRUCTURE_CONFIG.timeline.stages
  },

  getDefaultMemory: function() {
    return {
      basicInfo: { birthPlace: '', birthDate: '', occupation: '', hobbies: [], familyMembers: [], education: '', workExperience: '' },
      preferences: { topics: [], conversationStyle: 'warm', questionFrequency: 'low', favoriteTopics: [], avoidTopics: [] },
      progress: { totalQuestions: 24, answeredQuestions: [], currentPhase: 'childhood', daysRemaining: 30, conversationPhase: 'trust_building', exchangesInCurrentPhase: 0 },
      history: { totalConversations: 0, lastConversationTime: '', keyMemories: [] },
      hasSeenVoiceTutorial: false
    }
  },

  generateElderResponse: function(messages) {
    const elder = this.data.currentTestElder
    if (!elder) return

    const aiMessage = messages[messages.length - 1]
    const aiContent = aiMessage.content

    const prompt = `
你现在扮演一位${elder.age}岁的${elder.background}，名叫${elder.name}。
你的性格特点：${elder.personality}。
你的对话风格：${elder.conversationStyle}。
你喜欢谈论的话题：${elder.favoriteTopics.join('、')}。
你不喜欢谈论的话题：${elder.avoidTopics.join('、')}。

你的基本信息：
- 出生地：${elder.basicInfo.birthPlace}
- 出生日期：${elder.basicInfo.birthDate}
- 职业：${elder.basicInfo.occupation}
- 爱好：${elder.basicInfo.hobbies.join('、')}
- 家庭成员：${elder.basicInfo.familyMembers.join('、')}
- 教育背景：${elder.basicInfo.education}
- 工作经历：${elder.basicInfo.workExperience}

你的重要记忆：
${elder.keyMemories.map((m, i) => `${i + 1}. ${m}`).join('\n')}

现在聊天伙伴问你：${aiContent}

请以${elder.name}的身份，用口语化的方式回答这个问题。回答要自然、真诚，符合老年人的说话习惯，可以适当回忆过去的经历。回答不要太长，100-200字左右。
`

    callLLM([{ role: 'user', content: prompt }], null, null, false)
      .then(content => {
        this.addElderMessage(messages, content)
      })
      .catch(err => {
        console.error('Elder response generation error:', err)
        const fallbackContent = this.getFallbackResponse(elder, aiContent)
        this.addElderMessage(messages, fallbackContent)
      })
  },

  getFallbackResponse: function(elder, aiContent) {
    const chapters = elder.chapters || {}
    const currentStage = this.data.currentStage
    const chapter = chapters[currentStage]
    
    if (chapter && chapter.content) {
      const paragraphs = chapter.content.split('\n\n')
      const randomIndex = Math.floor(Math.random() * paragraphs.length)
      return paragraphs[randomIndex] || chapter.content.substring(0, 200) + '...'
    }
    
    return `我是${elder.name}，今年${elder.age}岁，曾经是一位${elder.background}。我经历了很多事情，有机会慢慢跟你讲。`
  },

  addElderMessage: function(messages, content) {
    const elderMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: content,
      time: this.formatTime(new Date()),
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, elderMessage]
    this.setData({
      messages: updatedMessages,
      scrollTop: 999999
    })
    wx.setStorageSync('currentChatMessages', updatedMessages)

    this.extractMemory(updatedMessages)

    setTimeout(() => {
      this.callLLMForNextQuestion(updatedMessages)
    }, 1500)
  },

  callLLMForNextQuestion: function(messages) {
    callLLM(messages, this.data.goal, this.data.userMemory, true)
      .then(content => {
        const aiMessage = {
          id: 'ai_' + Date.now(),
          role: 'ai',
          content: content,
          time: this.formatTime(new Date()),
          timestamp: new Date().toISOString()
        }

        const updatedMessages = [...messages, aiMessage]
        this.setData({
          messages: updatedMessages,
          scrollTop: 999999
        })
        wx.setStorageSync('currentChatMessages', updatedMessages)

        this.extractMemory(updatedMessages)

        if (this.data.isTestMode && this.data.currentTestElder) {
          const stageMessageCount = updatedMessages.filter(m => m.role === 'ai').length
          
          if (stageMessageCount >= 5 || this.isStageComplete()) {
            setTimeout(() => {
              this.saveLetter(updatedMessages)
              setTimeout(() => {
                this.continueNextStage()
              }, 1500)
            }, 1000)
          } else {
            setTimeout(() => {
              this.generateElderResponse(updatedMessages)
            }, 2000)
          }
        }
      })
      .catch(err => {
        console.error('LLM call error:', err)
      })
  },

  isStageComplete: function() {
    const userMemory = this.data.userMemory
    const currentStage = userMemory.progress.currentPhase
    const keyMemories = userMemory.keyMemories || []
    const stageMemories = keyMemories.filter(m => 
      (m.chapter && m.chapter.includes(currentStage)) ||
      (typeof m === 'string' && m.length > 0)
    )
    return stageMemories.length >= 3
  },

  continueNextStage: function() {
    const elder = this.data.currentTestElder
    if (!elder) return

    const userMemory = this.data.userMemory
    const stages = this.getStages(this.data.goal)
    const currentStageIndex = stages.findIndex(s => s.id === userMemory.progress.currentPhase)
    
    if (currentStageIndex >= stages.length - 1) {
      wx.showToast({ title: '所有章节已完成', icon: 'success' })
      this.checkBiographyComplete()
      return
    }

    const nextStage = stages[currentStageIndex + 1]
    
    this.setData({
      currentStage: nextStage.id,
      stageName: nextStage.name,
      messages: []
    })
    wx.setStorageSync('currentChatMessages', [])

    setTimeout(() => {
      const greeting = `好的，我们已经聊完了${stages[currentStageIndex].name}。接下来我们聊聊${nextStage.name}吧，你可以跟我讲讲这方面的故事。`
      
      const aiMessage = {
        id: 'ai_' + Date.now(),
        role: 'ai',
        content: greeting,
        time: this.formatTime(new Date()),
        timestamp: new Date().toISOString()
      }
      
      this.setData({ messages: [aiMessage] }, () => {
        setTimeout(() => {
          this.scrollToBottom()
          setTimeout(() => {
            this.generateElderResponse([aiMessage])
          }, 2000)
        }, 100)
      })
    }, 500)
  },

  onShowTestElders: function() {
    this.setData({
      showTestElders: true,
      testElders: TEST_ELDERS
    })
  },

  onCloseTestElders: function() {
    this.setData({ showTestElders: false })
  },

  onSelectTestElder: function(e) {
    const elder = e.currentTarget.dataset.elder
    this.setData({ currentTestElder: elder })
  },

  onStartTestConversation: function() {
    const elder = this.data.currentTestElder
    if (!elder) return

    const userMemory = {
      basicInfo: elder.basicInfo,
      preferences: {
        topics: elder.favoriteTopics,
        conversationStyle: elder.conversationStyle,
        questionFrequency: 'medium',
        favoriteTopics: elder.favoriteTopics,
        avoidTopics: elder.avoidTopics
      },
      progress: {
        totalQuestions: 24,
        answeredQuestions: [],
        currentPhase: 'childhood',
        daysRemaining: 30,
        conversationPhase: 'trust_building',
        exchangesInCurrentPhase: 0
      },
      history: {
        totalConversations: 0,
        lastConversationTime: '',
        keyMemories: elder.keyMemories
      },
      hasSeenVoiceTutorial: true
    }

    const userInfo = {
      nickName: elder.name,
      avatarUrl: ''
    }

    wx.setStorageSync('userMemory', userMemory)
    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('letters', [])
    wx.setStorageSync('biography', null)
    wx.setStorageSync('currentChatMessages', [])

    this.setData({
      showTestElders: false,
      isTestMode: true,
      messages: [],
      userMemory: userMemory,
      userNickName: elder.name,
      userAvatar: '',
      conversationPhase: 'trust_building',
      currentStage: 'childhood',
      stageName: '童年记忆'
    }, () => {
      const greeting = `您好！我是${elder.name}的专属聊天伙伴。我了解到您曾经是一位${elder.background}，经历了很多故事。今天先从您的童年开始聊起好吗？`
      
      const aiMessage = {
        id: 'ai_' + Date.now(),
        role: 'ai',
        content: greeting,
        time: this.formatTime(new Date()),
        timestamp: new Date().toISOString()
      }
      
      this.setData({ messages: [aiMessage] }, () => {
        setTimeout(() => {
          this.scrollToBottom()
          setTimeout(() => {
            this.generateElderResponse([aiMessage])
          }, 2000)
        }, 100)
      })
    })
  },

  onUnload: function() {
    if (this.floatHeaderTimer) {
      clearTimeout(this.floatHeaderTimer)
      this.floatHeaderTimer = null
    }
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer)
      this.recordingTimer = null
    }
  },

  onTutorialComplete: function() {
    wx.setStorageSync('hasCompletedTutorial', true)
    this.setData({ 
      showTutorial: false, 
      hasCompletedTutorial: true 
    })
    wx.showToast({
      title: '教程完成',
      icon: 'success'
    })
  },

  onTutorialSkip: function() {
    wx.setStorageSync('hasCompletedTutorial', true)
    this.setData({ 
      showTutorial: false, 
      hasCompletedTutorial: true 
    })
  },

  showChapterCompleteToast: function(chapterName) {
    wx.showModal({
      title: '章节完成',
      content: `恭喜您完成了「${chapterName}」章节！\n\n您的故事已经保存到信夹中，可以随时查看。`,
      confirmText: '去信夹看看',
      cancelText: '继续聊天',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/letterbox/index'
          })
        }
      }
    })
  },

  showAllChaptersCompleteToast: function() {
    wx.showModal({
      title: '所有章节完成',
      content: '太棒了！您已经完成了所有章节的故事收集。\n\n我们正在为您生成完整的人生传记，请稍等片刻...',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
