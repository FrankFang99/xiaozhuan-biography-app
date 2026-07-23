# 小传 - 网页版技术规格文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 产品名称 | 小传 - 您的专属传记作者 |
| 文档版本 | v1.1.2 |
| 文档日期 | 2026-07-21 |
| 适用平台 | Web (PC/Mobile) |

---

## 1. 技术架构

### 1.1 技术栈

| 层次 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | React | 19.x | UI框架 |
| 编程语言 | TypeScript | 5.x | 类型安全 |
| 构建工具 | Vite | 6.x | 快速构建 |
| 路由 | React Router | 7.x | 单页应用路由 |
| 状态管理 | Zustand | 4.x | 轻量级状态管理 |
| 样式 | Tailwind CSS | 4.x | 原子化CSS框架 |
| 图标 | Lucide React | 0.x | 图标库，但不用于头像 |
| 存储 | localStorage | - | 本地数据持久化 |
| 语音 | Web Speech API | - | 语音输入/朗读 |

### 1.2 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        浏览器                                │
├─────────────────────────────────────────────────────────────┤
│                     页面层 (Pages)                           │
│  LoginPage | OnboardingPage | ChatPage | LetterboxPage      │
│  BiographyPage | MyPage | FeedbackPage | ShowcasePage       │
├─────────────────────────────────────────────────────────────┤
│                    组件层 (Components)                       │
│  MessageBubble | ProgressBar | StageIndicator | TopicCard   │
│  UserInfoCard | FeedbackForm | StarBackground               │
├─────────────────────────────────────────────────────────────┤
│                    状态管理层 (Store)                        │
│                    useAppStore (Zustand)                     │
│  ┌─────────────┬─────────────┬─────────────┐               │
│  │ 用户状态     │ 对话状态     │ 数据状态     │               │
│  │ currentUser │ messages    │ letters     │               │
│  │ goal        │ stage       │ biography   │               │
│  │ userMemory  │ progress    │ feedbacks   │               │
│  └─────────────┴─────────────┴─────────────┘               │
├─────────────────────────────────────────────────────────────┤
│                    服务层 (Services)                         │
│  aiService | feedbackService | storageService | speechService│
├─────────────────────────────────────────────────────────────┤
│                    数据源                                    │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   localStorage   │  │   AI API        │                   │
│  │   (本地存储)     │  │   (Minimax)     │                   │
│  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 目录结构

```
web-app/
├── src/
│   ├── assets/              # 静态资源
│   │   ├── biographer_avatar.jpg  # AI头像（本地图片）
│   │   └── ...
│   ├── components/          # 通用组件
│   │   ├── MessageBubble.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StageIndicator.tsx
│   │   ├── TopicCard.tsx
│   │   ├── UserInfoCard.tsx
│   │   ├── FeedbackForm.tsx
│   │   ├── StarBackground.tsx
│   │   └── ...
│   ├── pages/               # 页面组件
│   │   ├── LoginPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── LetterboxPage.tsx
│   │   ├── BiographyPage.tsx
│   │   ├── MyPage.tsx
│   │   ├── FeedbackPage.tsx
│   │   └── ShowcasePage.tsx
│   ├── services/            # 服务层
│   │   ├── aiService.ts     # AI API调用
│   │   ├── feedbackService.ts  # 反馈服务
│   │   ├── storageService.ts   # 存储服务
│   │   └── speechService.ts    # 语音服务
│   ├── stores/              # 状态管理
│   │   └── useAppStore.ts   # Zustand Store
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── helpers.ts
│   │   └── constants.ts
│   ├── App.tsx              # 应用入口组件
│   ├── main.tsx             # 应用启动文件
│   └── index.css            # 全局样式
├── public/                  # 公共资源
│   ├── index.html
│   └── favicon.svg
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── ...
```

---

## 2. 核心模块设计

### 2.1 状态管理 (Zustand)

**Store定义：** `src/stores/useAppStore.ts`

**核心状态：**

