# 小传 - AI传记助手 技术规格文档

## 文档信息

| 属性 | 内容 |
|------|------|
| 文档版本 | v1.1.0 |
| 创建日期 | 2026-07-20 |
| 最后更新 | 2026-07-20 |
| 作者 | FrankFang |
| 状态 | 活跃维护中 |

---

## 一、技术架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        微信小程序端                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  页面层   │  │  组件层   │  │  工具层   │  │  数据层   │   │
│  │ Pages    │  │ Components│  │ Utils    │  │ Storage  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │        │
└───────┼──────────────┼──────────────┼──────────────┼────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                       云开发层                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              云函数 (Cloud Functions)                   │  │
│  │  callLLM / extractMemory / login / submitFeedback     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              云数据库 (Cloud Database)                  │  │
│  │  user_events / errors / performance / feedbacks       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI服务层                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Minimax API │  │ DeepSeek API │  │  其他API     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 目录结构

```
miniprogram/
├── app.js                 # 应用入口
├── app.json               # 应用配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
├── version.json           # 版本信息
├── cloudfunctions/        # 云函数
│   ├── callllm/           # LLM调用
│   ├── extractmemory/     # 记忆提取
│   ├── login/             # 用户登录
│   └── submitFeedback/    # 反馈提交
├── components/            # 组件
│   └── tutorial-guide/    # 引导教程组件
├── custom-tab-bar/        # 自定义TabBar
├── data/                  # 测试数据
│   └── testElders.js      # 测试长辈数据
├── images/                # 图片资源
├── pages/                 # 页面
│   ├── login/             # 登录页
│   ├── showcase/          # 产品展示页
│   ├── onboarding/        # 目标设置页
│   ├── chat/              # 聊天页（核心）
│   ├── letterbox/         # 信夹页
│   ├── my/                # 我的页
│   ├── biography/         # 传记页
│   ├── feedback/          # 反馈页
│   └── test/              # 测试页
└── utils/                 # 工具类
    ├── llm.js             # LLM调用封装
    ├── biographyGenerator.js  # 传记生成器
    ├── biographyEvaluator.js  # 传记评测器
    ├── tracker.js         # 埋点追踪
    └── imageUtils.js      # 图片工具
```

---

## 二、页面技术规格

### 2.1 页面清单与职责

| 页面 | 路径 | 职责 | 关键方法 |
|------|------|------|----------|
| 登录页 | `/pages/login/index` | 用户登录、身份认证 | `onLogin`, `onSkipLogin` |
| 产品展示 | `/pages/showcase/index` | 产品功能介绍、引导 | `onStart` |
| 目标设置 | `/pages/onboarding/index` | 设置记录目标和人物信息 | `onStart`, `onConfirmOutline` |
| 聊天页 | `/pages/chat/index` | 核心对话界面，收集人生故事 | `onSend`, `handleBiographyRequest`, `handleFeedbackRequest` |
| 信夹页 | `/pages/letterbox/index` | 展示信件和章节进度 | `loadLetters`, `loadBiography`, `onViewBiography` |
| 我的页 | `/pages/my/index` | 个人中心、功能入口 | `onFeedback`, `onClearMemory`, `onLogout` |
| 传记页 | `/pages/biography/index` | 完整传记阅读 | `onViewChapter`, `onShare` |
| 反馈页 | `/pages/feedback/index` | 用户反馈提交 | `onSubmit`, `getFullContext`, `uploadFeedback` |
| 测试页 | `/pages/test/index` | 内部测试功能 | 各种测试方法 |

### 2.2 聊天页技术规格（核心）

**文件路径**：`miniprogram/pages/chat/index.js`

**数据模型**：
```javascript
data: {
  messages: [],           // 消息列表
  inputText: '',          // 输入文本
  goal: null,             // 目标设置
  userMemory: null,       // 用户记忆
  isLoading: false,       // 加载状态
  inputMode: 'voice',     // 输入模式：voice/text
  currentStage: 'childhood',    // 当前传记阶段
  conversationPhase: 'trust_building',  // 对话阶段
  suggestedQuestions: [], // 建议问题
  usedQuestions: [],      // 已使用问题
  showTutorial: false,    // 是否显示教程
  isTestMode: false,      // 测试模式
  // ... 其他状态
}
```

**核心方法**：

