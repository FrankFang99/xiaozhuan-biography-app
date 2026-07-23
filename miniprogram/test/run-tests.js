// 小传小程序自动化测试 - 测试运行器
// 使用说明：
// 1. 确保微信开发者工具已安装并开启自动化测试功能
// 2. 在小程序根目录执行: npm install
// 3. 执行测试: npm test

const automator = require('miniprogram-automator')
const path = require('path')

let miniProgram = null

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
}

async function launchMiniProgram() {
  try {
    console.log('🔄 正在启动微信开发者工具...')
    miniProgram = await automator.launch({
      projectPath: path.resolve(__dirname, '..'),
      autoPort: true,
      timeout: 60000
    })
    console.log('✅ 小程序启动成功')
    return true
  } catch (err) {
    console.error('❌ 小程序启动失败:', err.message)
    console.warn('💡 请确保微信开发者工具已安装，且已开启"服务端口"')
    return false
  }
}

async function closeMiniProgram() {
  if (miniProgram) {
    try {
      await miniProgram.close()
      console.log('✅ 小程序已关闭')
    } catch (err) {
      console.warn('⚠️ 关闭小程序时出现错误:', err.message)
    }
  }
}

function addTestResult(name, status, message = '') {
  results.tests.push({ name, status, message })
  if (status === 'passed') results.passed++
  else if (status === 'failed') results.failed++
  else if (status === 'skipped') results.skipped++
}

function printResult(name, status, message = '') {
  const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️'
  console.log(`${icon} ${name}`)
  if (message) {
    console.log(`   ${message}`)
  }
}

async function testShowcase() {
  console.log('\n📱 测试展示页 (Showcase)')
  
  try {
    const page = await miniProgram.reLaunch('/pages/showcase/index')
    await page.waitFor(2000)
    
    // 测试1: 页面标题
    const title = await page.$('.title')
    if (title) {
      const titleText = await title.text()
      if (titleText.includes('小传')) {
        addTestResult('展示页标题显示', 'passed')
        printResult('展示页标题显示', 'passed')
      } else {
        addTestResult('展示页标题显示', 'failed', `标题为: ${titleText}`)
        printResult('展示页标题显示', 'failed', `标题为: ${titleText}`)
      }
    } else {
      addTestResult('展示页标题显示', 'failed', '未找到标题元素')
      printResult('展示页标题显示', 'failed', '未找到标题元素')
    }
    
    // 测试2: 示例卡片存在
    const cards = await page.$$('.card')
    if (cards.length > 0) {
      addTestResult('示例传记卡片显示', 'passed')
      printResult('示例传记卡片显示', 'passed')
    } else {
      addTestResult('示例传记卡片显示', 'failed', '未找到卡片元素')
      printResult('示例传记卡片显示', 'failed', '未找到卡片元素')
    }
    
    // 测试3: 开始记录按钮
    const startBtn = await page.$('.start-btn')
    if (startBtn) {
      addTestResult('开始记录按钮显示', 'passed')
      printResult('开始记录按钮显示', 'passed')
    } else {
      addTestResult('开始记录按钮显示', 'failed', '未找到按钮元素')
      printResult('开始记录按钮显示', 'failed', '未找到按钮元素')
    }
    
    await page.waitFor(1000)
  } catch (err) {
    console.error('❌ 展示页测试失败:', err.message)
    addTestResult('展示页测试', 'failed', err.message)
  }
}