| 状态名 | 类型 | 说明 |
|--------|------|------|
| currentUser | User \| null | 当前用户信息 |
| messages | Message[] | 对话消息列表 |
| letters | Letter[] | 信件列表 |
| bookChapters | BookChapter[] | 传记章节 |
| biographyProgress | number | 传记进度百分比 |
| chatCount | number | 对话次数 |
| wordCount | number | 字数统计 |
| currentPage | string | 当前页面 |
| goal | GoalSetting \| null | 目标设置 |
| userMemory | UserMemory | 用户记忆 |
| notifications | Notification[] | 通知列表 |
| currentStage | string | 当前阶段 |
| stageName | string | 阶段名称 |
| suggestedQuestions | string[] | 建议问题 |
| usedQuestions | string[] | 已使用问题 |
| fontSize | 'small' \| 'medium' \| 'large' | 字体大小 |

**核心方法：**

| 方法名 | 参数 | 说明 |
|--------|------|------|
| login | phone: string | 登录 |
| logout | - | 退出登录 |
| setCurrentUser | user: User \| null | 设置用户 |
| setCurrentPage | page: string | 切换页面 |
| setGoal | goal: GoalSetting | 设置目标 |
| addMessage | message: Message | 添加消息 |
| saveLetter | content: string, chapter: string | 保存信件 |
| updateProgress | - | 更新进度 |
| updateUserMemory | memory: UserMemory | 更新用户记忆 |
| clearUserMemory | - | 清除用户记忆 |

### 2.2 AI服务 (aiService)

**文件：** `src/services/aiService.ts`

**功能：**
- 调用AI模型进行对话
- 提取用户记忆
- 生成传记内容
- 提供模型降级策略

**接口设计：**

```typescript
interface AiService {
  chat(message: string, context: Message[]): Promise<string>;
  extractMemory(messages: Message[]): Promise<UserMemory>;
  generateBiography(memory: UserMemory, letters: Letter[]): Promise<string>;
}
```

**模型配置：**

| 模型 | API Base | 环境变量 | 用途 |
|------|----------|----------|------|
| Minimax abab6 | https://api.minimax.chat/v1 | MINIMAX_TOKEN | 聊天对话 |
| Minimax M3 | https://api.minimax.chat/v1 | MINIMAX_TOKEN | 兜底模型 |
| Minimax vision-pro | https://api.minimax.chat/v1 | MINIMAX_TOKEN | 图片理解（多模态） |
| DeepSeek | https://api.deepseek.com/v1 | DEEPSEEK_TOKEN | 信息提取 |

**注意：** API Token不应硬编码在代码中，应使用环境变量或占位符。

### 2.3 反馈服务 (feedbackService)

**文件：** `src/services/feedbackService.ts`

**功能：**
- 收集用户反馈
- 收集对话上下文
- 压缩上下文（超过4000 tokens时）
- 本地缓存（网络异常时）
- 自动重试上传

**接口设计：**

```typescript
interface FeedbackService {
  submitFeedback(feedback: FeedbackData): Promise<void>;
  collectContext(): ContextData;
  compressContext(context: ContextData): ContextData;
  cacheFeedback(feedback: FeedbackData): void;
  uploadCachedFeedbacks(): Promise<void>;
}
```

**反馈数据结构：**

```typescript
interface FeedbackData {
  type: 'suggestion' | 'bug' | 'complaint' | 'praise' | 'other';
  content: string;
  contact?: string;
  includeContext: boolean;
  context?: ContextData;
  timestamp: number;
}

interface ContextData {
  messages: Message[];
  userMemory: UserMemory;
  letters: Letter[];
  goal: GoalSetting | null;
}
```

**本地缓存机制：**
- 使用localStorage存储缓存的反馈
- 键名：`localFeedbacks`
- 数据结构：`{ id: string; data: FeedbackData; attempts: number }[]`
- 自动重试：应用启动时检查缓存并上传
- 重试次数限制：最多3次