| 方法 | 功能 | 调用时机 |
|------|------|----------|
| `onSend()` | 发送消息主入口 | 用户点击发送按钮 |
| `isBiographyIntent(text)` | 检测传记意图 | 消息发送前 |
| `isFeedbackIntent(text)` | 检测反馈意图 | 消息发送前 |
| `handleBiographyRequest(intent, text, messages)` | 处理传记请求 | 检测到传记意图时 |
| `handleFeedbackRequest(messages)` | 处理反馈请求 | 检测到反馈意图时 |
| `extractMemory(messages)` | 提取记忆信息 | 对话结束后 |
| `updateUserMemory(extracted)` | 更新用户记忆 | 记忆提取成功后 |
| `formatTime(date)` | 格式化时间 | 消息显示时 |

**对话阶段管理**：
```javascript
// 对话阶段定义
conversationPhase: 'trust_building' | 'interest_exploration' | 'deep_collection'

// 阶段转换逻辑
// trust_building → interest_exploration → deep_collection
// 根据对话轮次或用户反馈自动转换
```

**意图检测关键词**：

| 意图类型 | 触发关键词 |
|----------|------------|
| 传记生成 | 传记、生成、查看、写、成果、作品 |
| 传记修改 | 重新、修改、调整、不满意、补充 |
| 反馈 | 反馈、意见、建议、问题、bug、报错 |

---

## 三、AI模型服务

### 3.1 模型配置

**文件路径**：`miniprogram/utils/llm.js`

```javascript
const MODEL_CONFIG = {
  minimax: {
    name: 'Minimax abab6',
    baseUrl: 'https://api.minimax.chat/v1',
    model: 'abab6-chat',
    maxTokens: 800,
    temperature: 0.8,
    topP: 0.9,
    strengths: ['聊天', '情感陪伴', '故事创作']
  },
  minimax_biography: {
    name: 'Minimax Biography Pro',
    baseUrl: 'https://api.minimax.chat/v1',
    model: 'abab6-chat',
    maxTokens: 4000,
    temperature: 0.75,
    topP: 0.92,
    strengths: ['传记创作', '长篇叙事', '文学写作'],
    isBiography: true
  },
  minimax_m3: {
    name: 'Minimax M3',
    baseUrl: 'https://api.minimax.chat/v1',
    model: 'm3-chat',
    maxTokens: 800,
    temperature: 0.7,
    topP: 0.9,
    isFallback: true
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    maxTokens: 800,
    temperature: 0.7,
    topP: 0.9,
    strengths: ['信息提取', '逻辑推理']
  },
  deepseek_extraction: {
    name: 'DeepSeek Extraction',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    maxTokens: 2000,
    temperature: 0.3,
    topP: 0.8,
    strengths: ['信息提取', '结构化输出']
  }
}
```

### 3.2 LLM调用流程

**文件路径**：`miniprogram/utils/llm.js`

```javascript
function callLLM(messages, goal, userMemory, useCloud = true) {
  // 1. 选择模型
  const modelKey = selectModel(lastMessage.content)
  
  // 2. 构建系统Prompt
  const { systemPrompt } = buildSystemPrompt(goal, userMemory)
  
  // 3. 降级策略
  // 首选：云函数调用
  // 备选：直接API调用
  // 兜底：备用模型调用
}
```

**降级策略**：
```
callLLMCloud() → 失败
    ↓
callLLMDirect(modelKey) → 失败
    ↓
callLLMDirect('minimax_m3') → 失败
    ↓
reject(error)
```

### 3.3 传记生成

**文件路径**：`miniprogram/utils/biographyGenerator.js`

**核心方法**：

| 方法 | 功能 | 参数 | 返回 |
|------|------|------|------|
| `generateBiographyFromMemory(memory, goal)` | 从记忆生成完整传记 | memory, goal | Promise<biography> |
| `generateBiographyAgent(memory, goal, letters, options)` | 使用Agent方式生成传记 | memory, goal, letters, options | Promise<biography> |
| `generateNarrativeChapter(memories, title, yearRange, style, feedback)` | 生成单章内容 | memories, title, yearRange, style, feedback | Promise<chapter> |
| `generateIntro(basicInfo, goal, feedback)` | 生成引言 | basicInfo, goal, feedback | Promise<string> |
| `generateEnding(basicInfo, goal, chapters, feedback)` | 生成结语 | basicInfo, goal, chapters, feedback | Promise<string> |
| `generateFamilyView(basicInfo, goal, feedback)` | 生成家人视角 | basicInfo, goal, feedback | Promise<object> |

