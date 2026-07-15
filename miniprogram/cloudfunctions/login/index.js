const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const { code, userInfo } = event
  
  try {
    const wxContext = cloud.getWXContext()
    
    const openid = wxContext.OPENID
    
    let user = await db.collection('users').where({ openid }).get()
    
    if (user.data.length === 0) {
      await db.collection('users').add({
        data: {
          openid,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          phone: '',
          birthday: '',
          createdAt: db.serverDate(),
          status: 'active'
        }
      })
    }
    
    return {
      success: true,
      openid,
      userInfo
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