### 2.4 语音服务 (speechService)

**文件：** `src/services/speechService.ts`

**功能：**
- 语音输入（使用Web Speech API）
- 消息朗读（使用SpeechSynthesis API）
- 语音状态管理

**接口设计：**

```typescript
interface SpeechService {
  startListening(onResult: (text: string) => void): void;
  stopListening(): void;
  speak(text: string): void;
  cancelSpeak(): void;
  isSupported(): boolean;
}
```

### 2.5 存储服务 (storageService)

**文件：** `src/services/storageService.ts`

**功能：**
- 封装localStorage操作
- 数据序列化/反序列化
- 数据版本管理
- 数据迁移

**接口设计：**

```typescript
interface StorageService {
  get(key: string): any;
  set(key: string, value: any): void;
  remove(key: string): void;
  clear(): void;
}
```

---

## 3. 页面组件设计

### 3.1 LoginPage

**文件：** `src/pages/LoginPage.tsx`

**功能：**
- 用户登录入口
- 昵称输入
- 头像上传
- 用户协议确认
- 游客模式

**UI设计要点：**
- 深色星空背景（渐变 + 动态星星）
- 居中布局
- 品牌Logo（金色头像）
- 白色输入框，金色聚焦边框
- 微信绿色登录按钮
- 用户协议复选框

**交互流程：**
1. 用户输入昵称
2. （可选）上传头像
3. 勾选用户协议
4. 点击登录按钮
5. 跳转到目标设置页

### 3.2 ChatPage

**文件：** `src/pages/ChatPage.tsx`

**功能：**
- AI对话主界面
- 语音输入（绿色渐变按钮，白色"按住说话"文字，无图标）
- 文字输入（输入框 + 图片按钮 + 发送按钮）
- 图片输入（支持从相册选择，自动保存到用户记忆）
- 阶段展示
- 进度展示
- 话题建议
- 消息朗读
- 字体大小调节

**UI设计要点：**
- 浅色渐变背景（#eef2f7 → #f5f7fa）
- 顶部：AI头像 + 名称 + 阶段指示器 + 进度条
- 消息列表：卡片式气泡
  - AI消息：白色背景，圆角左上角较小
  - 用户消息：绿色渐变背景（#07c160 → #06ad56），圆角右上角较小
  - 图片消息：带圆角的图片展示，支持点击预览
- 底部：话题建议卡片 + 输入区域
  - 语音模式：绿色渐变按钮，白色"按住说话"文字
  - 文字模式：左侧图片按钮 + 中间输入框 + 右侧发送按钮

**交互流程：**
1. 用户输入文字或语音
2. 点击发送或回车发送
3. 显示加载状态
4. 显示AI回复
5. 自动滚动到底部

**反馈意图检测：**
- 监听用户输入
- 检测关键词：反馈、意见、建议、投诉、问题、bug等
- 检测到意图后弹出确认对话框
- 用户确认后跳转到反馈页并携带上下文

### 3.3 MyPage

**文件：** `src/pages/MyPage.tsx`

**功能：**
- 用户信息展示
- 统计数据
- 功能菜单

**UI设计要点：**
- 深色背景（#0a0a1a → #1a1a2e）
- 星空粒子动画背景
- 毛玻璃效果卡片
- 用户信息：头像 + 昵称 + 登录方式 + 在线状态
- 统计数据：金色数字 + 灰色标签
- 功能菜单：图标 + 文字 + 箭头

**功能菜单列表：**
| 菜单项 | 图标 | 说明 |
|--------|------|------|
| 我的目标 | Target | 修改传记目标 |
| 查看传记 | BookOpen | 查看生成的传记 |
| 示例传记 | BookOpenCheck | 查看示例 |
| 关于我们 | Info | 关于应用 |
| 用户反馈 | MessageSquare | 提交反馈 |
| 清除记忆 | Trash2 | 清除所有记忆 |
| 退出登录 | LogOut | 退出账号 |

