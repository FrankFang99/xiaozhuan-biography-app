const Tracker = require('../../utils/tracker.js')
const { STRUCTURE_CONFIG } = require('../../utils/llm.js')

Page({
  data: {
    name: '',
    selectedRelation: '',
    selectedTime: '',
    targetLetterCount: 5,
    selectedStyle: 'warm',
    selectedStructure: 'timeline',
    isEditing: false,
    showOutline: false,
    outlineStages: []
  },

  onLoad: function() {
    Tracker.pageView('onboarding')
    
    const existingGoal = wx.getStorageSync('goal')
    if (existingGoal) {
      this.setData({ 
        name: existingGoal.name || '',
        selectedRelation: existingGoal.relation || '',
        selectedTime: existingGoal.targetTime || '',
        targetLetterCount: existingGoal.targetLetterCount || 5,
        selectedStyle: existingGoal.style || 'warm',
        selectedStructure: existingGoal.structure || 'timeline',
        isEditing: true
      })
    }
  },

  onNameInput: function(e) {
    this.setData({ name: e.detail.value })
  },

  onSelectRelation: function(e) {
    this.setData({ selectedRelation: e.currentTarget.dataset.value })
  },

  onSelectTime: function(e) {
    this.setData({ selectedTime: e.currentTarget.dataset.value })
  },

  onSelectLetterCount: function(e) {
    this.setData({ targetLetterCount: parseInt(e.currentTarget.dataset.value) })
  },

  onSelectStyle: function(e) {
    this.setData({ selectedStyle: e.currentTarget.dataset.value })
  },

  onSelectStructure: function(e) {
    this.setData({ selectedStructure: e.currentTarget.dataset.value })
  },

  onStart: function() {
    const { name, selectedRelation, selectedTime, targetLetterCount, selectedStyle, selectedStructure } = this.data
    if (!name) {
      wx.showToast({ title: '请输入称呼', icon: 'none' })
      return
    }
    if (!selectedRelation) {
      wx.showToast({ title: '请选择关系', icon: 'none' })
      return
    }
    if (!selectedTime) {
      wx.showToast({ title: '请选择完成时间', icon: 'none' })
      return
    }

    const config = STRUCTURE_CONFIG[selectedStructure] || STRUCTURE_CONFIG.timeline
    const stages = config.stages.map((stage, index) => ({
      ...stage,
      order: index + 1
    }))

    this.setData({ 
      showOutline: true,
      outlineStages: stages
    })
  },

  onConfirmOutline: function() {
    const { name, selectedRelation, selectedTime, targetLetterCount, selectedStyle, selectedStructure } = this.data
    
    const goal = {
      name,
      relation: selectedRelation,
      targetTime: selectedTime,
      letterCount: targetLetterCount,
      style: selectedStyle,
      structure: selectedStructure,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: new Date().toISOString()
    }

    wx.setStorageSync('goal', goal)
    Tracker.goalSet(goal)
    
    const userMemory = wx.getStorageSync('userMemory') || {}
    if (userMemory.progress) {
      userMemory.progress.targetLetterCount = targetLetterCount
      userMemory.progress.currentPhase = selectedStructure === 'timeline' ? 'childhood' : 'early_life'
      wx.setStorageSync('userMemory', userMemory)
    }

    wx.showToast({ 
      title: this.data.isEditing ? '目标已更新' : '目标已设定', 
      icon: 'success' 
    })

    setTimeout(() => {
      wx.switchTab({ url: '/pages/chat/index' })
    }, 1500)
  },

  onBackToEdit: function() {
    this.setData({ showOutline: false })
  },

  onRegenerateOutline: function() {
    const { selectedStructure } = this.data
    
    const structures = Object.keys(STRUCTURE_CONFIG)
    const currentIndex = structures.indexOf(selectedStructure)
    const nextIndex = (currentIndex + 1) % structures.length
    const newStructure = structures[nextIndex]
    
    const config = STRUCTURE_CONFIG[newStructure]
    const stages = config.stages.map((stage, index) => ({
      ...stage,
      order: index + 1
    }))
    
    this.setData({ 
      selectedStructure: newStructure,
      outlineStages: stages 
    })
    
    const structureNames = {
      timeline: '时间线模式',
      milestone: '重大事件模式'
    }
    
    wx.showToast({ 
      title: `已切换为${structureNames[newStructure]}`, 
      icon: 'none' 
    })
  }
})
