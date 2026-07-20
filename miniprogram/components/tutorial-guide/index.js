Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    currentStep: 0,
    steps: [
      {
        id: 'voice-btn',
        title: '按住说话',
        desc: '按住下方的麦克风按钮，就可以和我聊天啦',
        target: '.voice-btn',
        position: 'bottom',
        showArrow: true
      },
      {
        id: 'input-area',
        title: '文字输入',
        desc: '点击输入框，也可以用文字和我聊天',
        target: '.input',
        position: 'bottom',
        showArrow: true
      },
      {
        id: 'progress',
        title: '进度查看',
        desc: '顶部显示您的传记进度，完成所有章节就可以生成完整传记啦',
        target: '.progress-section',
        position: 'bottom',
        showArrow: true
      },
      {
        id: 'tab-bar',
        title: '查看功能',
        desc: '点击底部的"信夹"可以查看您的故事，"我的"可以查看传记',
        target: null,
        position: 'center',
        showArrow: false,
        fixedPosition: { top: '70%', left: '50%' }
      }
    ],
    highlightRect: {
      top: 0,
      left: 0,
      width: 0,
      height: 0
    },
    arrowPosition: {
      top: 0,
      left: 0
    },
    currentStepInfo: {
      title: '',
      desc: '',
      showArrow: true,
      transformStyle: 'transform: translateX(-50%);'
    }
  },

  lifetimes: {
    attached: function() {
      if (this.properties.show) {
        this.startTutorial()
      }
    }
  },

  methods: {
    startTutorial: function() {
      this.setData({ currentStep: 0 })
      this.updateHighlight()
    },

    updateHighlight: function() {
      const step = this.data.steps[this.data.currentStep]
      if (!step) return

      const transformStyle = step.position === 'center' 
        ? 'transform: translate(-50%, -50%);' 
        : 'transform: translateX(-50%);'
      
      const showArrow = step.showArrow !== false

      const currentStepInfo = {
        title: step.title || '',
        desc: step.desc || '',
        showArrow: showArrow,
        transformStyle: transformStyle
      }

      if (step.fixedPosition) {
        this.setData({
          highlightRect: {
            top: 0,
            left: 0,
            width: 0,
            height: 0
          },
          arrowPosition: {
            top: step.fixedPosition.top,
            left: step.fixedPosition.left
          },
          currentStepInfo: currentStepInfo
        })
        return
      }

      const query = wx.createSelectorQuery()
      query.select(step.target).boundingClientRect((rect) => {
        if (rect) {
          const arrowTop = step.position === 'bottom' 
            ? rect.bottom + 20 
            : rect.top - 100
          const arrowLeft = rect.left + rect.width / 2

          this.setData({
            highlightRect: rect,
            arrowPosition: {
              top: arrowTop,
              left: arrowLeft
            },
            currentStepInfo: currentStepInfo
          })
        } else {
          console.warn('[Tutorial] Target element not found:', step.target)
        }
      }).exec()
    },

    onNext: function() {
      const currentStep = this.data.currentStep
      const steps = this.data.steps
      
      if (currentStep >= steps.length - 1) {
        this.triggerEvent('complete')
      } else {
        this.setData({ currentStep: currentStep + 1 }, () => {
          setTimeout(() => {
            this.updateHighlight()
          }, 100)
        })
      }
    },

    onSkip: function() {
      this.triggerEvent('skip')
    },

    onTargetTap: function() {
      this.onNext()
    }
  }
})