### 3.4 FeedbackPage

**文件：** `src/pages/FeedbackPage.tsx`

**功能：**
- 反馈类型选择
- 反馈内容输入
- 联系方式输入
- 上下文包含选项
- 提交反馈

**UI设计要点：**
- 深色背景（与我的页面一致）
- 金色主题色强调
- 反馈类型选项卡
- 文本域输入
- 开关组件
- 提交按钮

---

## 4. 路由设计

**文件：** `src/App.tsx`

**路由配置：**

| 路径 | 页面组件 | 说明 |
|------|----------|------|
| `/` | LoginPage | 登录页 |
| `/onboarding` | OnboardingPage | 目标设置页 |
| `/chat` | ChatPage | 对话页 |
| `/letterbox` | LetterboxPage | 信夹页 |
| `/biography` | BiographyPage | 传记页 |
| `/my` | MyPage | 我的页 |
| `/feedback` | FeedbackPage | 反馈页 |
| `/showcase` | ShowcasePage | 示例页 |

**路由守卫：**
- 未登录用户访问受保护页面时，重定向到登录页
- 使用Zustand状态管理登录状态

---

## 5. 样式设计

### 5.1 Tailwind CSS配置

**文件：** `tailwind.config.js`

**主题配置：**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4A853',
        'gold-dark': '#b89444',
        'wx-green': '#07c160',
        'wx-green-dark': '#06ad56',
        'dark-bg': '#0a0a1a',
        'dark-bg-secondary': '#1a1a2e',
        'light-bg': '#eef2f7',
        'light-bg-secondary': '#f5f7fa',
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'star-twinkle': 'twinkle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

### 5.2 全局样式

**文件：** `src/index.css`

**内容：**
- 全局字体设置
- 滚动条样式
- 基础重置样式
- 页面过渡动画

---

## 6. 性能优化

### 6.1 代码分割
- 使用React.lazy和Suspense进行组件懒加载
- 路由级别的代码分割

### 6.2 图片优化
- 压缩头像图片（当前3.68MB，目标<500KB）
- 使用WebP格式
- 设置适当的图片尺寸

### 6.3 状态管理优化
- 使用Zustand的selector避免不必要的重渲染
- 合理组织状态结构

### 6.4 缓存策略
- 本地缓存反馈数据
- 缓存用户记忆数据

---

## 7. 部署与发布

### 7.1 构建命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 部署到GitHub Pages
npm run deploy
```

### 7.2 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| VITE_MINIMAX_TOKEN | Minimax API Token | - |
| VITE_DEEPSEEK_TOKEN | DeepSeek API Token | - |
| VITE_APP_TITLE | 应用标题 | 小传 |

### 7.3 部署流程

1. 代码提交到GitHub
2. 运行 `npm run build` 构建
3. 运行 `npm run deploy` 部署到GitHub Pages
4. GitHub Pages自动更新

---

## 8. 安全注意事项

### 8.1 API Token保护
- 不在代码中硬编码API Token
- 使用环境变量配置
- 构建时使用占位符替换

### 8.2 用户数据保护
- 用户数据仅存储在本地
- 不向服务器发送敏感信息
- 反馈上下文可由用户选择是否包含

### 8.3 XSS防护
- 使用React的自动转义
- 对用户输入进行适当验证

### 8.4 CSRF防护
- 单页应用无需传统CSRF防护
- API请求使用适当的认证方式

---

## 9. 版本记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2026-07-22 | v1.1.3 | 移除图片输入功能（延迟至V1.2），优化语音/文字切换按钮图标，统一图标风格，同步小程序版更新 |
| 2026-07-21 | v1.1.2 | 添加图片输入功能，优化语音按钮样式，更新传记生成支持图片融合 |
| 2026-07-20 | v1.1.0 | 创建网页版技术规格文档 |

---

## 10. 参考文档

- 小程序版技术规格文档：`../tech_spec.md`
- 网页版PRD文档：`./product_prd.md`