async function testLogin() {
  console.log('\n🔐 测试登录页 (Login)')
  
  try {
    const page = await miniProgram.reLaunch('/pages/login/index')
    await page.waitFor(2000)
    
    // 测试1: 头像按钮
    const avatarBtn = await page.$('.avatar-btn')
    if (avatarBtn) {
      addTestResult('头像按钮显示', 'passed')
      printResult('头像按钮显示', 'passed')
    } else {
      addTestResult('头像按钮显示', 'failed', '未找到头像按钮')
      printResult('头像按钮显示', 'failed', '未找到头像按钮')
    }
    
    // 测试2: 昵称输入框
    const nicknameInput = await page.$('.nickname-input')
    if (nicknameInput) {
      addTestResult('昵称输入框显示', 'passed')
      printResult('昵称输入框显示', 'passed')
    } else {
      addTestResult('昵称输入框显示', 'failed', '未找到昵称输入框')
      printResult('昵称输入框显示', 'failed', '未找到昵称输入框')
    }
    
    // 测试3: 隐私协议勾选框
    const checkbox = await page.$('.checkbox')
    if (checkbox) {
      addTestResult('隐私协议勾选框显示', 'passed')
      printResult('隐私协议勾选框显示', 'passed')
    } else {
      addTestResult('隐私协议勾选框显示', 'failed', '未找到勾选框')
      printResult('隐私协议勾选框显示', 'failed', '未找到勾选框')
    }
    
    // 测试4: 登录按钮
    const loginBtn = await page.$('.login-btn')
    if (loginBtn) {
      addTestResult('登录按钮显示', 'passed')
      printResult('登录按钮显示', 'passed')
    } else {
      addTestResult('登录按钮显示', 'failed', '未找到登录按钮')
      printResult('登录按钮显示', 'failed', '未找到登录按钮')
    }
    
    await page.waitFor(1000)
  } catch (err) {
    console.error('❌ 登录页测试失败:', err.message)
    addTestResult('登录页测试', 'failed', err.message)
  }
}

async function testChat() {
  console.log('\n💬 测试对话页 (Chat)')
  
  try {
    const page = await miniProgram.reLaunch('/pages/chat/index')
    await page.waitFor(3000)
    
    // 测试1: 页面头部
    const header = await page.$('.chat-header')
    if (header) {
      addTestResult('对话页头部显示', 'passed')
      printResult('对话页头部显示', 'passed')
    } else {
      addTestResult('对话页头部显示', 'failed', '未找到头部元素')
      printResult('对话页头部显示', 'failed', '未找到头部元素')
    }
    
    // 测试2: 消息列表
    const messageList = await page.$('.message-list')
    if (messageList) {
      addTestResult('消息列表区域显示', 'passed')
      printResult('消息列表区域显示', 'passed')
    } else {
      addTestResult('消息列表区域显示', 'failed', '未找到消息列表')
      printResult('消息列表区域显示', 'failed', '未找到消息列表')
    }
    
    // 测试3: 输入区域
    const inputArea = await page.$('.input-area')
    if (inputArea) {
      addTestResult('输入区域显示', 'passed')
      printResult('输入区域显示', 'passed')
    } else {
      addTestResult('输入区域显示', 'failed', '未找到输入区域')
      printResult('输入区域显示', 'failed', '未找到输入区域')
    }
    
    // 测试4: 检查是否黑屏
    const pageContainer = await page.$('.page-container')
    if (pageContainer) {
      addTestResult('页面容器存在', 'passed')
      printResult('页面容器存在', 'passed')
    } else {
      addTestResult('页面容器存在', 'failed', '页面容器不存在，可能是黑屏')
      printResult('页面容器存在', 'failed', '页面容器不存在，可能是黑屏')
    }
    
    await page.waitFor(1000)
  } catch (err) {
    console.error('❌ 对话页测试失败:', err.message)
    addTestResult('对话页测试', 'failed', err.message)
  }
}

async function testOnboarding() {
  console.log('\n🎯 测试目标设置页 (Onboarding)')
  
  try {
    const page = await miniProgram.reLaunch('/pages/onboarding/index')
    await page.waitFor(2000)
    
    // 测试1: 称呼输入框
    const nameInput = await page.$('.input')
    if (nameInput) {
      addTestResult('称呼输入框显示', 'passed')
      printResult('称呼输入框显示', 'passed')
    } else {
      addTestResult('称呼输入框显示', 'failed', '未找到输入框')
      printResult('称呼输入框显示', 'failed', '未找到输入框')
    }
    
    // 测试2: 关系选项
    const relationOptions = await page.$$('.relation-item')
    if (relationOptions.length > 0) {
      addTestResult('关系选项显示', 'passed')
      printResult('关系选项显示', 'passed')
    } else {
      addTestResult('关系选项显示', 'failed', '未找到关系选项')
      printResult('关系选项显示', 'failed', '未找到关系选项')
    }
    
    // 测试3: 开始按钮
    const startBtn = await page.$('.start-btn')
    if (startBtn) {
      addTestResult('开始按钮显示', 'passed')
      printResult('开始按钮显示', 'passed')
    } else {
      addTestResult('开始按钮显示', 'failed', '未找到开始按钮')
      printResult('开始按钮显示', 'failed', '未找到开始按钮')
    }
    
    await page.waitFor(1000)
  } catch (err) {
    console.error('❌ 目标设置页测试失败:', err.message)
    addTestResult('目标设置页测试', 'failed', err.message)
  }
}

