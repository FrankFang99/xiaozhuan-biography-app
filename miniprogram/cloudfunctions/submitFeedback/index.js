const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { feedbackType, content, contact, includeContext, contextData } = event
  
  const openid = cloud.getWXContext().OPENID
  
  try {
    const feedback = {
      _id: Date.now().toString(),
      feedbackType,
      content,
      contact: contact || '',
      includeContext: includeContext || false,
      contextData: includeContext ? contextData : null,
      openid,
      status: 'pending',
      createdAt: new Date().toISOString(),
      handledAt: null,
      handleResult: ''
    }
    
    await db.collection('feedbacks').add({
      data: feedback
    })
    
    return {
      success: true,
      message: '反馈提交成功'
    }
  } catch (error) {
    console.error('[submitFeedback] Error:', error)
    return {
      success: false,
      error: error.message || '提交失败'
    }
  }
}