**传记数据结构**：
```javascript
{
  id: 'user_biography',
  name: '称呼',
  intro: '引言（800+字）',
  ending: '结语（1500+字）',
  epilogue: '后记（500+字）',
  timeline: [{ year, event }, ...],  // 25-30个时间节点
  photos: [{ title, desc, position }, ...],  // 20个照片位
  chapters: [{
    title: '章节标题',
    year: '时间范围',
    content: '正文（2000+字）',
    quote: '金句（25-40字）',
    emotion: '情感标签'
  }, ...],  // 15-20章
  familyView: { title, content },  // 家人视角（1000+字）
  lastGeneratedAt: 'ISO时间戳',
  feedback: '用户反馈（可选）'
}
```

---

## 四、数据存储

### 4.1 本地存储（wx.setStorageSync）

| Key | 数据类型 | 说明 | 更新时机 |
|-----|----------|------|----------|
| `goal` | Object | 目标设置 | Onboarding完成 |
| `userMemory` | Object | 用户记忆 | 每次对话后 |
| `currentChatMessages` | Array | 当前聊天记录 | 每次消息发送/接收 |
| `letters` | Array | 信件列表 | 章节完成后 |
| `biography` | Object | 当前传记 | 传记生成后 |
| `userInfo` | Object | 用户信息 | 登录后 |
| `userId` | String | 用户ID | 登录后生成 |
| `localFeedbacks` | Array | 待上传反馈 | 网络异常时保存 |
| `hasCompletedTutorial` | Boolean | 是否完成教程 | 教程完成后 |

**userMemory结构**：
```javascript
{
  basicInfo: {
    birthPlace: '',      // 出生地
    birthDate: '',       // 出生日期
    occupation: '',      // 职业
    hobbies: [],         // 爱好列表
    familyMembers: [],   // 家庭成员
    education: '',       // 教育经历
    workExperience: ''   // 工作经历
  },
  preferences: {
    topics: [],              // 话题偏好
    conversationStyle: 'warm',    // 对话风格
    questionFrequency: 'low',     // 问题频率
    favoriteTopics: [],       // 喜欢的话题
    avoidTopics: []          // 避免的话题
  },
  progress: {
    totalQuestions: 24,      // 总问题数
    answeredQuestions: [],   // 已回答问题
    currentPhase: 'childhood',   // 当前阶段
    daysRemaining: 30,       // 剩余天数
    conversationPhase: 'trust_building',  // 对话阶段
    exchangesInCurrentPhase: 0   // 当前阶段对话次数
  },
  history: {
    totalConversations: 0,   // 总对话次数
    lastConversationTime: '', // 最后对话时间
    keyMemories: []          // 关键记忆点
  }
}
```

### 4.2 云端数据库

**文件路径**：`cloudfunctions/database-schema.md`

| 集合名 | 用途 | 关键字段 |
|--------|------|----------|
| `user_events` | 用户行为事件 | eventName, timestamp, userId, properties |
| `errors` | 错误日志 | errorType, message, stack, userId, page |
| `performance` | 性能数据 | metricName, value, duration, success |
| `biography_evaluations` | 传记评测 | sampleId, generatedBiography, scores, totalScore |
| `versions` | 版本管理 | version, build, type, changes |
| `user_profiles` | 用户画像 | nickName, avatarUrl, totalConversations, totalLetters |
| `feedbacks` | 用户反馈 | feedbackType, content, contextData, openid, status |

---

## 五、云函数

### 5.1 云函数清单

| 云函数 | 路径 | 功能 | 参数 |
|--------|------|------|------|
| callLLM | `cloudfunctions/callllm` | 调用LLM API | messages, goal, userMemory |
| extractMemory | `cloudfunctions/extractmemory` | 提取记忆信息 | messages, currentMemory |
| login | `cloudfunctions/login` | 用户登录 | userInfo |
| submitFeedback | `cloudfunctions/submitFeedback` | 提交用户反馈 | feedbackType, content, contact, includeContext, contextData |

### 5.2 callLLM云函数

**文件路径**：`miniprogram/cloudfunctions/callllm/index.js`

**输入**：
```javascript
{
  messages: [{ role, content }, ...],
  goal: { name, relation, structure, style },
  userMemory: { basicInfo, preferences, progress, history }
}
```

**输出**：
```javascript
{
  success: true,
  content: 'AI回复内容'
}
```