async function testMy() {
  console.log('\n👤 测试我的页 (My)')
  
  try {
    const page = await miniProgram.reLaunch('/pages/my/index')
    await page.waitFor(2000)
    
    // 测试1: 用户信息区域
    const userInfoArea = await page.$('.user-info')
    if (userInfoArea) {
      addTestResult('用户信息区域显示', 'passed')
      printResult('用户信息区域显示', 'passed')
    } else {
      addTestResult('用户信息区域显示', 'failed', '未找到用户信息区域')
      printResult('用户信息区域显示', 'failed', '未找到用户信息区域')
    }
    
    // 测试2: 菜单选项
    const menuItems = await page.$$('.menu-item')
    if (menuItems.length > 0) {
      addTestResult('菜单选项显示', 'passed')
      printResult('菜单选项显示', 'passed')
    } else {
      addTestResult('菜单选项显示', 'failed', '未找到菜单选项')
      printResult('菜单选项显示', 'failed', '未找到菜单选项')
    }
    
    await page.waitFor(1000)
  } catch (err) {
    console.error('❌ 我的页测试失败:', err.message)
    addTestResult('我的页测试', 'failed', err.message)
  }
}

async function testLetterbox() {
  console.log('\n📮 测试信夹页 (Letterbox)')
  
  try {
    const page = await miniProgram.reLaunch('/pages/letterbox/index')
    await page.waitFor(2000)
    
    // 测试1: 页面标题
    const title = await page.$('.title')
    if (title) {
      addTestResult('信夹页标题显示', 'passed')
      printResult('信夹页标题显示', 'passed')
    } else {
      addTestResult('信夹页标题显示', 'failed', '未找到标题元素')
      printResult('信夹页标题显示', 'failed', '未找到标题元素')
    }
    
    await page.waitFor(1000)
  } catch (err) {
    console.error('❌ 信夹页测试失败:', err.message)
    addTestResult('信夹页测试', 'failed', err.message)
  }
}

async function runAllTests() {
  console.log('🚀 开始运行小传小程序自动化测试\n')
  
  const launched = await launchMiniProgram()
  if (!launched) {
    console.log('\n⚠️ 自动化测试无法启动，建议使用手动测试SOP')
    return
  }
  
  try {
    await testShowcase()
    await testLogin()
    await testOnboarding()
    await testChat()
    await testLetterbox()
    await testMy()
  } finally {
    await closeMiniProgram()
  }
  
  printSummary()
}

function printSummary() {
  console.log('\n' + '='.repeat(50))
  console.log('📊 测试结果汇总')
  console.log('='.repeat(50))
  console.log(`✅ 通过: ${results.passed}`)
  console.log(`❌ 失败: ${results.failed}`)
  console.log(`⏭️ 跳过: ${results.skipped}`)
  console.log(`📝 总计: ${results.tests.length}`)
  console.log('='.repeat(50))
  
  if (results.failed > 0) {
    console.log('\n❌ 失败的测试用例:')
    results.tests.forEach(test => {
      if (test.status === 'failed') {
        console.log(`   - ${test.name}: ${test.message}`)
      }
    })
    process.exit(1)
  } else {
    console.log('\n🎉 所有测试通过！')
    process.exit(0)
  }
}

runAllTests().catch(err => {
  console.error('❌ 测试运行出错:', err)
  process.exit(1)
})
