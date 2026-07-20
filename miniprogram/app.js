App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'trae-ai-creativity'
    })

    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }

    const goal = wx.getStorageSync('goal')
    if (goal) {
      this.globalData.goal = goal
    }
  },

  globalData: {
    userInfo: null,
    isLoggedIn: false,
    goal: null,
    letters: [],
    messages: [],
    currentPage: 'chat'
  }
})
