Page({
  data: {
    stars: [],
    showModal: false,
    selectedStar: null
  },

  onLoad: function() {
    this.loadStars()
  },

  loadStars: function() {
    const goal = wx.getStorageSync('goal')
    const letters = wx.getStorageSync('letters') || []
    
    const baseStars = [
      {
        id: 'star_1',
        name: goal ? goal.name : '张爷爷',
        emoji: '👴',
        birthday: '1945年8月15日',
        status: 'alive',
        message: '张爷爷出生于1945年，经历了新中国的成立和发展。他用勤劳的双手养育了三个子女，如今已是儿孙满堂。他常说："人生最大的幸福，就是看到家人平安健康。"',
        x: 15,
        y: 20,
        opacity: 1,
        duration: 3
      },
      {
        id: 'star_2',
        name: '李奶奶',
        emoji: '👵',
        birthday: '1938年3月20日',
        status: 'passed',
        message: '李奶奶于2020年离开了我们，但她的笑容永远留在我们心中。她是一位慈祥的母亲，一位勤劳的妻子，更是一位伟大的奶奶。她教会了我们什么是爱，什么是奉献。',
        x: 70,
        y: 35,
        opacity: 0.7,
        duration: 5
      },
      {
        id: 'star_3',
        name: '王爷爷',
        emoji: '👴',
        birthday: '1942年11月11日',
        status: 'alive',
        message: '王爷爷是一位退伍军人，曾参加过抗美援朝战争。他的一生充满了传奇色彩，从战场归来后，他用余生守护着家人和家乡。',
        x: 35,
        y: 60,
        opacity: 0.9,
        duration: 4
      },
      {
        id: 'star_4',
        name: '陈奶奶',
        emoji: '👵',
        birthday: '1950年5月5日',
        status: 'alive',
        message: '陈奶奶是一位退休教师，她把一生都奉献给了教育事业。她的学生遍布全国各地，每一个都记得她的谆谆教诲。',
        x: 85,
        y: 75,
        opacity: 0.8,
        duration: 4.5
      },
      {
        id: 'star_5',
        name: '刘爷爷',
        emoji: '👴',
        birthday: '1935年12月25日',
        status: 'passed',
        message: '刘爷爷是一位老工匠，他的手艺精湛，远近闻名。他常说："做事要用心，做人要真诚。"这句话成为了我们家族的家训。',
        x: 20,
        y: 85,
        opacity: 0.5,
        duration: 6
      }
    ]

    const dynamicStars = []
    for (let i = 0; i < 20; i++) {
      dynamicStars.push({
        id: 'dynamic_' + i,
        name: '',
        emoji: '',
        birthday: '',
        status: 'alive',
        message: '',
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.2,
        duration: Math.random() * 4 + 2
      })
    }

    this.setData({ stars: [...dynamicStars, ...baseStars] })
  },

  onStarTap: function(e) {
    const star = e.currentTarget.dataset.star
    if (star.name) {
      this.setData({ 
        showModal: true,
        selectedStar: star
      })
    }
  },

  onCloseModal: function() {
    this.setData({ showModal: false })
  },

  stopPropagation: function() {
    return
  }
})