### 5.3 submitFeedback云函数

**文件路径**：`miniprogram/cloudfunctions/submitFeedback/index.js`

**输入**：
```javascript
{
  feedbackType: 'suggestion/bug/complaint/praise/other',
  content: '反馈内容',
  contact: '联系方式（可选）',
  includeContext: true/false,
  contextData: { messages, userMemory, letters, biography }  // 完整上下文
}
```

**输出**：
```javascript
{
  success: true,
  message: '反馈提交成功'
}
```

---

## 六、埋点追踪

### 6.1 Tracker工具

**文件路径**：`miniprogram/utils/tracker.js`

**核心方法**：

| 方法 | 事件名 | 用途 |
|------|--------|------|
| `track(eventName, properties)` | - | 通用事件追踪 |
| `pageView(pageName)` | page_view | 页面浏览 |
| `click(elementName)` | click | 点击事件 |
| `sendMessage(content, type)` | message_send | 发送消息 |
| `messageReceive(content, type)` | message_receive | 接收消息 |
| `feedbackSubmit(type, content)` | feedback_submit | 提交反馈 |
| `biographyGenerate(success, duration)` | biography_generate | 生成传记 |
| `login(loginType)` | login | 用户登录 |
| `goalSet(goal)` | goal_set | 设置目标 |
| `systemError(error)` | system_error | 系统错误 |
| `networkError(url, method)` | network_error | 网络错误 |
| `performance(name, value)` | performance | 性能指标 |

**使用方式**：
```javascript
const Tracker = require('../../utils/tracker.js')

// 在页面onLoad中初始化
Tracker.init(userId)
Tracker.pageView('pageName')

// 在事件中调用
Tracker.sendMessage(content)
Tracker.feedbackSubmit(type, content)
```

---

## 七、用户反馈模块

### 7.1 反馈页面技术规格

**文件路径**：`miniprogram/pages/feedback/index.js`

**数据模型**：
```javascript
data: {
  feedbackType: 'suggestion',      // 反馈类型
  feedbackContent: '',             // 反馈内容
  contactInfo: '',                 // 联系方式
  isLoading: false,                // 加载状态
  includeContext: true,            // 是否包含上下文
  contextPreview: '',              // 上下文预览
  feedbackTypes: [                 // 反馈类型列表
    { value: 'suggestion', label: '功能建议', icon: '💡' },
    { value: 'bug', label: '问题反馈', icon: '🐛' },
    { value: 'complaint', label: '不满意', icon: '😔' },
    { value: 'praise', label: '表扬', icon: '👍' },
    { value: 'other', label: '其他', icon: '📝' }
  ]
}
```

**核心方法**：

| 方法 | 功能 |
|------|------|
| `onSubmit()` | 提交反馈 |
| `getFullContext()` | 收集完整上下文 |
| `uploadFeedback(data)` | 上传反馈（含降级） |
| `saveToLocal(data)` | 保存到本地缓存 |
| `retryLocalFeedbacks(feedbacks)` | 重试上传本地反馈 |

**上下文收集**：
```javascript
getFullContext() {
  // 收集内容：
  // 1. messages - 当前聊天记录
  // 2. userMemory - 用户记忆
  // 3. letters.length - 信件数量
  // 4. biography - 传记信息
  // 5. conversationCount - 对话次数
  // 6. lastConversationTime - 最后对话时间
}
```

### 7.2 反馈触发机制

**文件路径**：`miniprogram/pages/chat/index.js`

**意图检测方法**：
```javascript
isFeedbackIntent(text) {
  // 检测关键词：反馈、意见、建议、投诉、问题、bug、报错等
}
```

**触发流程**：
```
用户发送消息 → 检测意图 → 显示反馈引导弹窗 → 用户确认 → 跳转到反馈页面
```

### 7.3 离线缓存机制

**文件路径**：`miniprogram/pages/feedback/index.js`, `miniprogram/app.js`

**缓存流程**：
```
上传失败 → saveToLocal() → 保存到 localFeedbacks
                          ↓
              下次启动或成功上传时
                          ↓
              retryLocalFeedbacks() → 重新上传
                          ↓
              上传成功 → 从localFeedbacks移除
```

---

## 八、错误处理与监控

### 8.1 错误监控

**文件路径**：`miniprogram/app.js`

