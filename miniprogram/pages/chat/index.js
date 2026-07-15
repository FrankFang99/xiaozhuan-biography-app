const { callLLM, extractMemory, STRUCTURE_CONFIG } = require('../../utils/llm.js')
const Tracker = require('../../utils/tracker.js')
const { generateBiographyFromMemory } = require('../../utils/biographyGenerator.js')

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
    showFloatHeader: false
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
      
      this.setData({ 
        goal, 
        notifications: notifications.slice(0, 3),
        hasNotification: notifications.length > 0,
        messages,
        userMemory,
        currentLetterCount: letters.length,
        targetLetterCount,
        progressPercent,
        daysRemaining,
        userAvatar: userInfo.avatarUrl || '',
        userNickName: userInfo.nickName || '',
        currentStage: currentStage.id,
        stageName: currentStage.name,
        conversationPhase: userMemory.progress.conversationPhase || 'trust_building',
        showVoiceTutorial: !userMemory.hasSeenVoiceTutorial,
        showFloatHeader: false
      }, () => {
        this.calculateScrollHeight()
        
        if (messages.length === 0) {
          this.initConversation()
        } else {
          setTimeout(() => {
            this.scrollToBottom()
          }, 100)
        }
      })
    
    this.initRecorder()
    this.getSuggestedQuestions()
    
    this.resetFloatHeaderTimer()
  },
  
  calculateScrollHeight: function() {
    const systemInfo = wx.getSystemInfoSync()
    const windowHeight = systemInfo.windowHeight
    const headerHeight = 280
    const inputHeight = 140
    const tabBarHeight = 140
    const pixelRatio = systemInfo.pixelRatio
    
    const scrollHeight = windowHeight - (headerHeight + inputHeight + tabBarHeight) / pixelRatio
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
    } catch (e) {
      console.warn('微信同声传译插件未授权，语音功能暂时不可用:', e)
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
    const cloudPath = `voice/${Date.now()}.${fileExtension}`
    
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: res.tempFilePath,
      success: (uploadRes) => {
        wx.cloud.callFunction({
          name: 'speechToText',
          data: {
            fileID: uploadRes.fileID
          },
          success: (callRes) => {
            wx.hideLoading()
            if (callRes.result && callRes.result.success && callRes.result.text) {
              this.setData({ inputText: callRes.result.text })
              this.onSend()
            } else {
              wx.showToast({ title: callRes.result?.error || '识别失败', icon: 'none' })
            }
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '识别服务暂不可用', icon: 'none' })
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '文件上传失败', icon: 'none' })
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
    
    this.setData({ 
      notifications: notifications.slice(0, 3),
      hasNotification: notifications.length > 0,
      currentLetterCount: letters.length,
      currentStage: currentStage.id,
      stageName: currentStage.name,
      conversationPhase: userMemory.progress.conversationPhase || 'trust_building',
      userMemory,
      goal,
      userAvatar: userInfo.avatarUrl || '',
      userNickName: userInfo.nickName || ''
    })

    this.updateTabBar()
  },

  updateTabBar: function() {
    const tabBar = this.getTabBar()
    if (tabBar) {
      tabBar.updateCurrentIndex()
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
    const currentScrollTop = this.data.scrollTop
    const newScrollTop = currentScrollTop === 999999 ? 999998 : 999999
    this.setData({ scrollTop: newScrollTop })
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
    this.setData({ inputText: e.detail.value })
    if (this.data.showFloatHeader) {
      this.resetFloatHeaderTimer()
    }
  },

  onSend: async function() {
    const { inputText, messages, goal, userMemory } = this.data
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
      scrollTop: 999999
    })

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
          scrollTop: 999999
        })
        wx.setStorageSync('currentChatMessages', updatedMessages)

        this.extractMemory(updatedMessages)

        if (inputText.trim() === '结束' || inputText.trim() === '停止' || inputText.trim() === '保存') {
          this.saveLetter(updatedMessages)
        }
      })
      .catch(err => {
        this.setData({ isLoading: false })
        console.error('LLM call error:', err)
        Tracker.error(err.message || 'LLM call failed', 'api_error')
        
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
      createdAt: now.toISOString()
    }

    const letters = wx.getStorageSync('letters') || []
    letters.unshift(letter)
    wx.setStorageSync('letters', letters)
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

    wx.showToast({ title: '信件已保存', icon: 'success' })

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
      
      generateBiographyFromMemory(userMemory, goal)
        .then(biography => {
          wx.hideLoading()
          
          wx.setStorageSync('biography', biography)
          this.addNotification('传记完成', `${goal.name || '用户'}的传记已完成！`)
          
          wx.showModal({
            title: '传记完成',
            content: `${goal.name || '用户'}的传记已经完成，快去传记宇宙查看吧！`,
            showCancel: false,
            confirmText: '去查看',
            success: () => {
              wx.navigateTo({ url: '/pages/biography/index?id=user_biography' })
            }
          })
        })
        .catch(err => {
          wx.hideLoading()
          console.error('Biography generation error:', err)
          
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
    this.setData({ inputText: question })
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

  onUnload: function() {
    if (this.floatHeaderTimer) {
      clearTimeout(this.floatHeaderTimer)
      this.floatHeaderTimer = null
    }
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer)
      this.recordingTimer = null
    }
  }
})
