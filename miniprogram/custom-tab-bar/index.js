Component({
  data: {
    selectedIndex: 0,
    color: '#6b7ab5',
    selectedColor: '#d4a853',
    tabs: [
      { pagePath: '/pages/chat/index', text: '对话', icon: 'chat' },
      { pagePath: '/pages/letterbox/index', text: '信夹', icon: 'letter' },
      { pagePath: '/pages/my/index', text: '我的', icon: 'my' }
    ]
  },

  attached() {
    this.updateCurrentIndex()
  },

  methods: {
    onTabTap(e) {
      const index = e.currentTarget.dataset.index
      const tab = this.data.tabs[index]
      if (index === this.data.selectedIndex) return
      
      this.setData({ selectedIndex: index })
      wx.switchTab({ url: tab.pagePath })
    },

    updateCurrentIndex() {
      try {
        const pages = getCurrentPages()
        if (!pages || pages.length === 0) {
          return
        }
        const currentPage = pages[pages.length - 1]
        if (!currentPage || !currentPage.route) {
          return
        }
        const route = '/' + currentPage.route
        const index = this.data.tabs.findIndex(tab => tab.pagePath === route)
        if (index !== -1) {
          this.setData({ selectedIndex: index })
        }
      } catch (e) {
        console.error('[TabBar] Failed to update current index:', e)
      }
    }
  }
})