```javascript
// 系统错误捕获
wx.onError = (error) => {
  Tracker.systemError(error)
}

// 未处理Promise拒绝
wx.onUnhandledRejection = (error) => {
  Tracker.systemError(error)
}

// 网络请求监控
wx.request = (options) => {
  // 记录请求耗时、状态码、成功/失败
  Tracker.apiCall(url, duration, success, statusCode)
}
```

### 8.2 LLM调用错误处理

**文件路径**：`miniprogram/utils/llm.js`

**错误类型**：
- 云函数调用失败
- API响应错误
- 网络连接失败
- JSON解析错误

**处理策略**：
1. 日志记录详细错误信息
2. 降级到备用模型
3. 向用户显示友好提示
4. 记录到错误监控系统

---

## 九、版本管理

### 9.1 版本信息

**文件路径**：`miniprogram/version.json`

```javascript
{
  version: '1.1.0',
  build: 1001,
  type: 'development',  // development/testing/production
  status: 'draft',      // draft/released/deprecated
  changes: [
    { id, type, description }
  ],
  models: [
    { name, version, type }
  ]
}
```

### 9.2 版本变更记录

**当前版本**：v1.1.0

| ID | 类型 | 描述 |
|----|------|------|
| FEATURE-001 | feature | 实现语音和文字聊天功能 |
| FEATURE-002 | feature | 实现信夹页面 |
| FEATURE-003 | feature | 实现传记生成功能 |
| FEATURE-004 | feature | 实现用户引导教程 |
| FEATURE-005 | feature | 实现多模型降级策略 |
| FEATURE-006 | feature | 实现传记评测体系 |
| FEATURE-007 | feature | 实现埋点追踪系统 |
| FEATURE-008 | feature | 实现用户反馈模块 |
| BUGFIX-001 | bugfix | 修复WXML可选链语法错误 |
| BUGFIX-002 | bugfix | 修复聊天记录丢失问题 |
| BUGFIX-003 | bugfix | 修复传记显示问题 |
| BUGFIX-004 | bugfix | 修复字体模糊问题 |

---

## 十、开发规范

### 10.1 代码风格

- 使用ES6+语法
- 变量命名使用camelCase
- 函数命名使用camelCase
- 常量命名使用UPPER_CASE
- 文件命名使用kebab-case
- 注释使用中文，简洁明了

### 10.2 页面开发规范

```javascript
// 页面结构
Page({
  data: {
    // 状态定义
  },
  
  onLoad: function(options) {
    // 页面加载逻辑
    Tracker.pageView('pageName')
  },
  
  onShow: function() {
    // 页面显示逻辑
  },
  
  // 事件处理方法
  onEventName: function(e) {
    // 事件处理
  },
  
  // 业务逻辑方法
  doSomething: function() {
    // 业务逻辑
  }
})
```

### 10.3 工具类开发规范

```javascript
// 工具类结构
const ModuleName = {
  // 常量定义
  
  // 私有方法
  _privateMethod: function() {},
  
  // 公共方法
  publicMethod: function() {},
  
  // 异步方法
  asyncMethod: function() {
    return new Promise((resolve, reject) => {})
  }
}

module.exports = ModuleName
```

### 10.4 云函数开发规范

```javascript
// 云函数结构
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  // 获取openid
  const openid = cloud.getWXContext().OPENID
  
  try {
    // 业务逻辑
    return { success: true, data: result }
  } catch (error) {
    console.error('[FunctionName] Error:', error)
    return { success: false, error: error.message }
  }
}
```

---

## 十一、附录

### 11.1 关键API

| API | 用途 | 文档 |
|-----|------|------|
| wx.cloud.callFunction | 调用云函数 | 微信官方文档 |
| wx.setStorageSync | 本地存储 | 微信官方文档 |
| wx.getStorageSync | 读取本地存储 | 微信官方文档 |
| wx.request | 网络请求 | 微信官方文档 |
| wx.showToast | 显示提示 | 微信官方文档 |
| wx.showModal | 显示弹窗 | 微信官方文档 |

### 11.2 参考文档

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [MiniMax API文档](https://api.minimax.chat/document/guide)
- [DeepSeek API文档](https://platform.deepseek.com/docs/api)

### 11.3 文档维护规则

- 功能新增或修改后，同步更新本技术规格文档
- 云函数参数变更时，更新对应的云函数规格
- 数据模型变更时，更新本地存储和云端数据库规格
- 版本发布前，完成技术规格文档的审核确认