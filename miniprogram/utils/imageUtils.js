function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false
  
  const validProtocols = ['http://', 'https://', 'data:', '/']
  return validProtocols.some(protocol => url.startsWith(protocol))
}

function isCloudFileID(url) {
  if (!url || typeof url !== 'string') return false
  return url.startsWith('cloud://')
}

function isWxFileUrl(url) {
  if (!url || typeof url !== 'string') return false
  return url.startsWith('wxfile://')
}

function convertCloudFileID(fileID) {
  return new Promise((resolve) => {
    if (!fileID || !isCloudFileID(fileID)) {
      resolve(null)
      return
    }

    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => {
        if (res.fileList && res.fileList.length > 0 && res.fileList[0].tempFileURL) {
          resolve(res.fileList[0].tempFileURL)
        } else {
          resolve(null)
        }
      },
      fail: () => {
        resolve(null)
      }
    })
  })
}

async function resolveImageUrl(url) {
  if (!url || !isValidUrl(url)) {
    return null
  }

  if (isCloudFileID(url)) {
    const tempUrl = await convertCloudFileID(url)
    return tempUrl
  }

  if (isWxFileUrl(url)) {
    return url
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('/')) {
    return url
  }

  return null
}

function getAvatarInitial(name) {
  if (!name || typeof name !== 'string') return '用'
  const firstChar = name.charAt(0)
  if (/[\u4e00-\u9fa5]/.test(firstChar)) {
    return firstChar
  }
  if (/[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase()
  }
  return '用'
}

function generateAvatarGradient(name) {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

function getDefaultAvatarPath() {
  return '/images/biographer_avatar.jpg'
}

module.exports = {
  isValidUrl,
  isCloudFileID,
  isWxFileUrl,
  convertCloudFileID,
  resolveImageUrl,
  getAvatarInitial,
  generateAvatarGradient,
  getDefaultAvatarPath
}