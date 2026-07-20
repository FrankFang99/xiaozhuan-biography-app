const Tracker = {
  _userId: '',
  _sessionId: '',
  _events: [],
  _isEnabled: true,

  init: function(userId) {
    this._userId = userId || this._generateId()
    this._sessionId = this._generateId()
    this._events = []
    console.log('[Tracker] Initialized with userId:', this._userId)
  },

  _generateId: function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  },

  _getTimestamp: function() {
    return new Date().toISOString()
  },

  _getPage: function() {
    const pages = getCurrentPages()
    if (pages.length > 0) {
      const page = pages[pages.length - 1]
      return page.route || 'unknown'
    }
    return 'unknown'
  },

  track: function(eventName, properties) {
    if (!this._isEnabled) return

    const event = {
      eventName: eventName,
      timestamp: this._getTimestamp(),
      userId: this._userId,
      sessionId: this._sessionId,
      page: this._getPage(),
      properties: properties || {},
      deviceInfo: this._getDeviceInfo()
    }

    this._events.push(event)
    this._send(event)
    console.log('[Tracker] Tracked:', eventName, properties)
    return event
  },

  _getDeviceInfo: function() {
    try {
      const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {}
      const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {}
      return {
        platform: deviceInfo.platform || 'unknown',
        system: deviceInfo.system || 'unknown',
        version: deviceInfo.version || 'unknown',
        model: deviceInfo.model || 'unknown',
        screenWidth: windowInfo.screenWidth || 0,
        screenHeight: windowInfo.screenHeight || 0,
        pixelRatio: windowInfo.pixelRatio || 2
      }
    } catch (e) {
      try {
        const sysInfo = wx.getSystemInfoSync()
        return {
          platform: sysInfo.platform,
          system: sysInfo.system,
          version: sysInfo.version,
          model: sysInfo.model,
          screenWidth: sysInfo.screenWidth,
          screenHeight: sysInfo.screenHeight,
          pixelRatio: sysInfo.pixelRatio
        }
      } catch (fallbackError) {
        return {}
      }
    }
  },

  _send: function(event) {
    try {
      wx.cloud.callFunction({
        name: 'trackEvent',
        data: event,
        fail: function() {}
      })
    } catch (e) {
      this._storeLocal(event)
    }
  },

  _storeLocal: function(event) {
    try {
      const stored = wx.getStorageSync('trackEvents') || []
      stored.push(event)
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100)
      }
      wx.setStorageSync('trackEvents', stored)
    } catch (e) {
      console.error('[Tracker] Failed to store event:', e)
    }
  },

  flush: function() {
    if (this._events.length === 0) return

    const events = [...this._events]
    this._events = []

    try {
      wx.cloud.callFunction({
        name: 'trackBatch',
        data: { events: events },
        fail: function() {
          const stored = wx.getStorageSync('trackEvents') || []
          stored.push(...events)
          wx.setStorageSync('trackEvents', stored)
        }
      })
    } catch (e) {
      const stored = wx.getStorageSync('trackEvents') || []
      stored.push(...events)
      wx.setStorageSync('trackEvents', stored)
    }
  },

  identify: function(userId) {
    this._userId = userId
    console.log('[Tracker] User identified:', userId)
  },

  setUserProperty: function(key, value) {
    const userProps = wx.getStorageSync('userProperties') || {}
    userProps[key] = value
    wx.setStorageSync('userProperties', userProps)
    console.log('[Tracker] User property set:', key, value)
  },

  getUserProperty: function(key) {
    const userProps = wx.getStorageSync('userProperties') || {}
    return userProps[key]
  },

  pageView: function(pageName, properties) {
    this.track('page_view', {
      pageName: pageName,
      ...properties
    })
  },

  click: function(elementName, properties) {
    this.track('click', {
      elementName: elementName,
      ...properties
    })
  },

  input: function(inputType, value, properties) {
    this.track('input', {
      inputType: inputType,
      valueLength: value ? value.length : 0,
      ...properties
    })
  },

  sendMessage: function(content, messageType) {
    this.track('message_send', {
      contentLength: content ? content.length : 0,
      messageType: messageType || 'text'
    })
  },

  messageReceive: function(content, messageType) {
    this.track('message_receive', {
      contentLength: content ? content.length : 0,
      messageType: messageType || 'text'
    })
  },

  recordingStart: function() {
    this.track('recording_start', {})
  },

  recordingEnd: function(duration) {
    this.track('recording_end', {
      duration: duration
    })
  },

  recordingSuccess: function(text) {
    this.track('recording_success', {
      textLength: text ? text.length : 0
    })
  },

  recordingFail: function(error) {
    this.track('recording_fail', {
      error: error
    })
  },

  modeSwitch: function(fromMode, toMode) {
    this.track('mode_switch', {
      fromMode: fromMode,
      toMode: toMode
    })
  },

  tutorialShow: function(tutorialName) {
    this.track('tutorial_show', {
      tutorialName: tutorialName
    })
  },

  tutorialClose: function(tutorialName) {
    this.track('tutorial_close', {
      tutorialName: tutorialName
    })
  },

  conversationPhaseChange: function(fromPhase, toPhase) {
    this.track('conversation_phase_change', {
      fromPhase: fromPhase,
      toPhase: toPhase
    })
  },

  saveLetter: function(contentLength) {
    this.track('letter_save', {
      contentLength: contentLength
    })
  },

  goalSet: function(goal) {
    this.track('goal_set', {
      ...goal
    })
  },

  login: function(loginType) {
    this.track('login', {
      loginType: loginType
    })
  },

  logout: function() {
    this.track('logout', {})
  },

  share: function(shareType) {
    this.track('share', {
      shareType: shareType
    })
  },

  error: function(errorMessage, errorType) {
    this.track('error', {
      errorMessage: errorMessage,
      errorType: errorType
    })
  },

  performance: function(metricName, value, properties) {
    this.track('performance', {
      metricName: metricName,
      value: value,
      ...properties
    })
  },

  pageLoadTime: function(pageName, loadTime) {
    this.performance('page_load_time', loadTime, { pageName: pageName })
  },

  apiCall: function(apiName, duration, success, statusCode) {
    this.track('api_call', {
      apiName: apiName,
      duration: duration,
      success: success,
      statusCode: statusCode
    })
  },

  llmCall: function(model, duration, success, tokens) {
    this.track('llm_call', {
      model: model,
      duration: duration,
      success: success,
      tokens: tokens
    })
  },

  biographyGenerate: function(success, duration, chapterCount, totalScore) {
    this.track('biography_generate', {
      success: success,
      duration: duration,
      chapterCount: chapterCount,
      totalScore: totalScore
    })
  },

  biographyEvaluation: function(score, strengths, improvements) {
    this.track('biography_evaluation', {
      score: score,
      strengths: strengths,
      improvements: improvements
    })
  },

  chapterComplete: function(chapterName, questionsAnswered, totalQuestions) {
    this.track('chapter_complete', {
      chapterName: chapterName,
      questionsAnswered: questionsAnswered,
      totalQuestions: totalQuestions
    })
  },

  questionAnswer: function(chapterName, questionIndex, answerLength) {
    this.track('question_answer', {
      chapterName: chapterName,
      questionIndex: questionIndex,
      answerLength: answerLength
    })
  },

  tabSwitch: function(fromTab, toTab) {
    this.track('tab_switch', {
      fromTab: fromTab,
      toTab: toTab
    })
  },

  navigation: function(fromPage, toPage) {
    this.track('navigation', {
      fromPage: fromPage,
      toPage: toPage
    })
  },

  featureUse: function(featureName, duration) {
    this.track('feature_use', {
      featureName: featureName,
      duration: duration
    })
  },

  voiceRecognition: function(success, duration, textLength) {
    this.track('voice_recognition', {
      success: success,
      duration: duration,
      textLength: textLength
    })
  },

  imageUpload: function(success, size, count) {
    this.track('image_upload', {
      success: success,
      size: size,
      count: count
    })
  },

  memoryClear: function() {
    this.track('memory_clear', {})
  },

  goalReset: function() {
    this.track('goal_reset', {})
  },

  feedbackSubmit: function(type, content) {
    this.track('feedback_submit', {
      type: type,
      contentLength: content ? content.length : 0
    })
  },

  appLaunch: function() {
    this.track('app_launch', {})
  },

  appShow: function() {
    this.track('app_show', {})
  },

  appHide: function() {
    this.flush()
    this.track('app_hide', {})
  },

  systemError: function(error) {
    try {
      this.track('system_error', {
        message: error.message || '',
        stack: error.stack || '',
        name: error.name || '',
        fileName: error.fileName || '',
        lineNumber: error.lineNumber || '',
        columnNumber: error.columnNumber || ''
      })
    } catch (e) {
      console.error('[Tracker] Failed to track system error:', e)
    }
  },

  networkError: function(url, method, statusCode, error) {
    this.track('network_error', {
      url: url,
      method: method,
      statusCode: statusCode,
      error: error ? error.message : ''
    })
  },

  storageError: function(operation, key, error) {
    this.track('storage_error', {
      operation: operation,
      key: key,
      error: error ? error.message : ''
    })
  }
}

module.exports = Tracker