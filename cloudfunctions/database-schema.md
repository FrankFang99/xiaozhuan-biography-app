# 云开发数据库集合定义

## 1. user_events（用户行为事件）

存储用户的所有行为事件，用于分析用户行为路径和功能使用频率。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 自动生成 |
| eventName | string | 是 | 事件名称 |
| timestamp | string | 是 | 时间戳（ISO格式） |
| userId | string | 否 | 用户ID |
| sessionId | string | 否 | 会话ID |
| page | string | 否 | 当前页面 |
| properties | object | 否 | 事件属性 |
| deviceInfo | object | 否 | 设备信息 |
| createdAt | timestamp | 是 | 创建时间 |

## 2. errors（错误日志）

存储小程序运行时的错误信息，用于监控和排查问题。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 自动生成 |
| errorType | string | 是 | 错误类型（system_error, network_error, storage_error） |
| message | string | 是 | 错误消息 |
| stack | string | 否 | 错误堆栈 |
| url | string | 否 | 出错URL（网络错误） |
| method | string | 否 | 请求方法（网络错误） |
| statusCode | number | 否 | HTTP状态码（网络错误） |
| userId | string | 否 | 用户ID |
| page | string | 否 | 当前页面 |
| deviceInfo | object | 否 | 设备信息 |
| createdAt | timestamp | 是 | 创建时间 |

## 3. performance（性能数据）

存储性能指标，用于监控小程序性能。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 自动生成 |
| metricName | string | 是 | 指标名称（page_load_time, api_call, llm_call） |
| value | number | 是 | 指标值 |
| pageName | string | 否 | 页面名称（页面加载时间） |
| apiName | string | 否 | API名称（API调用） |
| model | string | 否 | 模型名称（LLM调用） |
| duration | number | 否 | 耗时（毫秒） |
| success | boolean | 否 | 是否成功 |
| tokens | number | 否 | Token数量（LLM调用） |
| userId | string | 否 | 用户ID |
| deviceInfo | object | 否 | 设备信息 |
| createdAt | timestamp | 是 | 创建时间 |

## 4. biography_evaluations（传记评测）

存储传记生成的评测结果，用于追踪AI生成质量。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 自动生成 |
| sampleId | string | 否 | 测试样本ID |
| generatedBiography | object | 是 | 生成的传记内容 |
| scores | object | 是 | 各项评分 |
| totalScore | number | 是 | 总分 |
| overallComment | string | 否 | 综合评价 |
| strengths | array | 否 | 优点列表 |
| improvements | array | 否 | 改进建议列表 |
| faithfulness | string | 否 | 内容忠实度 |
| userId | string | 否 | 用户ID |
| createdAt | timestamp | 是 | 创建时间 |

## 5. versions（版本管理）

存储小程序版本信息，用于版本控制和变更追踪。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 自动生成 |
| version | string | 是 | 版本号（如 1.1.0） |
| build | number | 是 | 构建号 |
| type | string | 是 | 版本类型（development, testing, production） |
| changes | array | 是 | 变更列表 |
| description | string | 否 | 版本描述 |
| status | string | 是 | 状态（draft, released, deprecated） |
| releaseDate | timestamp | 否 | 发布日期 |
| author | string | 否 | 作者 |
| createdAt | timestamp | 是 | 创建时间 |

## 6. user_profiles（用户画像）

存储用户基本信息和使用统计。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 用户ID |
| nickName | string | 否 | 用户昵称 |
| avatarUrl | string | 否 | 头像URL |
| loginType | string | 否 | 登录类型 |
| loginDate | timestamp | 否 | 首次登录日期 |
| lastActiveDate | timestamp | 否 | 最后活跃日期 |
| totalConversations | number | 是 | 总对话次数 |
| totalLetters | number | 是 | 总信件数 |
| biographyGenerated | boolean | 是 | 是否生成过传记 |
| createdAt | timestamp | 是 | 创建时间 |
| updatedAt | timestamp | 是 | 更新时间 |

## 7. feedbacks（用户反馈）

存储用户反馈信息，包括完整的对话上下文。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 自动生成 |
| feedbackType | string | 是 | 反馈类型（feature_suggestion, bug_report, complaint, praise, other） |
| content | string | 是 | 反馈内容 |
| contact | string | 否 | 联系方式 |
| includeContext | boolean | 是 | 是否包含上下文 |
| contextData | object | 否 | 上下文数据（消息、记忆、传记等） |
| openid | string | 是 | 用户openid |
| status | string | 是 | 状态（pending, processing, resolved） |
| createdAt | string | 是 | 创建时间 |
| handledAt | string | 否 | 处理时间 |
| handleResult | string | 否 | 处理结果 |

## 云函数列表

### 1. trackEvent

接收单个事件并存储到 user_events 集合。

**输入参数**：
- eventName: string
- timestamp: string
- userId: string (可选)
- sessionId: string (可选)
- page: string (可选)
- properties: object (可选)
- deviceInfo: object (可选)

### 2. trackBatch

批量接收事件并存储到 user_events 集合。

**输入参数**：
- events: array

### 3. getErrorStats

获取错误统计信息。

**输入参数**：
- startTime: timestamp
- endTime: timestamp
- errorType: string (可选)

**返回**：
- totalCount: number
- byType: object
- byPage: object
- recentErrors: array

### 4. getPerformanceStats

获取性能统计信息。

**输入参数**：
- startTime: timestamp
- endTime: timestamp
- metricName: string (可选)

**返回**：
- avgDuration: number
- p95Duration: number
- successRate: number
- byPage: object
- byApi: object

### 5. getUserBehaviorStats

获取用户行为统计信息。

**输入参数**：
- startTime: timestamp
- endTime: timestamp
- userId: string (可选)

**返回**：
- totalUsers: number
- activeUsers: number
- pageViews: object
- featureUsage: object
- conversionRate: number

### 6. getBiographyEvaluationStats

获取传记评测统计信息。

**输入参数**：
- startTime: timestamp
- endTime: timestamp

**返回**：
- totalEvaluations: number
- avgScore: number
- scoreDistribution: object
- improvementSuggestions: array

### 7. createVersion

创建新版本记录。

**输入参数**：
- version: string
- build: number
- type: string
- changes: array
- description: string (可选)
- author: string (可选)

### 8. getVersions

获取版本列表。

**输入参数**：
- limit: number (默认 20)
- offset: number (默认 0)

**返回**：
- versions: array
- total: number

### 9. updateUserProfile

更新用户画像。

**输入参数**：
- userId: string
- updates: object

### 10. getUserProfile

获取用户画像。

**输入参数**：
- userId: string

**返回**：
- profile: object