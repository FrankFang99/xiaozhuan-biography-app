Page({
  data: {
    chapters: [],
    selectedChapter: '',
    selectedChapterContent: '',
    goal: null
  },

  onLoad: function() {
    const goal = wx.getStorageSync('goal')
    this.setData({ goal })
    this.loadBook()
  },

  loadBook: function() {
    const goal = this.data.goal
    const letters = wx.getStorageSync('letters') || []
    
    const chapters = [
      {
        number: '01',
        title: '序章',
        content: `亲爱的读者，这本传记记录了${goal ? goal.name : '一位平凡老人'}的一生。每一段文字，都是时光的印记；每一个故事，都是生命的馈赠。让我们一起走进${goal ? goal.name : '他'}的世界，聆听那些被岁月珍藏的记忆。`
      },
      {
        number: '02',
        title: '童年时光',
        content: `${goal ? goal.name : '老人'}出生在一个宁静的小镇。童年的记忆里，有夏天的蝉鸣，有冬天的白雪，有父母温暖的怀抱。那些无忧无虑的日子，成为了${goal ? goal.name : '他'}一生中最珍贵的底色。`
      },
      {
        number: '03',
        title: '青春岁月',
        content: '年轻的时候，每个人都有梦想。也许是远方的风景，也许是心中的热爱。那些为梦想奋斗的日子，那些挥洒汗水的时光，都成为了生命中最闪亮的篇章。'
      },
      {
        number: '04',
        title: '人生感悟',
        content: `走过人生的大半旅程，回望来时的路。有欢笑，有泪水，有收获，有遗憾。但正是这些经历，塑造了今天的自己。如果让${goal ? goal.name : '他'}对年轻时的自己说一句话，那一定是：珍惜当下，不负韶华。`
      },
      {
        number: '05',
        title: '结语',
        content: `这本传记记录了${goal ? goal.name : '老人'}平凡而精彩的一生。每一个平凡的人，都有属于自己的故事。让我们铭记这些珍贵的记忆，让平凡的人生，在时光里永远闪耀。`
      }
    ]

    if (letters.length > 0) {
      const personalStory = {
        number: '03',
        title: '独家记忆',
        content: letters.map(l => l.content).join('\n\n')
      }
      chapters.splice(2, 0, personalStory)
    }

    this.setData({ 
      chapters,
      selectedChapter: chapters[0].title,
      selectedChapterContent: chapters[0].content
    })
  },

  onSelectChapter: function(e) {
    const title = e.currentTarget.dataset.title
    const chapter = this.data.chapters.find(c => c.title === title)
    if (chapter) {
      this.setData({ 
        selectedChapter: title,
        selectedChapterContent: chapter.content
      })
    }
  }
})
